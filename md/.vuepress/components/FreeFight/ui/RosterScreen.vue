<template>
  <div class="ff-roster">
    <div class="ff-roster-head">
      <h1>FREE FIGHT</h1>
      <p class="ff-sub">选择两名战士 · 任意 GLB 皆可参战</p>
    </div>

    <div class="ff-slots">
      <div v-for="slot in ['p1', 'p2']" :key="slot" class="ff-slot" :class="slot">
        <div class="ff-slot-head">
          <span class="ff-badge" :class="slot">{{ slot.toUpperCase() }}</span>
          <span class="ff-picked">{{ picked[slot]?.name || '未选择' }}</span>
        </div>

        <div class="ff-preview" :ref="el => setPreviewEl(slot, el)">
          <div v-if="loading[slot]" class="ff-preview-msg">载入中…</div>
          <div v-else-if="!picked[slot]" class="ff-preview-msg dim">请选择战士</div>
        </div>

        <div v-if="picked[slot]" class="ff-meta">
          <span class="ff-chip" :class="picked[slot].rig">
            {{ picked[slot].rig === 'skinned' ? '🦴 骨骼' : '🧱 刚体' }}
          </span>
          <span class="ff-chip ghost">高 {{ picked[slot].height?.toFixed(2) }}m</span>
          <span v-if="picked[slot].flat" class="ff-chip warn">扁平体型</span>
        </div>

        <div v-if="picked[slot]" class="ff-facing">
          <label>朝向校准</label>
          <div class="ff-facing-row">
            <button
              v-for="q in [0, 90, 180, 270]" :key="q"
              class="ff-quad" :class="{ on: facingDeg[slot] === q }"
              @click="setFacing(slot, q)"
            >{{ q }}°</button>
          </div>
          <input
            type="range" min="0" max="359" step="1"
            :value="facingDeg[slot]"
            @input="e => setFacing(slot, +e.target.value)"
          />
          <span class="ff-hint-sm">转到角色正面朝向屏幕外</span>
        </div>

        <div class="ff-list">
          <button
            v-for="m in builtins" :key="m.id"
            class="ff-item"
            :class="{ on: picked[slot]?.id === m.id }"
            :disabled="loading[slot]"
            @click="choose(slot, m)"
          >
            <span class="ff-item-name">{{ m.name }}</span>
            <span class="ff-item-rig">{{ m.rig === 'skinned' ? '🦴' : '🧱' }}</span>
          </button>
          <button class="ff-item import" :disabled="loading[slot]" @click="pickFile(slot)">
            📁 导入 GLB…
          </button>
        </div>

        <p v-if="errors[slot]" class="ff-error">{{ errors[slot] }}</p>
      </div>
    </div>

    <div class="ff-keyhint">
      <div><b>P1</b> WASD 移动 · Q 跳 · E 防御 · 双击方向冲刺</div>
      <div><b>P2</b> 方向键移动 · Num0 跳 · Num. 防御</div>
    </div>

    <div class="ff-actions">
      <button class="ff-btn ghost" disabled title="F5 里程碑">🔧 进入工房</button>
      <button class="ff-btn primary" :disabled="!ready" @click="$emit('start')">
        ⚔️ 开始战斗
      </button>
    </div>

    <input
      ref="fileInput" type="file" accept=".glb"
      style="display:none" @change="onFile"
    />
  </div>
</template>

<script>
import * as THREE from "three";

/**
 * 选将界面。每个槽位一个独立的小型 Three 预览（旋转展示）。
 *
 * 预览刻意用独立的 renderer 而非共享主场景：选将阶段没有战斗循环，
 * 独立小场景更简单，且离开界面时整体销毁即可，不会污染 Arena 的场景图。
 */
export default {
  name: "FreeFightRoster",
  props: {
    factory: { type: Object, required: true },
    builtins: { type: Array, required: true },
    accent: { type: String, default: "#4a9eff" },
  },
  emits: ["start", "picked"],
  data() {
    return {
      picked: { p1: null, p2: null },
      loading: { p1: false, p2: false },
      errors: { p1: "", p2: "" },
      facingDeg: { p1: 0, p2: 0 },
      _pendingSlot: null,
    };
  },
  computed: {
    ready() {
      return !!(this.picked.p1 && this.picked.p2) && !this.loading.p1 && !this.loading.p2;
    },
  },
  mounted() {
    this._previews = {};
    this._els = {};
    this._raf = requestAnimationFrame(this._tick);
  },
  beforeUnmount() {
    cancelAnimationFrame(this._raf);
    for (const slot of ["p1", "p2"]) this._teardownPreview(slot);
  },
  methods: {
    setPreviewEl(slot, el) {
      this._els = this._els || {};
      this._els[slot] = el;
    },

    async choose(slot, meta) {
      this.errors[slot] = "";
      this.loading[slot] = true;
      try {
        const fighter = await this.factory.create(
          { kind: "builtin", id: meta.id },
          { slot, facingOffset: THREE.MathUtils.degToRad(this.facingDeg[slot]) }
        );
        this._adopt(slot, fighter, { id: meta.id, name: meta.name, spec: { kind: "builtin", id: meta.id } });
      } catch (err) {
        this.errors[slot] = String(err?.message || err);
        console.error("[FreeFight] 载入失败", err);
      } finally {
        this.loading[slot] = false;
      }
    },

    pickFile(slot) {
      this._pendingSlot = slot;
      this.$refs.fileInput.click();
    },

    async onFile(e) {
      const file = e.target.files?.[0];
      e.target.value = "";
      const slot = this._pendingSlot;
      if (!file || !slot) return;

      this.errors[slot] = "";
      this.loading[slot] = true;
      try {
        const spec = { kind: "import", file };
        const fighter = await this.factory.create(spec, {
          slot,
          facingOffset: THREE.MathUtils.degToRad(this.facingDeg[slot]),
        });
        this._adopt(slot, fighter, {
          id: `import:${file.name}`,
          name: file.name.replace(/\.glb$/i, ""),
          spec,
        });
      } catch (err) {
        this.errors[slot] = String(err?.message || err);
        console.error("[FreeFight] 导入失败", err);
      } finally {
        this.loading[slot] = false;
      }
    },

    /** 接管一个新造出的 Fighter：更新元信息 + 重建预览 */
    _adopt(slot, fighter, info) {
      const m = fighter.metrics();
      this.picked[slot] = {
        id: info.id,
        name: info.name,
        spec: info.spec,
        rig: fighter.kind,
        height: m.height,
        flat: m.flat,
      };
      this._buildPreview(slot, fighter);
      this.$emit("picked", { slot, spec: info.spec, facingDeg: this.facingDeg[slot] });
    },

    setFacing(slot, deg) {
      this.facingDeg[slot] = deg;
      const p = this._previews[slot];
      if (p?.fighter) {
        // facingPivot 就是校准层，直接改它即可，无需重建模型
        p.fighter.parts.facingPivot.rotation.y = THREE.MathUtils.degToRad(deg);
      }
      if (this.picked[slot]) {
        this.$emit("picked", {
          slot,
          spec: this.picked[slot].spec,
          facingDeg: deg,
        });
      }
    },

    _buildPreview(slot, fighter) {
      this._teardownPreview(slot);
      const el = this._els?.[slot];
      if (!el) return;

      const w = el.clientWidth || 240;
      const h = el.clientHeight || 240;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
      camera.position.set(0, 1.2, 4.2);
      camera.lookAt(0, 0.9, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 1.9);
      key.position.set(2, 4, 3);
      scene.add(key);
      const rim = new THREE.DirectionalLight(new THREE.Color(this.accent), 0.7);
      rim.position.set(-2, 2, -3);
      scene.add(rim);

      // 脚下的圆盘，给个地面参照
      const discGeo = new THREE.CircleGeometry(1.1, 48);
      discGeo.rotateX(-Math.PI / 2);
      const discMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(this.accent), transparent: true, opacity: 0.14,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      scene.add(disc);

      const spin = new THREE.Group();
      spin.add(fighter.root);
      scene.add(spin);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      this._previews[slot] = { scene, camera, renderer, spin, fighter, disc, discGeo, discMat };
    },

    _teardownPreview(slot) {
      const p = this._previews?.[slot];
      if (!p) return;
      p.renderer.domElement.remove();
      p.renderer.dispose();
      p.discGeo.dispose();
      p.discMat.dispose();
      // fighter 的 geometry/material 由 AssetRegistry 统一释放，这里只摘出场景
      p.fighter.detach();
      delete this._previews[slot];
    },

    _tick() {
      this._raf = requestAnimationFrame(this._tick);
      for (const slot of ["p1", "p2"]) {
        const p = this._previews?.[slot];
        if (!p) continue;
        p.spin.rotation.y += 0.006;
        p.renderer.render(p.scene, p.camera);
      }
    },
  },
};
</script>

<style scoped>
.ff-roster {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px;
  overflow-y: auto;
  color: #e8eefc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.ff-roster-head { text-align: center; margin-bottom: 18px; }
.ff-roster-head h1 {
  margin: 0;
  font-size: 30px;
  letter-spacing: 5px;
  font-weight: 800;
  background: linear-gradient(135deg, #7cc4ff, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.ff-sub { margin: 6px 0 0; font-size: 13px; opacity: 0.62; }

.ff-slots {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  width: 100%;
  max-width: 880px;
}

.ff-slot {
  background: rgba(14, 20, 38, 0.72);
  border: 1px solid rgba(122, 162, 255, 0.18);
  border-radius: 14px;
  padding: 14px;
  backdrop-filter: blur(14px);
}
.ff-slot.p1 { border-top: 3px solid #4a9eff; }
.ff-slot.p2 { border-top: 3px solid #f9736b; }

.ff-slot-head {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}
.ff-badge {
  font-size: 11px; font-weight: 800; letter-spacing: 1px;
  padding: 3px 9px; border-radius: 6px;
}
.ff-badge.p1 { background: rgba(74, 158, 255, 0.22); color: #8cc6ff; }
.ff-badge.p2 { background: rgba(249, 115, 107, 0.22); color: #ffa9a3; }
.ff-picked {
  font-size: 14px; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.ff-preview {
  position: relative;
  height: 190px;
  border-radius: 10px;
  background: radial-gradient(circle at 50% 65%, rgba(74,158,255,0.10), rgba(0,0,0,0.28));
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.ff-preview :deep(canvas) { display: block; }
.ff-preview-msg { font-size: 12px; opacity: 0.7; }
.ff-preview-msg.dim { opacity: 0.35; }

.ff-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 9px 0; }
.ff-chip {
  font-size: 11px; padding: 3px 8px; border-radius: 999px;
  background: rgba(255,255,255,0.07);
}
.ff-chip.skinned { background: rgba(74, 222, 128, 0.16); color: #86efac; }
.ff-chip.rigid { background: rgba(251, 191, 36, 0.16); color: #fcd34d; }
.ff-chip.warn { background: rgba(248, 113, 113, 0.16); color: #fca5a5; }
.ff-chip.ghost { opacity: 0.6; }

.ff-facing { margin: 8px 0 12px; }
.ff-facing > label {
  display: block; font-size: 11px; opacity: 0.6; margin-bottom: 5px;
}
.ff-facing-row { display: flex; gap: 5px; margin-bottom: 6px; }
.ff-quad {
  flex: 1; padding: 5px 0; font-size: 11px; cursor: pointer;
  background: rgba(255,255,255,0.05); color: #cfe0ff;
  border: 1px solid rgba(255,255,255,0.08); border-radius: 6px;
  transition: all 0.15s;
}
.ff-quad:hover { background: rgba(74,158,255,0.18); }
.ff-quad.on { background: rgba(74,158,255,0.34); border-color: #4a9eff; color: #fff; }
.ff-facing input[type="range"] { width: 100%; accent-color: #4a9eff; }
.ff-hint-sm { font-size: 10px; opacity: 0.42; }

.ff-list { display: flex; flex-direction: column; gap: 4px; }
.ff-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 11px; font-size: 13px; cursor: pointer;
  background: rgba(255,255,255,0.04); color: #dbe7ff;
  border: 1px solid transparent; border-radius: 8px;
  transition: all 0.15s;
}
.ff-item:hover:not(:disabled) { background: rgba(74,158,255,0.16); }
.ff-item.on { background: rgba(74,158,255,0.26); border-color: rgba(74,158,255,0.5); }
.ff-item:disabled { opacity: 0.4; cursor: default; }
.ff-item.import { justify-content: center; opacity: 0.78; border-style: dashed; border-color: rgba(255,255,255,0.16); }
.ff-item-rig { opacity: 0.75; }

.ff-error {
  margin: 8px 0 0; font-size: 11px; line-height: 1.5;
  color: #fca5a5; background: rgba(248,113,113,0.1);
  padding: 7px 9px; border-radius: 6px;
}

.ff-keyhint {
  display: flex; gap: 22px; margin: 16px 0 4px;
  font-size: 11px; opacity: 0.5; flex-wrap: wrap; justify-content: center;
}

.ff-actions { display: flex; gap: 12px; margin-top: 14px; }
.ff-btn {
  padding: 11px 28px; font-size: 14px; font-weight: 700;
  border: none; border-radius: 10px; cursor: pointer;
  transition: all 0.2s;
}
.ff-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff;
  box-shadow: 0 4px 16px rgba(59,130,246,0.34);
}
.ff-btn.primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(59,130,246,0.5); }
.ff-btn.ghost { background: rgba(255,255,255,0.07); color: #b9c9e8; }
.ff-btn:disabled { opacity: 0.36; cursor: not-allowed; transform: none; box-shadow: none; }

@media (max-width: 760px) {
  .ff-slots { grid-template-columns: 1fr; }
  .ff-preview { height: 160px; }
}
</style>
