import * as THREE from "three";
import GUI from "lil-gui";
import { KeyBindingGUI } from "./KeyBindingGUI.js";
import { SkeletonLines } from "../core/SkeletonLines.js";

/**
 * AniAI 的 lil-gui 面板，分三个文件夹：
 * 1. 模型 Model：显示骨骼（SkeletonLines，蓝绿线、选中标红）、重置视角
 * 2. 骨骼 Skeleton：下拉选骨骼 → 拖动旋转滑杆（度）实时微调
 * 3. 键位 Key Bindings：预置指令 + 触发方式 + 绑定/解绑按键
 *
 * @param {import('../aniai.js').AniAI} aniai
 * @param {{scene?: object, camera?: object, controls?: object}} context 可选的三件套，用于「显示骨骼」「重置视角」
 */
export class GUIPanel {
  constructor(aniai, context = {}, handlers = {}) {
    this.aniai = aniai;
    this.context = context;
    this.handlers = handlers;

    this.gui = new GUI({ title: "AniAI 控制面板" });
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

    this._buildModel();
    this._buildSkeleton();
    this._buildPose();
    this.keyBindings = new KeyBindingGUI(aniai, this.gui);
    this._buildPresetBindings();
  }

  dispose() {
    this._fileInput?.remove();
    this._fileInput = null;
    this.skeletonLines?.dispose();
    this.gui.destroy();
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

  /** 选中骨骼 → 对应骨骼线段标红（必要时自动显示骨骼线） */
  _highlightBone() {
    if (!this.skeletonLines || !this._skeletonState) return;
    if (!this.skeletonLines.visible) {
      this.skeletonLines.setVisible(true);
      if (this._modelState) this._modelState.showSkeleton = true;
      this._showSkeletonCtrl?.updateDisplay();
    }
    this.skeletonLines.highlight(this._skeletonState.bone);
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
      save: () => this.aniai.pose.save(state.poseName),
      apply: () => this.aniai.pose.apply(state.poseName, { duration: 0.5 }),
      saved: "",
    };
    f.add(state, "poseName").name("姿态名");
    f.add(state, "save").name("保存当前姿态");
    f.add(state, "apply").name("应用姿态");
    f.add(state, "saved").name("已保存").disable();
    f.add(
      { refresh: () => (state.saved = this.aniai.pose.names().join(", ") || "(无)") },
      "refresh"
    ).name("刷新列表");
    state.saved = this.aniai.pose.names().join(", ") || "(无)";
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
