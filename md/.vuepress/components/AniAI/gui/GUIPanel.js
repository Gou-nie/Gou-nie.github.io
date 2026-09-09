import * as THREE from "three";
import GUI from "lil-gui";
import { KeyBindingGUI } from "./KeyBindingGUI.js";
import { CustomActionGUI } from "./CustomActionGUI.js";
import { SkeletonLines } from "../core/SkeletonLines.js";
import { ConfigStore } from "../core/ConfigStore.js";

/**
 * AniAI 的 lil-gui 面板，顶部菜单栏模式：
 * 每个菜单项对应一个独立的 GUI 实例，点击菜单时显示对应面板
 *
 * 菜单：模型 Model、骨骼 Skeleton、姿态 Pose、自定义动作 Custom Actions、键位 Key Bindings、配置 Config
 *
 * @param {import('../aniai.js').AniAI} aniai
 * @param {{scene?: object, camera?: object, controls?: object}} context 可选的三件套
 * @param {{onImport?: Function}} handlers
 * @param {{container?: HTMLElement, slot?: string}} mount 面板挂载容器；slot 为配置分桶前缀
 *   （同一模型被多个角色/玩家同时使用时必须区分，否则键位配置互相覆盖）
 */
export class GUIPanel {
  constructor(aniai, context = {}, handlers = {}, mount = {}) {
    this.aniai = aniai;
    this.context = context;
    this.handlers = handlers;
    this.container = mount.container;

    // 配置缓存：按「槽位 + 模型名」分桶。只按模型名分桶会让两个玩家选同一模型时串键位。
    const modelKey = aniai.modelName || "default";
    this.configStore = new ConfigStore(mount.slot ? `${mount.slot}:${modelKey}` : modelKey);
    this.config = this.configStore.load();

    this._skeletonCtrls = null;
    this.skeletonLines = null;

    // 骨骼线可视化
    if (context.scene) {
      this.skeletonLines = new SkeletonLines(context.scene);
      this.skeletonLines.build(this.aniai.registry);
    }

    // 记录相机 home，供「重置视角」
    if (context.camera) this.homeCamera = context.camera.position.clone();
    this.homeTarget = context.controls?.target ? context.controls.target.clone() : new THREE.Vector3();

    // 先恢复姿态
    const restored = this.aniai.pose.hydrate(this.config.poses);
    if (restored) console.log(`[AniAI] 已从本地缓存恢复 ${restored} 个姿态`);

    // 创建各个菜单的GUI实例
    this.guis = {};
    this._createGUIs();

    const persist = () => this._persist();
    this.keyBindings = new KeyBindingGUI(aniai, this.guis.keys, {
      savedBindings: this.config.bindings,
      onChange: persist,
    });
    this._buildPresetBindings();
    this.customActions = new CustomActionGUI(aniai, this.guis.action, this.keyBindings, {
      onSelectBone: (name) => this._highlightBone(name),
      savedActions: this.config.actions,
      onChange: persist,
    });

    // 默认隐藏所有面板
    this.hideAll();
  }

  _createGUIs() {
    const menus = ['model', 'skeleton', 'pose', 'action', 'keys', 'config'];
    menus.forEach(menu => {
      this.guis[menu] = new GUI({
        container: this.container,
        title: '',
        closeFolders: false,
        width: 320
      });
      this.guis[menu].domElement.classList.add(`aniai-gui-${menu}`);
    });

    this._buildModel();
    this._buildSkeleton();
    this._buildPose();
    this._buildConfigMenu();
  }

  showMenu(menu) {
    this.hideAll();
    if (this.guis[menu]) {
      this.guis[menu].show();
    }
  }

  hideAll() {
    Object.values(this.guis).forEach(gui => gui.hide());
  }

  /** 把当前键位 / 动作 / 姿态写入 localStorage */
  _persist() {
    if (!this.keyBindings) return;
    this.configStore.save({
      bindings: this.keyBindings.serialize(),
      actions: this.customActions?.serialize() || [],
      poses: this.aniai.pose.serialize(),
    });
  }

  dispose() {
    this._fileInput?.remove();
    this._fileInput = null;
    this.skeletonLines?.dispose();
    Object.values(this.guis).forEach(gui => gui.destroy());
  }

  /** 每帧调用：驱动骨骼线跟随骨骼动画 */
  update() {
    this.skeletonLines?.update();
  }

  // ---- 模型 ----
  _buildModel() {
    const gui = this.guis.model;
    const state = {
      showSkeleton: false,
      resetView: () => this._resetView(),
    };
    this._modelState = state;
    this._showSkeletonCtrl = gui.add(state, "showSkeleton").name("显示骨骼").onChange((v) => this._toggleSkeleton(v));
    gui.add(state, "resetView").name("重置视角");

    // 导入其它 GLB/GLTF
    if (this.handlers.onImport) {
      this._fileInput = document.createElement("input");
      this._fileInput.type = "file";
      this._fileInput.accept = ".glb,.gltf";
      this._fileInput.style.display = "none";
      this._fileInput.addEventListener("change", () => {
        const file = this._fileInput.files?.[0];
        this._fileInput.value = "";
        if (file) this.handlers.onImport(file);
      });
      document.body.appendChild(this._fileInput);
      gui.add({ importModel: () => this._fileInput.click() }, "importModel").name("📁 导入模型");
    }
  }

  _toggleSkeleton(show) {
    if (!this.context.scene || !this.skeletonLines) return;
    this.skeletonLines.setVisible(show);
  }

  _resetView() {
    if (this.context.camera && this.homeCamera) {
      this.context.camera.position.copy(this.homeCamera);
    }
    if (this.context.controls) {
      this.context.controls.target.copy(this.homeTarget);
      this.context.controls.update();
    }
  }

  // ---- 骨骼 ----
  _buildSkeleton() {
    const gui = this.guis.skeleton;
    if (!this.aniai.registry || !this.aniai.registry.hasSkeleton) {
      gui.add({ msg: "该模型无骨骼" }, "msg").name("提示").disable();
      return;
    }

    const names = this.aniai.registry.names();
    const state = {
      bone: names[0],
      rx: 0,
      ry: 0,
      rz: 0,
      resetAll: () => this.aniai.reset(),
    };
    this._skeletonState = state;

    gui.add(state, "bone", names).name("骨骼").onChange(() => {
      this._syncBoneSliders();
      this._highlightBone();
    });
    const crx = gui.add(state, "rx", -180, 180, 1).name("X 轴").onChange(() => this._applyBone());
    const cry = gui.add(state, "ry", -180, 180, 1).name("Y 轴").onChange(() => this._applyBone());
    const crz = gui.add(state, "rz", -180, 180, 1).name("Z 轴").onChange(() => this._applyBone());
    this._skeletonCtrls = { rx: crx, ry: cry, rz: crz };

    gui.add(state, "resetAll").name("🔄 复位全部");

    this._syncBoneSliders();
    this._highlightBone();
  }

  /** 选骨后，把滑杆同步成该骨当前偏移（度） */
  _syncBoneSliders() {
    if (!this._skeletonState || !this._skeletonCtrls) return;
    const name = this._skeletonState.bone;
    const bone = this.aniai.registry.get(name);
    const rest = this.aniai.registry.restPose(name);
    if (!bone || !rest) return;
    const d = THREE.MathUtils.radToDeg;
    this._skeletonState.rx = d(bone.rotation.x - rest.rotation.x);
    this._skeletonState.ry = d(bone.rotation.y - rest.rotation.y);
    this._skeletonState.rz = d(bone.rotation.z - rest.rotation.z);
    this._skeletonCtrls.rx.updateDisplay();
    this._skeletonCtrls.ry.updateDisplay();
    this._skeletonCtrls.rz.updateDisplay();
  }

  /** 把滑杆偏移应用到选中骨骼（rest 叠加） */
  _applyBone() {
    if (!this._skeletonState) return;
    const offset = {
      x: THREE.MathUtils.degToRad(this._skeletonState.rx),
      y: THREE.MathUtils.degToRad(this._skeletonState.ry),
      z: THREE.MathUtils.degToRad(this._skeletonState.rz),
    };
    this.aniai.cmd.setRotation(this._skeletonState.bone, offset)?.execute();
  }

  _resetBone() {
    if (!this._skeletonState) return;
    this.aniai.cmd.reset(this._skeletonState.bone)?.execute();
    this._syncBoneSliders();
  }

  /** 选中骨骼 → 对应骨骼线段标红（必要时自动显示骨骼线）；不传 name 时用骨骼面板当前选中项 */
  _highlightBone(name) {
    const boneName = name ?? this._skeletonState?.bone;
    if (!this.skeletonLines || !boneName) return;
    if (!this.skeletonLines.visible) {
      this.skeletonLines.setVisible(true);
      if (this._modelState) this._modelState.showSkeleton = true;
      this._showSkeletonCtrl?.updateDisplay();
    }
    this.skeletonLines.highlight(boneName);
  }

  // ---- 姿态 ----
  _buildPose() {
    const gui = this.guis.pose;
    if (!this.aniai.registry) {
      gui.add({ msg: "未加载模型" }, "msg").name("提示").disable();
      return;
    }
    const state = {
      poseName: "idle",
      save: () => {
        this.aniai.pose.save(state.poseName);
        this.customActions?.refreshPoseOptions();
        state.saved = this._poseListText();
        this._savedCtrl?.updateDisplay();
        this._persist();
      },
      apply: () => this.aniai.pose.apply(state.poseName, { duration: 0.5 }),
      remove: () => {
        if (!this.aniai.pose.delete(state.poseName)) {
          console.warn(`[AniAI] 姿态「${state.poseName}」不存在`);
          return;
        }
        this.customActions?.refreshPoseOptions();
        state.saved = this._poseListText();
        this._savedCtrl?.updateDisplay();
        this._persist();
      },
      saved: "",
    };
    gui.add(state, "poseName").name("名称");
    gui.add(state, "save").name("💾 保存");
    gui.add(state, "apply").name("▶️ 应用");
    gui.add(state, "remove").name("🗑️ 删除");
    this._savedCtrl = gui.add(state, "saved").name("已保存").disable();
    state.saved = this._poseListText();
  }

  _poseListText() {
    return this.aniai.pose.names().join(", ") || "(无)";
  }

  // ---- 配置菜单 ----
  _buildConfigMenu() {
    const gui = this.guis.config;
    gui.add(
      {
        clear: () => {
          this.configStore.clear();
          console.log("[AniAI] 已清除本地配置，刷新页面后恢复默认键位");
        },
      },
      "clear"
    ).name("🗑️ 清除缓存");
  }

  // ---- 预置指令 + 键位 ----
  _buildPresetBindings() {
    const ai = this.aniai;
    this.keyBindings.register("reset", "复位全部", () => ai.cmd.resetAll(), "press", "r");
    this.keyBindings.register("bounce", "弹跳", () => ai.cmd.bounce({ factor: 1.08 }), "press", "b");
    if (ai.registry?.get("EarL_Armature")) {
      this.keyBindings.register(
        "ear-left",
        "左耳摆动",
        () => ai.cmd.sway("EarL_Armature", { axis: "z", angle: 0.3, speed: 3 }),
        "toggle",
        "t"
      );
    }
    if (ai.registry?.get("Tail_Armature")) {
      this.keyBindings.register(
        "tail",
        "尾巴摇摆",
        () => ai.cmd.sway("Tail_Armature", { axis: "y", angle: 0.5, speed: 4 }),
        "hold",
        "d"
      );
    }
  }
}
