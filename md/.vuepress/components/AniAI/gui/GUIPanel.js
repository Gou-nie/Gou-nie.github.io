import * as THREE from "three";
import GUI from "lil-gui";
import { KeyBindingGUI } from "./KeyBindingGUI.js";
import { CustomActionGUI } from "./CustomActionGUI.js";
import { SkeletonLines } from "../core/SkeletonLines.js";
import { ConfigStore } from "../core/ConfigStore.js";

/**
 * AniAI 的 lil-gui 面板，左右各挂一个 GUI 实例，避免所有折叠面板堆在同一个下拉里：
 * 左侧「查看/编辑」：模型 Model、骨骼 Skeleton、姿态 Pose
 * 右侧「动作/键位」：自定义动作 Custom Actions、键位 Key Bindings
 *
 * 键位 / 自定义动作 / 已保存姿态会缓存到 localStorage（按模型分桶），下次打开自动恢复。
 *
 * @param {import('../aniai.js').AniAI} aniai
 * @param {{scene?: object, camera?: object, controls?: object}} context 可选的三件套，用于「显示骨骼」「重置视角」
 * @param {{onImport?: Function}} handlers
 * @param {{leftContainer?: HTMLElement, rightContainer?: HTMLElement}} mount 面板挂载容器，缺省时回退到 lil-gui 默认的右上角悬浮
 */
export class GUIPanel {
  constructor(aniai, context = {}, handlers = {}, mount = {}) {
    this.aniai = aniai;
    this.context = context;
    this.handlers = handlers;

    // 配置缓存：按模型名分桶，避免不同 GLB 的骨骼名互相污染
    this.configStore = new ConfigStore(aniai.modelName || "default");
    this.config = this.configStore.load();

    const leftOpts = { title: "查看 / 编辑" };
    const rightOpts = { title: "动作 / 键位" };
    if (mount.leftContainer) leftOpts.container = mount.leftContainer;
    if (mount.rightContainer) rightOpts.container = mount.rightContainer;
    this.guiLeft = new GUI(leftOpts);
    this.guiRight = new GUI(rightOpts);
    this.gui = this.guiLeft; // 兼容旧引用（dispose 等）
    // lil-gui 0.21 无 gui.keyboard.disable()；其 DOM 内已 stopPropagation，配合 InputManager 捕获阶段监听即可

    this._skeletonCtrls = null;
    this.skeletonLines = null;

    // 骨骼线可视化：默认蓝绿，选中某骨骼时对应线段标红
    if (context.scene) {
      this.skeletonLines = new SkeletonLines(context.scene);
      this.skeletonLines.build(this.aniai.registry);
    }

    // 记录相机 home，供「重置视角」
    if (context.camera) this.homeCamera = context.camera.position.clone();
    this.homeTarget = context.controls?.target ? context.controls.target.clone() : new THREE.Vector3();

    // 先恢复姿态：自定义动作里的「应用姿态」要能在下拉里选到它们
    const restored = this.aniai.pose.hydrate(this.config.poses);
    if (restored) console.log(`[AniAI] 已从本地缓存恢复 ${restored} 个姿态`);

    this._buildModel();
    this._buildSkeleton();
    this._buildPose();

    const persist = () => this._persist();
    this.keyBindings = new KeyBindingGUI(aniai, this.guiRight, {
      savedBindings: this.config.bindings,
      onChange: persist,
    });
    this._buildPresetBindings();
    this.customActions = new CustomActionGUI(aniai, this.guiRight, this.keyBindings, {
      onSelectBone: (name) => this._highlightBone(name),
      savedActions: this.config.actions,
      onChange: persist,
    });
    this._buildConfigFolder();
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
    this.guiLeft.destroy();
    this.guiRight.destroy();
  }

  /** 每帧调用：驱动骨骼线跟随骨骼动画 */
  update() {
    this.skeletonLines?.update();
  }

  // ---- 模型 ----
  _buildModel() {
    const f = this.gui.addFolder("模型 Model");
    const state = {
      url: this.aniai.modelName || (this.aniai.model ? "已加载" : "未加载"),
      showSkeleton: false,
      resetView: () => this._resetView(),
    };
    this._modelState = state;
    f.add(state, "url").name("模型").disable();
    this._showSkeletonCtrl = f.add(state, "showSkeleton").name("显示骨骼").onChange((v) => this._toggleSkeleton(v));
    f.add(state, "resetView").name("重置视角");

    // 导入其它 GLB/GLTF：按钮触发隐藏的 file input
    if (this.handlers.onImport) {
      this._fileInput = document.createElement("input");
      this._fileInput.type = "file";
      this._fileInput.accept = ".glb,.gltf";
      this._fileInput.style.display = "none";
      this._fileInput.addEventListener("change", () => {
        const file = this._fileInput.files?.[0];
        this._fileInput.value = ""; // 清空，允许重复选同一文件
        if (file) this.handlers.onImport(file);
      });
      document.body.appendChild(this._fileInput);
      f.add({ importModel: () => this._fileInput.click() }, "importModel").name("导入 GLB");
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
    const f = this.gui.addFolder("骨骼 Skeleton");
    if (!this.aniai.registry || !this.aniai.registry.hasSkeleton) {
      f.add({ msg: "该模型无骨骼" }, "msg").name("提示").disable();
      return;
    }

    const names = this.aniai.registry.names();
    const state = {
      bone: names[0],
      rx: 0,
      ry: 0,
      rz: 0, // 相对 rest 的偏移（度）
      resetBone: () => this._resetBone(),
      resetAll: () => this.aniai.reset(),
    };
    this._skeletonState = state;

    f.add(state, "bone", names).name("选择骨骼").onChange(() => {
      this._syncBoneSliders();
      this._highlightBone();
    });
    const crx = f.add(state, "rx", -180, 180, 1).name("绕X旋转°").onChange(() => this._applyBone());
    const cry = f.add(state, "ry", -180, 180, 1).name("绕Y旋转°").onChange(() => this._applyBone());
    const crz = f.add(state, "rz", -180, 180, 1).name("绕Z旋转°").onChange(() => this._applyBone());
    this._skeletonCtrls = { rx: crx, ry: cry, rz: crz };

    f.add(state, "resetBone").name("复位此骨骼");
    f.add(state, "resetAll").name("复位全部骨骼");

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
    const f = this.gui.addFolder("姿态 Pose");
    if (!this.aniai.registry) {
      f.add({ msg: "未加载模型" }, "msg").name("提示").disable();
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
    f.add(state, "poseName").name("姿态名");
    f.add(state, "save").name("保存当前姿态");
    f.add(state, "apply").name("应用姿态");
    f.add(state, "remove").name("删除姿态");
    this._savedCtrl = f.add(state, "saved").name("已保存").disable();
    f.add({ refresh: () => (state.saved = this._poseListText()) }, "refresh").name("刷新列表");
    state.saved = this._poseListText();
  }

  _poseListText() {
    return this.aniai.pose.names().join(", ") || "(无)";
  }

  // ---- 配置缓存 ----
  _buildConfigFolder() {
    const f = this.guiRight.addFolder("配置 Config").close();
    f.add(
      { msg: this.configStore.storageKey.replace("aniai:config:v1:", "") },
      "msg"
    )
      .name("缓存槽位")
      .disable();
    f.add(
      {
        clear: () => {
          this.configStore.clear();
          console.log("[AniAI] 已清除本地配置，刷新页面后恢复默认键位");
        },
      },
      "clear"
    ).name("清除本地配置");
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
