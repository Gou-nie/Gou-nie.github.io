<template>
  <div class="ff-hud">
    <!-- 顶部：血条 + 气槽 + 回合 + 计时（F4 起接 debug.hud 真数据） -->
    <div class="ff-top">
      <div class="ff-bar-wrap left">
        <div class="ff-name">{{ names.p1 }}</div>
        <div class="ff-bar"><div class="ff-fill p1" :style="{ width: hpP1 + '%' }"></div></div>
        <div class="ff-meter"><div class="ff-meter-fill p1" :style="{ width: meterP1 + '%' }"></div></div>
        <div class="ff-pips">
          <i v-for="n in neededWins" :key="n" :class="{ on: n <= winsP1 }">●</i>
        </div>
      </div>
      <div class="ff-timer">{{ timer }}</div>
      <div class="ff-bar-wrap right">
        <div class="ff-name">{{ names.p2 }}</div>
        <div class="ff-bar"><div class="ff-fill p2" :style="{ width: hpP2 + '%' }"></div></div>
        <div class="ff-meter"><div class="ff-meter-fill p2" :style="{ width: meterP2 + '%' }"></div></div>
        <div class="ff-pips">
          <i v-for="n in neededWins" :key="n" :class="{ on: n <= winsP2 }">●</i>
        </div>
      </div>
    </div>

    <!-- 连击弹字 -->
    <div v-if="comboCount >= 2" class="ff-combo">{{ comboCount }} HIT COMBO!</div>

    <!-- K.O. / 胜负横幅 -->
    <div v-if="phase === 'ko'" class="ff-banner">K.O.!</div>
    <div v-else-if="phase === 'matchEnd'" class="ff-banner">{{ winnerLabel }} 获胜</div>

    <!-- 调试面板：F2 的验收窗口（逐帧步进用） -->
    <div v-if="showDebug" class="ff-debug">
      <div class="ff-debug-row head">
        <span>tick {{ debug.tick }}</span>
        <span>距离 {{ debug.distance?.toFixed(2) }}m</span>
        <span v-if="debug.stalls">丢帧 {{ debug.stalls }}</span>
        <span class="ff-fps">{{ fps }} fps</span>
      </div>
      <div v-for="slot in ['p1','p2']" :key="slot" class="ff-debug-row">
        <b :class="slot">{{ slot.toUpperCase() }}</b>
        <span class="st">{{ debug[slot]?.state }}</span>
        <span>{{ debug[slot]?.frames }}f</span>
        <span class="hp">HP {{ debug[slot]?.hp }}</span>
        <span>y {{ debug[slot]?.y?.toFixed(2) }}</span>
        <span>v {{ debug[slot]?.speed?.toFixed(2) }}</span>
        <span :class="{ air: !debug[slot]?.grounded }">
          {{ debug[slot]?.grounded ? '地' : '空' }}
        </span>
        <!-- F3：当前招式 + 相位 + 帧数/总帧（逐帧步进验收用） -->
        <span v-if="debug[slot]?.move" class="mv">
          {{ debug[slot].move.label }}·{{ debug[slot].move.phase }}
          {{ debug[slot].move.frame }}/{{ debug[slot].move.total }}
        </span>
      </div>
    </div>

    <!-- 底部操作提示 -->
    <div class="ff-controls">
      <button @click="$emit('back')">← 选将</button>
      <button @click="$emit('reset')">↺ 重置站位</button>
      <button @click="$emit('toggle-pause')">{{ paused ? '▶ 继续' : '⏸ 暂停' }}</button>
      <button v-if="paused" @click="$emit('step')">⏭ 逐帧</button>
      <button @click="showDebug = !showDebug">{{ showDebug ? '隐藏' : '显示' }}调试</button>
    </div>

    <div class="ff-keys">
      <span><b>P1</b> WASD·Q跳·E防·双击冲刺</span>
      <span><b>P2</b> ↑↓←→·Num0跳·Num.防</span>
    </div>
  </div>
</template>

<script>
/**
 * 战斗 HUD。F2 阶段的核心价值是调试面板（验收窗口）。
 * F4 起顶部血条/气槽/计时/回合/连击/KO 横幅全部接 Arena.debug.hud 的真数据。
 */
export default {
  name: "FreeFightHUD",
  props: {
    debug: { type: Object, default: () => ({}) },
    names: { type: Object, default: () => ({ p1: "P1", p2: "P2" }) },
    paused: { type: Boolean, default: false },
  },
  emits: ["back", "reset", "toggle-pause", "step"],
  data() {
    return {
      showDebug: true,
      fps: 0,
    };
  },
  computed: {
    hud() {
      return this.debug?.hud || {};
    },
    hpP1() { return this.hud.hp?.p1 ?? 100; },
    hpP2() { return this.hud.hp?.p2 ?? 100; },
    meterP1() { return this.hud.meter?.p1 ?? 0; },
    meterP2() { return this.hud.meter?.p2 ?? 0; },
    timer() { return this.hud.timer ?? 99; },
    winsP1() { return this.hud.wins?.p1 ?? 0; },
    winsP2() { return this.hud.wins?.p2 ?? 0; },
    neededWins() { return this.hud.neededWins ?? 2; },
    phase() { return this.hud.phase || "fighting"; },
    winner() { return this.hud.winner || null; },
    comboCount() {
      return Math.max(this.hud.combo?.p1 ?? 0, this.hud.combo?.p2 ?? 0);
    },
    winnerLabel() {
      return this.winner === "p1" ? this.names.p1 : this.winner === "p2" ? this.names.p2 : "";
    },
  },
  mounted() {
    // FPS 用真实 rAF 采样，与固定步长的 tick 分开看，才能发现「逻辑稳但渲染掉帧」
    let frames = 0;
    let last = performance.now();
    const sample = () => {
      this._fpsRaf = requestAnimationFrame(sample);
      frames++;
      const now = performance.now();
      if (now - last >= 500) {
        this.fps = Math.round((frames * 1000) / (now - last));
        frames = 0;
        last = now;
      }
    };
    this._fpsRaf = requestAnimationFrame(sample);
  },
  beforeUnmount() {
    cancelAnimationFrame(this._fpsRaf);
  },
};
</script>

<style scoped>
.ff-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  color: #eaf1ff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.ff-top {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 14px 18px;
}
.ff-bar-wrap { flex: 1; }
.ff-bar-wrap.right { text-align: right; }
.ff-name {
  font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
  margin-bottom: 4px; opacity: 0.9;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ff-bar {
  height: 15px; border-radius: 8px;
  background: rgba(0,0,0,0.55);
  border: 1px solid rgba(255,255,255,0.16);
  overflow: hidden;
}
.ff-fill { height: 100%; transition: width 0.25s ease-out; }
.ff-fill.p1 { background: linear-gradient(90deg, #2563eb, #60a5fa); }
.ff-fill.p2 {
  background: linear-gradient(90deg, #fb7185, #f43f5e);
  margin-left: auto;
}
.ff-bar-wrap.right .ff-bar { display: flex; }

/* 气槽 */
.ff-meter {
  height: 5px; border-radius: 3px;
  margin-top: 3px;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.12);
  overflow: hidden;
}
.ff-meter-fill { height: 100%; transition: width 0.2s ease-out; }
.ff-meter-fill.p1 { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.ff-meter-fill.p2 {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  margin-left: auto;
}
.ff-bar-wrap.right .ff-meter { display: flex; }

/* 回合圆点 */
.ff-pips { margin-top: 5px; font-size: 11px; letter-spacing: 4px; }
.ff-pips i { font-style: normal; opacity: 0.22; }
.ff-pips i.on { opacity: 1; text-shadow: 0 0 6px rgba(255,255,255,0.8); }
.ff-bar-wrap.right .ff-pips { direction: rtl; }

.ff-timer {
  font-size: 27px; font-weight: 800; font-variant-numeric: tabular-nums;
  min-width: 62px; text-align: center;
  text-shadow: 0 2px 8px rgba(0,0,0,0.85);
}

/* 连击弹字 */
.ff-combo {
  position: absolute; top: 18%; left: 50%;
  transform: translateX(-50%);
  font-size: 34px; font-weight: 900; font-style: italic;
  color: #fde047;
  text-shadow: 0 0 12px rgba(250, 204, 21, 0.8), 0 2px 4px rgba(0,0,0,0.8);
  animation: ff-combo-pop 0.18s ease-out;
}
@keyframes ff-combo-pop {
  from { transform: translateX(-50%) scale(1.4); opacity: 0; }
  to   { transform: translateX(-50%) scale(1); opacity: 1; }
}

/* K.O. / 胜负横幅 */
.ff-banner {
  position: absolute; top: 40%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 64px; font-weight: 900; font-style: italic;
  color: #fff; letter-spacing: 2px;
  text-shadow: 0 0 22px rgba(244, 63, 94, 0.9), 0 3px 6px rgba(0,0,0,0.85);
  animation: ff-banner-in 0.3s ease-out;
}
@keyframes ff-banner-in {
  from { transform: translate(-50%, -50%) scale(2); opacity: 0; }
  to   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.ff-debug {
  position: absolute; top: 90px; left: 18px;
  background: rgba(6, 10, 22, 0.82);
  border: 1px solid rgba(122, 162, 255, 0.2);
  border-radius: 9px;
  padding: 9px 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  line-height: 1.75;
  backdrop-filter: blur(8px);
}
.ff-debug-row { display: flex; gap: 11px; align-items: baseline; }
.ff-debug-row.head { opacity: 0.72; border-bottom: 1px solid rgba(255,255,255,0.09); padding-bottom: 4px; margin-bottom: 4px; }
.ff-debug-row b.p1 { color: #7cc4ff; }
.ff-debug-row b.p2 { color: #ffa9a3; }
.ff-debug-row .st { min-width: 74px; color: #fcd34d; }
.ff-debug-row .hp { color: #fda4af; }
.ff-debug-row .air { color: #86efac; }
.ff-debug-row .mv { color: #a7f3d0; }
.ff-fps { margin-left: auto; opacity: 0.65; }

.ff-controls {
  position: absolute; bottom: 40px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 7px;
  pointer-events: auto;
}
.ff-controls button {
  padding: 7px 14px; font-size: 12px; font-weight: 600;
  background: rgba(16, 24, 44, 0.86);
  color: #cfe0ff;
  border: 1px solid rgba(122, 162, 255, 0.26);
  border-radius: 8px; cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.15s;
}
.ff-controls button:hover { background: rgba(74, 158, 255, 0.28); color: #fff; }

.ff-keys {
  position: absolute; bottom: 12px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 18px;
  font-size: 10.5px; opacity: 0.42;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .ff-timer { font-size: 20px; min-width: 46px; }
  .ff-debug { font-size: 10px; top: 82px; left: 10px; }
  .ff-banner { font-size: 40px; }
  .ff-combo { font-size: 24px; }
  .ff-controls { flex-wrap: wrap; justify-content: center; max-width: 94vw; }
}
</style>
