import { STEP, MAX_CATCHUP, MAX_FRAME_TIME } from "./constants.js";

/**
 * 固定步长主循环。
 *
 * 为什么必须固定步长：144Hz 显示器上 rAF 每秒回调 144 次。若逻辑跟着 rAF 走，
 * 「起手 8 帧」在 60Hz 上是 133ms、在 144Hz 上是 55ms —— 同一套帧数据在不同机器上
 * 是两个游戏。格斗游戏的一切平衡都建立在帧数确定性上，这条没有商量余地。
 *
 * 累加器模式：
 *   acc += 真实经过的时间
 *   while (acc >= STEP) { fixedUpdate(STEP); acc -= STEP }
 *   render(acc / STEP)   ← 余量作为渲染插值系数，避免 60Hz 逻辑在 144Hz 屏上一顿一顿
 *
 * 三重保护：
 * - MAX_FRAME_TIME：单帧时间增量钳制（切标签页回来时 now-last 可能是几十秒）
 * - MAX_CATCHUP：单次回调最多补 5 步，补不完就丢弃余量（宁可跳帧不要慢放）
 * - 暂停时不累加（pause 期间的时间不计入）
 */
export class FightLoop {
  /**
   * @param {{
   *   fixedUpdate: (dt: number, tick: number) => void,
   *   render: (alpha: number) => void,
   *   onStall?: (droppedSeconds: number) => void,
   * }} handlers
   */
  constructor(handlers) {
    this.fixedUpdate = handlers.fixedUpdate;
    this.render = handlers.render;
    this.onStall = handlers.onStall || null;

    this._acc = 0;
    this._last = 0;
    this._rafId = null;
    this._running = false;
    this._paused = false;
    this._tick = 0;

    /** 单步模式：暂停下逐帧推进用（调试与训练模式） */
    this._stepOnce = false;

    /**
     * 预热帧数。前若干帧的时间增量不可信：首次真正绘制要上传纹理、
     * 建立 GPU 管线，耗时可达数百毫秒，于是「下一帧」看到一个巨大的增量。
     * 这与稳态帧率无关，预热期只对齐时间基准、不追帧、不计入丢帧统计。
     */
    this._warmup = handlers.warmupFrames ?? 3;

    /** 时间缩放（K.O. 慢放用）。0.3 = 三分之一速度。 */
    this.timeScale = 1;

    this._loop = this._loop.bind(this);
  }

  get tick() {
    return this._tick;
  }

  get running() {
    return this._running;
  }

  get paused() {
    return this._paused;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._last = this._now();
    this._acc = 0;
    this._rafId = requestAnimationFrame(this._loop);
  }

  stop() {
    this._running = false;
    if (this._rafId != null) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  pause() {
    this._paused = true;
  }

  resume() {
    if (!this._paused) return;
    this._paused = false;
    // 重置时间基准，否则暂停期间的时间会被当成需要追赶的欠帧
    this._last = this._now();
    this._acc = 0;
  }

  /** 暂停状态下推进一帧（逐帧调试） */
  stepOnce() {
    this._stepOnce = true;
  }

  _now() {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  }

  _loop(now) {
    if (!this._running) return;
    this._rafId = requestAnimationFrame(this._loop);

    const rawDelta = (now - this._last) / 1000;
    this._last = now;

    if (this._paused) {
      if (this._stepOnce) {
        this._stepOnce = false;
        this._tick++;
        this.fixedUpdate(STEP, this._tick);
      }
      this.render(0);
      return;
    }

    // 预热期：只推进一步逻辑并对齐时间基准，不追帧、不计丢帧。
    // 首帧绘制的 GPU 建立开销会让紧随其后的 delta 大到必然触发追帧上限，
    // 那是启动成本而非稳态抖动，计入丢帧统计会掩盖真正的性能问题。
    if (this._warmup > 0) {
      this._warmup--;
      this._acc = 0;
      this._tick++;
      this.fixedUpdate(STEP, this._tick);
      this.render(0);
      return;
    }

    // 钳制：切标签页回来时 rawDelta 可能是几十秒
    const delta = Math.min(rawDelta, MAX_FRAME_TIME) * this.timeScale;
    this._acc += delta;

    let steps = 0;
    while (this._acc >= STEP && steps < MAX_CATCHUP) {
      this._tick++;
      this.fixedUpdate(STEP, this._tick);
      this._acc -= STEP;
      steps++;
    }

    // 追不上就丢弃余量：宁可跳帧，不要让游戏进入慢放
    if (steps >= MAX_CATCHUP && this._acc >= STEP) {
      const dropped = this._acc;
      this._acc = 0;
      this.onStall?.(dropped);
    }

    this.render(this._acc / STEP);
  }
}
