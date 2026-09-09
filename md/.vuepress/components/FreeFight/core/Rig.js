import * as THREE from "three";

/**
 * Rig：一具「可摆姿势的躯体」的统一抽象。
 *
 * 战斗层只认这个接口，不认骨骼 —— 这是让 6 个内置模型（1 个有骨骼、5 个没有）
 * 全部能上场对打的关键。两个实现：
 * - SkinnedRig：可动节点是 THREE.Bone（包装 AniAI 的 BoneRegistry）
 * - RigidRig  ：可动节点是人为插入的 bodyPivot（整体做变换）
 *
 * 姿态（Pose）的存储与插值：
 * - 存储用 Euler（可读、易序列化、与 AniAI PoseStore 格式兼容）
 * - 插值前转 Quaternion 做 slerp。绝不对 Euler 做线性插值 —— 招式常有大幅旋转
 *   （回旋 360°、上挑 90°+），Euler lerp 会走万向锁路径产生扭曲，且从 350° 到 10°
 *   会绕远路转 340° 而不是就近转 20°。
 */

/** 判定锚点的默认半径（米），按部位角色区分 */
const ROLE_RADIUS = {
  fist: 0.16,
  foot: 0.18,
  head: 0.2,
  tail: 0.16,
  special: 0.16,
  body: 0.32,
};

/**
 * 骨骼名 → 部位角色的启发式规则。命中即建议为判定锚点。
 * 顺序有意义：先匹配到的优先（hand 比 arm 更精确，故排在前）。
 * 大小写不敏感。命中结果只是工房里的默认值，玩家可任意增删改。
 */
const ANCHOR_RULES = [
  { role: "fist", re: /hand|fist|wrist|palm|claw/i },
  { role: "foot", re: /foot|toe|ankle|shin|leg|knee/i },
  { role: "head", re: /head|skull|jaw|snout/i },
  { role: "tail", re: /tail/i },
  { role: "special", re: /ear|horn|wing|spike|tentacle/i },
];

/** 从骨骼名推断部位角色；无匹配返回 null */
export function inferRole(name) {
  for (const { role, re } of ANCHOR_RULES) {
    if (re.test(name)) return role;
  }
  return null;
}

/** 某角色的默认判定半径 */
export function radiusForRole(role) {
  return ROLE_RADIUS[role] ?? ROLE_RADIUS.special;
}

export class Rig {
  /**
   * @param {'skinned'|'rigid'} kind
   * @param {{root: THREE.Object3D, bodyPivot: THREE.Object3D, metrics: object}} parts
   */
  constructor(kind, parts) {
    this.kind = kind;
    this.root = parts.root;
    this.bodyPivot = parts.bodyPivot;
    this.metrics = parts.metrics;

    // 复用的临时对象，避免每帧在插值里分配（每帧每骨骼都会用到）
    this._qa = new THREE.Quaternion();
    this._qb = new THREE.Quaternion();
    this._ea = new THREE.Euler();
    this._va = new THREE.Vector3();
    this._vb = new THREE.Vector3();
  }

  /** 可动节点名列表，子类实现 */
  nodes() {
    throw new Error("Rig.nodes() 未实现");
  }

  /** 按名取可动节点，子类实现 */
  node() {
    throw new Error("Rig.node() 未实现");
  }

  /** 某节点的 rest 变换 { position, rotation, scale }，子类实现 */
  rest() {
    throw new Error("Rig.rest() 未实现");
  }

  /** 复位到 rest pose，子类实现 */
  reset() {
    throw new Error("Rig.reset() 未实现");
  }

  /** 建议的判定锚点列表，子类实现 */
  anchors() {
    throw new Error("Rig.anchors() 未实现");
  }

  /** 受击胶囊参数（局部空间，沿 Y 轴）。由归一化度量直接得出，无需玩家配置。 */
  hurtbox() {
    return { radius: this.metrics.radius, height: this.metrics.height };
  }

  /**
   * 捕获当前姿态为可序列化对象。
   * 骨骼战士 → { kind:'skinned', bones: { 骨骼名: [x,y,z,order] } }
   * 刚体战士 → { kind:'rigid', body: { position:[..], rotation:[..], scale:[..] } }
   */
  capturePose() {
    throw new Error("Rig.capturePose() 未实现");
  }

  /**
   * 在两个姿态之间插值并写入当前 rig。
   * @param {object|null} from 起始姿态；null 表示从 rest pose 开始
   * @param {object|null} to 目标姿态；null 表示回到 rest pose
   * @param {number} t 0..1
   */
  lerpPose() {
    throw new Error("Rig.lerpPose() 未实现");
  }

  /**
   * 内部：把一个节点的变换朝目标插值。
   * @param {THREE.Object3D} node
   * @param {{position?: number[], rotation?: number[], scale?: number[]}} from
   * @param {{position?: number[], rotation?: number[], scale?: number[]}} to
   * @param {number} t
   */
  _lerpNode(node, from, to, t) {
    if (from.rotation && to.rotation) {
      this._qa.setFromEuler(this._eulerFrom(from.rotation));
      this._qb.setFromEuler(this._eulerFrom(to.rotation));
      // slerp 而非 Euler lerp：见文件头注释
      node.quaternion.slerpQuaternions(this._qa, this._qb, t);
    }
    if (from.position && to.position) {
      this._va.fromArray(from.position);
      this._vb.fromArray(to.position);
      node.position.lerpVectors(this._va, this._vb, t);
    }
    if (from.scale && to.scale) {
      this._va.fromArray(from.scale);
      this._vb.fromArray(to.scale);
      node.scale.lerpVectors(this._va, this._vb, t);
    }
  }

  /** [x, y, z, order?] → 复用的 Euler 实例 */
  _eulerFrom(arr) {
    return this._ea.set(arr[0], arr[1], arr[2], arr[3] || "XYZ");
  }
}

/** 把 Object3D 的当前变换导出为可序列化的三元组 */
export function serializeTransform(obj) {
  return {
    position: obj.position.toArray(),
    rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z, obj.rotation.order],
    scale: obj.scale.toArray(),
  };
}

/** rest 变换（Vector3/Euler 对象）→ 可序列化三元组 */
export function serializeRest(rest) {
  return {
    position: rest.position.toArray(),
    rotation: [rest.rotation.x, rest.rotation.y, rest.rotation.z, rest.rotation.order],
    scale: rest.scale.toArray(),
  };
}
