<template>
  <div class="aniai-container">
    <canvas ref="canvas" class="aniai-canvas"></canvas>
    <div class="aniai-hint">右侧面板设置键位 · 默认：r=复位 b=弹跳 t=左耳摆动 d=尾巴(按住)</div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AniAI } from "./AniAI/aniai.js";
import { GUIPanel } from "./AniAI/gui/GUIPanel.js";

/**
 * AniAI 最小挂载（M1 验证用）：渲染模型 + 控制台打印骨骼树。
 * 后续里程碑会在此接入指令面板、键位 GUI 等。
 */
export default {
  name: "AniAI",
  data() {
    return {
      modelUrl: "/models/mimikyu.glb",
    };
  },
  mounted() {
    this.init();
  },
  beforeUnmount() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this.onResize);
    this.guiPanel?.dispose();
    this.ai?.dispose();
    window.aniAI = null;
    this.controls?.dispose();
    this._disposeModel(this.ai?.model);
    this.renderer?.dispose();
  },
  methods: {
    async init() {
      this.canvas = this.$refs.canvas;
      const w = this.canvas.clientWidth || 1;
      const h = this.canvas.clientHeight || 1;

      // 场景 / 相机 / 渲染器
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x1a1a2e);

      this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
      this.camera.position.set(0, 1, 5);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
      });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(window.devicePixelRatio);

      // 灯光
      this.scene.add(new THREE.AmbientLight(0xffffff, 1.2));
      const dir = new THREE.DirectionalLight(0xffffff, 2);
      dir.position.set(2, 4, 3);
      this.scene.add(dir);

      // 相机控制
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;

      window.addEventListener("resize", this.onResize);

      // ---- M1/M2 核心：加载 + 识别骨骼 + 指令 ----
      this.ai = new AniAI();
      try {
        await this.ai.loadModel(this.modelUrl);
        this.scene.add(this.ai.model);
        this.ai.showSkeleton();

        // 暴露到 window，便于控制台直接调指令验证
        window.aniAI = this.ai;
        console.log("[AniAI] 骨骼名列表：", this.ai.registry.names());

        // ---- M4 GUI 面板 ----
        this.guiPanel = this._buildPanel();
        console.log("[AniAI] 已加载 GUI 面板，默认键位：r=复位 b=弹跳 t=左耳摆动 d=尾巴(按住)");
      } catch (err) {
        console.error("[AniAI] 模型加载失败", err);
      }

      this.animate();
    },
    animate() {
      this.rafId = requestAnimationFrame(this.animate);
      this.controls?.update();
      this.guiPanel?.update();
      this.renderer?.render(this.scene, this.camera);
    },
    onResize() {
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    },
    /** 释放某模型子树里的 geometry/material */
    _disposeModel(root) {
      if (!root) return;
      root.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose();
          if (Array.isArray(o.material)) {
            o.material.forEach((m) => m.dispose());
          } else if (o.material?.isMaterial) {
            o.material.dispose();
          }
        }
      });
    },
    /** 构造 GUI 面板（含「导入 GLB」回调） */
    _buildPanel() {
      return new GUIPanel(
        this.ai,
        { scene: this.scene, camera: this.camera, controls: this.controls },
        { onImport: (file) => this.reloadModel(file) }
      );
    },
    /** 把相机框到当前模型包围盒 */
    _fitCameraToModel() {
      const model = this.ai?.model;
      if (!model) return;
      const box = new THREE.Box3().setFromObject(model);
      if (box.isEmpty()) return;
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const dist = (maxDim / 2) / Math.tan((this.camera.fov * Math.PI) / 360);
      this.camera.position.copy(center).add(new THREE.Vector3(0, maxDim * 0.2, dist * 1.5));
      this.camera.near = Math.max(0.01, maxDim / 100);
      this.camera.far = maxDim * 100;
      this.camera.updateProjectionMatrix();
      if (this.controls) {
        this.controls.target.copy(center);
        this.controls.update();
      }
    },
    /** 导入新的 GLB/GLTF 文件并重建整个场景 */
    async reloadModel(file) {
      if (this._loading) return;
      this._loading = true;
      try {
        // 1. 拆旧：面板 + 旧模型资源
        this.guiPanel?.dispose();
        this.guiPanel = null;
        const oldModel = this.ai?.model;
        this.ai?.dispose();
        if (oldModel) {
          this.scene.remove(oldModel);
          this._disposeModel(oldModel);
        }

        // 2. 载新：用 Blob URL 加载本地文件
        const url = URL.createObjectURL(file);
        let ai;
        try {
          ai = new AniAI();
          await ai.loadModel(url);
        } finally {
          URL.revokeObjectURL(url);
        }
        ai.modelName = file.name;
        this.ai = ai;
        this.scene.add(this.ai.model);
        window.aniAI = this.ai;

        // 3. 重建面板 + 相机框到新模型
        this.guiPanel = this._buildPanel();
        this._fitCameraToModel();
        console.log(`[AniAI] 已导入「${file.name}」，骨骼：`, this.ai.registry.names());
      } catch (err) {
        console.error("[AniAI] 导入模型失败", err);
      } finally {
        this._loading = false;
      }
    },
  },
};
</script>

<style scoped>
.aniai-container {
  position: relative;
  width: 100%;
  height: 520px;
}
.aniai-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.aniai-hint {
  position: absolute;
  top: 12px;
  left: 12px;
  color: #fff;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
</style>
