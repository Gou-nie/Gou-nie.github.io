<template>
  <div class="aniai-container" :style="{ background: getThemeColors().bg }">
    <canvas ref="canvas" class="aniai-canvas"></canvas>

    <!-- 顶部菜单栏 -->
    <div class="aniai-menubar" :style="{ borderBottomColor: getThemeColors().primary + '66' }">
      <div class="aniai-menu-left">
        <div class="aniai-menu-item" :class="{ active: activeMenu === 'model' }" @click="toggleMenu('model')" data-menu="model">
          <span class="menu-icon">📦</span>
          <span>模型</span>
        </div>
        <div class="aniai-menu-item" :class="{ active: activeMenu === 'skeleton' }" @click="toggleMenu('skeleton')" data-menu="skeleton">
          <span class="menu-icon">🦴</span>
          <span>骨骼</span>
        </div>
        <div class="aniai-menu-item" :class="{ active: activeMenu === 'pose' }" @click="toggleMenu('pose')" data-menu="pose">
          <span class="menu-icon">💾</span>
          <span>姿态</span>
        </div>
        <div class="aniai-menu-item" :class="{ active: activeMenu === 'action' }" @click="toggleMenu('action')" data-menu="action">
          <span class="menu-icon">🎬</span>
          <span>动作</span>
        </div>
        <div class="aniai-menu-item" :class="{ active: activeMenu === 'keys' }" @click="toggleMenu('keys')" data-menu="keys">
          <span class="menu-icon">⌨️</span>
          <span>键位</span>
        </div>
      </div>
      <div class="aniai-menu-right">
        <div class="aniai-menu-item" :class="{ active: activeMenu === 'theme' }" @click="toggleMenu('theme')" data-menu="theme">
          <span class="menu-icon">🎨</span>
        </div>
        <div class="aniai-menu-item" :class="{ active: activeMenu === 'config' }" @click="toggleMenu('config')" data-menu="config">
          <span class="menu-icon">⚙️</span>
        </div>
      </div>
    </div>

    <!-- 面板容器 -->
    <div ref="guiContainer" class="aniai-gui-container"></div>

    <!-- 主题选择器（自定义面板） -->
    <div v-if="activeMenu === 'theme'" class="aniai-theme-panel" :style="{ left: themeButtonLeft }">
      <div class="theme-item" @click="changeTheme('blue')">
        <div class="theme-preview blue"></div>
        <span>蓝色</span>
        <span v-if="theme === 'blue'" class="theme-check">✓</span>
      </div>
      <div class="theme-item" @click="changeTheme('purple')">
        <div class="theme-preview purple"></div>
        <span>紫色</span>
        <span v-if="theme === 'purple'" class="theme-check">✓</span>
      </div>
      <div class="theme-item" @click="changeTheme('green')">
        <div class="theme-preview green"></div>
        <span>绿色</span>
        <span v-if="theme === 'green'" class="theme-check">✓</span>
      </div>
      <div class="theme-item" @click="changeTheme('orange')">
        <div class="theme-preview orange"></div>
        <span>橙色</span>
        <span v-if="theme === 'orange'" class="theme-check">✓</span>
      </div>
      <div class="theme-item" @click="changeTheme('dark')">
        <div class="theme-preview dark"></div>
        <span>暗黑</span>
        <span v-if="theme === 'dark'" class="theme-check">✓</span>
      </div>

      <div class="theme-divider"></div>

      <div class="theme-item" @click="changeTheme('custom')">
        <div class="theme-preview custom" :style="{ background: `linear-gradient(135deg, ${customPrimaryColor}, ${customSecondaryColor})` }"></div>
        <span>自定义</span>
        <span v-if="theme === 'custom'" class="theme-check">✓</span>
      </div>

      <div v-if="theme === 'custom'" class="custom-color-picker">
        <div class="color-row">
          <label>背景起始</label>
          <div class="color-input-group">
            <input type="color" v-model="customBgColor1" @input="onCustomColorChange" />
            <span class="color-value">{{ customBgColor1 }}</span>
          </div>
        </div>
        <div class="color-row">
          <label>背景结束</label>
          <div class="color-input-group">
            <input type="color" v-model="customBgColor2" @input="onCustomColorChange" />
            <span class="color-value">{{ customBgColor2 }}</span>
          </div>
        </div>
        <div class="color-row">
          <label>主题色1</label>
          <div class="color-input-group">
            <input type="color" v-model="customPrimaryColor" @input="onCustomColorChange" />
            <span class="color-value">{{ customPrimaryColor }}</span>
          </div>
        </div>
        <div class="color-row">
          <label>主题色2</label>
          <div class="color-input-group">
            <input type="color" v-model="customSecondaryColor" @input="onCustomColorChange" />
            <span class="color-value">{{ customSecondaryColor }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="aniai-hint">按 r=复位 · b=弹跳 · t=左耳 · d=尾巴</div>
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
      activeMenu: null,
      theme: 'blue', // 当前主题：blue, purple, green, orange, dark, custom
      themeButtonLeft: 'auto',
      customBgColor1: '#0a0e27',
      customBgColor2: '#2a1e4d',
      customPrimaryColor: '#3b82f6',
      customSecondaryColor: '#6366f1',
    };
  },
  mounted() {
    // 从localStorage恢复主题
    const savedTheme = localStorage.getItem('aniai-theme');
    if (savedTheme) {
      this.theme = savedTheme;
    }
    this.loadCustomColors();
    this.updateCSSVariables();
    this.init();
  },
  beforeUnmount() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("click", this.handleClickOutside);
    this.guiPanel?.dispose();
    this.ai?.dispose();
    window.aniAI = null;
    this.controls?.dispose();
    this._disposeModel(this.ai?.model);
    this.renderer?.dispose();
  },
  methods: {
    toggleMenu(menu) {
      if (this.activeMenu === menu) {
        this.activeMenu = null;
        this.guiPanel?.hideAll();
      } else {
        this.activeMenu = menu;

        // 主题菜单特殊处理
        if (menu === 'theme') {
          this.guiPanel?.hideAll();
          this.$nextTick(() => {
            const button = this.$el?.querySelector(`.aniai-menu-item[data-menu="${menu}"]`);
            const panel = this.$el?.querySelector('.aniai-theme-panel');
            if (button && panel) {
              const rect = button.getBoundingClientRect();
              const panelWidth = panel.offsetWidth || 280; // 获取实际宽度或使用默认值
              const viewportWidth = window.innerWidth;

              // 判断是否会超出右侧边界
              if (rect.left + panelWidth > viewportWidth - 20) {
                // 右对齐按钮，留20px边距
                this.themeButtonLeft = `${Math.max(20, rect.right - panelWidth)}px`;
              } else {
                // 左对齐按钮
                this.themeButtonLeft = `${rect.left}px`;
              }
            }
          });
        } else {
          this.guiPanel?.showMenu(menu);
          // 计算按钮位置，设置面板位置
          this.$nextTick(() => {
            const button = this.$el?.querySelector(`.aniai-menu-item[data-menu="${menu}"]`);
            const container = this.$refs.guiContainer;
            if (button && container) {
              const rect = button.getBoundingClientRect();
              const panelWidth = 245; // lil-gui默认宽度
              const viewportWidth = window.innerWidth;

              // 判断是否会超出右侧边界
              if (rect.left + panelWidth > viewportWidth) {
                // 右对齐按钮
                container.style.left = `${rect.right - panelWidth}px`;
              } else {
                // 左对齐按钮
                container.style.left = `${rect.left}px`;
              }
            }
          });
        }
      }
    },
    handleClickOutside(e) {
      const container = this.$refs.guiContainer;
      const menubar = this.$el?.querySelector('.aniai-menubar');
      if (container && !container.contains(e.target) && menubar && !menubar.contains(e.target)) {
        this.activeMenu = null;
        this.guiPanel?.hideAll();
      }
    },
    changeTheme(newTheme) {
      this.theme = newTheme;
      localStorage.setItem('aniai-theme', newTheme);
      this.updateCSSVariables();
      this.updateSceneBackground();
      this.saveCustomColors();
      // 通知GUIPanel更新主题
      this.guiPanel?.updateTheme?.(newTheme);
    },
    saveCustomColors() {
      if (this.theme === 'custom') {
        localStorage.setItem('aniai-custom-bg1', this.customBgColor1);
        localStorage.setItem('aniai-custom-bg2', this.customBgColor2);
        localStorage.setItem('aniai-custom-primary', this.customPrimaryColor);
        localStorage.setItem('aniai-custom-secondary', this.customSecondaryColor);
      }
    },
    loadCustomColors() {
      this.customBgColor1 = localStorage.getItem('aniai-custom-bg1') || '#0a0e27';
      this.customBgColor2 = localStorage.getItem('aniai-custom-bg2') || '#2a1e4d';
      this.customPrimaryColor = localStorage.getItem('aniai-custom-primary') || '#3b82f6';
      this.customSecondaryColor = localStorage.getItem('aniai-custom-secondary') || '#6366f1';
    },
    onCustomColorChange() {
      if (this.theme === 'custom') {
        this.updateCSSVariables();
        this.updateSceneBackground();
        this.saveCustomColors();
      }
    },
    updateCSSVariables() {
      const colors = this.getThemeColors();
      const container = this.$el;
      if (container) {
        container.style.setProperty('--theme-primary', colors.primary);
        container.style.setProperty('--theme-secondary', colors.secondary);
        // 计算半透明颜色
        const primaryRGB = this.hexToRgb(colors.primary);
        container.style.setProperty('--theme-primary-light', `rgba(${primaryRGB}, 0.6)`);
        container.style.setProperty('--theme-primary-glow', `rgba(${primaryRGB}, 0.4)`);
      }
    },
    updateSceneBackground() {
      if (this.scene) {
        const colors = this.getThemeColors();
        this.scene.background = new THREE.Color(colors.sceneBg);
      }
    },
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '59, 130, 246';
    },
    getThemeColors() {
      const themes = {
        blue: {
          bg: 'linear-gradient(135deg, #0a0e27 0%, #1a1d3a 50%, #2a1e4d 100%)',
          sceneBg: '#0a0e27',
          primary: '#3b82f6',
          secondary: '#6366f1',
        },
        purple: {
          bg: 'linear-gradient(135deg, #1a0a27 0%, #2d1a3a 50%, #3d1e4d 100%)',
          sceneBg: '#1a0a27',
          primary: '#a855f7',
          secondary: '#c026d3',
        },
        green: {
          bg: 'linear-gradient(135deg, #0a271a 0%, #1a3a2d 50%, #1e4d3d 100%)',
          sceneBg: '#0a271a',
          primary: '#10b981',
          secondary: '#14b8a6',
        },
        orange: {
          bg: 'linear-gradient(135deg, #271a0a 0%, #3a2d1a 50%, #4d3d1e 100%)',
          sceneBg: '#271a0a',
          primary: '#f97316',
          secondary: '#f59e0b',
        },
        dark: {
          bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)',
          sceneBg: '#0a0a0a',
          primary: '#6b7280',
          secondary: '#9ca3af',
        },
        custom: {
          bg: `linear-gradient(135deg, ${this.customBgColor1} 0%, ${this.customBgColor2} 100%)`,
          sceneBg: this.customBgColor1,
          primary: this.customPrimaryColor,
          secondary: this.customSecondaryColor,
        },
      };
      return themes[this.theme] || themes.blue;
    },
    async init() {
      this.canvas = this.$refs.canvas;
      const w = this.canvas.clientWidth || 1;
      const h = this.canvas.clientHeight || 1;

      // 场景 / 相机 / 渲染器
      this.scene = new THREE.Scene();
      const colors = this.getThemeColors();
      this.scene.background = new THREE.Color(colors.sceneBg);

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
      document.addEventListener("click", this.handleClickOutside);

      // ---- M1/M2 核心：加载 + 识别骨骼 + 指令 ----
      this.ai = new AniAI();
      try {
        await this.ai.loadModel(this.modelUrl);
        // 作为配置缓存的分桶标识（GUIPanel 用它区分不同模型的键位配置）
        this.ai.modelName = this.modelUrl.split("/").pop();
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
        { onImport: (file) => this.reloadModel(file) },
        { container: this.$refs.guiContainer }
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

<style>
/* CSS变量 - 通过JS动态更新 */
.aniai-container {
  --theme-primary: #3b82f6;
  --theme-secondary: #6366f1;
  --theme-primary-light: rgba(96, 165, 250, 0.6);
  --theme-primary-glow: rgba(59, 130, 246, 0.4);
}

/* 全屏平铺 */
.aniai-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  z-index: 101;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1d3a 50%, #2a1e4d 100%);
}
.aniai-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* ========== 顶部菜单栏 ========== */
.aniai-menubar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: linear-gradient(180deg, rgba(15, 20, 40, 0.95) 0%, rgba(10, 15, 30, 0.92) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(59, 130, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6), 0 0 60px rgba(59, 130, 246, 0.1);
  z-index: 100;
}

.aniai-menu-left,
.aniai-menu-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.aniai-menu-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  letter-spacing: 0.4px;
  background: rgba(30, 40, 70, 0.3);
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.aniai-menu-item:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(99, 102, 241, 0.35) 100%);
  border-color: rgba(59, 130, 246, 0.5);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.aniai-menu-item:active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(99, 102, 241, 0.5) 100%);
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

/* 激活状态的菜单项 - 使用动态主题色 */
.aniai-menu-item.active {
  background: linear-gradient(135deg, var(--theme-primary, #3b82f6) 0%, var(--theme-secondary, #6366f1) 100%);
  border-color: var(--theme-primary-light, rgba(96, 165, 250, 0.6));
  color: #ffffff;
  box-shadow: 0 0 20px var(--theme-primary-glow, rgba(59, 130, 246, 0.4));
}

.menu-icon {
  font-size: 17px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* GUI容器 - 从顶部菜单栏下方弹出 */
.aniai-gui-container {
  position: fixed;
  top: 48px;
  left: 20px;
  z-index: 99;
  transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 底部提示 */
.aniai-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  text-align: center;
  letter-spacing: 0.3px;
}

/* ========== 主题选择器面板 ========== */
.aniai-theme-panel {
  position: fixed;
  top: 48px;
  right: auto;
  z-index: 99;
  background: rgba(10, 15, 30, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 0 0 12px 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-top: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  padding: 12px;
  min-width: 200px;
  max-width: 280px;
  transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 500;
  position: relative;
}

.theme-item:hover {
  background: rgba(59, 130, 246, 0.15);
  color: #ffffff;
}

.theme-preview {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.theme-preview.blue {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
}

.theme-preview.purple {
  background: linear-gradient(135deg, #a855f7 0%, #c026d3 100%);
}

.theme-preview.green {
  background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
}

.theme-preview.orange {
  background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%);
}

.theme-preview.dark {
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
}

.theme-check {
  margin-left: auto;
  color: #10b981;
  font-size: 16px;
  font-weight: 700;
}

.theme-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

/* 自定义颜色选择器 */
.custom-color-picker {
  padding: 8px 0;
  margin-top: 8px;
}

.color-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin: 4px 0;
  justify-content: space-between;
}

.color-row label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 65px;
  font-weight: 500;
  flex-shrink: 0;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.color-row input[type="color"] {
  width: 40px;
  height: 32px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  transition: all 0.2s ease;
}

.color-row input[type="color"]:hover {
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.color-value {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-family: monospace;
  text-transform: uppercase;
  min-width: 60px;
  text-align: right;
}

/* ========== lil-gui 面板样式 ========== */

/* 主面板容器 */
.aniai-gui-container :deep(.lil-gui) {
  --background-color: rgba(10, 15, 30, 0.75);
  --text-color: #ffffff;
  --title-background-color: rgba(20, 25, 45, 0.9);
  --title-text-color: #ffffff;
  --widget-color: rgba(40, 50, 80, 0.6);
  --hover-color: rgba(80, 95, 140, 0.8);
  --focus-color: rgba(59, 130, 246, 0.7);
  --number-color: #60a5fa;
  --string-color: #93c5fd;

  border-radius: 0 0 12px 12px !important;
  border: 1px solid rgba(59, 130, 246, 0.2) !important;
  border-top: none !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  width: 320px !important;
  overflow: hidden;
}

/* 隐藏主标题栏（菜单栏已经显示了标题） */
.aniai-gui-container :deep(.lil-gui > .title) {
  display: none;
}

/* 子文件夹 */
.aniai-gui-container :deep(.lil-gui .lil-gui) {
  border: none !important;
  margin: 8px 0;
  background: transparent;
}

.aniai-gui-container :deep(.lil-gui .lil-gui .title) {
  background: rgba(30, 35, 55, 0.5);
  border-radius: 8px;
  margin: 4px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.aniai-gui-container :deep(.lil-gui .lil-gui .title:hover) {
  background: rgba(50, 60, 90, 0.7);
  border-color: rgba(59, 130, 246, 0.3);
}

/* 折叠箭头 */
.aniai-gui-container :deep(.lil-gui .title:before) {
  border-color: #60a5fa !important;
  border-width: 5px !important;
}

/* 控制器行 */
.aniai-gui-container :deep(.lil-gui .controller) {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding: 10px 8px;
  transition: background 0.2s ease;
}

.aniai-gui-container :deep(.lil-gui .controller:hover) {
  background: rgba(40, 50, 80, 0.3);
}

/* 控制器标签 */
.aniai-gui-container :deep(.lil-gui .controller .name) {
  color: #e5e7eb;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

/* 输入框 */
.aniai-gui-container :deep(.lil-gui input[type="text"]),
.aniai-gui-container :deep(.lil-gui input[type="number"]) {
  background: rgba(20, 25, 45, 0.7);
  border: 1.5px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  padding: 7px 10px;
  transition: all 0.25s ease;
}

.aniai-gui-container :deep(.lil-gui input[type="text"]:hover),
.aniai-gui-container :deep(.lil-gui input[type="number"]:hover) {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(30, 35, 60, 0.8);
}

.aniai-gui-container :deep(.lil-gui input[type="text"]:focus),
.aniai-gui-container :deep(.lil-gui input[type="number"]:focus) {
  background: rgba(30, 35, 60, 0.9);
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  outline: none;
}

/* 下拉选择框 */
.aniai-gui-container :deep(.lil-gui select) {
  background: rgba(20, 25, 45, 0.7);
  border: 1.5px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  padding: 7px 10px;
  transition: all 0.25s ease;
  cursor: pointer;
}

.aniai-gui-container :deep(.lil-gui select:hover) {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(30, 35, 60, 0.8);
}

.aniai-gui-container :deep(.lil-gui select:focus) {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  outline: none;
}

/* 滑块 */
.aniai-gui-container :deep(.lil-gui input[type="range"]) {
  background: rgba(30, 40, 70, 0.5);
  border-radius: 10px;
  height: 5px;
}

.aniai-gui-container :deep(.lil-gui input[type="range"]::-webkit-slider-thumb) {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
  transition: all 0.2s ease;
  cursor: grab;
}

.aniai-gui-container :deep(.lil-gui input[type="range"]::-webkit-slider-thumb:hover) {
  transform: scale(1.15);
  box-shadow: 0 3px 12px rgba(59, 130, 246, 0.7);
}

.aniai-gui-container :deep(.lil-gui input[type="range"]::-webkit-slider-thumb:active) {
  cursor: grabbing;
  transform: scale(1.05);
}

.aniai-gui-container :deep(.lil-gui input[type="range"]::-moz-range-thumb) {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
  border: none;
  transition: all 0.2s ease;
  cursor: grab;
}

.aniai-gui-container :deep(.lil-gui input[type="range"]::-moz-range-thumb:hover) {
  transform: scale(1.15);
  box-shadow: 0 3px 12px rgba(59, 130, 246, 0.7);
}

.aniai-gui-container :deep(.lil-gui input[type="range"]::-moz-range-thumb:active) {
  cursor: grabbing;
  transform: scale(1.05);
}

/* 按钮 */
.aniai-gui-container :deep(.lil-gui button) {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  padding: 9px 14px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.aniai-gui-container :deep(.lil-gui button:hover) {
  background: linear-gradient(135deg, #60a5fa 0%, #818cf8 100%);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
}

.aniai-gui-container :deep(.lil-gui button:active) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

/* 复选框 */
.aniai-gui-container :deep(.lil-gui input[type="checkbox"]) {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid rgba(59, 130, 246, 0.5);
  background: rgba(20, 25, 45, 0.7);
  cursor: pointer;
  transition: all 0.25s ease;
}

.aniai-gui-container :deep(.lil-gui input[type="checkbox"]:hover) {
  border-color: #60a5fa;
}

.aniai-gui-container :deep(.lil-gui input[type="checkbox"]:checked) {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* 禁用状态 */
.aniai-gui-container :deep(.lil-gui .controller.disabled) {
  opacity: 0.35;
  pointer-events: none;
}

/* 滚动条 */
.aniai-gui-container :deep(.lil-gui)::-webkit-scrollbar {
  width: 6px;
}

.aniai-gui-container :deep(.lil-gui)::-webkit-scrollbar-track {
  background: transparent;
}

.aniai-gui-container :deep(.lil-gui)::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.4);
  border-radius: 10px;
  transition: background 0.2s ease;
}

.aniai-gui-container :deep(.lil-gui)::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.6);
}

/* 面板内容区域 */
.aniai-gui-container :deep(.lil-gui .children) {
  padding: 8px 0;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .aniai-menubar {
    height: 40px;
    padding: 0 8px;
  }

  .aniai-menu-item {
    padding: 5px 10px;
    font-size: 12px;
    gap: 4px;
  }

  .menu-icon {
    font-size: 14px;
  }

  .aniai-gui-container {
    left: 10px;
    right: 10px;
  }

  .aniai-gui-container :deep(.lil-gui) {
    width: calc(100vw - 20px) !important;
    max-width: 320px;
  }

  .aniai-hint {
    font-size: 11px;
    padding: 6px 12px;
    max-width: 90%;
  }
}
</style>
