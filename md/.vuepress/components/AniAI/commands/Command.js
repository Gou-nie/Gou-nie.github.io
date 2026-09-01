/**
 * 指令基类：所有骨骼操作指令的统一接口。
 * - execute()：执行指令（动画型返回 gsap tween/timeline，便于组合）
 * - stop()：中断当前动画
 */
export class Command {
  constructor(name = "command") {
    this.name = name;
    this._tween = null; // 动画型指令保存 gsap tween/timeline
    this.animated = false; // 是否为动画型指令（execute 返回有限时长 tween，可被 sequence 排序）
  }

  /** 执行指令，子类实现 */
  execute() {
    throw new Error(`Command「${this.name}」未实现 execute()`);
  }

  /** 中断（kill 当前 tween） */
  stop() {
    if (this._tween) {
      this._tween.kill();
      this._tween = null;
    }
  }

  /** 记录 tween，便于统一 stop；返回原 tween 便于链式/组合 */
  _track(tween) {
    this._tween = tween;
    return tween;
  }
}
