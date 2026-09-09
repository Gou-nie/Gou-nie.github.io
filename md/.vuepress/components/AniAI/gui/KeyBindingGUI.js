/**
 * 键位设置面板：把「可绑定指令」做成条目，支持
 * - 触发方式下拉（press / hold / toggle）
 * - 「绑定按键」：点击后进入等待态，按任意键完成绑定（Esc 取消）
 * - 「解绑」
 * - 冲突检测：同一键已绑其它指令时覆盖并提示
 *
 * 面板拆成两个子文件夹，避免「一览」和「配置」挤在一起：
 * - 当前绑定一览：只读，一眼看清 动作 → 键
 * - 绑定设置：每个动作的触发方式/绑定/解绑操作区
 *
 * 键位会缓存到 localStorage：register 时若 savedBindings 里有该 id 的记录，
 * 优先用缓存的键/模式而不是代码里的默认值；任何变更都通过 onChange 回写。
 */
export class KeyBindingGUI {
  /**
   * @param {import('../aniai.js').AniAI} aniai
   * @param {import('lil-gui').GUI} gui
   * @param {{savedBindings?: Object, onChange?: Function}} options
   */
  constructor(aniai, gui, options = {}) {
    this.aniai = aniai;
    this.gui = gui;
    this.saved = options.savedBindings || {};
    this.onChange = options.onChange || null;
    this.folder = gui.addFolder("⌨️ 键位绑定");
    this.listFolder = this.folder.addFolder("当前键位").open();
    this.settingsFolder = this.folder.addFolder("⚙️ 设置").close();
    this.listState = {};
    this.slots = new Map(); // id -> slot
    this._capturing = false;
    this._suspend = false; // 恢复缓存期间抑制回写
  }

  /**
   * 注册一个可绑定指令
   * @param {string} id 唯一标识（也是缓存 key，需稳定）
   * @param {string} label 显示名
   * @param {() => import('../commands/Command.js').Command} makeCommand 构造指令（每次绑定重新构造）
   * @param {'press'|'hold'|'toggle'} defaultMode
   * @param {string|null} defaultKey 默认预绑定的键（可选）
   */
  register(id, label, makeCommand, defaultMode = "press", defaultKey = null) {
    // 缓存优先：存过就用存的（key 为 null 表示用户主动解绑，也要尊重）
    const cached = this.saved[id];
    const mode = cached?.mode || defaultMode;
    const key = cached ? cached.key ?? null : defaultKey;

    const state = { mode };
    const slotFolder = this.settingsFolder.addFolder(label);

    const slot = {
      id,
      label,
      makeCommand,
      mode,
      key: null,
      folder: slotFolder,
      state,
    };

    slotFolder
      .add(state, "mode", ["press", "hold", "toggle"])
      .name("模式")
      .onChange((v) => {
        slot.mode = v;
        if (slot.key) this._bind(slot, slot.key); // 用新模式重绑
        this._persist();
      });
    slotFolder.add({ bind: () => this._startCapture(slot) }, "bind").name("🔑 绑定");
    slotFolder.add({ clear: () => this._clear(slot) }, "clear").name("✕ 清除");

    // 一览：只读展示「动作 -> 键」，与上面的设置区分开
    this.listState[id] = "未绑定";
    slot.listCtrl = this.listFolder.add(this.listState, id).name(label).disable();

    this.slots.set(id, slot);

    // 注册阶段（含从缓存恢复）不回写，避免每注册一条就写一次 localStorage
    this._suspend = true;
    if (key) this._bind(slot, key);
    this._suspend = false;
    this._refreshTitle(slot);
  }

  /** 序列化当前所有键位，供缓存 */
  serialize() {
    const out = {};
    for (const [id, slot] of this.slots) {
      out[id] = { key: slot.key, mode: slot.mode };
    }
    return out;
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
      this._persist();
    });
  }

  _bind(slot, key) {
    const existing = this.aniai.input.getBinding(key);
    if (existing && existing.command !== slot._boundCommand) {
      console.warn(`[AniAI] 按键「${key}」已被占用，覆盖旧绑定`);
      // 旧持有者的 slot 也要同步成「未绑定」，否则一览里两个动作都显示同一个键
      for (const [, other] of this.slots) {
        if (other !== slot && other.key === key) {
          other.key = null;
          other._boundCommand = null;
          this._refreshTitle(other);
        }
      }
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
    this._persist();
  }

  /** 移除一个动作绑定（供「自定义动作」删除时调用） */
  unregister(id) {
    const slot = this.slots.get(id);
    if (!slot) return;
    this._suspend = true;
    this._clear(slot);
    this._suspend = false;
    slot.folder.destroy();
    slot.listCtrl?.destroy();
    delete this.listState[id];
    this.slots.delete(id);
    this._persist();
  }

  _persist() {
    if (this._suspend) return;
    this.onChange?.();
  }

  _refreshTitle(slot) {
    // lil-gui 的 folder 是 GUI 实例，用 .title() 改标题（.name() 是 Controller 的方法）
    slot.folder.title(`${slot.label}  [${slot.key || "未绑定"}]`);
    this.listState[slot.id] = slot.key || "未绑定";
    slot.listCtrl?.updateDisplay();
  }
}
