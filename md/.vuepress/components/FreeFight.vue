<template>
  <div class="freefight-root">
    <canvas ref="canvas" class="ff-canvas" :class="{ hidden: screen !== 'arena' }"></canvas>

    <FreeFight-ui-RosterScreen
      v-if="screen === 'roster'"
      :factory="factory"
      :builtins="builtins"
      :accent="accent"
      @picked="onPicked"
      @start="startFight"
    />

    <FreeFight-ui-FightHUD
      v-else-if="screen === 'arena'"
      :debug="debug"
      :names="names"
      :paused="paused"
      @back="backToRoster"
      @reset="resetRound"
      @toggle-pause="togglePause"
      @step="stepOnce"
    />

    <div v-if="fatal" class="ff-fatal">
      <h3>出错了</h3>
      <p>{{ fatal }}</p>
      <button @click="backToRoster">返回选将</button>
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import { AssetRegistry } from "./FreeFight/core/AssetRegistry.js";
import { FighterFactory } from "./FreeFight/core/FighterFactory.js";
import { FightInput } from "./FreeFight/input/FightInput.js";
import { Arena } from "./FreeFight/fight/Arena.js";
import { BUILTIN_FIGHTERS } from "./FreeFight/data/builtins.js";

/**
 * FreeFight 主入口。
 *
 * 组件必须放在 components 根目录：@vuepress/plugin-register-components
 * 把相对路径的 / 换成 - 来命名，FreeFight/FreeFight.vue 会变成 <FreeFight-FreeFight>。
 * 同理，子组件被注册为 <FreeFight-ui-RosterScreen> / <FreeFight-ui-FightHUD>，
 * 模板里必须用这个名字引用。
 *
 * 三屏：roster（选将）→ studio（编招，F5）→ arena（开打）。
 * F2 只实现 roster ⇄ arena。
 */
export default {
  name: "FreeFight",
  data() {
    return {
      screen: "roster",
      builtins: BUILTIN_FIGHTERS,
      accent: "#4a9eff",
      debug: {},
      paused: false,
      fatal: "",
      names: { p1: "P1", p2: "P2" },
      picks: { p1: null, p2: null },
    };
  },
  created() {
    // 资产层与工厂在 created 就绪，选将界面立刻可用
    this.assets = new AssetRegistry();
    this.factory = new FighterFactory(this.assets);
  },
  mounted() {
    this.input = new FightInput();
    // 选将阶段不该响应游戏按键
    this.input.setEnabled(false);
    window.addEventListener("resize", this.onResize);

    // 便于控制台调试
    window.freeFight = this;
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    this.arena?.dispose();
    this.arena = null;
    this.input?.dispose();
    this.renderer?.dispose();
    this.assets?.dispose();
    window.freeFight = null;
  },
  methods: {
    onPicked({ slot, spec, facingDeg }) {
      this.picks[slot] = { spec, facingDeg };
    },

    async startFight() {
      if (!this.picks.p1 || !this.picks.p2) return;
      this.fatal = "";
      this.screen = "arena";
      // 等 canvas 从 hidden 状态恢复，拿到真实尺寸
      await this.$nextTick();

      try {
        this._ensureRenderer();

        // 两名战士各自独立构造（同模型时 AssetRegistry 会各给一份克隆）
        const [f1, f2] = await Promise.all([
          this.factory.create(this.picks.p1.spec, {
            slot: "p1",
            facingOffset: THREE.MathUtils.degToRad(this.picks.p1.facingDeg || 0),
          }),
          this.factory.create(this.picks.p2.spec, {
            slot: "p2",
            facingOffset: THREE.MathUtils.degToRad(this.picks.p2.facingDeg || 0),
          }),
        ]);

        this.names = { p1: f1.displayName, p2: f2.displayName };

        this.arena?.dispose();
        this.arena = new Arena({
          scene: this.scene,
          camera: this.camera,
          renderer: this.renderer,
          input: this.input,
          fighters: [f1, f2],
          accent: new THREE.Color(this.accent).getHex(),
          onTick: (d) => { this.debug = { ...d }; },
        });

        this.input.setEnabled(true);
        this.paused = false;
        this.onResize();
        // 预编译着色器再启动，避免首帧编译耗时被计成丢帧
        await this.arena.startWhenReady();
      } catch (err) {
        console.error("[FreeFight] 进场失败", err);
        this.fatal = String(err?.message || err);
        this.input.setEnabled(false);
      }
    },

    _ensureRenderer() {
      if (this.renderer) return;
      const canvas = this.$refs.canvas;
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0a0e1f);
      this.scene.fog = new THREE.Fog(0x0a0e1f, 14, 30);

      this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },

    onResize() {
      if (!this.renderer) return;
      const canvas = this.$refs.canvas;
      const w = canvas?.clientWidth || window.innerWidth;
      const h = canvas?.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
    },

    backToRoster() {
      this.arena?.stop();
      this.input?.setEnabled(false);
      this.screen = "roster";
      this.fatal = "";
    },

    resetRound() {
      this.arena?.reset();
    },

    togglePause() {
      if (!this.arena) return;
      if (this.paused) {
        this.arena.resume();
        this.paused = false;
      } else {
        this.arena.pause();
        this.paused = true;
      }
    },

    stepOnce() {
      this.arena?.stepOnce();
    },
  },
};
</script>

<style>
.freefight-root {
  position: fixed;
  inset: 0;
  z-index: 101;
  background: linear-gradient(135deg, #070b18 0%, #101733 55%, #1a1436 100%);
  overflow: hidden;
}

.ff-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.ff-canvas.hidden { visibility: hidden; }

.ff-fatal {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(12, 18, 34, 0.95);
  border: 1px solid rgba(248, 113, 113, 0.45);
  border-radius: 12px;
  padding: 22px 26px;
  max-width: 420px;
  color: #eaf1ff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-align: center;
}
.ff-fatal h3 { margin: 0 0 8px; color: #fca5a5; font-size: 16px; }
.ff-fatal p { margin: 0 0 16px; font-size: 13px; line-height: 1.6; opacity: 0.85; }
.ff-fatal button {
  padding: 8px 20px; font-size: 13px; font-weight: 600;
  background: rgba(74, 158, 255, 0.25); color: #cfe0ff;
  border: 1px solid rgba(74, 158, 255, 0.5);
  border-radius: 8px; cursor: pointer;
}
</style>
