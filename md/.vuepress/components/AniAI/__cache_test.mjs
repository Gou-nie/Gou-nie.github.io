/**
 * 缓存相关的回归测试：PoseStore 的 serialize/hydrate 往返，ConfigStore 的读写与容错。
 * 用法：node md/.vuepress/components/AniAI/__cache_test.mjs
 */
import { PoseStore } from "./commands/PoseCommands.js";
import { ConfigStore } from "./core/ConfigStore.js";

// 简易 localStorage 桩，让 ConfigStore 在 Node 下可测
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
};

function makeBone(name, x = 0, y = 0, z = 0) {
  return { name, rotation: { x, y, z, order: "XYZ", clone: () => ({ x, y, z, order: "XYZ" }) } };
}
function makeRegistry(bones) {
  return { names: () => Object.keys(bones), get: (n) => bones[n] || null };
}

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); pass++; console.log("  ✓", name); }
  catch (e) { fail++; console.log("  ✗", name, "→", e.message); }
};
const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

t("PoseStore serialize → hydrate 往返保值", () => {
  const reg = makeRegistry({ A: makeBone("A", 0.1, 0.2, 0.3), B: makeBone("B", -1, 0, 0.5) });
  const s1 = new PoseStore();
  s1.save("idle", reg);
  const json = JSON.parse(JSON.stringify(s1.serialize()));

  const s2 = new PoseStore();
  const n = s2.hydrate(json);
  if (n !== 1) throw new Error(`应恢复 1 个姿态，得 ${n}`);
  const snap = s2.get("idle");
  if (!snap) throw new Error("姿态丢失");
  if (!near(snap.get("A").x, 0.1) || !near(snap.get("A").z, 0.3)) throw new Error("A 旋转值不符");
  if (!near(snap.get("B").x, -1)) throw new Error("B 旋转值不符");
});

t("hydrate 容错：非法输入不抛错", () => {
  const s = new PoseStore();
  if (s.hydrate(null) !== 0) throw new Error("null 应返回 0");
  if (s.hydrate(undefined) !== 0) throw new Error("undefined 应返回 0");
  if (s.hydrate({ bad: "not-an-object" }) !== 0) throw new Error("非对象值应跳过");
  if (s.hydrate({ p: { A: [1] } }) !== 0) throw new Error("长度不足的数组应跳过");
});

t("hydrate 后可被 names() 看到（自定义动作下拉依赖）", () => {
  const s = new PoseStore();
  s.hydrate({ jump: { A: [0, 1, 0, "XYZ"] }, duck: { A: [0, -1, 0, "XYZ"] } });
  const names = s.names().sort();
  if (names.join(",") !== "duck,jump") throw new Error(`得 ${names.join(",")}`);
});

t("ConfigStore 空槽位返回完整空结构", () => {
  const c = new ConfigStore("empty.glb");
  const d = c.load();
  if (typeof d.bindings !== "object" || !Array.isArray(d.actions) || typeof d.poses !== "object") {
    throw new Error("结构不完整");
  }
});

t("ConfigStore save → load 往返", () => {
  const c = new ConfigStore("mimikyu.glb");
  c.save({ bindings: { reset: { key: "r", mode: "press" } }, actions: [{ id: "custom-1" }], poses: {} });
  const d = c.load();
  if (d.bindings.reset.key !== "r") throw new Error("键位未保存");
  if (d.actions[0].id !== "custom-1") throw new Error("动作未保存");
});

t("ConfigStore 按模型分桶互不干扰", () => {
  const a = new ConfigStore("a.glb");
  const b = new ConfigStore("b.glb");
  a.save({ bindings: { x: { key: "1", mode: "press" } }, actions: [], poses: {} });
  if (Object.keys(b.load().bindings).length !== 0) throw new Error("桶之间串了");
});

t("ConfigStore 损坏 JSON 走降级而非抛错", () => {
  const c = new ConfigStore("broken.glb");
  store.set(c.storageKey, "{not json");
  const d = c.load();
  if (Object.keys(d.bindings).length !== 0) throw new Error("应降级为空");
});

t("ConfigStore.clear 清空槽位", () => {
  const c = new ConfigStore("tmp.glb");
  c.save({ bindings: { z: { key: "z", mode: "press" } }, actions: [], poses: {} });
  c.clear();
  if (Object.keys(c.load().bindings).length !== 0) throw new Error("未清空");
});

console.log(`\n结果：${pass} 通过，${fail} 失败`);
process.exit(fail ? 1 : 0);
