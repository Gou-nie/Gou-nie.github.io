import { STEP, GRAVITY } from "./constants.js";

/**
 * MoveRunner —— 固定步长招式播放器。
 *
 * 为什么不用 gsap（DESIGN §9.2）：gsap 跑自己的 ticker，与固定步长累加器的
 * 时间基准不同。掉帧时 gsap 会跳跃补偿，可能把判定窗口整个跳过。招式的
 * 帧数据必须逐 tick 播放 —— 「起手 8 帧」在 60Hz 与 144Hz 下必须是同样的
 * 8 个逻辑帧。gsap 只留给工房预览与 UI 动效。
 *
 * 时间轴（DESIGN §5.1）：startup → active → recovery，每个相位是一个姿态
 * key。相位之间用 key 衔接：startup 从「出招瞬间的身姿」起算，之后每个
 * 相位从上一相位 key 的终点接着 lerp —— 链式插值保证全程连续，不需要在
 * 相位边界重新捕获姿态。
 *
 * 姿态插值走 rig.lerpPose（四元数 slerp，不是 Euler lerp，见 Rig.js 注释）；
 * 缓动用 easeOut，落在「发力后快速到位、收尾趋缓」的直觉上。
 *
 * active 是唯一产生判定的窗口：窗口内每个 tick 回调 onActiveTick，
 * F4 的 HitDetector 只在这里被喂数据。
 *
 * motion（根节点位移）语义：
 *   forward/rise：米，在 startup+active 窗口内匀速施加的总位移
 *   spin        ：弧度，同一窗口内匀速累计的绕 Y 旋转
 * spin 不进姿态 key —— 姿态 key 走四元数最短弧，2π ≡ 0 表达不了 360°，
 * 所以 spin 作为累计值在 pose 之外叠加（见 studio/presets.js 的回旋）。
 *
 * 招式播完（elapsed == totalFrames）后状态机 force 回 idle，姿态再用
 * RETURN_FRAMES 帧从收招 key blend 回 rest —— 收招 key 未必是中立姿态，
 * 直接放行会出现「打完定格一秒然后瞬回中立」。
 */

/** 收招结束后把姿态 blend 回 rest 的帧数 */
export const RETURN_FRAMES = 6;

/** 三相位帧数之和 —— 状态锁、测试、HUD 都依赖这同一个数 */
export function moveTotalFrames(move) {
  const { startup, active, recovery } = move.phases;
  return startup.frames + active.frames + recovery.frames;
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export class MoveRunner {
  /**
   * @param {{
   *   fighter: import('../core/FighterFactory.js').Fighter,
   *   move: object,
   *   onActiveTick?: Function,   // 每个 active 帧调用一次（F4 判定用）
   * }} cfg
   */
  constructor({ fighter, move, onActiveTick = null }) {
    this.f = fighter;
    this.move = move;
    this.onActiveTick = onActiveTick;

    const { startup, active, recovery } = move.phases;
    this.sFrames = startup.frames;
    this.aFrames = active.frames;
    this.rFrames = recovery.frames;
    this.totalFrames = this.sFrames + this.aFrames + this.rFrames;

    /** 已播放的逻辑帧数（0 = 还没播第一帧；本 tick 内的新招式不自增） */
    this.elapsed = 0;
    /** 三相位已播完，处于收招 blend 阶段 */
    this.done = false;
    /** blend 已过的帧数 */
    this.blendElapsed = 0;
    /** 当前相位名（'startup' | 'active' | 'recovery' | 'return' | 'none'） */
    this.phaseName = "none";
    /** active 相位内已播的帧数（调试与 F4 用） */
    this.activeTicks = 0;

    // 出招瞬间的身姿 → startup 相位与它平滑衔接（从走位前倾直接起手不跳变）
    this.startPose = fighter.rig.capturePose();

    // 位移方向在出招瞬间冻结 —— 攻击中 caps.turn = false 不会转向，
    // motion 语义是「朝出招瞬间面对的方向」突进。
    const fa = fighter.facing;
    this._dirX = Math.sin(fa);
    this._dirZ = Math.cos(fa);

    // motion 在 startup+active 窗口内匀速施加，速度 = 总量 / 窗口时长
    const win = this.sFrames + this.aFrames;
    const m = move.motion || {};
    this._fwdSpeed = m.forward ? m.forward / (win * STEP) : 0;
    this._riseSpeed = m.rise ? m.rise / (win * STEP) : 0;
    this._spinPerTick = m.spin ? m.spin / win : 0;
    /** spin 累计值（弧度）。blend 结束后残留 2π ≡ 0，视觉无跳变 */
    this.spin = 0;
  }

  get isActive() {
    return this.elapsed > this.sFrames && this.elapsed <= this.sFrames + this.aFrames;
  }

  /**
   * 播放一个固定步长帧。
   * @returns {boolean} false = 完全结束（含收招 blend）不再需要 tick
   */
  tick() {
    if (!this.done) {
      this.elapsed++;
      const e = this.elapsed;
      const { sFrames: s, aFrames: a, rFrames: r } = this;
      const ttl = this.totalFrames;

      let from, to, t;
      if (e <= s) {
        // startup：从出招瞬间的身姿压向起手 key
        from = this.startPose;
        to = this.move.phases.startup.pose;
        t = e / s;
        this.phaseName = "startup";
      } else if (e <= s + a) {
        from = this.move.phases.startup.pose;
        to = this.move.phases.active.pose;
        t = (e - s) / a;
        this.phaseName = "active";
        this.activeTicks++;
      } else {
        from = this.move.phases.active.pose;
        to = this.move.phases.recovery.pose;
        t = (e - s - a) / r;
        this.phaseName = "recovery";
      }

      this.f.rig.lerpPose(from, to, easeOutCubic(Math.min(t, 1)));

      // ---- motion：只在 startup+active 施加速度与旋转 ----
      if (e <= s + a) {
        const vel = this.f.velocity;
        if (this._fwdSpeed) {
          vel.x = this._dirX * this._fwdSpeed;
          vel.z = this._dirZ * this._fwdSpeed;
        }
        if (this._riseSpeed) {
          // rise 的语义是「窗口内净抬升 rise 米」，但 Physics.integrate 在 y>0 时
          // 会先扣一格重力再位移。要净抬升精确，必须把即将被扣的那格重力补回去：
          // vy = riseSpeed + 本 tick 将扣的重力。落地后没有重力可扣，也无需补。
          vel.y = this._riseSpeed + (this.f.position.y > 0 ? GRAVITY * STEP : 0);
        }
        if (this._spinPerTick) this.spin += this._spinPerTick;
      } else if (e === s + a + 1) {
        // 收招第一帧：清掉 motion 施加的残速，避免「打完还往前飘」。
        // 击退残速不在此列 —— 那是被打中时由 applyKnockback 加的，独立衰减。
        const vel = this.f.velocity;
        if (this._fwdSpeed) { vel.x = 0; vel.z = 0; }
        if (this._riseSpeed) vel.y = 0;
      }

      // spin 叠加在姿态之上（见文件头注释与 presets 的回旋说明）
      if (this._spinPerTick) this.f.rig.bodyPivot.rotation.y += this.spin;

      // active 窗口：判定只在这里被喂数据
      if (this.phaseName === "active") this.onActiveTick?.();

      if (e >= ttl) {
        // 最后一帧 recovery key 已就位，状态机放行（force：冲刺等带锁状态可能残留）。
        // 注意：不在此移除 —— 姿态还是 recovery key，收招 blend 从下一 tick 开始；
        // 本帧的相位名保持 recovery（最后一帧仍属于该相位）。
        if (this.f.state.is("attack")) this.f.state.to("idle", { force: true });
        this.done = true;
      }
      return true;
    }

    // ---- 收招 blend：recovery key → rest ----
    this.phaseName = "return";
    this.blendElapsed++;
    const t = Math.min(this.blendElapsed / RETURN_FRAMES, 1);
    this.f.rig.lerpPose(this.move.phases.recovery.pose, null, easeOutCubic(t));
    // spin 保持累计值（2π ≡ 0），结束时随 bodyPivot 一起归位
    if (this._spinPerTick) this.f.rig.bodyPivot.rotation.y += this.spin;

    const finished = this.blendElapsed >= RETURN_FRAMES;
    if (finished) {
      // 姿态已回 rest。若残留的 spin 不是 2π 的整数倍会在此瞬归 —— 预设招都是 2π，无跳变
      this.phaseName = "none";
      this.f.move = null;
    }
    return !finished;
  }
}
