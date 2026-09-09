import * as THREE from "three";

/**
 * 模型归一化：把任意尺度/朝向/原点的 GLB 统一成「1.8 米高、脚踩地面、原点居中、正面朝 +Z」。
 *
 * 导入的 GLB 尺度完全不可控（内置资产里 apple 与 tape_recorder 的世界尺寸差两个数量级），
 * 不归一化的话，苹果会有房子那么大，而录音机只有一粒米。
 *
 * 变换挂在两层静态 pivot 上，不去改 modelScene 自身的 transform
 * （modelScene 的 geometry/material 是共享的，且原始 transform 可能被 GLB 的动画引用）：
 *
 *   fighterRoot      世界位移 + 锁定转身（Physics 驱动，F2）
 *   └── bodyPivot    招式姿态（RigidRig 动它，F3）
 *       └── facingPivot   朝向校准（绕 Y 静态旋转）
 *           └── centerPivot   缩放 + 落地 + 居中（静态）
 *               └── modelScene
 *
 * 顺序的正确性：three.js 的局部矩阵是 T * R * S，即先缩放再旋转再平移。
 * centerPivot 先把模型缩放到标准身高、再平移到「X-Z 居中且 min.y = 0」；
 * 此时模型的中轴恰好是 Y 轴，所以 facingPivot 绕 Y 旋转不会破坏居中与落地。
 * 若把两者合并到一个 pivot，旋转会连带旋转平移量，模型就飞了。
 */

/** 标准身高（米）。所有角色归一化到同一高度，保证对战公平。 */
export const FIGHTER_HEIGHT = 1.8;

/**
 * 扁平模型判定阈值：高度 / max(宽,深) 低于此值时改用最大边归一。
 * 否则趴着的鲤鱼王会被拉成 1.8 米高的巨兽。
 */
const FLAT_RATIO = 0.35;

/** X-Z 推挤半径的合理区间（相对标准身高），避免细长/扁平模型的半径失真 */
const MIN_RADIUS = 0.18;
const MAX_RADIUS = 0.6;

/**
 * 计算归一化参数。纯计算，不修改任何对象。
 * @param {THREE.Box3} box 模型在「未经归一化」状态下的包围盒
 * @returns {{scale: number, offset: THREE.Vector3, height: number, radius: number, flat: boolean, degenerate: boolean}}
 */
export function computeNormalization(box) {
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // 退化包围盒（空模型 / 全是点光源之类）：不缩放，只做个兜底，避免除零得到 Infinity
  const degenerate = !isFinite(size.x) || !isFinite(size.y) || !isFinite(size.z) ||
    Math.max(size.x, size.y, size.z) <= 1e-6;
  if (degenerate) {
    return {
      scale: 1,
      offset: new THREE.Vector3(0, 0, 0),
      height: FIGHTER_HEIGHT,
      radius: MIN_RADIUS,
      flat: false,
      degenerate: true,
    };
  }

  const footprint = Math.max(size.x, size.z);
  const flat = size.y / footprint < FLAT_RATIO;
  // 常规模型按「高度」归一（不用最大边，否则趴着的模型会被压扁）；
  // 极端扁平的模型按最大边归一，否则会被拉成细高的怪物。
  const basis = flat ? Math.max(size.x, size.y, size.z) : size.y;
  const scale = FIGHTER_HEIGHT / basis;

  // 缩放后：X-Z 居中（center 归零）、落地（min.y 归零）
  const offset = new THREE.Vector3(
    -center.x * scale,
    -box.min.y * scale,
    -center.z * scale
  );

  const height = size.y * scale;
  const rawRadius = (footprint * scale) / 2;

  return {
    scale,
    offset,
    height,
    radius: THREE.MathUtils.clamp(rawRadius, MIN_RADIUS, MAX_RADIUS),
    flat,
    degenerate: false,
  };
}

/**
 * 把模型装进归一化 pivot 链，返回各层节点与度量。
 *
 * @param {THREE.Object3D} modelScene 已克隆的模型场景（不会被修改 transform）
 * @param {{facingOffset?: number}} [opts] facingOffset：朝向校准弧度，绕 Y
 * @returns {{
 *   root: THREE.Group, bodyPivot: THREE.Group, facingPivot: THREE.Group, centerPivot: THREE.Group,
 *   metrics: {scale, offset, height, radius, flat, degenerate}
 * }}
 */
export function buildNormalizedRig(modelScene, opts = {}) {
  // 先量原始包围盒。此刻 modelScene 还没有父级变换，setFromObject 得到的就是其自身空间的盒子。
  // updateWorldMatrix 是必须的：GLTFLoader 返回的场景未必已经算过世界矩阵，
  // 而 Box3.setFromObject 依赖各 mesh 的 matrixWorld。
  modelScene.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(modelScene);
  const metrics = computeNormalization(box);

  const centerPivot = new THREE.Group();
  centerPivot.name = "ff-centerPivot";
  centerPivot.scale.setScalar(metrics.scale);
  centerPivot.position.copy(metrics.offset);
  centerPivot.add(modelScene);

  const facingPivot = new THREE.Group();
  facingPivot.name = "ff-facingPivot";
  facingPivot.rotation.y = opts.facingOffset || 0;
  facingPivot.add(centerPivot);

  const bodyPivot = new THREE.Group();
  bodyPivot.name = "ff-bodyPivot";
  bodyPivot.add(facingPivot);

  const root = new THREE.Group();
  root.name = "ff-fighterRoot";
  root.add(bodyPivot);

  return { root, bodyPivot, facingPivot, centerPivot, metrics };
}
