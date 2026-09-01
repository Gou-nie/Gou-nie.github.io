import { PoseStore, SavePose, ApplyPose } from "./commands/PoseCommands.js";
import { Sequence, Parallel, Loop } from "./commands/CompositeCommands.js";
import { SetBoneRotation } from "./commands/BoneCommands.js";
import { RotateTo } from "./commands/AnimatedCommands.js";

const cloneEuler = (o) => ({ x: o.x, y: o.y, z: o.z, clone: () => cloneEuler(o) });

function makeBone(name, x = 0, y = 0, z = 0) {
  const bone = { name };
  bone.rotation = { x, y, z, clone: () => cloneEuler(bone.rotation) };
  return bone;
}

function makeRegistry() {
  const bones = { A: makeBone("A", 0, 0, 0), B: makeBone("B", 0.5, 0, 0) };
  return { names: () => Object.keys(bones), get: (n) => bones[n] || null };
}

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); pass++; console.log("  ✓", name); }
  catch (e) { fail++; console.log("  ✗", name, "→", e.message); }
};
const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

t("PoseStore.save 快照旋转", () => {
  const r = makeRegistry();
  const store = new PoseStore();
  r.get("A").rotation.z = 0.9;
  store.save("idle", r);
  if (store.get("idle").get("A").z !== 0.9) throw new Error("快照值错误");
});

t("SavePose 执行写入 store", () => {
  const r = makeRegistry();
  const store = new PoseStore();
  r.get("A").rotation.y = 0.3;
  new SavePose(store, r, "p1").execute();
  if (!store.has("p1")) throw new Error("未保存");
});

t("ApplyPose 过渡到目标姿态", () => {
  const r = makeRegistry();
  const store = new PoseStore();
  r.get("A").rotation.y = 0.3;
  store.save("p1", r);
  r.get("A").rotation.y = 0;
  const tl = new ApplyPose(store, r, "p1", { duration: 0.2 }).execute();
  tl.progress(1);
  if (!near(r.get("A").rotation.y, 0.3)) throw new Error(`期望 0.3，得 ${r.get("A").rotation.y}`);
});

t("ApplyPose 不存在姿态返回 null", () => {
  const r = makeRegistry();
  const store = new PoseStore();
  const out = new ApplyPose(store, r, "nope").execute();
  if (out !== null) throw new Error("应返回 null");
});

t("Sequence 组合即时+动画", () => {
  const r = makeRegistry();
  const seq = new Sequence([
    new SetBoneRotation(r.get("A"), { rotation: { x: 0, y: 0, z: 0 } }, { z: 0.5 }),
    new RotateTo(r.get("B"), { rotation: { x: 0.5, y: 0, z: 0 } }, { y: 0.7 }, { duration: 0.2 }),
  ]);
  const tl = seq.execute();
  tl.progress(1);
  if (!near(r.get("A").rotation.z, 0.5)) throw new Error("即时指令未生效");
  if (!near(r.get("B").rotation.y, 0.7)) throw new Error(`动画指令未生效，得 ${r.get("B").rotation.y}`);
});

t("Parallel 多指令并行", () => {
  const r = makeRegistry();
  const p = new Parallel([
    new RotateTo(r.get("A"), { rotation: { x: 0, y: 0, z: 0 } }, { x: 0.4 }, { duration: 0.2 }),
    new RotateTo(r.get("B"), { rotation: { x: 0.5, y: 0, z: 0 } }, { z: 0.6 }, { duration: 0.2 }),
  ]);
  const tl = p.execute();
  tl.progress(1);
  if (!near(r.get("A").rotation.x, 0.4)) throw new Error("A 未到位");
  if (!near(r.get("B").rotation.z, 0.6)) throw new Error("B 未到位");
});

function fakeTween() {
  const t = {
    totalDuration: () => 1,
    eventCallback(ev, cb) { if (ev === "onComplete") t._cb = cb; return t; },
    kill() {},
  };
  return t;
}

t("Loop 有限次数执行", () => {
  let count = 0, last;
  const cmd = {
    animated: true,
    execute() { count++; last = fakeTween(); return last; },
    stop() {},
  };
  const loop = new Loop(cmd, { times: 3 });
  loop.execute();
  if (count !== 1) throw new Error(`首次应 count=1，得 ${count}`);
  last._cb();
  last._cb();
  if (count !== 3) throw new Error(`期望 3 次，得 ${count}`);
  last._cb(); // times 已到 0，不应再执行
  if (count !== 3) throw new Error("超出次数仍执行了");
});

t("Loop stop 中断无限循环", () => {
  let count = 0, last;
  const cmd = {
    animated: true,
    execute() { count++; last = fakeTween(); return last; },
    stop() {},
  };
  const loop = new Loop(cmd, { times: -1 });
  loop.execute();
  loop.stop();
  last._cb(); // onComplete 触发，但 _running=false 不应重跑
  if (count !== 1) throw new Error(`stop 后不应继续，得 ${count}`);
});

console.log(`\n结果：${pass} 通过，${fail} 失败`);
process.exit(fail ? 1 : 0);
