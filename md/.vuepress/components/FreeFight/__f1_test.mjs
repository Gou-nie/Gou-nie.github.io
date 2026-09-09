/**
 * F1 验收测试：归一化 + Rig 适配 + 姿态插值。
 * 运行：node md/.vuepress/components/FreeFight/__f1_test.mjs
 *
 * 用真 three.js（Node 里可跑，因为只用到数学与 Object3D，不碰 WebGL）。
 */
import * as THREE from "three";
import { computeNormalization, buildNormalizedRig, FIGHTER_HEIGHT } from "./core/Normalizer.js";
import { RigidRig } from "./core/RigidRig.js";
import { SkinnedRig } from "./core/SkinnedRig.js";
import { inferRole } from "./core/Rig.js";

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); pass++; console.log("  ✓", name); }
  catch (e) { fail++; console.log("  ✗", name, "→", e.message); }
};
const near = (a, b, eps = 1e-5) => Math.abs(a - b) < eps;
const assert = (c, m) => { if (!c) throw new Error(m || "断言失败"); };

/** 造一个指定尺寸/位置的 mesh，用于测包围盒相关逻辑 */
function makeBox(w, h, d, cx = 0, cy = 0, cz = 0) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
  mesh.position.set(cx, cy, cz);
  return mesh;
}

console.log("\n[归一化]");

t("常规模型按高度归一到标准身高", () => {
  const box = new THREE.Box3(new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 4, 1));
  const n = computeNormalization(box);
  assert(near(n.scale, FIGHTER_HEIGHT / 4), `scale 应为 ${FIGHTER_HEIGHT / 4}，实为 ${n.scale}`);
  assert(near(n.height, FIGHTER_HEIGHT), `归一化后高度应为 ${FIGHTER_HEIGHT}，实为 ${n.height}`);
  assert(!n.flat, "不该判定为扁平");
});

t("巨大模型与微小模型归一化后同高（苹果 vs 录音机）", () => {
  const huge = computeNormalization(
    new THREE.Box3(new THREE.Vector3(-50, 0, -50), new THREE.Vector3(50, 200, 50))
  );
  const tiny = computeNormalization(
    new THREE.Box3(new THREE.Vector3(-0.01, 0, -0.01), new THREE.Vector3(0.01, 0.04, 0.01))
  );
  assert(near(huge.height, tiny.height), "两者归一化后高度必须一致");
  assert(near(huge.height, FIGHTER_HEIGHT), "且等于标准身高");
});

t("落地：偏离原点的模型被拉回 min.y = 0", () => {
  // 模型悬在空中（y 从 10 到 14）
  const box = new THREE.Box3(new THREE.Vector3(-1, 10, -1), new THREE.Vector3(1, 14, 1));
  const n = computeNormalization(box);
  // 缩放后 min.y = 10 * scale，offset.y 应恰好抵消它
  assert(near(n.offset.y, -10 * n.scale), `offset.y 应为 ${-10 * n.scale}，实为 ${n.offset.y}`);
});

t("居中：X-Z 偏心的模型被拉回原点", () => {
  const box = new THREE.Box3(new THREE.Vector3(8, 0, -20), new THREE.Vector3(12, 4, -16));
  const n = computeNormalization(box);
  assert(near(n.offset.x, -10 * n.scale), "X 中心应被抵消");
  assert(near(n.offset.z, 18 * n.scale), "Z 中心应被抵消");
});

t("扁平模型（趴着的鲤鱼王）改用最大边归一，不被拉成巨兽", () => {
  // 长 6、高 0.5、宽 1 —— 高/最大边 = 0.083，远低于阈值
  const box = new THREE.Box3(new THREE.Vector3(-3, 0, -0.5), new THREE.Vector3(3, 0.5, 0.5));
  const n = computeNormalization(box);
  assert(n.flat, "应判定为扁平");
  assert(near(n.scale, FIGHTER_HEIGHT / 6), "应按最大边(6)归一");
  assert(n.height < FIGHTER_HEIGHT, "扁平模型归一化后高度必然小于标准身高");
  // 关键：若错误地按高度归一，scale 会是 1.8/0.5 = 3.6，模型长度变成 21.6 米
  assert(n.scale < 1, "按高度归一会得到 3.6 的荒谬缩放");
});

t("退化包围盒不产生 Infinity / NaN", () => {
  const empty = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
  const n = computeNormalization(empty);
  assert(n.degenerate, "应标记为退化");
  assert(isFinite(n.scale) && n.scale > 0, "scale 必须是有限正数");
  assert(isFinite(n.radius) && n.radius > 0, "radius 必须是有限正数");
});

t("推挤半径被钳制在合理区间", () => {
  const needle = computeNormalization(
    new THREE.Box3(new THREE.Vector3(-0.001, 0, -0.001), new THREE.Vector3(0.001, 4, 0.001))
  );
  assert(needle.radius >= 0.18, "极细模型的半径应被抬到下限");
  const pancake = computeNormalization(
    new THREE.Box3(new THREE.Vector3(-20, 0, -20), new THREE.Vector3(20, 45, 20))
  );
  assert(pancake.radius <= 0.6, "极宽模型的半径应被压到上限");
});

console.log("\n[pivot 链]");

t("归一化后模型实际落在地面且居中（端到端验证）", () => {
  // 一个 4 高、偏心、悬空的模型
  const mesh = makeBox(2, 4, 2, 10, 12, -6);
  const { root, metrics } = buildNormalizedRig(mesh);
  root.updateMatrixWorld(true);
  const worldBox = new THREE.Box3().setFromObject(root);
  assert(near(worldBox.min.y, 0, 1e-4), `脚底应在 y=0，实为 ${worldBox.min.y}`);
  const c = worldBox.getCenter(new THREE.Vector3());
  assert(near(c.x, 0, 1e-4), `X 应居中，实为 ${c.x}`);
  assert(near(c.z, 0, 1e-4), `Z 应居中，实为 ${c.z}`);
  const size = worldBox.getSize(new THREE.Vector3());
  assert(near(size.y, FIGHTER_HEIGHT, 1e-4), `高度应为 ${FIGHTER_HEIGHT}，实为 ${size.y}`);
  assert(near(metrics.height, FIGHTER_HEIGHT, 1e-4), "metrics.height 应与实测一致");
});

t("朝向校准旋转后仍然落地且居中（pivot 分层的关键验证）", () => {
  const mesh = makeBox(1, 4, 3, 5, 8, 5);
  const { root } = buildNormalizedRig(mesh, { facingOffset: Math.PI / 2 });
  root.updateMatrixWorld(true);
  const worldBox = new THREE.Box3().setFromObject(root);
  // 若把缩放/平移与旋转合并到一个 pivot，旋转会连带旋转平移量，模型会飞走
  assert(near(worldBox.min.y, 0, 1e-4), `旋转后脚底仍应在 y=0，实为 ${worldBox.min.y}`);
  const c = worldBox.getCenter(new THREE.Vector3());
  assert(near(c.x, 0, 1e-4), `旋转后 X 仍应居中，实为 ${c.x}`);
  assert(near(c.z, 0, 1e-4), `旋转后 Z 仍应居中，实为 ${c.z}`);
});

t("90° 校准确实把深度与宽度对调了（证明旋转真的生效）", () => {
  const mesh = makeBox(1, 4, 3); // 宽 1、深 3
  const a = buildNormalizedRig(mesh.clone());
  a.root.updateMatrixWorld(true);
  const sizeA = new THREE.Box3().setFromObject(a.root).getSize(new THREE.Vector3());

  const b = buildNormalizedRig(mesh.clone(), { facingOffset: Math.PI / 2 });
  b.root.updateMatrixWorld(true);
  const sizeB = new THREE.Box3().setFromObject(b.root).getSize(new THREE.Vector3());

  assert(near(sizeA.x, sizeB.z, 1e-4), "旋转 90° 后原宽度应变成深度");
  assert(near(sizeA.z, sizeB.x, 1e-4), "旋转 90° 后原深度应变成宽度");
});

console.log("\n[Rig 适配]");

t("RigidRig：无骨骼模型可摆姿势", () => {
  const parts = buildNormalizedRig(makeBox(1, 2, 1));
  const rig = new RigidRig(parts);
  assert(rig.kind === "rigid", "类型应为 rigid");
  assert(rig.nodes().length === 1, "应有唯一可动节点");
  assert(rig.node("__body__") === parts.bodyPivot, "节点应是 bodyPivot");
  assert(rig.anchors().length === 1, "应有一个整体锚点");
  assert(rig.anchors()[0].role === "body", "锚点角色应为 body");
});

t("RigidRig：捕获与插值姿态（前冲撞语义）", () => {
  const parts = buildNormalizedRig(makeBox(1, 2, 1));
  const rig = new RigidRig(parts);

  const restPose = rig.capturePose();
  parts.bodyPivot.position.z = 0.4;
  parts.bodyPivot.rotation.x = 0.3;
  const lungePose = rig.capturePose();

  assert(near(lungePose.body.position[2], 0.4), "应捕获到 z 位移");
  assert(near(restPose.body.position[2], 0), "rest 姿态不应被后续修改污染");

  rig.lerpPose(restPose, lungePose, 0.5);
  assert(near(parts.bodyPivot.position.z, 0.2), `半程 z 应为 0.2，实为 ${parts.bodyPivot.position.z}`);

  rig.lerpPose(restPose, lungePose, 1);
  assert(near(parts.bodyPivot.position.z, 0.4), "终点应完全到位");

  rig.reset();
  assert(near(parts.bodyPivot.position.z, 0), "reset 应清零");
  assert(near(parts.bodyPivot.rotation.x, 0), "reset 应清掉旋转");
});

t("RigidRig：非等比缩放（蓄力挤压）能插值", () => {
  const parts = buildNormalizedRig(makeBox(1, 2, 1));
  const rig = new RigidRig(parts);
  const a = rig.capturePose();
  parts.bodyPivot.scale.set(1.2, 0.7, 1.2);
  const b = rig.capturePose();
  rig.lerpPose(a, b, 0.5);
  assert(near(parts.bodyPivot.scale.y, 0.85), `半程 y 缩放应为 0.85，实为 ${parts.bodyPivot.scale.y}`);
  assert(near(parts.bodyPivot.scale.x, 1.1), "x 缩放应独立插值");
});

console.log("\n[骨骼锚点启发式]");

t("mimikyu 的真实骨骼名能命中头/尾/耳", () => {
  // 这些是 mimikyu.glb 经 GLTFLoader sanitize 后的实际名字（Ear.L → EarL）
  assert(inferRole("Head_Armature") === "head", "应识别头");
  assert(inferRole("Tail_Armature") === "tail", "应识别尾");
  assert(inferRole("Tail_tip_Armature") === "tail", "尾尖也应识别为尾");
  assert(inferRole("EarL_Armature") === "special", "耳应识别为特殊部位");
  assert(inferRole("EarR_Armature") === "special", "另一只耳同理");
});

t("通用人形骨骼名能命中拳/脚", () => {
  assert(inferRole("mixamorigLeftHand") === "fist", "应识别手");
  assert(inferRole("RightFoot") === "foot", "应识别脚");
  assert(inferRole("hand_R") === "fist", "下划线命名同理");
  assert(inferRole("LowerLeg_L") === "foot", "腿应归为脚");
});

t("躯干类骨骼不产生锚点（避免整个身体都是攻击框）", () => {
  assert(inferRole("Body_Armature") === null, "身体不该是攻击锚点");
  assert(inferRole("Neck_Armature") === null, "颈部不该是攻击锚点");
  assert(inferRole("ROOT_Armature") === null, "根骨不该是攻击锚点");
  assert(inferRole("Spine02") === null, "脊柱不该是攻击锚点");
});

t("SkinnedRig：无可识别部位时回落到整体锚点", () => {
  const parts = buildNormalizedRig(makeBox(1, 2, 1));
  const fakeRegistry = {
    hasSkeleton: true,
    names: () => ["Bone_A", "Bone_B"],
    get: () => null,
    restPose: () => null,
    reset: () => {},
  };
  const rig = new SkinnedRig(fakeRegistry, parts);
  const anchors = rig.anchors();
  assert(anchors.length === 1, "应回落到一个锚点");
  assert(anchors[0].id === "__body__", "且是整体锚点");
});

t("SkinnedRig：mimikyu 骨架产出 7 个锚点（头/4 段耳/2 段尾），躯干被排除", () => {
  const parts = buildNormalizedRig(makeBox(1, 2, 1));
  const names = [
    "Armature_rootJoint", "ROOT_Armature", "Body_Armature", "Neck_Armature",
    "Head_Armature", "EarR_Armature", "Ear_tipR_Armature", "EarL_Armature",
    "Ear_tipL_Armature", "Tail_Armature", "Tail_tip_Armature",
  ];
  const bones = {};
  for (const n of names) {
    const b = new THREE.Bone();
    b.name = n;
    bones[n] = b;
  }
  const registry = {
    hasSkeleton: true,
    names: () => names,
    get: (n) => bones[n] || null,
    restPose: (n) => (bones[n] ? { position: new THREE.Vector3(), rotation: new THREE.Euler(), scale: new THREE.Vector3(1, 1, 1) } : null),
    reset: () => {},
  };
  const rig = new SkinnedRig(registry, parts);
  const anchors = rig.anchors();
  const roles = anchors.map((a) => a.role);
  // 11 根骨骼里只有 7 根适合当攻击锚点；躯干/颈/根骨被正确排除
  assert(anchors.length === 7, `应有 7 个锚点，实为 ${anchors.length}: ${anchors.map(a => a.id)}`);
  assert(roles.filter((r) => r === "head").length === 1, "应有 1 个头锚点");
  assert(roles.filter((r) => r === "tail").length === 2, "应有 2 个尾锚点");
  assert(roles.filter((r) => r === "special").length === 4, "应有 4 个耳部锚点");
  const ids = anchors.map((a) => a.id);
  assert(!ids.includes("Body_Armature"), "躯干不应成为锚点");
  assert(!ids.includes("Neck_Armature"), "颈部不应成为锚点");
  assert(!ids.includes("Armature_rootJoint"), "根骨不应成为锚点");
});

console.log("\n[四元数插值 —— §9.4 的核心保障]");

t("大角度旋转走最短弧，不绕远路", () => {
  const parts = buildNormalizedRig(makeBox(1, 2, 1));
  const rig = new RigidRig(parts);
  const deg = THREE.MathUtils.degToRad;

  // 从 350° 转到 10°：正确答案是就近转 20°，错误答案是绕 340°
  const a = { kind: "rigid", body: { position: [0,0,0], rotation: [0, deg(350), 0, "XYZ"], scale: [1,1,1] } };
  const b = { kind: "rigid", body: { position: [0,0,0], rotation: [0, deg(10),  0, "XYZ"], scale: [1,1,1] } };

  rig.lerpPose(a, b, 0.5);
  // 中点应在 0°(=360°) 附近。用四元数比较避免 Euler 表示的多解问题。
  const mid = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0, "XYZ"));
  const got = parts.bodyPivot.quaternion;
  const angle = 2 * Math.acos(Math.min(1, Math.abs(got.dot(mid))));
  assert(angle < deg(1), `中点应接近 0°，实际偏离 ${THREE.MathUtils.radToDeg(angle).toFixed(2)}°`);
});

t("插值端点精确落位（无累积漂移）", () => {
  const parts = buildNormalizedRig(makeBox(1, 2, 1));
  const rig = new RigidRig(parts);
  const deg = THREE.MathUtils.degToRad;
  const a = { kind: "rigid", body: { position: [0,0,0], rotation: [0,0,0,"XYZ"], scale: [1,1,1] } };
  const b = { kind: "rigid", body: { position: [0,0,0], rotation: [deg(90),0,0,"XYZ"], scale: [1,1,1] } };

  // 反复插值不应累积误差（MoveRunner 每帧都会调用）
  for (let i = 0; i <= 60; i++) rig.lerpPose(a, b, i / 60);
  const target = new THREE.Quaternion().setFromEuler(new THREE.Euler(deg(90), 0, 0, "XYZ"));
  const angle = 2 * Math.acos(Math.min(1, Math.abs(parts.bodyPivot.quaternion.dot(target))));
  assert(angle < 1e-4, `终点应精确到位，偏离 ${angle}`);
});

console.log("\n[Fighter 位姿]");

const { Fighter } = await import("./core/FighterFactory.js");

t("faceTowards 正确计算朝向角", () => {
  const parts = buildNormalizedRig(makeBox(1, 2, 1));
  const f = new Fighter({ slot: "p1", rig: new RigidRig(parts), registry: null, modelScene: null, entry: null, parts });
  f.placeAt(0, 0);
  f.faceTowards(new THREE.Vector3(0, 0, 5));   // 正前方 +Z
  assert(near(f.facing, 0), `面朝 +Z 时 facing 应为 0，实为 ${f.facing}`);
  f.faceTowards(new THREE.Vector3(5, 0, 0));   // 正右方 +X
  assert(near(f.facing, Math.PI / 2), `面朝 +X 时 facing 应为 90°，实为 ${f.facing}`);
});

t("两个战士互相面对（入场初始化）", () => {
  const mk = (slot) => {
    const parts = buildNormalizedRig(makeBox(1, 2, 1));
    return new Fighter({ slot, rig: new RigidRig(parts), registry: null, modelScene: null, entry: null, parts });
  };
  const p1 = mk("p1"), p2 = mk("p2");
  p1.placeAt(-2, 0);
  p2.placeAt(2, 0);
  p1.faceTowards(p2.position);
  p2.faceTowards(p1.position);
  // 两人应朝向相反
  const diff = Math.abs(p1.facing - p2.facing);
  assert(near(diff, Math.PI), `两人朝向应相差 180°，实为 ${THREE.MathUtils.radToDeg(diff)}°`);
  p1.syncTransform();
  assert(near(p1.root.rotation.y, p1.facing), "syncTransform 应写入 root");
});

t("朝向插值走最短弧（跨 ±180° 不抽搐）", () => {
  const parts = buildNormalizedRig(makeBox(1, 2, 1));
  const f = new Fighter({ slot: "p1", rig: new RigidRig(parts), registry: null, modelScene: null, entry: null, parts });
  f.prevFacing = Math.PI - 0.1;
  f.facing = -Math.PI + 0.1;   // 跨越 180° 边界，实际只差 0.2 弧度
  f.syncTransform(0.5);
  // 若不做最短弧处理，会插值到 0 附近（转了半圈）
  const y = f.root.rotation.y;
  assert(Math.abs(y) > Math.PI - 0.2, `应在 ±180° 附近，实为 ${y}（说明绕了远路）`);
});

console.log(`\n${fail === 0 ? "✅" : "❌"} F1 测试：${pass} 通过，${fail} 失败\n`);
process.exit(fail === 0 ? 0 : 1);
