/**
 * F4 验收测试：判定与规则（HitDetector / FightRules / 命中→掉血→硬直→KO→回合）。
 * 运行：node md/.vuepress/components/FreeFight/__f4_test.mjs
 *
 * 验收标准（DESIGN §11 F4 行）：
 *   命中掉血 + 硬直 + 击退；防御成立（chip + blockstun，背身防不住）；
 *   一次激活只命中一次；launch 浮空；同帧对撞双方各结算；
 *   连击计数与伤害递减 0.9^(n-1)；气槽累积；计时到点判血多者胜；
 *   K.O. → 慢放 → 三局两胜 → 比赛结束。
 *
 * 与 F1–F3 一样只测逻辑层（node），不依赖 DOM / WebGL。判定采样复刻
 * Arena._fixedUpdate 的「位置定稿 → syncTransform + updateMatrixWorld → sample」段。
 */
import * as THREE from "three";
import { PRESET_MOVES } from "./studio/presets.js";
import { MoveSet } from "./fight/MoveSet.js";
import { MoveRunner, moveTotalFrames } from "./fight/MoveRunner.js";
import { FightState } from "./fight/FightState.js";
import { CharacterController } from "./fight/CharacterController.js";
import {
  integrate, clampToArena, resolveOverlap, updateFacing,
} from "./fight/Physics.js";
import { buildNormalizedRig } from "./core/Normalizer.js";
import { RigidRig } from "./core/RigidRig.js";
import { Fighter } from "./core/FighterFactory.js";
import { HitDetector, sphereVsCapsule } from "./fight/HitDetector.js";
import { FightRules, MAX_HP, MAX_METER } from "./fight/FightRules.js";
import {
  STEP, KO_FRAMES, KO_SLOWMO, OVERTIME,
  METER_GAIN_HIT, METER_GAIN_BLOCK, METER_GAIN_TAKEN,
} from "./fight/constants.js";

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); pass++; console.log("  ✓", name); }
  catch (e) { fail++; console.log("  ✗", name, "→", e.message); }
};
const near = (a, b, eps = 1e-4) => Math.abs(a - b) < eps;
const assert = (c, m) => { if (!c) throw new Error(m || "断言失败"); };

/** 造一个可用于判定测试的战士（刚体，box 视觉件，hurtbox 半径 0.3 / 高 1.8） */
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

const NO_INPUT = {
  forward: false, back: false, left: false, right: false,
  block: false, jumpTap: false, lightTap: false, heavyTap: false,
  specialTap: false, dash: null,
};
const inputWith = (o) => ({ ...NO_INPUT, ...o });

/** 搭一套带规则 + 判定的对局环境 */
function makeMatch() {
  const a = makeFighter("p1");
  const b = makeFighter("p2");
  const rules = new FightRules([a, b]);
  const detector = new HitDetector({ rules });
  return { a, b, rules, detector };
}

/** 判定采样前：把逻辑位姿精确同步进场景图并刷新世界矩阵 */
function syncForHit(...fs) {
  for (const f of fs) {
    f.syncTransform();
    f.root.updateMatrixWorld(true);
  }
}

/** 复刻 Arena._fixedUpdate 的完整 tick 顺序（含判定采样 + 规则推进） */
function fullStep(m, inA, inB) {
  const { a, b, rules, detector } = m;
  const fighting = rules.phase === "fighting";
  if (fighting) {
    a.move?.tick();
    b.move?.tick();
    a.controller.update(inA, b, STEP);
    b.controller.update(inB, a, STEP);
  }
  integrate(a, STEP);
  integrate(b, STEP);
  clampToArena(a);
  clampToArena(b);
  resolveOverlap(a, b);
  clampToArena(a);
  clampToArena(b);
  updateFacing(a, b, STEP);
  updateFacing(b, a, STEP);
  if (fighting) {
    syncForHit(a, b);
    detector.sample(a, b);
    detector.sample(b, a);
    for (const f of [a, b]) {
      if (f.state.is("hitstun", "blockstun", "knockdown", "ko")) f.move = null;
    }
  }
  a.state.tick();
  b.state.tick();
  rules.tick();
  if (rules.pendingReset) {
    rules.pendingReset = false;
    beginRound(m);
  }
}

/** 开下一回合（复刻 Arena._beginNextRound，供规则 pendingReset 触发） */
function beginRound(m) {
  for (const f of [m.a, m.b]) {
    f.state = new FightState();
    f.hp = MAX_HP;
    f.meter = 0;
    f.velocity.set(0, 0, 0);
    f.grounded = true;
    f.controller.cancelDash();
    f.move = null;
    f.resetPose();
  }
  m.a.placeAt(-2.2, 0);
  m.b.placeAt(2.2, 0);
  m.a.faceTowards(m.b.position);
  m.b.faceTowards(m.a.position);
  m.a.syncTransform();
  m.b.syncTransform();
  m.rules.beginRound();
}

/** 把攻方推进到 active 第 1 帧并判定一次（守方位置由调用方预先摆好） */
function landHit(detector, attacker, defender, moveId) {
  const move = byId(moveId);
  const s = move.phases.startup.frames;
  attacker.move = new MoveRunner({ fighter: attacker, move });
  attacker.state.to("attack", { lock: moveTotalFrames(move) });
  for (let i = 0; i < s + 1; i++) attacker.move.tick();
  syncForHit(attacker, defender);
  return detector.sample(attacker, defender);
}

// ============================================================
console.log("\n[球 × 竖直胶囊几何]");

t("sphereVsCapsule：球心在胶囊轴线上命中", () => {
  const c = new THREE.Vector3(0, 0.9, 0);
  const a = new THREE.Vector3(0, 0, 0);
  const b = new THREE.Vector3(0, 1.8, 0);
  assert(sphereVsCapsule(c, 0.32, a, b, 0.3) === true, "中心应在胶囊内");
});

t("sphereVsCapsule：水平远离则未命中", () => {
  const c = new THREE.Vector3(0, 0.9, 5);
  const a = new THREE.Vector3(0, 0, 0);
  const b = new THREE.Vector3(0, 1.8, 0);
  assert(sphereVsCapsule(c, 0.32, a, b, 0.3) === false, "距离 5 应 miss");
});

t("sphereVsCapsule：边界恰好在 sr+cr 命中，超过则 miss", () => {
  const a = new THREE.Vector3(0, 0, 0);
  const b = new THREE.Vector3(0, 1.8, 0);
  const hit = new THREE.Vector3(0, 0.9, 0.62);   // sr(0.32)+cr(0.3)=0.62
  const miss = new THREE.Vector3(0, 0.9, 0.62001);
  assert(sphereVsCapsule(hit, 0.32, a, b, 0.3) === true, "0.62 应恰好命中");
  assert(sphereVsCapsule(miss, 0.32, a, b, 0.3) === false, "0.62001 应 miss");
});

t("sphereVsCapsule：头顶上方也按端点到球心距离判定", () => {
  const a = new THREE.Vector3(0, 0, 0);
  const b = new THREE.Vector3(0, 1.8, 0);
  const above = new THREE.Vector3(0, 2.4, 0);   // 距头顶 0.6 ≤ 0.62
  const tooHigh = new THREE.Vector3(0, 2.43, 0); // 距头顶 0.63 > 0.62
  assert(sphereVsCapsule(above, 0.32, a, b, 0.3) === true, "头顶 0.6 应命中");
  assert(sphereVsCapsule(tooHigh, 0.32, a, b, 0.3) === false, "头顶 0.63 应 miss");
});

// ============================================================
console.log("\n[命中 → 掉血 / 硬直 / 击退 / 气槽]");

t("命中：扣血 = 招式 damage，进 hitstun，沿攻方方向击退，双方气槽累积", () => {
  const { a, b, detector } = makeMatch();
  a.placeAt(0, 0);
  b.placeAt(0, 0.4);
  a.faceTowards(b.position);
  b.faceTowards(a.position);

  const res = landHit(detector, a, b, "preset-ram");
  assert(res && res.blocked === false, "应判为未防御命中");
  assert(res.damage === 6 && res.combo === 1, `damage 6 / combo 1，实际 ${JSON.stringify(res)}`);
  assert(b.hp === MAX_HP - 6, `血量应 ${MAX_HP - 6}，实际 ${b.hp}`);
  assert(b.state.name === "hitstun", `应进 hitstun，实际 ${b.state.name}`);
  assert(b.velocity.z > 0, "击退应沿 +Z（攻方→守方）方向");
  assert(a.meter === METER_GAIN_HIT, `攻方气槽应 ${METER_GAIN_HIT}，实际 ${a.meter}`);
  assert(b.meter === METER_GAIN_TAKEN, `守方气槽应 ${METER_GAIN_TAKEN}，实际 ${b.meter}`);
});

t("一次激活只命中一次（hitsPerActivation 语义）", () => {
  const { a, b, detector } = makeMatch();
  a.placeAt(0, 0);
  b.placeAt(0, 0.4);
  a.faceTowards(b.position);
  b.faceTowards(a.position);

  landHit(detector, a, b, "preset-ram");
  const hpAfterFirst = b.hp;
  const again = detector.sample(a, b); // 同一 runner 仍在 active，二次采样
  assert(again === null, "同一激活第二次采样应返回 null");
  assert(b.hp === hpAfterFirst, "不应重复扣血");
});

// ============================================================
console.log("\n[防御与背身]");

t("防御成立：chip 伤害 + blockstun，气槽按被防结算", () => {
  const { a, b, detector } = makeMatch();
  a.placeAt(0, 0);
  b.placeAt(0, 0.4);
  a.faceTowards(b.position);
  b.faceTowards(a.position); // b 面向 -Z（正对攻方）
  b.state.to("block");

  const res = landHit(detector, a, b, "preset-ram");
  assert(res && res.blocked === true, "应判为防御成功");
  assert(res.damage === 1, `chip 伤害应为 1，实际 ${res.damage}`);
  assert(b.hp === MAX_HP - 1, `血量应 ${MAX_HP - 1}，实际 ${b.hp}`);
  assert(b.state.name === "blockstun", `应进 blockstun，实际 ${b.state.name}`);
  assert(a.meter === METER_GAIN_BLOCK, `攻方气槽应 ${METER_GAIN_BLOCK}，实际 ${a.meter}`);
});

t("背身防御失效：守方面向背离攻方时按满伤命中", () => {
  const { a, b, detector } = makeMatch();
  a.placeAt(0, 0);
  b.placeAt(0, 0.4);
  a.faceTowards(b.position);
  b.faceTowards(a.position);      // 先正对
  b.facing = 0;                   // 再手动转成背对（面向 +Z，攻方在 -Z）
  b.state.to("block");

  const res = landHit(detector, a, b, "preset-ram");
  assert(res && res.blocked === false, "背身不应防住");
  assert(res.damage === 6, `应满伤 6，实际 ${res.damage}`);
  assert(b.state.name === "hitstun", `应进 hitstun 而非 blockstun，实际 ${b.state.name}`);
});

// ============================================================
console.log("\n[launch 浮空 / 同帧对撞]");

t("launch 招式（上挑）命中后守方浮空（velocity.y > 0）", () => {
  const { a, b, detector } = makeMatch();
  a.placeAt(0, 0);
  b.placeAt(0, 0.4);
  a.faceTowards(b.position);
  b.faceTowards(a.position);

  const res = landHit(detector, a, b, "preset-launch");
  assert(res && res.blocked === false, "上挑应命中");
  assert(b.velocity.y > 0, `上挑应浮空（velocity.y>0），实际 ${b.velocity.y}`);
});

t("同帧对撞（trade）：双方各自结算，都掉血", () => {
  const { a, b, detector } = makeMatch();
  a.placeAt(0, 0);
  b.placeAt(0, 0.4);
  a.faceTowards(b.position);
  b.faceTowards(a.position);

  // 双方同 tick 进入 active，互不防御
  const s = byId("preset-ram").phases.startup.frames;
  a.move = new MoveRunner({ fighter: a, move: byId("preset-ram") });
  b.move = new MoveRunner({ fighter: b, move: byId("preset-ram") });
  a.state.to("attack", { lock: moveTotalFrames(byId("preset-ram")) });
  b.state.to("attack", { lock: moveTotalFrames(byId("preset-ram")) });
  for (let i = 0; i < s + 1; i++) { a.move.tick(); b.move.tick(); }

  syncForHit(a, b);
  const r1 = detector.sample(a, b);
  const r2 = detector.sample(b, a);
  assert(r1 && r1.blocked === false, "a→b 应命中");
  assert(r2 && r2.blocked === false, "b→a 应命中");
  assert(a.hp === MAX_HP - 6 && b.hp === MAX_HP - 6, `双方应各掉 6 血，实际 a=${a.hp} b=${b.hp}`);
});

// ============================================================
console.log("\n[连击递减与归零]");

t("连击递减：连续三段伤害 6 → 5 → 5（0.9^(n-1)）", () => {
  const { a, b, rules } = makeMatch();
  const hit = byId("preset-ram").hit;

  const r1 = rules.registerHit(a, b, hit, false);
  assert(r1.combo === 1 && r1.damage === 6, `第 1 段 combo1/伤害6，实际 ${JSON.stringify(r1)}`);
  b.state.to("hitstun", { lock: 10 }); // 命中后守方进入硬直

  const r2 = rules.registerHit(a, b, hit, false);
  assert(r2.combo === 2 && r2.damage === 5, `第 2 段 combo2/伤害5，实际 ${JSON.stringify(r2)}`);

  const r3 = rules.registerHit(a, b, hit, false);
  assert(r3.combo === 3 && r3.damage === 5, `第 3 段 combo3/伤害5，实际 ${JSON.stringify(r3)}`);
});

t("连击经 HitDetector 接线：两段命中第二段递减，血量精确", () => {
  const { a, b, detector } = makeMatch();
  a.placeAt(0, 0);
  b.placeAt(0, 0.4);
  a.faceTowards(b.position);
  b.faceTowards(a.position);

  const r1 = landHit(detector, a, b, "preset-ram");
  assert(r1 && r1.combo === 1 && r1.damage === 6, `第 1 段，实际 ${JSON.stringify(r1)}`);
  assert(b.state.name === "hitstun", "第 1 段后应 hitstun");

  const r2 = landHit(detector, a, b, "preset-ram");
  assert(r2 && r2.combo === 2 && r2.damage === 5, `第 2 段，实际 ${JSON.stringify(r2)}`);
  assert(b.hp === MAX_HP - 11, `血量应 ${MAX_HP - 11}，实际 ${b.hp}`);
});

t("硬直结束连击归零（hitstun 恢复 → idle）", () => {
  const { a, b, rules } = makeMatch();
  const hit = byId("preset-ram").hit;
  rules.registerHit(a, b, hit, false);
  b.state.to("hitstun", { lock: 10 });
  rules.registerHit(a, b, hit, false);
  assert(rules.combo[b.slot] === 2, "前置：combo 应为 2");

  b.state.lock = 1; // 直接缩短硬直锁到最后一帧（to() 会被现有锁挡住）
  b.state.tick();   // lock → 0
  rules.tick();     // _recoverStates: hitstun → idle，combo 归零
  assert(b.state.name === "idle", `应恢复 idle，实际 ${b.state.name}`);
  assert(rules.combo[b.slot] === 0, `combo 应归零，实际 ${rules.combo[b.slot]}`);
});

// ============================================================
console.log("\n[气槽上限]");

t("气槽累积封顶 100（不会溢出）", () => {
  const { a, b, rules } = makeMatch();
  const hit = byId("preset-ram").hit;
  // 攻方 +12/段、守方 +8/段；13 段后分别为 156、104，都应封顶 100
  for (let i = 0; i < 13; i++) rules.registerHit(a, b, hit, false);
  assert(a.meter === MAX_METER, `攻方气槽应封顶 ${MAX_METER}，实际 ${a.meter}`);
  assert(b.meter === MAX_METER, `守方气槽应封顶 ${MAX_METER}，实际 ${b.meter}`);
});

// ============================================================
console.log("\n[计时 / 加赛 / K.O. / 三局两胜]");

t("计时到点判血多者胜：记胜 + 进入下一回合（pendingReset）", () => {
  const { a, b, rules } = makeMatch();
  a.hp = 80; b.hp = 50;
  rules.timer = STEP * 1.5;
  rules.tick(); // timer → 0.5*STEP，仍 fighting
  assert(rules.phase === "fighting", "第一 tick 后应仍 fighting");
  rules.tick(); // timer ≤ 0 → _timeUp
  assert(rules.winner === "p1", `血多者应为 p1，实际 ${rules.winner}`);
  assert(rules.wins.p1 === 1, `p1 应记 1 胜，实际 ${rules.wins.p1}`);
  assert(rules.round === 2, `应进入第 2 回合，实际 ${rules.round}`);
  assert(rules.pendingReset === true, "应置位 pendingReset 请求开下一回合");
});

t("时间到双方等血：加赛 OVERTIME，不记胜", () => {
  const { a, b, rules } = makeMatch();
  a.hp = 60; b.hp = 60;
  rules.timer = STEP;
  rules.tick();
  assert(rules.phase === "fighting", "加赛仍在 fighting 相");
  assert(near(rules.timer, OVERTIME, 1e-9), `计时应重设为加赛 ${OVERTIME}，实际 ${rules.timer}`);
  assert(rules.wins.p1 === 0 && rules.wins.p2 === 0, "加赛不应记胜");
});

t("K.O.：HP 归零 → ko 相 + 慢放 0.3 + 双方进 ko 态", () => {
  const { a, b, rules } = makeMatch();
  b.hp = 4;
  rules.registerHit(a, b, byId("preset-ram").hit, false);
  assert(rules.phase === "ko", `应进入 ko 相，实际 ${rules.phase}`);
  assert(rules.winner === "p1", `胜者应为 p1，实际 ${rules.winner}`);
  assert(rules.timeScale === KO_SLOWMO, `慢放应 ${KO_SLOWMO}，实际 ${rules.timeScale}`);
  assert(a.state.name === "ko" && b.state.name === "ko", "双方都应进 ko 态");
  assert(a.move === null && b.move === null, "双方招式都应被清掉");
});

t("三局两胜：第二胜达成 → matchEnd", () => {
  const { a, b, rules } = makeMatch();
  rules.wins = { p1: 1, p2: 0 };
  b.hp = 1;
  rules.registerHit(a, b, byId("preset-ram").hit, false); // → ko，winner p1
  assert(rules.phase === "ko", "前置：应进入 ko 相");
  for (let i = 0; i < KO_FRAMES; i++) rules.tick();
  assert(rules.phase === "matchEnd", `KO 倒计时结束应 matchEnd，实际 ${rules.phase}`);
  assert(rules.wins.p1 === 2, `p1 应 2 胜，实际 ${rules.wins.p1}`);
  assert(rules.winner === "p1", "胜者应保持 p1");
});

// ============================================================
console.log("\n[完整 step 集成]");

t("走位逼近 → 出招命中 → 掉血 → hitstun 打断对手招式", () => {
  const m = makeMatch();
  const { a, b } = m;
  a.placeAt(0, 0);
  b.placeAt(0, 0.6);
  a.faceTowards(b.position);
  b.faceTowards(a.position);

  // b 先起长起手招式（回旋，startup 12），a 用快招（撞击，startup 5）抢打断
  fullStep(m, inputWith({ lightTap: true }), inputWith({ heavyTap: true }));
  assert(a.move?.move.id === "preset-ram", `a 应出撞击，实际 ${a.move?.move.id}`);
  assert(b.move?.move.id === "preset-spin", `b 应出回旋，实际 ${b.move?.move.id}`);

  // 推进到 a 的 active 命中（回旋 startup 12 内，b 还没进 active）
  for (let i = 0; i < 8; i++) fullStep(m, NO_INPUT, NO_INPUT);

  assert(b.hp === MAX_HP - 6, `b 应被命中掉 6 血，实际 ${b.hp}`);
  assert(b.state.name === "hitstun", `b 应被打断进 hitstun，实际 ${b.state.name}`);
  assert(b.move === null, "b 的招式应被清掉");
});

// ============================================================
console.log(`\n✅ F4 测试：${pass} 通过，${fail} 失败`);
process.exit(fail ? 1 : 0);
