/**
 * 键位设置面板：把「可绑定指令」做成条目，支持
 * - 触发方式下拉（press / hold / toggle）
 * - 「绑定按键」：点击后进入等待态，按任意键完成绑定（Esc 取消）
 * - 「解绑」
 * - 冲突检测：同一键已绑其它指令时覆盖并提示
 */
export class KeyBindingGUI {
  constructor(aniai, gui) {
    this.aniai = aniai;
    this.gui = gui;
    this.folder = gui.addFolder("键位 Key Bindings");
    this.slots = new Map(); // id -> slot
    this._capturing = false;
  }

  /**
   * 注册一个可绑定指令
   * @param {string} id 唯一标识
   * @param {string} label 显示名
   * @param {() => import('../commands/Command.js').Command} makeCommand 构造指令（每次绑定重新构造）
   * @param {'press'|'hold'|'toggle'} defaultMode
   * @param {string|null} defaultKey 默认预绑定的键（可选）
   */
  register(id, label, makeCommand, defaultMode = "press", defaultKey = null) {
    const state = { mode: defaultMode };
    const slotFolder = this.folder.addFolder(label);

    const slot = {
      id,
      label,
      makeCommand,
      mode: defaultMode,
      key: null,
      folder: slotFolder,
      state,
    };

    slotFolder
      .add(state, "mode", ["press", "hold", "toggle"])
      .name("触发方式")
      .onChange((v) => {
        slot.mode = v;
        if (slot.key) this._bind(slot, slot.key); // 用新模式重绑
      });
    slotFolder.add({ bind: () => this._startCapture(slot) }, "bind").name("绑定按键");
    slotFolder.add({ clear: () => this._clear(slot) }, "clear").name("解绑");

    this.slots.set(id, slot);
    if (defaultKey) this._bind(slot, defaultKey);
    this._refreshTitle(slot);
  }

  /** 进入等待态，捕获下一次按键 */
  _startCapture(slot) {
    if (this._capturing) return;
    this._capturing = true;
    console.log(`[AniAI] 正在为「${slot.label}」设置按键，请按下任意键（Esc 取消）…`);
    this.aniai.input.captureNext((key) => {
      this._capturing = false;
      if (key === "Escape") {
        console.log("[AniAI] 已取消绑定");
        return;
      }
      this._bind(slot, key);
    });
  }

  _bind(slot, key) {
    const existing = this.aniai.input.getBinding(key);
    if (existing && existing.command !== slot._boundCommand) {
      console.warn(`[AniAI] 按键「${key}」已被占用，覆盖旧绑定`);
    }
    const command = slot.makeCommand();
    this.aniai.bindKey(key, command, slot.mode);
    slot.key = key;
    slot._boundCommand = command;
    this._refreshTitle(slot);
  }

  _clear(slot) {
    if (slot.key) {
      this.aniai.unbindKey(slot.key);
      slot.key = null;
      slot._boundCommand = null;
    }
    this._refreshTitle(slot);
  }

  _refreshTitle(slot) {
    // lil-gui 的 folder 是 GUI 实例，用 .title() 改标题（.name() 是 Controller 的方法）
    slot.folder.title(`${slot.label}  [${slot.key || "未绑定"}]`);
  }
}
