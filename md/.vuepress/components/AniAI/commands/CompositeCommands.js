import gsap from "gsap";
import { Command } from "./Command.js";

/**
 * 组合指令：把多个指令编排成 sequence / parallel / loop。
 *
 * 约定：动画型指令（this.animated === true）的 execute() 返回有限时长 tween/timeline，
 *       组合器用 gsap timeline 统一排序；即时指令用 tl.call() 在对应时间点执行。
 *       无限循环动画（如 hold 用的无限 sway）无法在 sequence 中排序，会被跳过并告警。
 */

/** 并行：所有指令同时开始 */
export class Parallel extends Command {
  constructor(commands = []) {
    super("parallel");
    this.animated = true;
    this.commands = commands.filter(Boolean);
  }

  execute() {
    this.stop();
    const tl = gsap.timeline();
    for (const cmd of this.commands) {
      if (cmd.animated) {
        const t = cmd.execute();
        if (t && typeof t.totalDuration === "function") {
          tl.add(t, 0); // 不 pause：gsap 会把已播放 tween 重挂到 timeline 并受其驱动
        }
      } else {
        tl.call(() => cmd.execute(), null, 0);
      }
    }
    if (tl.getChildren().length === 0) return null;
    return this._track(tl);
  }

  stop() {
    super.stop();
    for (const cmd of this.commands) cmd.stop();
  }
}

/** 顺序：动画型指令依次衔接，即时指令在对应时间点执行 */
export class Sequence extends Command {
  constructor(commands = []) {
    super("sequence");
    this.animated = true;
    this.commands = commands.filter(Boolean);
  }

  execute() {
    this.stop();
    const tl = gsap.timeline();
    let pos = 0;
    for (const cmd of this.commands) {
      if (cmd.animated) {
        const t = cmd.execute();
        if (t && typeof t.totalDuration === "function") {
          const dur = t.totalDuration();
          if (isFinite(dur)) {
            tl.add(t, pos); // 不 pause：gsap 会把已播放 tween 重挂到 timeline 并受其驱动
            pos += dur;
          } else {
            t.kill();
            console.warn("[AniAI] sequence 跳过无限循环动画（请改用 loop 或单独绑定）");
          }
        }
      } else {
        tl.call(() => cmd.execute(), null, pos);
      }
    }
    if (tl.getChildren().length === 0) return null;
    return this._track(tl);
  }

  stop() {
    super.stop();
    for (const cmd of this.commands) cmd.stop();
  }
}

/** 循环：重复执行某指令 times 次（times: -1 无限，直到 stop） */
export class Loop extends Command {
  constructor(command, opts = {}) {
    super("loop");
    this.command = command;
    this._total = opts.times ?? -1;
    this.times = this._total;
    this._running = false;
  }

  execute() {
    this.stop();
    this._running = true;
    this.times = this._total;
    this._run();
    return null;
  }

  _run() {
    if (!this._running || !this.command) return;
    if (this.times > 0) this.times--;
    const t = this.command.execute();
    if (t && typeof t.eventCallback === "function" && isFinite(t.totalDuration?.())) {
      t.eventCallback("onComplete", () => {
        if (!this._running || this.times === 0) return;
        this._run();
      });
    } else {
      // 即时指令：异步重跑，避免同步死循环
      if (this.times !== 0) setTimeout(() => this._run(), 0);
    }
  }

  stop() {
    this._running = false;
    this.command?.stop();
    super.stop();
  }
}
