import {
  STEP, COMBO_DAMAGE_FALLOFF,
  MAX_HP, MAX_METER, METER_GAIN_HIT, METER_GAIN_BLOCK, METER_GAIN_TAKEN,
  ROUND_TIME, BEST_OF, OVERTIME, KO_SLOWMO, KO_FRAMES,
  KNOCKDOWN_FRAMES, GETUP_FRAMES,
} from "./constants.js";

/**
 * FightRules —— 对局规则与记分。
 *
 * 职责（DESIGN §6.5）：
 *   - 血量 / 气槽（直接写 Fighter.hp / Fighter.meter，字段 F1 就留好了）
 *   - 连击计数与伤害递减（0.9^(n-1) —— 必须有，否则任何能连的招都会一套带走）
 *   - 单局计时与时间到判血多者胜（平局加赛）
 *   - 三局两胜（bestOf）与 K.O. 慢放演出
 *   - 硬直/倒地/起身的状态恢复推进
 *
 * 与 HitDetector 的分工：HitDetector 判定「打没打到 / 防没防住」并施加
 * hitstun/blockstun/击退；FightRules 只记账（血/气/连击/回合/计时）。
 * registerHit 由 HitDetector 在施加硬直状态**之前**调用，所以这里读到的
 * defender.state 是被命中前的状态 —— 这正是连击判定需要的。
 */

export class FightRules {
  /**
   * @param {import('../core/FighterFactory.js').Fighter[]} fighters 顺序 [p1, p2]
   * @param {{bestOf?: number, roundTime?: number}} [opts]
   */
  constructor(fighters, opts = {}) {
    this.fighters = fighters;
    this.bestOf = opts.bestOf ?? BEST_OF;
    this.roundTime = opts.roundTime ?? ROUND_TIME;
    /** 三局两胜 = 先到 ceil(bestOf/2) 胜 */
    this.neededWins = Math.ceil(this.bestOf / 2);
    this.reset();
  }

  /** 完整重置（回到第 1 回合、0:0） */
  reset() {
    this.wins = { p1: 0, p2: 0 };
    this.round = 1;
    this.phase = "fighting"; // fighting | ko | matchEnd
    this.winner = null;
    this.timer = this.roundTime;
    /** 期望的时间缩放（K.O. 慢放），由 Arena 同步给 FightLoop */
    this.timeScale = 1;
    /** 置位后由 Arena 消费：开下一回合 */
    this.pendingReset = false;
    this.combo = { p1: 0, p2: 0 };
    this.koTicks = 0;
  }

  /** 开新回合：只重置计时/连击/胜者标记，wins/round 保持 */
  beginRound() {
    this.phase = "fighting";
    this.winner = null;
    this.timer = this.roundTime;
    this.timeScale = 1;
    this.combo = { p1: 0, p2: 0 };
    this.koTicks = 0;
  }

  /**
   * 记一次命中/被防。
   * @param {object} attacker
   * @param {object} defender
   * @param {object} hit 招式 hit 段
   * @param {boolean} blocked
   * @returns {{damage: number, combo: number}}
   */
  registerHit(attacker, defender, hit, blocked) {
    let combo;
    if (blocked) {
      // 防御成功打断连击
      this.combo[defender.slot] = 0;
      combo = 0;
    } else {
      const prev = this.combo[defender.slot] || 0;
      combo = defender.state.is("hitstun", "knockdown") ? prev + 1 : 1;
      this.combo[defender.slot] = combo;
    }

    const base = blocked ? hit.chip : hit.damage;
    const scale = blocked ? 1 : Math.pow(COMBO_DAMAGE_FALLOFF, combo - 1);
    const damage = Math.max(1, Math.round(base * scale));

    defender.hp = Math.max(0, defender.hp - damage);

    // 气槽：造成/承受伤害都积攒
    attacker.meter = Math.min(MAX_METER, attacker.meter + (blocked ? METER_GAIN_BLOCK : METER_GAIN_HIT));
    defender.meter = Math.min(MAX_METER, defender.meter + METER_GAIN_TAKEN);

    if (defender.hp <= 0) this._startKo(attacker, defender);

    return { damage, combo };
  }

  /** 每固定步长推进一次（计时 / KO 倒计时 / 硬直恢复）。在 state.tick 之后调用。 */
  tick() {
    if (this.phase === "fighting") {
      this.timer -= STEP;
      if (this.timer <= 0) this._timeUp();
    } else if (this.phase === "ko") {
      this.koTicks--;
      if (this.koTicks <= 0) this._endRound();
    }
    // matchEnd 不推进，等用户重置

    this._recoverStates();
  }

  /** 命中造成 K.O.：双方进 ko 态，慢放倒计时开始 */
  _startKo(winner, loser) {
    this.phase = "ko";
    this.winner = winner.slot;
    this.timeScale = KO_SLOWMO;
    this.koTicks = KO_FRAMES;
    for (const f of this.fighters) {
      f.state.to("ko", { force: true });
      f.move = null;
    }
  }

  /** 时间到：血多者胜；等血平局加赛 */
  _timeUp() {
    const [a, b] = this.fighters;
    if (a.hp === b.hp) {
      this.timer = OVERTIME;
      return;
    }
    this.winner = a.hp > b.hp ? a.slot : b.slot;
    this._endRound();
  }

  /** 一回合结束：记胜 → 达成胜场则比赛结束，否则请求开下一回合 */
  _endRound() {
    this.timeScale = 1;
    this.wins[this.winner]++;
    if (this.wins[this.winner] >= this.neededWins) {
      this.phase = "matchEnd";
    } else {
      this.round++;
      this.pendingReset = true; // Arena 消费后调 beginRound()
    }
  }

  /**
   * 硬直/倒地/起身的恢复推进。在 state.tick（锁已递减）之后调用，
   * lock === 0 即「刚好到期」。被抛飞落地 → 倒地 → 起身 → 中立。
   */
  _recoverStates() {
    for (const f of this.fighters) {
      const st = f.state;
      if (st.lock > 0) continue;

      if (st.is("hitstun")) {
        if (!f.grounded) {
          // 被浮空/击飞：落地或空中硬直结束都进倒地
          st.to("knockdown", { lock: KNOCKDOWN_FRAMES });
        } else {
          st.to("idle", { force: true });
          this.combo[f.slot] = 0;
        }
      } else if (st.is("blockstun")) {
        st.to("idle", { force: true });
      } else if (st.is("knockdown")) {
        st.to("getup", { lock: GETUP_FRAMES });
      } else if (st.is("getup")) {
        st.to("idle", { force: true });
        this.combo[f.slot] = 0;
      }
    }
  }
}

/** 供测试/文档引用：血量上限等规则常量 */
export { MAX_HP, MAX_METER };
