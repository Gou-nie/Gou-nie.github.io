/**
 * 角色状态机。
 *
 * 所有输入必须先过状态机再落到动作 —— 这是格斗游戏的核心机制，
 * 也是 AniAI 缺失的那一环（那里连按出拳键会让拳永远出不完，
 * 两个 Command 同时动一根骨骼还会打架）。
 *
 * F2 只实现移动相关状态；attack / hitstun / block 等在 F3、F4 接入，
 * 但能力位表现在就定义完整，避免后续改结构。
 */

/**
 * 状态能力位。
 * - move    : 是否接受移动输入
 * - attack  : 是否可以起招
 * - turn    : 是否自动面向对手（出招中转身会让判定球瞬移，产生「隔空打到」的观感）
 * - gravity : 是否受重力
 * - jump    : 是否可以起跳
 * - dash    : 是否可以冲刺
 * - block   : 是否可以进入防御
 * - moveMult: 移动速度倍率
 */
export const STATES = {
  idle:      { move: true,  attack: true,  turn: true,  gravity: false, jump: true,  dash: true,  block: true,  moveMult: 1 },
  walk:      { move: true,  attack: true,  turn: true,  gravity: false, jump: true,  dash: true,  block: true,  moveMult: 1 },
  dash:      { move: false, attack: true,  turn: false, gravity: false, jump: false, dash: false, block: false, moveMult: 0 },
  jump:      { move: true,  attack: true,  turn: false, gravity: true,  jump: false, dash: false, block: false, moveMult: 0.4 },
  air:       { move: true,  attack: true,  turn: false, gravity: true,  jump: false, dash: false, block: false, moveMult: 0.4 },
  block:     { move: true,  attack: false, turn: true,  gravity: false, jump: false, dash: false, block: true,  moveMult: 0.45 },
  // ---- 以下状态在 F3/F4 才会被进入，能力位先定义好 ----
  attack:    { move: false, attack: false, turn: false, gravity: false, jump: false, dash: false, block: false, moveMult: 0 },
  hitstun:   { move: false, attack: false, turn: false, gravity: true,  jump: false, dash: false, block: false, moveMult: 0 },
  blockstun: { move: false, attack: false, turn: true,  gravity: false, jump: false, dash: false, block: true,  moveMult: 0 },
  knockdown: { move: false, attack: false, turn: false, gravity: true,  jump: false, dash: false, block: false, moveMult: 0 },
  getup:     { move: false, attack: false, turn: true,  gravity: false, jump: false, dash: false, block: false, moveMult: 0 },
  ko:        { move: false, attack: false, turn: false, gravity: true,  jump: false, dash: false, block: false, moveMult: 0 },
};

/** 地面状态集合（用于判断是否可起跳、是否该贴地） */
export const GROUND_STATES = new Set(["idle", "walk", "dash", "block", "attack", "blockstun", "getup"]);

export class FightState {
  constructor() {
    this.name = "idle";
    /** 当前状态已持续的帧数 */
    this.frames = 0;
    /** 剩余锁定帧数：> 0 时不接受状态切换（硬直、冲刺等） */
    this.lock = 0;
    /** 上一状态，供调试与「返回上一态」用 */
    this.prev = "idle";
  }

  get caps() {
    return STATES[this.name] || STATES.idle;
  }

  get isGrounded() {
    return GROUND_STATES.has(this.name);
  }

  get locked() {
    return this.lock > 0;
  }

  /**
   * 切换状态。
   * @param {string} name 目标状态
   * @param {{lock?: number, force?: boolean}} [opts]
   *   lock：切换后锁定的帧数（期间拒绝非 force 的切换）
   *   force：无视锁定强制切换（被命中、K.O. 等）
   * @returns {boolean} 是否切换成功
   */
  to(name, opts = {}) {
    if (!STATES[name]) {
      console.warn(`[FreeFight] 未知状态「${name}」`);
      return false;
    }
    if (this.lock > 0 && !opts.force) return false;
    if (this.name === name && !opts.force) {
      // 同状态重入：只刷新锁定时长（例如持续行走）
      if (opts.lock != null) this.lock = opts.lock;
      return true;
    }
    this.prev = this.name;
    this.name = name;
    this.frames = 0;
    this.lock = opts.lock || 0;
    return true;
  }

  /** 每 tick 推进计时 */
  tick() {
    this.frames++;
    if (this.lock > 0) this.lock--;
  }

  is(...names) {
    return names.includes(this.name);
  }
}
