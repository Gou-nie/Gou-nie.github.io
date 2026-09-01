import * as THREE from "three";

/**
 * 自定义动作面板：挑选「应用姿态 / 骨骼摆动 / 骨骼旋转」+ 对应参数，
 * 组装成一个动作后自动注册到 KeyBindingGUI（键位 Key Bindings 里可绑键/解绑）。
 *
 * 动作定义（类型 + 参数 + label）会缓存到 localStorage，下次打开自动重建，
 * 键位则由 KeyBindingGUI 按同一个 id 恢复，两边靠 id 对齐。
 */
export class CustomActionGUI {
  /**
   * @param {import('../aniai.js').AniAI} aniai
   * @param {import('lil-gui').GUI} gui
   * @param {import('./KeyBindingGUI.js').KeyBindingGUI} keyBindings
   * @param {{onSelectBone?: Function, savedActions?: Array, onChange?: Function}} handlers
   */
  constructor(aniai, gui, keyBindings, handlers = {}) {
    this.aniai = aniai;
    this.keyBindings = keyBindings;
    this.handlers = handlers;
    this.onChange = handlers.onChange || null;
    this.folder = gui.addFolder("自定义动作 Custom Actions");
    this._count = 0;
    this._entries = new Map(); // id -> lil-gui controller（列表里的删除条目）
    this._defs = new Map(); // id -> 动作定义（可序列化）

    this._buildCreator();
    this.listFolder = this.folder.addFolder("已创建的动作");
    this._restore(handlers.savedActions || []);
  }

  _buildCreator() {
    const boneNames = this.aniai.registry?.names() || [];
    const state = {
      type: "pose",
      name: "",
      bone: boneNames[0] || "",
      axis: "y",
      angle: 30,
      speed: 3,
      duration: 0.3,
      poseName: "",
      create: () => this._create(state),
    };
    this._state = state;

    const f = this.folder.addFolder("新建动作").open();
    f.add(state, "type", { 应用姿态: "pose", 骨骼摆动: "sway", 骨骼旋转: "rotate" })
      .name("类型")
      .onChange(() => this._refreshFields());
    f.add(state, "name").name("动作名称");

    this._boneCtrl = f
      .add(state, "bone", boneNames.length ? boneNames : [""])
      .name("骨骼")
      .onChange((name) => this.handlers.onSelectBone?.(name));
    this._axisCtrl = f.add(state, "axis", ["x", "y", "z"]).name("轴");
    this._angleCtrl = f.add(state, "angle", -180, 180, 1).name("角度°");
    this._speedCtrl = f.add(state, "speed", 0.1, 10, 0.1).name("速度(次/秒)");
    this._durationCtrl = f.add(state, "duration", 0.05, 2, 0.05).name("时长(秒)");
    this._poseCtrl = f.add(state, "poseName", this._poseOptions()).name("姿态");
    f.add(state, "create").name("+ 创建动作");

    this._refreshFields();
  }

  _poseOptions() {
    const names = this.aniai.pose.names();
    return names.length ? names : [""];
  }

  /** 姿态面板保存新姿态后调用，刷新下拉可选项 */
  refreshPoseOptions() {
    const names = this._poseOptions();
    this._poseCtrl.options(names);
    if (!this._state.poseName) this._state.poseName = names[0] || "";
  }

  _refreshFields() {
    const type = this._state.type;
    const isBoneType = type === "sway" || type === "rotate";
    this._boneCtrl.show(isBoneType);
    this._axisCtrl.show(isBoneType);
    this._angleCtrl.show(isBoneType);
    this._speedCtrl.show(type === "sway");
    this._durationCtrl.show(type === "rotate");
    this._poseCtrl.show(type === "pose");
    if (isBoneType) this.handlers.onSelectBone?.(this._state.bone);
    if (type === "pose") this.refreshPoseOptions();
  }

  /** 从缓存重建动作条目（不回写，避免重复写入） */
  _restore(defs) {
    for (const def of defs) {
      if (!def || !def.id || !def.type) continue;
      // 骨骼类动作若模型里没有该骨骼（换了模型/骨骼改名），跳过而不是注册一个死绑定
      if ((def.type === "sway" || def.type === "rotate") && !this.aniai.registry?.get(def.bone)) {
        console.warn(`[AniAI] 跳过缓存动作「${def.label}」：找不到骨骼「${def.bone}」`);
        continue;
      }
      this._register(def);
      // id 形如 custom-3，保证后续新建不撞号
      const n = Number(String(def.id).replace("custom-", ""));
      if (Number.isFinite(n) && n > this._count) this._count = n;
    }
  }

  _create(state) {
    const type = state.type;
    if (type === "pose" && !state.poseName) {
      console.warn("[AniAI] 请先在「姿态 Pose」面板保存一个姿态");
      return;
    }
    if ((type === "sway" || type === "rotate") && !state.bone) {
      console.warn("[AniAI] 没有可用骨骼");
      return;
    }

    // 快照当前参数为一个可序列化的定义
    const def = {
      id: `custom-${++this._count}`,
      type,
      label: state.name.trim() || this._defaultLabel(state),
      bone: state.bone,
      axis: state.axis,
      angle: state.angle,
      speed: state.speed,
      duration: state.duration,
      poseName: state.poseName,
    };

    this._register(def);
    state.name = "";
    this.onChange?.();
  }

  /** 把一个动作定义注册进键位面板 + 列表 */
  _register(def) {
    this._defs.set(def.id, def);
    const mode = def.type === "sway" ? "hold" : "press";
    this.keyBindings.register(def.id, def.label, this._makeCommandFactory(def), mode);
    this._addEntry(def.id, def.label);
  }

  /** 序列化所有动作定义，供缓存 */
  serialize() {
    return Array.from(this._defs.values());
  }

  /** 按定义返回一个可重复调用的指令工厂（供 KeyBindingGUI 每次绑定重新构造指令） */
  _makeCommandFactory(def) {
    const { type } = def;
    if (type === "pose") {
      return () => this.aniai.cmd.applyPose(def.poseName, { duration: def.duration });
    }
    const angleRad = THREE.MathUtils.degToRad(def.angle);
    if (type === "sway") {
      return () => this.aniai.cmd.sway(def.bone, { axis: def.axis, angle: angleRad, speed: def.speed });
    }
    return () => this.aniai.cmd.rotate(def.bone, { [def.axis]: angleRad }, { duration: def.duration });
  }

  _defaultLabel(state) {
    if (state.type === "pose") return `姿态:${state.poseName}`;
    if (state.type === "sway") return `摆动:${state.bone}(${state.axis})`;
    return `旋转:${state.bone}(${state.axis})`;
  }

  _addEntry(id, label) {
    const row = { remove: () => this._remove(id) };
    const ctrl = this.listFolder.add(row, "remove").name(`✕ ${label}`);
    this._entries.set(id, ctrl);
  }

  _remove(id) {
    this.keyBindings.unregister(id);
    this._entries.get(id)?.destroy();
    this._entries.delete(id);
    this._defs.delete(id);
    this.onChange?.();
  }
}
