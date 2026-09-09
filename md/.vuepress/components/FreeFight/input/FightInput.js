import { DOUBLE_TAP_FRAMES } from "../fight/constants.js";

/**
 * 双人轮询式输入。
 *
 * 为什么不复用 AniAI 的 InputManager：那是「事件 → 触发 Command」模型，
 * 而格斗需要「每 tick 查询按键当前状态」（if (isDown) x += speed * dt）。
 * 但保留了它两个正确设计：
 * - 捕获阶段监听（lil-gui 会在自己 DOM 内 stopPropagation，冒泡阶段拿不到键）
 * - 输入框聚焦时不触发，避免改键位/打字时误操作
 *
 * 三层查询：
 * - isDown(key)          按键当前是否按下（移动用）
 * - pressedThisTick(key) 本 tick 是否刚按下（出招用，长按不连发）
 * - releasedThisTick(key)本 tick 是否刚松开
 *
 * 边沿状态在每个 fixedUpdate 末尾由 endTick() 清空，保证一次按下只被一个 tick 消费。
 */

/** 默认键位。P1 用左手区，P2 用右手区 + 小键盘，刻意分散在键盘矩阵不同区块以减少卡键。 */
export const DEFAULT_BINDINGS = {
  p1: {
    forward: "w",
    back: "s",
    left: "a",
    right: "d",
    jump: "q",
    block: "e",
    light: "f",
    heavy: "g",
    special: "r",
  },
  p2: {
    forward: "ArrowUp",
    back: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    jump: "Numpad0",
    block: "NumpadDecimal",
    light: "Numpad1",
    heavy: "Numpad2",
    special: "Numpad3",
  },
};

/** 无小键盘的笔记本备选键位（P2） */
export const LAPTOP_P2_BINDINGS = {
  forward: "ArrowUp",
  back: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  jump: "'",
  block: ";",
  light: ",",
  heavy: ".",
  special: "/",
};

/** 语义动作名 */
export const ACTIONS = [
  "forward", "back", "left", "right",
  "jump", "block", "light", "heavy", "special",
];

export class FightInput {
  /**
   * @param {{target?: EventTarget, bindings?: object}} [options]
   */
  constructor(options = {}) {
    this.target = options.target || (typeof window !== "undefined" ? window : null);
    this.bindings = {
      p1: { ...DEFAULT_BINDINGS.p1, ...(options.bindings?.p1 || {}) },
      p2: { ...DEFAULT_BINDINGS.p2, ...(options.bindings?.p2 || {}) },
    };

    this._down = new Set();
    this._pressed = new Set();   // 本 tick 新按下
    this._released = new Set();  // 本 tick 新松开
    this._enabled = true;

    /** 双击冲刺检测：'p1:forward' -> 上次按下时的 tick 序号 */
    this._lastTap = new Map();
    this._tick = 0;
    /** 本 tick 触发的冲刺：'p1' -> 'forward'|'back'|'left'|'right' */
    this._dashRequest = new Map();

    /** 捕获模式（改键位用）：捕获下一次按键 */
    this._capture = null;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
    this._attach();
  }

  _attach() {
    if (!this.target) return;
    // 捕获阶段：lil-gui 在自己 DOM 内 stopPropagation，冒泡阶段会丢键
    this.target.addEventListener("keydown", this._onKeyDown, true);
    this.target.addEventListener("keyup", this._onKeyUp, true);
    // 失焦必须清空按键集合，否则切走时松开的键收不到 keyup，
    // 回来后角色会永远朝一个方向走 —— Web 游戏最经典的 bug
    this.target.addEventListener("blur", this._onBlur);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this._onVisibility);
    }
  }

  _detach() {
    if (!this.target) return;
    this.target.removeEventListener("keydown", this._onKeyDown, true);
    this.target.removeEventListener("keyup", this._onKeyUp, true);
    this.target.removeEventListener("blur", this._onBlur);
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this._onVisibility);
    }
  }

  _onBlur() {
    this.clearAll();
  }

  _onVisibility() {
    if (typeof document !== "undefined" && document.hidden) this.clearAll();
  }

  /** 清空所有按键状态。失焦/切标签页/暂停时调用。 */
  clearAll() {
    this._down.clear();
    this._pressed.clear();
    this._released.clear();
    this._dashRequest.clear();
    this._lastTap.clear();
  }

  _onKeyDown(event) {
    // 捕获模式优先（改键位）：吞掉这次按键
    if (this._capture) {
      const cb = this._capture;
      this._capture = null;
      event.preventDefault();
      cb(this._normalize(event), event);
      return;
    }
    if (!this._enabled) return;
    if (this._isEditable(event.target)) return;

    const key = this._normalize(event);
    // 长按的自动重复不产生新的「按下」边沿，但要保持 isDown 为真
    if (event.repeat) {
      this._down.add(key);
      return;
    }
    if (!this._down.has(key)) {
      this._pressed.add(key);
      this._detectDoubleTap(key);
    }
    this._down.add(key);
    // 方向键/空格会滚动页面，游戏内一律拦掉
    if (this._isGameKey(key)) event.preventDefault();
  }

  _onKeyUp(event) {
    if (this._capture) return;
    const key = this._normalize(event);
    if (this._down.has(key)) this._released.add(key);
    this._down.delete(key);
  }

  /** 同向键在窗口内二次按下 → 记一次冲刺请求 */
  _detectDoubleTap(key) {
    for (const slot of ["p1", "p2"]) {
      const map = this.bindings[slot];
      for (const dir of ["forward", "back", "left", "right"]) {
        if (map[dir] !== key) continue;
        const tapKey = `${slot}:${dir}`;
        const last = this._lastTap.get(tapKey);
        if (last != null && this._tick - last <= DOUBLE_TAP_FRAMES) {
          this._dashRequest.set(slot, dir);
          this._lastTap.delete(tapKey); // 用掉，避免三击连触
        } else {
          this._lastTap.set(tapKey, this._tick);
        }
      }
    }
  }

  /**
   * 归一化按键标识。
   * 用 event.code 处理小键盘（Numpad0 等），因为 event.key 在 NumLock 关闭时
   * 会变成 'Insert'/'End' 之类，无法稳定绑定。其余键用 event.key。
   */
  _normalize(event) {
    if (typeof event.code === "string" && event.code.startsWith("Numpad")) {
      return event.code;
    }
    const k = event.key;
    if (typeof k !== "string") return String(k);
    return k.length === 1 ? k.toLowerCase() : k;
  }

  _isGameKey(key) {
    for (const slot of ["p1", "p2"]) {
      const map = this.bindings[slot];
      for (const action of ACTIONS) if (map[action] === key) return true;
    }
    return false;
  }

  _isEditable(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }

  // ---- 查询 ----

  isDown(key) {
    return this._down.has(key);
  }

  pressedThisTick(key) {
    return this._pressed.has(key);
  }

  releasedThisTick(key) {
    return this._released.has(key);
  }

  /** 某玩家某动作当前是否按下 */
  held(slot, action) {
    return this._down.has(this.bindings[slot]?.[action]);
  }

  /** 某玩家某动作是否本 tick 刚按下 */
  tapped(slot, action) {
    return this._pressed.has(this.bindings[slot]?.[action]);
  }

  /**
   * 本 tick 的输入快照。
   * 方向是「角色相对」的语义（forward = 朝对手），由 Fighter 按自身朝向解释，
   * 这样任意相机角度下操作都一致 —— 锁定制格斗的标准做法。
   */
  snapshot(slot) {
    const out = {
      forward: this.held(slot, "forward"),
      back: this.held(slot, "back"),
      left: this.held(slot, "left"),
      right: this.held(slot, "right"),
      block: this.held(slot, "block"),
      jumpTap: this.tapped(slot, "jump"),
      lightTap: this.tapped(slot, "light"),
      heavyTap: this.tapped(slot, "heavy"),
      specialTap: this.tapped(slot, "special"),
      dash: this._dashRequest.get(slot) || null,
    };
    return out;
  }

  /** 每个 fixedUpdate 开头调用：推进 tick 计数 */
  beginTick() {
    this._tick++;
  }

  /** 每个 fixedUpdate 末尾调用：清空边沿状态 */
  endTick() {
    this._pressed.clear();
    this._released.clear();
    this._dashRequest.clear();
  }

  /** 捕获下一次按键（改键位 UI 用） */
  captureNext(callback) {
    this._capture = callback;
  }

  cancelCapture() {
    this._capture = null;
  }

  /** 改键位。返回被顶掉的冲突项（同一槽位内同键会被清掉）。 */
  rebind(slot, action, key) {
    const map = this.bindings[slot];
    if (!map) return null;
    let conflict = null;
    for (const a of ACTIONS) {
      if (a !== action && map[a] === key) {
        conflict = a;
        map[a] = null;
      }
    }
    map[action] = key;
    return conflict;
  }

  /** 跨玩家的键位冲突检测（供 UI 提示） */
  crossConflicts() {
    const out = [];
    for (const a1 of ACTIONS) {
      const k = this.bindings.p1[a1];
      if (!k) continue;
      for (const a2 of ACTIONS) {
        if (this.bindings.p2[a2] === k) out.push({ key: k, p1: a1, p2: a2 });
      }
    }
    return out;
  }

  setEnabled(v) {
    this._enabled = v;
    if (!v) this.clearAll();
  }

  serialize() {
    return { p1: { ...this.bindings.p1 }, p2: { ...this.bindings.p2 } };
  }

  dispose() {
    this._detach();
    this.clearAll();
    this._capture = null;
  }
}
