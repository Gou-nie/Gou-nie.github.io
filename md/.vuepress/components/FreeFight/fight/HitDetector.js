import * as THREE from "three";
import { applyKnockback } from "./Physics.js";
import { BLOCK_FACING_DOT, KNOCKDOWN_HEIGHT_SCALE } from "./constants.js";

/**
 * HitDetector —— 攻击框（hitbox）× 受击框（hurtbox）判定与结算。
 *
 * 攻击框：招式 active 相位内，从 rig.anchors() 取该招启用的锚点，每帧
 * getWorldPosition() 得球心，半径 = 锚点基础半径 × 招式 radiusScale。
 * 受击框：由归一化度量自动生成的竖直胶囊（脚底 → 头顶，半径 = metrics.radius），
 * 随根节点移动；倒地时压扁。两类战士统一，无需玩家配置。
 *
 * 判定只在 active 窗口发生（由调用方保证：sample 内部再以 runner.isActive 门控）。
 * 一次激活对同一守方只命中一次（hitsPerActivation 语义），用 runner 上的
 * alreadyHit 集合记录。
 *
 * 关键设计（DESIGN §6.3）：resolve 判定防御成立的三条件全真才算防住：
 *   1. 守方处于 block 状态
 *   2. 守方面向攻方（背身防御无效 —— 3D 走位的核心战术价值）
 *   3. 招式不是 throw 类
 *
 * 同帧对撞（trade）：sample 只施加效果、不清除任何人的 move —— 清 move 由 Arena
 * 在两人都采样完之后按「是否被打断（hitstun/blockstun/…）」统一做。这样两人同 tick
 * 互相命中时，双方都能各自结算伤害与硬直。
 */

// 模块级临时对象：判定每帧要对每锚点做几何计算，绝不在循环里 new Vector3
const _capA = new THREE.Vector3();
const _capB = new THREE.Vector3();
const _closest = new THREE.Vector3();
const _ab = new THREE.Vector3();
const _toCenter = new THREE.Vector3();
const _anchorPos = new THREE.Vector3();

/**
 * 球 × 竖直胶囊相交检测。
 * @param {THREE.Vector3} center 球心
 * @param {number} sr 球半径
 * @param {THREE.Vector3} a 胶囊下端（脚底）
 * @param {THREE.Vector3} b 胶囊上端（头顶）
 * @param {number} cr 胶囊半径
 * @returns {boolean} 是否相交
 */
export function sphereVsCapsule(center, sr, a, b, cr) {
  _ab.subVectors(b, a);
  const len2 = _ab.lengthSq();
  let t = 0;
  if (len2 > 1e-12) {
    _toCenter.subVectors(center, a);
    t = THREE.MathUtils.clamp(_toCenter.dot(_ab) / len2, 0, 1);
  }
  _closest.copy(a).addScaledVector(_ab, t);
  const r = sr + cr;
  return _closest.distanceToSquared(center) <= r * r;
}

export class HitDetector {
  /**
   * @param {{rules: import('./FightRules.js').FightRules}} cfg
   */
  constructor({ rules }) {
    this.rules = rules;
  }

  /**
   * 对「攻方 → 守方」判定一步。
   * @returns {{blocked: boolean, damage: number, combo: number}|null} null = 本 tick 无命中
   */
  sample(attacker, defender) {
    const runner = attacker.move;
    if (!runner || !runner.isActive) return null;

    const move = runner.move;
    const hit = move.hit;
    if (!hit) return null;

    // 该招启用的锚点：null = 全部建议锚点，否则按 id 过滤
    const anchors = hit.anchors
      ? attacker.rig.anchors().filter((a) => hit.anchors.includes(a.id))
      : attacker.rig.anchors();
    if (!anchors.length) return null;

    // 受击胶囊（守方）：脚底 → 头顶；倒地压扁
    const hb = defender.hurtbox();
    let h = hb.height;
    if (defender.state.is("knockdown")) h *= KNOCKDOWN_HEIGHT_SCALE;
    _capA.set(defender.position.x, defender.position.y, defender.position.z);
    _capB.set(defender.position.x, defender.position.y + h, defender.position.z);
    const capR = hb.radius;

    for (const anchor of anchors) {
      // 球心：具名骨骼直接取世界坐标；body 类锚点（target === null）取 bodyPivot 世界坐标
      // 并抬到身高一半 —— 归一化后 bodyPivot 在脚底，不抬的话判定球只能擦到胶囊底部。
      if (anchor.target) {
        const node = attacker.rig.node(anchor.target);
        if (!node) continue; // 换模型后骨骼名不存在，跳过（DESIGN §9.9-10）
        node.getWorldPosition(_anchorPos);
      } else {
        attacker.rig.bodyPivot.getWorldPosition(_anchorPos);
        _anchorPos.y += attacker.metrics().height * 0.5;
      }

      const sr = anchor.radius * (hit.radiusScale ?? 1);
      if (!sphereVsCapsule(_anchorPos, sr, _capA, _capB, capR)) continue;

      // 一次激活只命中一次
      if (!runner._alreadyHit) runner._alreadyHit = new Set();
      if (runner._alreadyHit.has(defender.slot)) return null;
      runner._alreadyHit.add(defender.slot);

      return this._resolve(attacker, defender, move, hit);
    }
    return null;
  }

  /**
   * 命中结算：判定防御成立 → chip + blockstun；否则伤害 + hitstun + 击退。
   * 只施加效果，不清除任何人的 move（trade 语义，见文件头）。
   */
  _resolve(attacker, defender, move, hit) {
    if (this._isBlocked(attacker, defender, move)) {
      const { damage } = this.rules.registerHit(attacker, defender, hit, true);
      defender.state.to("blockstun", { lock: hit.blockstun ?? 8, force: true });
      return { blocked: true, damage, combo: 0 };
    }

    const { damage, combo } = this.rules.registerHit(attacker, defender, hit, false);
    // 硬直锁 frame；被命中必须 force 越过（守方可能在冲刺/攻击中带锁）
    defender.state.to("hitstun", { lock: hit.hitstun ?? 16, force: true });
    // 击退：沿「攻 → 守」水平方向 + 垂直分量（launch 招式靠 knockback.y 浮空）
    applyKnockback(defender, attacker, hit.knockback || { x: 0, y: 0 });
    return { blocked: false, damage, combo };
  }

  /** 防御成立三条件（全真才防住） */
  _isBlocked(attacker, defender, move) {
    if (!defender.state.is("block")) return false;
    if ((move.category ?? "") === "throw") return false;

    const tx = attacker.position.x - defender.position.x;
    const tz = attacker.position.z - defender.position.z;
    const tl = Math.hypot(tx, tz);
    if (tl < 1e-6) return false; // 完全重合无法判定朝向，保守视为未防住

    const dot = Math.sin(defender.facing) * (tx / tl) + Math.cos(defender.facing) * (tz / tl);
    return dot > BLOCK_FACING_DOT;
  }
}
