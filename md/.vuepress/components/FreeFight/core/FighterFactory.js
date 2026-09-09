import * as THREE from "three";
import { SkeletonParser } from "../../AniAI/core/SkeletonParser.js";
import { BoneRegistry } from "../../AniAI/core/BoneRegistry.js";
import { buildNormalizedRig } from "./Normalizer.js";
import { SkinnedRig } from "./SkinnedRig.js";
import { RigidRig } from "./RigidRig.js";

/**
 * FighterFactory：GLB → 归一化 → Rig 适配 → Fighter 实体。
 *
 * rig 类型由「实际有无 SkinnedMesh」判定，而不是信 builtins.js 里的预期值 ——
 * 玩家导入的模型无从预知，且内置清单可能与资产实际情况脱节。
 */
export class FighterFactory {
  /**
   * @param {import('./AssetRegistry.js').AssetRegistry} assets
   */
  constructor(assets) {
    this.assets = assets;
    this.parser = new SkeletonParser();
  }

  /**
   * 造一个战士。
   * @param {object} spec 传给 AssetRegistry.acquire 的资产标识
   * @param {{slot?: string, facingOffset?: number}} [opts]
   *   slot：玩家槽位（'p1'/'p2'），用于配置分桶与调试标识
   *   facingOffset：朝向校准弧度（绕 Y）
   * @returns {Promise<Fighter>}
   */
  async create(spec, opts = {}) {
    const { scene, entry } = await this.assets.acquire(spec);

    // 骨骼识别：以实际解析结果为准
    const parseResult = this.parser.parse(scene);
    const registry = new BoneRegistry(parseResult);
    const isSkinned = registry.hasSkeleton;

    const parts = buildNormalizedRig(scene, { facingOffset: opts.facingOffset || 0 });

    const rig = isSkinned
      ? new SkinnedRig(registry, parts)
      : new RigidRig(parts);

    return new Fighter({
      slot: opts.slot || "p1",
      rig,
      registry: isSkinned ? registry : null,
      modelScene: scene,
      entry,
      parts,
    });
  }
}

/**
 * Fighter：一名参战角色。
 *
 * F1 阶段只承载「身体」——rig、世界位姿、朝向。
 * F2 接入 Physics 后 position/velocity 由物理驱动；
 * F3 接入 MoveRunner 后 rig 姿态由招式驱动；
 * F4 接入 FightRules 后有 hp/meter/state。
 * 这些字段现在先占位，避免后续改动波及 F1 的接口。
 */
export class Fighter {
  constructor({ slot, rig, registry, modelScene, entry, parts }) {
    this.slot = slot;
    this.rig = rig;
    this.registry = registry;
    this.modelScene = modelScene;
    this.entry = entry;
    this.parts = parts;

    /** 世界根节点：加进 scene 的就是这个 */
    this.root = rig.root;
    this.root.name = `ff-fighter-${slot}`;

    // ---- 位姿（F2 由 Physics 驱动）----
    /** 逻辑位置（X-Z 平面 + Y 高度）。root.position 由渲染插值写入，两者分开。 */
    this.position = new THREE.Vector3(0, 0, 0);
    this.prevPosition = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    /** 朝向角（绕 Y，弧度）。0 = 面朝 +Z。 */
    this.facing = 0;
    this.prevFacing = 0;

    // ---- 数值（F4）----
    this.hp = 100;
    this.maxHp = 100;
    this.meter = 0;
    this.state = "idle";

    // ---- 招式（沿用类注释的占位约定：先留字段，避免 F3 改动 F1 的接口）----
    this.move = null; // 当前出招的 MoveRunner（null = 无出招/收招 blend 已完成）
    this.moveSet = null; // 该战士的 MoveSet（预设 4 招；F5 自定义招在此注入）

    this._metrics = rig.metrics;
  }

  get kind() {
    return this.rig.kind;
  }

  get displayName() {
    return this.entry?.meta?.name || this.entry?.key || "无名战士";
  }

  /** 受击胶囊（局部尺寸） */
  hurtbox() {
    return this.rig.hurtbox();
  }

  /** 归一化度量（scale/height/radius/flat…） */
  metrics() {
    return this._metrics;
  }

  /**
   * 把逻辑位姿写进 Three 的 root。
   * @param {number} [alpha] 渲染插值系数 0..1（F2 的固定步长循环用）；省略则直接对齐
   */
  syncTransform(alpha) {
    if (alpha == null) {
      this.root.position.copy(this.position);
      this.root.rotation.y = this.facing;
      return;
    }
    this.root.position.lerpVectors(this.prevPosition, this.position, alpha);
    // 朝向按最短弧插值，避免绕远路
    let d = this.facing - this.prevFacing;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.root.rotation.y = this.prevFacing + d * alpha;
  }

  /** 面向目标点（立即，不插值）。用于入场初始化与锁定转身。 */
  faceTowards(target) {
    this.facing = Math.atan2(target.x - this.position.x, target.z - this.position.z);
    this.prevFacing = this.facing;
  }

  /** 摆到场地上的某个位置 */
  placeAt(x, z) {
    this.position.set(x, 0, z);
    this.prevPosition.copy(this.position);
    this.velocity.set(0, 0, 0);
    this.syncTransform();
  }

  /** 复位到 rest pose（清掉招式残留的姿态） */
  resetPose() {
    this.rig.reset();
  }

  /**
   * 从场景移除。
   * 注意不 dispose geometry/material —— 它们与其他角色共享，
   * 释放统一由 AssetRegistry.dispose() 负责（见该文件注释）。
   */
  detach() {
    this.root.parent?.remove(this.root);
  }
}
