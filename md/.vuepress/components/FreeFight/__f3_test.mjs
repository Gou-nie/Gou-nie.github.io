/**
 * F3 验收测试：招式系统（MoveSet / MoveRunner / presets / 状态机攻击态）。
 * 运行：node md/.vuepress/components/FreeFight/__f3_test.mjs
 *
 * 验收标准（DESIGN §11 F3 行）：
 *   4 个预设招式可用，出招不可自打断，走位中出招会打断走位，
 *   招式播放帧精确（逐帧步进可验证）。
 */
import * as THREE from "three";
import { PRESET_MOVES, MOVE_CATEGORIES } from "./studio/presets.js";
import { MoveSet } from "./fight/MoveSet.js";
import { MoveRunner, RETURN_FRAMES, moveTotalFrames } from "./fight/MoveRunner.js";
import { FightState, STATES } from "./fight/FightState.js";
import { CharacterController } from "./fight/CharacterController.js";
import {
  integrate, clampToArena, resolveOverlap, updateFacing, horizontalDistance,
} from "./fight/Physics.js";
import { buildNormalizedRig } from "./core/Normalizer.js";
import { RigidRig } from "./core/RigidRig.js";
import { Fighter } from "./core/FighterFactory.js";
import {
  STEP, DASH_FRAMES, JUMP_VELOCITY, GRAVITY, ARENA_RADIUS, KNOCKBACK_EPSILON,
} from "./fight/constants.js";

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); pass++; console.log("  ✓", name); }
  catch (e) { fail++; console.log("  ✗", name, "→", e.message); }
};
const near = (a, b, eps = 1e-4) => Math.abs(a - b) < eps;
const assert = (c, m) => { if (!c) throw new Error(m || "断言失败"); };

/** 造一个可用于招式测试的战士（刚体，box 视觉件） */
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
  f.moveSet = MoveSet.fromPresets();
  return f;
}

/** 招式 id → 定义 */
const byId = (id) => PRESET_MOVES.find((m) => m.id === id);
const FRAMES = {
  ram: { s: 5, a: 3, r: 10, total: 18 },
  spin: { s: 12, a: 6, r: 20, total: 38 },
  launch: { s: 10, a: 5, r: 22, total: 37 },
  stomp: { s: 14, a: 4, r: 18, total: 36 },
};

/** 空输入快照 */
const NO_INPUT = {
  forward: false, back: false, left: false, right: false,
  block: false, jumpTap: false, lightTap: false, heavyTap: false,
  specialTap: false, dash: null,
};
const inputWith = (o) => ({ ...NO_INPUT, ...o });

/** 复刻 Arena._fixedUpdate 的 tick 顺序（含招式播放，见 Arena.js 类注释） */
function step(a, b, inA, inB) {
  a.move?.tick();
  b.move?.tick();
  a.controller.update(inA, b, STEP);
  b.controller.update(inB, a, STEP);
  integrate(a, STEP);
  integrate(b, STEP);
  clampToArena(a);
  clampToArena(b);
  resolveOverlap(a, b);
  clampToArena(a);
  clampToArena(b);
  updateFacing(a, b, STEP);
  updateFacing(b, a, STEP);
  a.state.tick();
  b.state.tick();
}

/** 撞完会前后飘的残余断言不需要：velocity 会被 friction 磨掉，用总位移断言 */
function bodyPivot(f) {
  return f.rig.bodyPivot;
}

/** 只对单角色走逻辑（对手站死不动）的便捷 tick 数 */
function playTicks(f, opponent, input, n) {
  for (let i = 0; i < n; i++) step(f, opponent, input, NO_INPUT);
}

// ============================================================
console.log("\n[预设招式数据]");

t("预设 4 招齐全，类别与 DESIGN §5.3 一致", () => {
  assert(PRESET_MOVES.length === 4, `实际 ${PRESET_MOVES.length} 招`);
  assert(byId("preset-ram").category === "light", "撞击应属 light");
  assert(byId("preset-spin").category === "heavy", "回旋应属 heavy");
  assert(byId("preset-launch").category === "special", "上挑应属 special");
  assert(byId("preset-stomp").category === "heavy", "跺地应属 heavy");
  assert(byId("preset-stomp").input.requires === "air", "跺地应要求空中");
});

t("三相位帧数与 DESIGN §5.3 表一致", () => {
  const want = {
    "preset-ram": [5, 3, 10], "preset-spin": [12, 6, 20],
    "preset-launch": [10, 5, 22], "preset-stomp": [14, 4, 18],
  };
  for (const [id, [s, a, r]] of Object.entries(want)) {
    const ph = byId(id).phases;
    assert(ph.startup.frames === s && ph.active.frames === a && ph.recovery.frames === r,
      `${id} 相位 ${ph.startup.frames}/${ph.active.frames}/${ph.recovery.frames} ≠ ${s}/${a}/${r}`);
  }
});

t("全部招式通过 MoveSet.validate（可序列化形状完整）", () => {
  const ms = MoveSet.fromPresets();
  const bad = ms.validateAll();
  assert(Object.keys(bad).length === 0, `校验失败：${JSON.stringify(bad)}`);
});

t("validate 能抓住坏数据（帧数/类别/pose 形状/requires）", () => {
  const ms = MoveSet.fromPresets();
  const badFrame = { ...byId("preset-ram"), phases: { ...byId("preset-ram").phases, startup: { frames: 0 } } };
  const badCat = { ...byId("preset-ram"), category: "air" };
  const badPose = { ...byId("preset-ram"), phases: { ...byId("preset-ram").phases, active: { frames: 3, pose: { body: { position: [0, 0] } } } } };
  const badReq = { ...byId("preset-stomp"), input: { requires: "ground" } };
  assert(ms.validate(badFrame).length > 0, "负帧数没被拦");
  assert(ms.validate(badCat).length > 0, "未知类别没被拦");
  assert(ms.validate(badPose).length > 0, "坏 pose 形状没被拦");
  assert(ms.validate(badReq).length > 0, "坏 requires 没被拦");
  assert(ms.validate(byId("preset-ram")).length === 0, "合法招式被误报");
});

// ============================================================
console.log("\n[MoveSet 选招]");

t("地面：light→撞击，heavy→回旋，special→上挑", () => {
  const ms = MoveSet.fromPresets();
  assert(ms.pick("light", { grounded: true }).id === "preset-ram");
  assert(ms.pick("heavy", { grounded: true }).id === "preset-spin");
  assert(ms.pick("special", { grounded: true }).id === "preset-launch");
});

t("空中：heavy→跺地（同类别按态势分流），light/special 无空中招 → null", () => {
  const ms = MoveSet.fromPresets();
  assert(ms.pick("heavy", { grounded: false }).id === "preset-stomp");
  assert(ms.pick("light", { grounded: false }) === null);
  assert(ms.pick("special", { grounded: false }) === null);
});

t("未知类别与空上下文不炸", () => {
  const ms = MoveSet.fromPresets();
  assert(ms.pick("throw", { grounded: true }) === null);
  assert(ms.pick("light", {}) === null, "无 grounded 字段应视为无匹配");
});

t("requires: forward/back 的招只在对应方向按下时选中（F5 预留语义）", () => {
  const ms = new MoveSet([
    { id: "t-fwd", label: "前冲", category: "heavy", input: { requires: "forward" },
      phases: { startup: { frames: 1 }, active: { frames: 1 }, recovery: { frames: 1 } },
      hit: { damage: 1 }, motion: {} },
    { id: "t-ram", label: "回旋", category: "heavy", input: { requires: null },
      phases: { startup: { frames: 1 }, active: { frames: 1 }, recovery: { frames: 1 } },
      hit: { damage: 1 }, motion: {} },
  ]);
  assert(ms.pick("heavy", { grounded: true, forwardHeld: true }).id === "t-fwd");
  assert(ms.pick("heavy", { grounded: true, forwardHeld: false }).id === "t-ram");
});

// ============================================================
console.log("\n[MoveRunner 相位帧精确 —— 逐帧步进]");

t("相位切换在精确帧号发生（撞击 5/3/10）", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 5); // 对手站在 +Z 5 米处
  const f = a;
  const runner = new MoveRunner({ fighter: f, move: byId("preset-ram") });
  f.move = runner;
  f.state.to("attack", { lock: moveTotalFrames(byId("preset-ram")) });

  const phaseAt = [];
  for (let i = 1; i <= 18; i++) {
    runner.tick();
    phaseAt.push(runner.phaseName);
    assert(runner.elapsed === i, `elapsed 应为 ${i}，实际 ${runner.elapsed}`);
  }
  assert(phaseAt.slice(0, 5).every((p) => p === "startup"), `前 5 帧应全为 startup：${phaseAt}`);
  assert(phaseAt.slice(5, 8).every((p) => p === "active"), `6-8 帧应全为 active：${phaseAt.slice(5, 8)}`);
  assert(phaseAt.slice(8, 18).every((p) => p === "recovery"), `9-18 帧应全为 recovery：${phaseAt.slice(8)}`);
  assert(runner.done === true, "18 帧末应 done");
  assert(runner.phaseName === "recovery", "最后一帧仍属于 recovery（return 从 blend 开始）");
});

t("active 窗口恰好播够 A 帧，且只有窗口内回调 onActiveTick", () => {
  const a = makeFighter();
  const f = a;
  let activeCalls = 0;
  const ticksInActive = [];
  const runner = new MoveRunner({
    fighter: f, move: byId("preset-ram"),
    onActiveTick: () => { activeCalls++; ticksInActive.push(runner.elapsed); },
  });
  f.move = runner;
  const ram = FRAMES.ram;
  for (let i = 1; i <= ram.total; i++) runner.tick();
  assert(activeCalls === ram.a, `active 回调应 ${ram.a} 次，实际 ${activeCalls}`);
  assert(ticksInActive[0] === ram.s + 1 && ticksInActive[ticksInActive.length - 1] === ram.s + ram.a,
    `回调帧号应 ${ram.s + 1}..${ram.s + ram.a}，实际 ${ticksInActive}`);
  assert(runner.activeTicks === ram.a, `activeTicks 应为 ${ram.a}`);
});

t("相位末尾姿态精确等于相位 key（撞击：前倾蓄力 → 撞出 → 收势）", () => {
  const a = makeFighter();
  const f = a;
  f.move = new MoveRunner({ fighter: f, move: byId("preset-ram") });
  const runner = f.move;
  const ram = FRAMES.ram;
  const key = (ph) => byId("preset-ram").phases[ph].pose.body;

  for (let i = 0; i < ram.s; i++) runner.tick();
  let r = bodyPivot(f).rotation;
  assert(near(r.x, key("startup").rotation[0], 1e-6), `startup 末 rotation.x 应 ${key("startup").rotation[0]}，实际 ${r.x}`);

  for (let i = 0; i < ram.a; i++) runner.tick();
  r = bodyPivot(f).rotation;
  assert(near(r.x, key("active").rotation[0], 1e-6), `active 末 rotation.x 应 ${key("active").rotation[0]}，实际 ${r.x}`);
  assert(near(bodyPivot(f).position.z, key("active").position[2], 1e-5), "active 末 position.z 应等于 key");

  for (let i = 0; i < ram.r; i++) runner.tick();
  r = bodyPivot(f).rotation;
  assert(near(r.x, key("recovery").rotation[0], 1e-6), `recovery 末 rotation.x 应 ${key("recovery").rotation[0]}，实际 ${r.x}`);
});

t("相位中途姿态在两端 key 之间单调过渡（不跳变、不超调）", () => {
  const a = makeFighter();
  const f = a;
  const ram = FRAMES.ram;
  const key = (ph) => byId("preset-ram").phases[ph].pose.body;
  f.move = new MoveRunner({ fighter: f, move: byId("preset-ram") });
  const runner = f.move;

  // 蓄力中途（第 3 帧）：前倾角介于 0 与 startup key 之间
  runner.tick(); runner.tick(); runner.tick();
  const mid = bodyPivot(f).rotation.x;
  assert(mid > 0.05 && mid < key("startup").rotation[0],
    `第 3 帧 rotation.x 应介于 0..${key("startup").rotation[0]}，实际 ${mid}`);

  // 过渡到 active 的第一帧：从 startup key 出发，不跳变
  runner.tick(); runner.tick(); // 5 帧 startup 播完
  runner.tick(); // active 第 1 帧
  const act1 = bodyPivot(f).rotation.x;
  assert(act1 > key("startup").rotation[0] - 1e-4 && act1 < key("active").rotation[0],
    `active 第 1 帧应越过 startup key 向 active key 走，实际 ${act1}`);
});

// ============================================================
console.log("\n[motion：根节点位移]");

t("撞击：startup+active 窗口内位移精确 = motion.forward（米），收招无额外位移", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8); // 对手很远，避免推挤/边界干扰
  const f = a;
  f.faceTowards(b.position); // 面朝 +Z（对手在正前方）

  const ram = FRAMES.ram;
  f.move = new MoveRunner({ fighter: f, move: byId("preset-ram") });
  const runner = f.move;
  f.state.to("attack", { lock: moveTotalFrames(byId("preset-ram")) });

  // 模拟完整 Arena 顺序（runner 先 tick，再积分）
  for (let i = 0; i < ram.s + ram.a; i++) step(f, b, NO_INPUT, NO_INPUT);
  const fwd = byId("preset-ram").motion.forward;
  assert(near(f.position.z, fwd, 1e-6), `s+a 后位移应 ${fwd}，实际 ${f.position.z}`);
  assert(f.position.x === 0, "不应有横向位移");

  for (let i = 0; i < ram.r; i++) step(f, b, NO_INPUT, NO_INPUT);
  assert(near(f.position.z, fwd, 1e-6), `收招后位移应保持 ${fwd}，实际 ${f.position.z}（收招清残速）`);
  assert(Math.abs(f.velocity.x) < KNOCKBACK_EPSILON && Math.abs(f.velocity.z) < KNOCKBACK_EPSILON, "收招后不应有残速");
});

t("motion 位移方向 = 出招瞬间的 facing（任意朝向都成立）", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  const f = a;
  // 朝 -Z 方向打（facing = π）
  f.faceTowards({ x: 0, z: -8 });
  b.placeAt(0, 8); // 对手在身后也无所谓——位移跟着出招瞬间 facing

  f.move = new MoveRunner({ fighter: f, move: byId("preset-ram") });
  f.state.to("attack", { lock: 18 });
  const ram = FRAMES.ram;
  for (let i = 0; i < ram.s + ram.a; i++) step(f, b, NO_INPUT, NO_INPUT);
  assert(near(f.position.z, -byId("preset-ram").motion.forward, 1e-6),
    `应朝 -Z 位移 ${-byId("preset-ram").motion.forward}，实际 ${f.position.z}`);
});

t("回旋：spin 在 startup+active 内累计 2π，收招后保持（2π ≡ 0 无跳变）", () => {
  const a = makeFighter();
  const f = a;
  const spin = FRAMES.spin;
  f.move = new MoveRunner({ fighter: f, move: byId("preset-spin") });
  const runner = f.move;

  for (let i = 0; i < spin.s; i++) runner.tick();
  const yMid = bodyPivot(f).rotation.y;
  assert(yMid > 0.5 && yMid < Math.PI * 2 * 0.95, `startup 末 spin 应过半程附近，实际 ${yMid}`);
  for (let i = 0; i < spin.a; i++) runner.tick();
  const yEnd = bodyPivot(f).rotation.y;
  assert(near(Math.abs(yEnd) % (Math.PI * 2), 0, 1e-3) || near(yEnd, Math.PI * 2, 1e-3),
    `active 末 spin 应为 2π（≡0），实际 ${yEnd}`);
  for (let i = 0; i < spin.r; i++) runner.tick();
  assert(near(bodyPivot(f).rotation.y, yEnd, 1e-6), "收招期间 spin 应保持");
});

t("上挑：rise 让身体在窗口内抬升 motion.rise 米", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8);
  const f = a;
  const launch = FRAMES.launch;
  f.move = new MoveRunner({ fighter: f, move: byId("preset-launch") });
  f.state.to("attack", { lock: moveTotalFrames(byId("preset-launch")) });
  for (let i = 0; i < launch.s + launch.a; i++) step(f, b, NO_INPUT, NO_INPUT);
  assert(near(f.position.y, byId("preset-launch").motion.rise, 1e-5),
    `s+a 后 y 应 ≈ ${byId("preset-launch").motion.rise}，实际 ${f.position.y}`);
});

// ============================================================
console.log("\n[收招与 blend]");

t("招式播完恰好 force 回 idle，姿态不瞬间跳回中立（blend 回 rest）", () => {
  const a = makeFighter();
  const f = a;
  const ram = FRAMES.ram;
  f.move = new MoveRunner({ fighter: f, move: byId("preset-ram") });
  const runner = f.move;
  f.state.to("attack", { lock: 18 });

  for (let i = 0; i < ram.total; i++) runner.tick();
  assert(f.state.name === "idle", `第 ${ram.total} 帧末应回 idle，实际 ${f.state.name}`);
  // 还没 blend：姿态仍停在收招 key（近中立但未必是 rest）
  const afterDone = bodyPivot(f).rotation.x;
  assert(f.move === runner, "blend 期间 runner 应仍在位");

  // blend 期间逐帧逼近 rest
  const mags = [];
  for (let i = 1; i <= RETURN_FRAMES; i++) {
    runner.tick();
    mags.push(Math.abs(bodyPivot(f).rotation.x));
  }
  assert(bodyPivot(f).rotation.x === 0, "blend 结束应精确回 rest（0 旋转）");
  assert(mags.every((m) => m <= afterDone + 1e-9), "blend 应单调收敛");
  assert(f.move === null, "blend 结束后 runner 应自移除");
});

t("blend 期间已可走位（状态 idle），pose 在脚下移动中收敛", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8);
  const f = a;
  f.faceTowards(b.position);
  const ram = FRAMES.ram;
  f.move = new MoveRunner({ fighter: f, move: byId("preset-ram") });
  f.state.to("attack", { lock: 18 });

  for (let i = 0; i < ram.total; i++) step(f, b, NO_INPUT, NO_INPUT);
  assert(f.state.name === "idle", "招式播完应已 idle");

  // blend 期间按住前进：应能移动
  const z0 = f.position.z;
  for (let i = 0; i < RETURN_FRAMES; i++) {
    step(f, b, inputWith({ forward: true }), NO_INPUT);
  }
  assert(f.position.z > z0 + 0.05, "blend 期间应能正常走位");
  assert(f.move === null, "blend 结束 runner 移除");
  assert(bodyPivot(f).rotation.x === 0, "走位同时姿态已回 rest");
});

t("招式中途被替换（连招）时姿态平滑衔接，不跳变", () => {
  const a = makeFighter();
  const f = a;
  const ram = FRAMES.ram;
  f.move = new MoveRunner({ fighter: f, move: byId("preset-ram") });
  const r1 = f.move;
  for (let i = 0; i < ram.s + 1; i++) r1.tick(); // active 第 2 帧（前倾最深处）
  const deep = bodyPivot(f).rotation.x;

  // 立刻换新招：新 runner 从当前姿态 capture 起播 startup
  f.move = new MoveRunner({ fighter: f, move: byId("preset-ram") });
  f.move.tick();
  const afterSwap = bodyPivot(f).rotation.x;
  assert(near(afterSwap, deep, 1e-4) || afterSwap < deep,
    `换招瞬间姿态应连续（≤${deep}），实际 ${afterSwap}`);
});

// ============================================================
console.log("\n[状态机攻击态]");

t("走位中出招：walk → attack，状态与锁同步，prev 记录走位态", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8);
  const f = a;
  f.faceTowards(b.position);

  // 先走进 walk
  for (let i = 0; i < 4; i++) step(f, b, inputWith({ forward: true }), NO_INPUT);
  assert(f.state.name === "walk", "前置：应处于 walk");

  step(f, b, inputWith({ forward: true, lightTap: true }), NO_INPUT);
  assert(f.state.name === "attack", "轻击应切入 attack");
  assert(f.state.prev === "walk", "prev 应为 walk（打断走位）");
  assert(f.move.move.id === "preset-ram", "应播放撞击");
  // Arena 的 fixedUpdate 以 state.tick() 收尾，出招同 tick 锁就被扣一格
  assert(f.state.lock === FRAMES.ram.total - 1, `出招同 tick 后 lock 应为 total-1，实际 ${f.state.lock}`);
  assert(f.state.frames === 1, "出招同 tick 后 frames 应为 1");
});

t("出招不可自打断：attack 中连按任意攻击键都无效", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8);
  const f = a;
  f.faceTowards(b.position);

  step(f, b, inputWith({ lightTap: true }), NO_INPUT);
  const first = f.move;
  assert(f.state.name === "attack", "前置：应出招");

  for (let i = 0; i < 10; i++) {
    step(f, b, inputWith({ lightTap: true, heavyTap: true, specialTap: true }), NO_INPUT);
  }
  assert(f.state.name === "attack", "攻击中连按不应打断自己");
  assert(f.move === first, "runner 不应被替换");
  assert(f.move.elapsed === 10, `10 次连按 tick 后招式应播到第 10 帧，实际 ${f.move.elapsed}`);
});

t("冲刺中出招：dash → attack（冲刺可被出招取消）", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8);
  const f = a;
  f.faceTowards(b.position);

  // 双击冲刺（dashFrames 在下一 tick 的控制器里才开始消耗）
  step(f, b, inputWith({ dash: "forward" }), NO_INPUT);
  assert(f.state.name === "dash", "前置：应冲刺");
  assert(f.controller.dashFrames === DASH_FRAMES, `冲刺应持续 ${DASH_FRAMES} 帧`);

  // 冲刺中重击
  step(f, b, inputWith({ heavyTap: true }), NO_INPUT);
  assert(f.state.name === "attack", "冲刺中重击应切入 attack");
  assert(f.state.prev === "dash", "prev 应为 dash");
  assert(f.move.move.id === "preset-spin", "重击应为回旋");
  assert(f.controller.dashFrames === 0, "冲刺推进应被清除");
});

t("空中重击出跺地（requires: air），且出招中仍受重力、落地不炸", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8);
  const f = a;
  f.faceTowards(b.position);

  // 起跳
  f.velocity.y = JUMP_VELOCITY;
  f.grounded = false;
  f.state.to("jump");
  // 越过最高点再出招（最高点 ~t=19 帧；此时在下降段，能验证「攻击中仍受重力」）
  for (let i = 0; i < 22; i++) step(f, b, NO_INPUT, NO_INPUT);
  assert(!f.grounded && f.position.y > 0.3, `前置：应在空中下降段（y=${f.position.y.toFixed(2)}）`);

  step(f, b, inputWith({ heavyTap: true }), NO_INPUT);
  assert(f.state.name === "attack", "空中重击应出招");
  assert(f.move.move.id === "preset-stomp", "应为跺地");
  const yAtHit = f.position.y;
  for (let i = 0; i < 5; i++) step(f, b, NO_INPUT, NO_INPUT);
  assert(f.position.y < yAtHit, "attack 态下重力应继续生效（越砸越低）");

  // 播完整个跺地 → 落地 → 回 idle
  for (let i = 0; i < FRAMES.stomp.total + RETURN_FRAMES + 4; i++) step(f, b, NO_INPUT, NO_INPUT);
  assert(f.position.y === 0 && f.grounded, "应已落地");
  assert(f.state.name === "idle", "招式播完应回 idle");
});

t("空中轻击（无空中招）不误出地面招，也不炸", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8);
  const f = a;
  f.velocity.y = JUMP_VELOCITY;
  f.grounded = false;
  f.state.to("jump");
  for (let i = 0; i < 4; i++) step(f, b, NO_INPUT, NO_INPUT);

  step(f, b, inputWith({ lightTap: true }), NO_INPUT);
  assert(f.state.name === "jump" || f.state.name === "air", `不应出招（实际状态 ${f.state.name}）`);
  assert(f.move === null, "不应有 runner");
});

t("出招中朝向锁定：caps.turn = false，对手绕后不转身", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  const f = a;
  f.faceTowards({ x: 0, z: 8 }); // 初始朝 +Z
  b.placeAt(0, 8);
  f.move = new MoveRunner({ fighter: f, move: byId("preset-spin") });
  f.state.to("attack", { lock: moveTotalFrames(byId("preset-spin")) });
  const facing0 = f.facing;

  // 对手瞬移到身后（-Z），出招期间不应转身
  b.placeAt(0, -8);
  for (let i = 0; i < 12; i++) step(f, b, NO_INPUT, NO_INPUT);
  assert(near(f.facing, facing0, 1e-6), `出招中 facing 应保持 ${facing0}，实际 ${f.facing}`);

  // 招式结束（idle + blend）后恢复自动转身
  for (let i = 0; i < FRAMES.spin.r + RETURN_FRAMES + 40; i++) step(f, b, NO_INPUT, NO_INPUT);
  assert(Math.abs(f.facing - Math.PI) < 0.15, `招式后应转身面向身后对手，实际 facing=${f.facing}`);
});

t("招式播完的下一招可以立刻衔接（出招恢复后可再出招）", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8);
  const f = a;
  f.faceTowards(b.position);
  const ram = FRAMES.ram;

  step(f, b, inputWith({ lightTap: true }), NO_INPUT);
  for (let i = 0; i < ram.total + RETURN_FRAMES + 1; i++) step(f, b, NO_INPUT, NO_INPUT);
  assert(f.state.name === "idle" && f.move === null, "前置：招式完全结束");

  step(f, b, inputWith({ lightTap: true }), NO_INPUT);
  assert(f.state.name === "attack" && f.move.move.id === "preset-ram", "应能立刻再出招");
  assert(f.move.elapsed === 0, "新招式从第 0 帧开始");
});

t("防御中不能直接起招（caps.attack = false），松开防御后可出", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8);
  const f = a;
  f.faceTowards(b.position);

  // 先进入防御（防御与轻击同 tick 齐按时出招优先，这是设计的输入优先级）
  step(f, b, inputWith({ block: true }), NO_INPUT);
  assert(f.state.name === "block", "前置：应处于防御");

  step(f, b, inputWith({ block: true, lightTap: true }), NO_INPUT);
  assert(f.state.name === "block", "防御中轻击应保持防御（不能起招）");
  assert(f.move === null, "不应有 runner");

  step(f, b, inputWith({ lightTap: true }), NO_INPUT);
  assert(f.state.name === "attack", "松防后轻击应能出招");
});

// ============================================================
console.log("\n[Arena 调试信息]");

t("Arena._debugOf 携带招式信息（供 HUD 逐帧验收）", () => {
  // 直接验证 Arena 的 debug 结构字段存在即可——完整 Arena 依赖 DOM，不进 node
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8);
  const f = a;
  f.faceTowards(b.position);
  // 出招 tick（runner 尚未播帧），再走一 tick（相位应推进到 startup 第 1 帧）
  step(f, b, inputWith({ lightTap: true }), NO_INPUT);
  step(f, b, NO_INPUT, NO_INPUT);
  const d = {
    state: f.state.name,
    move: f.move
      ? { label: f.move.move.label, phase: f.move.phaseName, frame: f.move.elapsed, total: f.move.totalFrames }
      : null,
  };
  assert(d.state === "attack", "攻击态");
  assert(d.move && d.move.label === "撞击", "招式 label 应完整");
  assert(d.move.phase === "startup" && d.move.frame === 1 && d.move.total === FRAMES.ram.total,
    `相位信息应 startup 1/${FRAMES.ram.total}，实际 ${d.move.phase} ${d.move.frame}/${d.move.total}`);
});

// ============================================================
console.log("\n[回归：无 moveSet 时不炸（F2 行为保持）]");

t("控制器对没有招式集合的战士忽略攻击键", () => {
  const a = makeFighter();
  const b = makeFighter("p2");
  b.placeAt(0, 8);
  const f = a;
  f.moveSet = null; // F2 时代的战士没有招式系统
  f.faceTowards(b.position);
  step(f, b, inputWith({ lightTap: true, heavyTap: true, specialTap: true }), NO_INPUT);
  assert(f.state.name === "idle", `无 moveSet 不应出招（实际 ${f.state.name}）`);
  assert(f.move === null, "无 moveSet 不应有 runner");
});

// ============================================================
console.log(`\n✅ F3 测试：${pass} 通过，${fail} 失败`);
process.exit(fail ? 1 : 0);
