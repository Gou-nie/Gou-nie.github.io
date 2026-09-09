/**
 * F2 验收测试：固定步长 + 输入 + 状态机 + 运动学 + 相机。
 * 运行：node md/.vuepress/components/FreeFight/__f2_test.mjs
 */
import * as THREE from "three";
import { FightLoop } from "./fight/FightLoop.js";
import { FightState, STATES } from "./fight/FightState.js";
import { CharacterController } from "./fight/CharacterController.js";
import { ArenaCamera } from "./fight/ArenaCamera.js";
import {
  integrate, clampToArena, resolveOverlap, updateFacing, applyKnockback,
} from "./fight/Physics.js";
import { FightInput, DEFAULT_BINDINGS } from "./input/FightInput.js";
import { buildNormalizedRig } from "./core/Normalizer.js";
import { RigidRig } from "./core/RigidRig.js";
import { Fighter } from "./core/FighterFactory.js";
import {
  STEP, WALK_SPEED, BACK_SPEED, ARENA_RADIUS, JUMP_VELOCITY, GRAVITY,
  DASH_FRAMES, MAX_CATCHUP, TURN_SPEED,
} from "./fight/constants.js";

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); pass++; console.log("  ✓", name); }
  catch (e) { fail++; console.log("  ✗", name, "→", e.message); }
};
const near = (a, b, eps = 1e-4) => Math.abs(a - b) < eps;
const assert = (c, m) => { if (!c) throw new Error(m || "断言失败"); };

/** 造一个可用于物理测试的战士 */
function makeFighter(slot = "p1") {
  const geo = new THREE.BoxGeometry(0.6, 1.8, 0.6);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
  const parts = buildNormalizedRig(mesh);
  const f = new Fighter({
    slot, rig: new RigidRig(parts), registry: null,
    modelScene: mesh, entry: null, parts,
  });
  f.state = new FightState();
  f.grounded = true;
  f.controller = new CharacterController(f);
  return f;
}

/** 空输入快照 */
const NO_INPUT = {
  forward: false, back: false, left: false, right: false,
  block: false, jumpTap: false, lightTap: false, heavyTap: false,
  specialTap: false, dash: null,
};
const inputWith = (o) => ({ ...NO_INPUT, ...o });

// ============================================================
console.log("\n[固定步长循环 —— §6.1 架构基石]");

/** 模拟 rAF，让循环可以在 node 里被驱动 */
function mockLoop() {
  let time = 0;
  const queue = [];
  globalThis.requestAnimationFrame = (cb) => { queue.push(cb); return queue.length; };
  globalThis.cancelAnimationFrame = () => {};
  globalThis.performance = { now: () => time };
  return {
    advance(ms) {
      time += ms;
      const pending = queue.splice(0, queue.length);
      for (const cb of pending) cb(time);
    },
    get pendingCount() { return queue.length; },
  };
}

t("60Hz 与 144Hz 下逻辑步数一致（同一套帧数据不能变成两个游戏）", () => {
  const results = {};
  for (const [label, frameMs] of [["60Hz", 1000 / 60], ["144Hz", 1000 / 144]]) {
    const mock = mockLoop();
    let ticks = 0;
    const loop = new FightLoop({
      fixedUpdate: () => { ticks++; },
      render: () => {},
      warmupFrames: 0,   // 关掉预热，测累加器本身
    });
    loop.start();
    // 模拟整 1 秒
    const frames = Math.round(1000 / frameMs);
    for (let i = 0; i < frames; i++) mock.advance(frameMs);
    loop.stop();
    results[label] = ticks;
  }
  // 两者都应约等于 60 步（允许 ±2 的累加器边界误差）
  assert(Math.abs(results["60Hz"] - 60) <= 2, `60Hz 应约 60 步，实为 ${results["60Hz"]}`);
  assert(Math.abs(results["144Hz"] - 60) <= 2, `144Hz 应约 60 步，实为 ${results["144Hz"]}`);
  assert(Math.abs(results["60Hz"] - results["144Hz"]) <= 2,
    `两种刷新率步数应一致：60Hz=${results["60Hz"]} vs 144Hz=${results["144Hz"]}`);
});

t("30Hz 低帧率下逻辑仍跑满 60 步（每帧补两步）", () => {
  const mock = mockLoop();
  let ticks = 0;
  const loop = new FightLoop({
    fixedUpdate: () => { ticks++; }, render: () => {}, warmupFrames: 0,
  });
  loop.start();
  for (let i = 0; i < 30; i++) mock.advance(1000 / 30);
  loop.stop();
  assert(Math.abs(ticks - 60) <= 2, `30Hz 下 1 秒应仍约 60 步，实为 ${ticks}`);
});

t("长时间卡顿被钳制，不会爆炸式追帧", () => {
  const mock = mockLoop();
  let ticks = 0;
  let stalled = 0;
  const loop = new FightLoop({
    fixedUpdate: () => { ticks++; },
    render: () => {},
    onStall: () => { stalled++; },
    warmupFrames: 0,
  });
  loop.start();
  mock.advance(30000); // 切标签页 30 秒后回来
  loop.stop();
  assert(ticks <= MAX_CATCHUP, `单帧最多补 ${MAX_CATCHUP} 步，实为 ${ticks}`);
  assert(stalled === 1, "应报告一次卡顿丢帧");
});

t("预热帧不追帧也不计丢帧（首帧 GPU 建立开销不该污染统计）", () => {
  const mock = mockLoop();
  let ticks = 0, stalled = 0;
  const loop = new FightLoop({
    fixedUpdate: () => { ticks++; },
    render: () => {},
    onStall: () => { stalled++; },
    warmupFrames: 3,
  });
  loop.start();
  // 前三帧模拟首帧编译着色器的巨大耗时
  mock.advance(800);
  mock.advance(400);
  mock.advance(200);
  assert(ticks === 3, `预热期每帧只推进一步，应为 3，实为 ${ticks}`);
  assert(stalled === 0, `预热期不该报丢帧，实为 ${stalled}`);

  // 预热结束后恢复正常追帧
  const before = ticks;
  mock.advance(1000 / 60);
  assert(ticks === before + 1, `预热后应正常推进，实际 +${ticks - before}`);
  loop.stop();
});

t("render 收到的 alpha 在 [0,1) 区间", () => {
  const mock = mockLoop();
  const alphas = [];
  const loop = new FightLoop({
    fixedUpdate: () => {},
    render: (a) => { alphas.push(a); },
    warmupFrames: 0,
  });
  loop.start();
  for (let i = 0; i < 20; i++) mock.advance(7); // 故意用非整步长的帧时间
  loop.stop();
  assert(alphas.length > 0, "应有渲染调用");
  for (const a of alphas) {
    assert(a >= 0 && a < 1, `alpha 应在 [0,1)，实为 ${a}`);
  }
});

t("暂停时不推进逻辑，但仍然渲染", () => {
  const mock = mockLoop();
  let ticks = 0, renders = 0;
  const loop = new FightLoop({
    fixedUpdate: () => { ticks++; },
    render: () => { renders++; },
  });
  loop.start();
  mock.advance(100);
  const before = ticks;
  loop.pause();
  for (let i = 0; i < 10; i++) mock.advance(16.7);
  loop.stop();
  assert(ticks === before, `暂停后逻辑不应推进（${before} → ${ticks}）`);
  assert(renders > 10, "暂停中应继续渲染");
});

t("暂停中可逐帧步进（训练模式）", () => {
  const mock = mockLoop();
  let ticks = 0;
  const loop = new FightLoop({ fixedUpdate: () => { ticks++; }, render: () => {} });
  loop.start();
  loop.pause();
  mock.advance(16.7);
  const before = ticks;
  loop.stepOnce();
  mock.advance(16.7);
  assert(ticks === before + 1, `stepOnce 应推进恰好一步（${before} → ${ticks}）`);
  loop.stop();
});

t("恢复后不追赶暂停期间的时间", () => {
  const mock = mockLoop();
  let ticks = 0;
  const loop = new FightLoop({ fixedUpdate: () => { ticks++; }, render: () => {} });
  loop.start();
  mock.advance(16.7);
  loop.pause();
  mock.advance(5000); // 暂停 5 秒
  const before = ticks;
  loop.resume();
  mock.advance(16.7);
  loop.stop();
  assert(ticks - before <= 2, `恢复后不该补 5 秒的帧，实际补了 ${ticks - before} 步`);
});

// ============================================================
console.log("\n[状态机]");

t("所有状态都有完整能力位定义", () => {
  const required = ["move", "attack", "turn", "gravity", "jump", "dash", "block", "moveMult"];
  for (const [name, caps] of Object.entries(STATES)) {
    for (const k of required) {
      assert(k in caps, `状态「${name}」缺少能力位 ${k}`);
    }
  }
});

t("attack 状态不可被打断（核心格斗规则）", () => {
  const st = new FightState();
  st.to("attack", { lock: 10 });
  assert(!st.to("walk"), "锁定期间不应允许切到 walk");
  assert(st.name === "attack", "状态应保持 attack");
  // force 可以强切（被命中）
  assert(st.to("hitstun", { force: true }), "force 应能强切");
  assert(st.name === "hitstun", "应切到 hitstun");
});

t("锁定帧数会随 tick 递减并到期解锁", () => {
  const st = new FightState();
  st.to("attack", { lock: 3 });
  assert(st.locked, "应处于锁定");
  st.tick(); st.tick(); st.tick();
  assert(!st.locked, "3 帧后应解锁");
  assert(st.to("idle"), "解锁后应可切换");
});

t("attack 状态禁止移动与转身（防止判定球瞬移）", () => {
  assert(STATES.attack.move === false, "attack 不该接受移动");
  assert(STATES.attack.turn === false, "attack 不该转身");
  assert(STATES.hitstun.turn === false, "hitstun 不该转身");
});

t("状态帧计数在切换时归零", () => {
  const st = new FightState();
  st.tick(); st.tick();
  assert(st.frames === 2, "应累计 2 帧");
  st.to("walk");
  assert(st.frames === 0, "切换后应归零");
});

// ============================================================
console.log("\n[运动学]");

t("重力使跳跃达到预期高度后落回地面", () => {
  const f = makeFighter();
  f.state.to("jump");
  f.velocity.y = JUMP_VELOCITY;
  f.grounded = false;

  let maxY = 0;
  let landedAt = -1;
  for (let i = 0; i < 200; i++) {
    integrate(f, STEP);
    maxY = Math.max(maxY, f.position.y);
    if (i > 5 && f.position.y === 0 && landedAt < 0) landedAt = i;
  }
  const expectedH = (JUMP_VELOCITY * JUMP_VELOCITY) / (2 * GRAVITY);
  assert(Math.abs(maxY - expectedH) < 0.1,
    `跳跃高度应约 ${expectedH.toFixed(2)}m，实为 ${maxY.toFixed(2)}m`);
  const expectedFrames = (2 * JUMP_VELOCITY / GRAVITY) / STEP;
  assert(Math.abs(landedAt - expectedFrames) < 5,
    `滞空应约 ${expectedFrames.toFixed(0)} 帧，实为 ${landedAt}`);
});

t("角色不会掉到地面以下", () => {
  const f = makeFighter();
  f.velocity.y = -50;
  for (let i = 0; i < 60; i++) integrate(f, STEP);
  assert(f.position.y === 0, `y 应为 0，实为 ${f.position.y}`);
  assert(f.grounded, "应标记为着地");
});

t("场地边界把角色拉回圆内（贴墙不反弹）", () => {
  const f = makeFighter();
  f.position.set(ARENA_RADIUS + 5, 0, 0);
  f.velocity.set(10, 0, 0);
  const hit = clampToArena(f);
  assert(hit, "应报告撞到边界");
  const dist = Math.hypot(f.position.x, f.position.z);
  assert(dist <= ARENA_RADIUS, `应在场地内，实际距原点 ${dist}`);
  assert(f.velocity.x <= 0.001, `朝墙的速度分量应被消除，实为 ${f.velocity.x}`);
});

t("沿墙滑行不累积速度", () => {
  const f = makeFighter();
  f.position.set(ARENA_RADIUS - 0.1, 0, 0);
  // 持续朝墙外推
  for (let i = 0; i < 60; i++) {
    f.velocity.x = 5;
    f.velocity.z = 2;
    integrate(f, STEP);
    clampToArena(f);
  }
  const dist = Math.hypot(f.position.x, f.position.z);
  assert(dist <= ARENA_RADIUS + 1e-6, `应始终在场地内，实为 ${dist}`);
  assert(isFinite(f.position.x) && isFinite(f.position.z), "位置不应变成 NaN/Infinity");
});

t("两人重叠时被推开", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0);
  b.placeAt(0.1, 0);
  resolveOverlap(a, b);
  const dist = Math.hypot(b.position.x - a.position.x, b.position.z - a.position.z);
  const minDist = a.metrics().radius + b.metrics().radius;
  assert(dist >= minDist - 1e-3, `应被推开到至少 ${minDist}，实为 ${dist}`);
});

t("完全重合时不产生 NaN（除零保护）", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0);
  b.placeAt(0, 0);
  resolveOverlap(a, b);
  assert(isFinite(a.position.x) && isFinite(b.position.x), "位置不应是 NaN");
  const dist = Math.hypot(b.position.x - a.position.x, b.position.z - a.position.z);
  assert(dist > 0, "应被分开");
});

t("推挤是对称的（双方各退一半）", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(-0.1, 0);
  b.placeAt(0.1, 0);
  const beforeMid = (a.position.x + b.position.x) / 2;
  resolveOverlap(a, b);
  const afterMid = (a.position.x + b.position.x) / 2;
  assert(near(beforeMid, afterMid), `中点应不变（${beforeMid} → ${afterMid}）`);
});

t("击退把守方沿攻→守方向推开", () => {
  const atk = makeFighter("p1"), def = makeFighter("p2");
  atk.placeAt(0, 0);
  def.placeAt(1, 0);
  def.velocity.set(0, 0, 0);
  applyKnockback(def, atk, { x: 0.2, y: 0 });
  assert(def.velocity.x > 0, `应朝 +X 被推开，实为 ${def.velocity.x}`);
  assert(near(def.velocity.z, 0), "不该有 Z 分量");
});

t("击退速度逐帧衰减到零", () => {
  const f = makeFighter();
  f.velocity.set(8, 0, 0);
  for (let i = 0; i < 120; i++) integrate(f, STEP);
  assert(f.velocity.x === 0, `击退应衰减到 0，实为 ${f.velocity.x}`);
});

// ============================================================
console.log("\n[朝向锁定]");

t("角色朝对手转身，且不瞬移", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0);
  b.placeAt(0, 5);   // 正前方 +Z
  a.facing = Math.PI; // 背对
  updateFacing(a, b, STEP);
  // 单帧最多转 TURN_SPEED * STEP
  const maxStep = TURN_SPEED * STEP;
  const turned = Math.abs(Math.PI - Math.abs(a.facing));
  assert(turned <= maxStep + 1e-6, `单帧转身不应超过 ${maxStep}，实际转了 ${turned}`);
});

t("持续转身最终精确对准对手", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0);
  b.placeAt(5, 0);   // 正右方 → 目标 facing = 90°
  a.facing = 0;
  for (let i = 0; i < 60; i++) updateFacing(a, b, STEP);
  assert(near(a.facing, Math.PI / 2, 1e-3), `应对准 90°，实为 ${THREE.MathUtils.radToDeg(a.facing)}°`);
});

t("转身走最短弧：跨 ±180° 边界时不绕远路", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0);
  // 目标朝向 -3.0 弧度（约 -172°）
  const targetAng = -3.0;
  b.placeAt(Math.sin(targetAng) * 5, Math.cos(targetAng) * 5);
  a.facing = 3.0; // 约 +172°
  // 最短路径：+3.0 → +π → 跨界 → -π → -3.0，共 0.283 弧度（正方向）
  // 绕远路：+3.0 → 0 → -3.0，共 6.0 弧度（负方向）

  // 注意：facing 会被归一化到 (-π, π]，所以裸相减会把「跨界」误读成一次巨大跳变。
  // 必须用最短弧方式测量本帧实际转过的角度。
  const wrappedDelta = (from, to) => {
    let d = to - from;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  };

  const first = a.facing;
  updateFacing(a, b, STEP);
  const delta = wrappedDelta(first, a.facing);
  assert(delta > 0, `应朝正方向跨界（最短弧 0.28 弧度），实际 delta=${delta}`);
  assert(Math.abs(delta) <= TURN_SPEED * STEP + 1e-6,
    `单帧步长应受限于 ${TURN_SPEED * STEP}，实为 ${Math.abs(delta)}`);

  // 继续转，应在很少的帧数内到位（0.283 / 0.1833 ≈ 1.5 帧）
  let frames = 1;
  while (Math.abs(wrappedDelta(a.facing, targetAng)) > 1e-3 && frames < 20) {
    updateFacing(a, b, STEP);
    frames++;
  }
  assert(frames <= 3, `最短弧只需约 2 帧，实际用了 ${frames} 帧（说明绕了远路）`);
  // 且最终确实对准了目标
  assert(Math.abs(wrappedDelta(a.facing, targetAng)) < 1e-3,
    `应对准 ${targetAng}，实为 ${a.facing}`);
});

t("朝向角始终归一化在 (-π, π]，长时间绕圈不发散", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0);
  for (let i = 0; i < 2000; i++) {
    // 让对手绕圈，逼迫角色持续转身
    const ang = (i / 100) * Math.PI * 2;
    b.placeAt(Math.cos(ang) * 3, Math.sin(ang) * 3);
    updateFacing(a, b, STEP);
    assert(a.facing > -Math.PI - 1e-6 && a.facing <= Math.PI + 1e-6,
      `facing 应归一化，第 ${i} 帧为 ${a.facing}`);
  }
});

t("两人几乎重合时不抖动（保持上一帧朝向）", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0);
  b.placeAt(0.001, 0);
  a.facing = 1.234;
  updateFacing(a, b, STEP);
  assert(near(a.facing, 1.234), `重合时朝向应不变，实为 ${a.facing}`);
});

t("attack 状态不转身", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0);
  b.placeAt(5, 0);
  a.facing = 0;
  a.state.to("attack", { lock: 20 });
  updateFacing(a, b, STEP);
  assert(a.facing === 0, "出招中朝向必须冻结");
});

// ============================================================
console.log("\n[控制器：角色相对移动]");

t("forward 是「朝对手」而非「朝 +Z」", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0);
  b.placeAt(5, 0);   // 对手在 +X
  a.controller.update(inputWith({ forward: true }), b, STEP);
  assert(a.velocity.x > 0, `应朝 +X（对手方向）移动，实为 vx=${a.velocity.x}`);
  assert(near(a.velocity.z, 0, 1e-3), `不该有 Z 速度，实为 ${a.velocity.z}`);
  assert(near(Math.hypot(a.velocity.x, a.velocity.z), WALK_SPEED, 1e-3),
    `速度应为 ${WALK_SPEED}`);
});

t("对手在任意方向时 forward 都正确", () => {
  for (const ang of [0, Math.PI / 4, Math.PI / 2, Math.PI, -Math.PI / 3]) {
    const a = makeFighter("p1"), b = makeFighter("p2");
    a.placeAt(0, 0);
    b.placeAt(Math.sin(ang) * 5, Math.cos(ang) * 5);
    a.controller.update(inputWith({ forward: true }), b, STEP);
    const moveAng = Math.atan2(a.velocity.x, a.velocity.z);
    let d = moveAng - ang;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    assert(Math.abs(d) < 1e-3, `角度 ${ang} 时移动方向偏差 ${d}`);
  }
});

t("后退比前进慢（拉开距离有代价）", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(5, 0);
  a.controller.update(inputWith({ back: true }), b, STEP);
  const backSpeed = Math.hypot(a.velocity.x, a.velocity.z);
  assert(near(backSpeed, BACK_SPEED, 1e-3), `后退速度应为 ${BACK_SPEED}，实为 ${backSpeed}`);
  assert(BACK_SPEED < WALK_SPEED, "后退必须比前进慢");
  assert(a.velocity.x < 0, "应朝远离对手方向");
});

t("侧移绕着对手（垂直于连线）", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(0, 5);  // 对手在 +Z
  a.controller.update(inputWith({ right: true }), b, STEP);
  assert(Math.abs(a.velocity.x) > 1, `侧移应产生 X 速度，实为 ${a.velocity.x}`);
  assert(near(a.velocity.z, 0, 1e-3), `侧移不该有 Z 速度，实为 ${a.velocity.z}`);
});

t("斜向移动不加速（归一化）", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(0, 5);
  a.controller.update(inputWith({ forward: true, right: true }), b, STEP);
  const diag = Math.hypot(a.velocity.x, a.velocity.z);
  const cap = Math.max(WALK_SPEED, BACK_SPEED);
  assert(diag <= cap + 1e-3, `斜向速度 ${diag} 不应超过上限 ${cap}`);
});

t("反向键同时按下互相抵消", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(0, 5);
  a.controller.update(inputWith({ forward: true, back: true }), b, STEP);
  assert(near(Math.hypot(a.velocity.x, a.velocity.z), 0, 1e-3),
    "前后同按应静止");
});

t("移动时进入 walk 态，松手回 idle", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(0, 5);
  a.controller.update(inputWith({ forward: true }), b, STEP);
  assert(a.state.name === "walk", `应为 walk，实为 ${a.state.name}`);
  a.controller.update(NO_INPUT, b, STEP);
  assert(a.state.name === "idle", `应回 idle，实为 ${a.state.name}`);
});

t("防御中移动变慢", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(0, 5);
  a.controller.update(inputWith({ block: true, back: true }), b, STEP);
  assert(a.state.name === "block", `应为 block，实为 ${a.state.name}`);
  const speed = Math.hypot(a.velocity.x, a.velocity.z);
  assert(speed < BACK_SPEED, `防御中后退(${speed})应慢于常规(${BACK_SPEED})`);
  assert(speed > 0, "防御中仍应能后退");
});

t("跳跃赋予垂直初速度且离地", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(0, 5);
  a.controller.update(inputWith({ jumpTap: true }), b, STEP);
  assert(near(a.velocity.y, JUMP_VELOCITY), `应有起跳速度，实为 ${a.velocity.y}`);
  assert(a.state.name === "jump", `应为 jump，实为 ${a.state.name}`);
});

t("空中不能二段跳", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(0, 5);
  a.controller.update(inputWith({ jumpTap: true }), b, STEP);
  a.grounded = false;
  a.position.y = 1;
  const vy = a.velocity.y;
  a.controller.update(inputWith({ jumpTap: true }), b, STEP);
  assert(a.velocity.y <= vy, "空中再按跳不应再次加速");
});

t("冲刺赋予高速并锁定方向", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(0, 5);
  a.controller.update(inputWith({ dash: "forward" }), b, STEP);
  assert(a.state.name === "dash", `应为 dash，实为 ${a.state.name}`);
  const speed = Math.hypot(a.velocity.x, a.velocity.z);
  assert(speed > WALK_SPEED, `冲刺速度 ${speed} 应快于走路 ${WALK_SPEED}`);
  // 冲刺中改方向无效
  a.controller.update(inputWith({ back: true }), b, STEP);
  assert(a.velocity.z > 0, "冲刺中不应被反向输入干扰");
});

t("冲刺在固定帧数后结束并回到可控状态", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(0, 5);
  a.controller.update(inputWith({ dash: "forward" }), b, STEP);
  for (let i = 0; i < DASH_FRAMES + 2; i++) {
    a.controller.update(NO_INPUT, b, STEP);
    a.state.tick();
  }
  assert(a.state.name !== "dash", `冲刺应已结束，实为 ${a.state.name}`);
});

t("不可移动状态（attack）不产生主动速度", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(0, 5);
  a.state.to("attack", { lock: 20 });
  a.velocity.set(0, 0, 0);
  a.controller.update(inputWith({ forward: true }), b, STEP);
  assert(near(Math.hypot(a.velocity.x, a.velocity.z), 0),
    `attack 中不该移动，实际速度 ${Math.hypot(a.velocity.x, a.velocity.z)}`);
});

t("attack 中仍受击退（不覆盖击退速度）", () => {
  const a = makeFighter("p1"), b = makeFighter("p2");
  a.placeAt(0, 0); b.placeAt(0, 5);
  a.state.to("attack", { lock: 20 });
  a.velocity.set(5, 0, 0); // 模拟击退残留
  a.controller.update(inputWith({ forward: true }), b, STEP);
  assert(a.velocity.x === 5, "击退速度不应被控制器清掉");
});

// ============================================================
console.log("\n[输入]");

/** 造一个假的 EventTarget，便于在 node 里派发键盘事件 */
function mockInput(bindings) {
  const listeners = {};
  const target = {
    addEventListener: (type, fn) => {
      (listeners[type] = listeners[type] || []).push(fn);
    },
    removeEventListener: (type, fn) => {
      listeners[type] = (listeners[type] || []).filter((f) => f !== fn);
    },
  };
  const input = new FightInput({ target, bindings });
  const fire = (type, key, extra = {}) => {
    const ev = {
      key, code: extra.code || key, repeat: !!extra.repeat,
      target: extra.target || null,
      preventDefault: () => {},
    };
    for (const fn of listeners[type] || []) fn(ev);
  };
  return { input, fire, listeners };
}

t("按下与松开正确反映在 isDown", () => {
  const { input, fire } = mockInput();
  fire("keydown", "w");
  assert(input.isDown("w"), "按下后应为 true");
  fire("keyup", "w");
  assert(!input.isDown("w"), "松开后应为 false");
});

t("边沿检测：一次按下只被一个 tick 消费", () => {
  const { input, fire } = mockInput();
  input.beginTick();
  fire("keydown", "f");
  assert(input.tapped("p1", "light"), "第一 tick 应检测到 tap");
  input.endTick();
  input.beginTick();
  assert(!input.tapped("p1", "light"), "第二 tick 不该重复触发");
  assert(input.held("p1", "light"), "但仍应处于按下状态");
});

t("长按的 repeat 事件不产生新边沿", () => {
  const { input, fire } = mockInput();
  input.beginTick();
  fire("keydown", "f");
  input.endTick();
  input.beginTick();
  fire("keydown", "f", { repeat: true });
  assert(!input.tapped("p1", "light"), "repeat 不该产生 tap");
  assert(input.held("p1", "light"), "但 isDown 应保持");
});

t("失焦清空所有按键（Web 游戏最经典的 bug）", () => {
  const { input, fire, listeners } = mockInput();
  fire("keydown", "w");
  fire("keydown", "d");
  assert(input.isDown("w") && input.isDown("d"), "两键应都按下");
  for (const fn of listeners.blur || []) fn();
  assert(!input.isDown("w") && !input.isDown("d"),
    "失焦后必须清空，否则回来时角色会永远朝一个方向走");
});

t("P1 与 P2 键位互不干扰", () => {
  const { input, fire } = mockInput();
  input.beginTick();
  fire("keydown", "w");                                  // P1 前进
  fire("keydown", "ArrowUp");                            // P2 前进
  const s1 = input.snapshot("p1");
  const s2 = input.snapshot("p2");
  assert(s1.forward && s2.forward, "两人应各自前进");
  assert(!s1.back && !s2.back, "不该有串键");
});

t("小键盘用 event.code 识别（NumLock 关闭时 key 会变）", () => {
  const { input, fire } = mockInput();
  // NumLock 关闭时，小键盘 1 的 event.key 是 'End'，但 code 恒为 'Numpad1'
  fire("keydown", "End", { code: "Numpad1" });
  assert(input.held("p2", "light"), "应通过 code 正确识别小键盘");
});

t("输入框聚焦时不响应（改键位/打字不误操作）", () => {
  const { input, fire } = mockInput();
  fire("keydown", "w", { target: { tagName: "INPUT" } });
  assert(!input.isDown("w"), "输入框内的按键不该进入游戏");
});

t("双击同向键触发冲刺", () => {
  const { input, fire } = mockInput();
  input.beginTick();
  fire("keydown", "w");
  fire("keyup", "w");
  input.endTick();
  input.beginTick();
  fire("keydown", "w");
  const s = input.snapshot("p1");
  assert(s.dash === "forward", `应触发前冲，实为 ${s.dash}`);
});

t("间隔过久的两次按下不触发冲刺", () => {
  const { input, fire } = mockInput();
  input.beginTick();
  fire("keydown", "w");
  fire("keyup", "w");
  input.endTick();
  for (let i = 0; i < 40; i++) { input.beginTick(); input.endTick(); }
  input.beginTick();
  fire("keydown", "w");
  const s = input.snapshot("p1");
  assert(s.dash === null, `间隔过久不该冲刺，实为 ${s.dash}`);
});

t("改键位会顶掉同槽位的冲突绑定", () => {
  const { input } = mockInput();
  const conflict = input.rebind("p1", "light", "w"); // w 原本是 forward
  assert(conflict === "forward", `应报告冲突项 forward，实为 ${conflict}`);
  assert(input.bindings.p1.forward === null, "旧绑定应被清空");
  assert(input.bindings.p1.light === "w", "新绑定应生效");
});

t("跨玩家键位冲突可被检测（供 UI 提示）", () => {
  const { input } = mockInput({ p2: { forward: "w" } });
  const conflicts = input.crossConflicts();
  assert(conflicts.length > 0, "应检测到 w 键被两人共用");
  assert(conflicts[0].key === "w", "冲突键应为 w");
});

t("默认键位无跨玩家冲突", () => {
  const { input } = mockInput();
  assert(input.crossConflicts().length === 0,
    `默认键位不该冲突：${JSON.stringify(input.crossConflicts())}`);
});

// ============================================================
console.log("\n[相机]");

function mockCamera() {
  const cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000);
  return cam;
}

t("相机站在两人连线的垂直方向上", () => {
  const cam = mockCamera();
  const ac = new ArenaCamera(cam);
  const p1 = new THREE.Vector3(-2, 0, 0);
  const p2 = new THREE.Vector3(2, 0, 0);
  ac.snap(p1, p2);

  // 连线沿 X 轴，相机应在 Z 方向上
  assert(Math.abs(cam.position.z) > Math.abs(cam.position.x),
    `相机应主要偏在 Z 方向，实为 (${cam.position.x.toFixed(2)}, ${cam.position.z.toFixed(2)})`);
  assert(near(cam.position.x, 0, 0.1), "相机 X 应接近中点");
});

t("两人都在相机视野内", () => {
  const cam = mockCamera();
  const ac = new ArenaCamera(cam);
  for (const sep of [1, 4, 8, 12]) {
    const p1 = new THREE.Vector3(-sep / 2, 0, 0);
    const p2 = new THREE.Vector3(sep / 2, 0, 0);
    ac.snap(p1, p2);
    cam.updateMatrixWorld(true);
    cam.updateProjectionMatrix();
    const frustum = new THREE.Frustum().setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse)
    );
    // 用角色胸部高度的点测试
    const a = new THREE.Vector3(p1.x, 0.9, p1.z);
    const b = new THREE.Vector3(p2.x, 0.9, p2.z);
    assert(frustum.containsPoint(a), `间隔 ${sep} 时 P1 应在视野内`);
    assert(frustum.containsPoint(b), `间隔 ${sep} 时 P2 应在视野内`);
  }
});

t("间隔变大时相机后退", () => {
  const cam = mockCamera();
  const ac = new ArenaCamera(cam);
  ac.snap(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0));
  const nearDist = ac.dist;
  ac.snap(new THREE.Vector3(-6, 0, 0), new THREE.Vector3(6, 0, 0));
  const farDist = ac.dist;
  assert(farDist > nearDist, `间隔大时应后退（${nearDist.toFixed(2)} → ${farDist.toFixed(2)}）`);
});

t("相机不因两人绕圈而瞬间翻面（侧别锁定）", () => {
  const cam = mockCamera();
  const ac = new ArenaCamera(cam);
  const p1 = new THREE.Vector3(-2, 0, 0);
  const p2 = new THREE.Vector3(2, 0, 0);
  ac.snap(p1, p2);

  let maxJump = 0;
  let prevYaw = ac.yaw;
  // 让 P2 绕 P1 转一整圈
  for (let i = 0; i <= 360; i += 2) {
    const a = (i * Math.PI) / 180;
    p2.set(p1.x + Math.cos(a) * 4, 0, p1.z + Math.sin(a) * 4);
    ac.update(p1, p2, 1 / 60);
    let d = ac.yaw - prevYaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    maxJump = Math.max(maxJump, Math.abs(d));
    prevYaw = ac.yaw;
  }
  // 单帧 yaw 变化不应出现 ~180° 的瞬跳
  assert(maxJump < Math.PI / 2,
    `单帧 yaw 跳变 ${THREE.MathUtils.radToDeg(maxJump).toFixed(1)}° 过大，说明发生了翻面抖动`);
});

t("相机平滑是帧率无关的", () => {
  const results = [];
  for (const fps of [60, 144]) {
    const cam = mockCamera();
    const ac = new ArenaCamera(cam);
    ac.snap(new THREE.Vector3(-2, 0, 0), new THREE.Vector3(2, 0, 0));
    const p1 = new THREE.Vector3(-2, 0, 0);
    const p2 = new THREE.Vector3(0, 0, 4);   // 突然换位置
    // 模拟 0.5 秒
    const steps = Math.round(0.5 * fps);
    for (let i = 0; i < steps; i++) ac.update(p1, p2, 1 / fps);
    results.push(ac.yaw);
  }
  assert(Math.abs(results[0] - results[1]) < 0.05,
    `不同帧率下收敛结果应一致：${results[0].toFixed(4)} vs ${results[1].toFixed(4)}`);
});

t("重合时相机不产生 NaN", () => {
  const cam = mockCamera();
  const ac = new ArenaCamera(cam);
  const p = new THREE.Vector3(0, 0, 0);
  ac.snap(p, p.clone());
  ac.update(p, p.clone(), 1 / 60);
  assert(isFinite(cam.position.x) && isFinite(cam.position.y) && isFinite(cam.position.z),
    `相机位置不应是 NaN：${cam.position.toArray()}`);
  assert(isFinite(ac.yaw), "yaw 不应是 NaN");
});

console.log(`\n${fail === 0 ? "✅" : "❌"} F2 测试：${pass} 通过，${fail} 失败\n`);
process.exit(fail === 0 ? 0 : 1);
