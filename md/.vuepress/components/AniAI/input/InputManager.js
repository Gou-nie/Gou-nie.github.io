/**
 * 键位绑定与派发：把指令（Command）绑定到键盘按键，按模式触发。
 *
 * 触发模式：
 * - press  ：按下触发一次（keydown 去抖，忽略长按连发）
 * - hold   ：按下开始（execute），松开停止（stop）——适合无限 sway
 * - toggle ：按一下开，再按一下关
 *
 * 额外能力：
 * - captureNext(cb)：捕获下一次按键（M4 键位设置「点击后按任意键」用）
 * - 输入框聚焦时不触发，避免打字时误触
 */
export class InputManager {
  constructor(options = {}) {
    this.target = options.target || (typeof window !== "undefined" ? window : null);
    this.bindings = new Map(); // normalizedKey -> { command, mode, active }
    this._capture = null; // { callback } 捕获模式
    this._enabled = true;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._attach();
  }

  /**
   * 绑定指令到按键
   * @param {string} key 按键（event.key，如 'a' / ' ' / 'ArrowUp'）
   * @param {import('../commands/Command.js').Command} command
   * @param {'press'|'hold'|'toggle'} mode
   */
  bind(key, command, mode = "press") {
    const k = this._normalize(key);
    if (!command) {
      console.warn(`[AniAI] bindKey("${key}")：指令为空`);
      return false;
    }
    const old = this.bindings.get(k);
    if (old) old.command.stop(); // 覆盖前停掉旧指令
    this.bindings.set(k, { command, mode, active: false });
    return true;
  }

  /** 解绑某按键 */
  unbind(key) {
    const k = this._normalize(key);
    const b = this.bindings.get(k);
    if (b) {
      b.command.stop();
      this.bindings.delete(k);
    }
  }

  /** 取某按键的绑定（供 GUI 展示/检测冲突） */
  getBinding(key) {
    return this.bindings.get(this._normalize(key)) || null;
  }

  /** 所有绑定（供 GUI 列表） */
  getBindings() {
    return Array.from(this.bindings.entries()).map(([key, b]) => ({
      key,
      command: b.command,
      mode: b.mode,
      active: b.active,
    }));
  }

  /** 捕获下一次按键，回调 (normalizedKey, event)；M4 键位设置用 */
  captureNext(callback) {
    this._capture = { callback };
  }

  cancelCapture() {
    this._capture = null;
  }

  /** 暂停/恢复触发（GUI 输入时可用） */
  setEnabled(v) {
    this._enabled = v;
  }

  /** 释放：解绑所有、停掉所有指令、移除监听 */
  dispose() {
    this._detach();
    for (const [, b] of this.bindings) b.command.stop();
    this.bindings.clear();
    this._capture = null;
  }

  _attach() {
    if (!this.target) return;
    // 用捕获阶段：lil-gui 会在自己 DOM 内 stopPropagation 阻止键盘事件冒泡，
    // 捕获阶段监听能先于它拿到按键，保证在 GUI 里点「绑定」后仍能捕获到键。
    this.target.addEventListener("keydown", this._onKeyDown, true);
    this.target.addEventListener("keyup", this._onKeyUp, true);
  }

  _detach() {
    if (!this.target) return;
    this.target.removeEventListener("keydown", this._onKeyDown, true);
    this.target.removeEventListener("keyup", this._onKeyUp, true);
  }

  _onKeyDown(event) {
    // 捕获模式优先：吞掉这次按键
    if (this._capture) {
      const cb = this._capture.callback;
      this._capture = null;
      event.preventDefault();
      cb(this._fromEvent(event), event);
      return;
    }

    if (!this._enabled) return;
    if (event.repeat) return; // 去抖：长按连发只触发一次
    if (this._isEditableTarget(event.target)) return;

    const key = this._fromEvent(event);
    const b = this.bindings.get(key);
    if (!b) return;

    switch (b.mode) {
      case "press":
        event.preventDefault();
        b.command.execute();
        break;
      case "hold":
        if (!b.active) {
          event.preventDefault();
          b.active = true;
          b.command.execute();
        }
        break;
      case "toggle":
        event.preventDefault();
        if (b.active) {
          b.active = false;
          b.command.stop();
        } else {
          b.active = true;
          b.command.execute();
        }
        break;
    }
  }

  _onKeyUp(event) {
    if (this._capture) return;
    const key = this._fromEvent(event);
    const b = this.bindings.get(key);
    if (!b) return;
    if (b.mode === "hold" && b.active) {
      b.active = false;
      b.command.stop();
    }
  }

  _fromEvent(event) {
    return this._normalize(event.key);
  }

  /** 单字符键统一小写（'A'→'a'），特殊键（'ArrowUp'/' '/'Enter'）保持原样 */
  _normalize(key) {
    if (typeof key !== "string") return key;
    return key.length === 1 ? key.toLowerCase() : key;
  }

  _isEditableTarget(target) {
    if (!target) return false;
    const tag = target.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      target.isContentEditable
    );
  }
}
