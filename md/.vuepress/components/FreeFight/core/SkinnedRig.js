import * as THREE from "three";
import { Rig, inferRole, radiusForRole, serializeRest } from "./Rig.js";

/**
 * 骨骼战士：包装 AniAI 的 BoneRegistry，可动节点是 THREE.Bone。
 *
 * 姿态格式与 AniAI PoseStore 兼容（{ 骨骼名: [x,y,z,order] }），
 * 所以在 AniAI 工具里手捏保存的姿态可以直接拿来当招式的相位。
 *
 * 骨骼名用「加载后」的名字作 key —— GLTFLoader 的 sanitizeNodeName 会删掉 . [ ] : /，
 * 例如 mimikyu 的 Ear.L_Armature 加载后实际叫 EarL_Armature。
 */
export class SkinnedRig extends Rig {
  /**
   * @param {import('../../AniAI/core/BoneRegistry.js').BoneRegistry} registry
   * @param {{root, bodyPivot, metrics}} parts
   */
  constructor(registry, parts) {
    super("skinned", parts);
    this.registry = registry;
    this._anchors = this._buildAnchors();
  }

  nodes() {
    return this.registry.names();
  }

  node(name) {
    return this.registry.get(name);
  }

  rest(name) {
    return this.registry.restPose(name);
  }

  reset() {
    this.registry.reset();
    // 招式也会动 bodyPivot（预设招式全是根节点语义），所以一并复位
    this.bodyPivot.position.set(0, 0, 0);
    this.bodyPivot.rotation.set(0, 0, 0);
    this.bodyPivot.scale.setScalar(1);
  }

  anchors() {
    return this._anchors;
  }

  /**
   * 按骨骼名启发式建议判定锚点。
   * 一个都没命中时回落到「整体」锚点（挂在 bodyPivot 上），保证任何骨架都能出招。
   */
  _buildAnchors() {
    const out = [];
    for (const name of this.registry.names()) {
      const role = inferRole(name);
      if (!role) continue;
      out.push({
        id: name,
        label: name,
        role,
        target: name, // 骨骼名，取世界坐标时用
        radius: radiusForRole(role),
      });
    }
    if (out.length === 0) {
      out.push({
        id: "__body__",
        label: "整体",
        role: "body",
        target: null, // null = 用 bodyPivot
        radius: radiusForRole("body"),
      });
    }
    return out;
  }

  capturePose() {
    const bones = {};
    for (const name of this.registry.names()) {
      const bone = this.registry.get(name);
      if (!bone) continue;
      bones[name] = [bone.rotation.x, bone.rotation.y, bone.rotation.z, bone.rotation.order];
    }
    return {
      kind: "skinned",
      bones,
      // 预设招式动的是整体，所以姿态也要记 bodyPivot
      body: {
        position: this.bodyPivot.position.toArray(),
        rotation: [
          this.bodyPivot.rotation.x,
          this.bodyPivot.rotation.y,
          this.bodyPivot.rotation.z,
          this.bodyPivot.rotation.order,
        ],
        scale: this.bodyPivot.scale.toArray(),
      },
    };
  }

  /** rest pose 作为姿态对象（供 lerpPose 的 null 端使用） */
  restPoseObject() {
    if (this._restCache) return this._restCache;
    const bones = {};
    for (const name of this.registry.names()) {
      const rest = this.registry.restPose(name);
      if (!rest) continue;
      bones[name] = [rest.rotation.x, rest.rotation.y, rest.rotation.z, rest.rotation.order];
    }
    this._restCache = {
      kind: "skinned",
      bones,
      body: {
        position: [0, 0, 0],
        rotation: [0, 0, 0, "XYZ"],
        scale: [1, 1, 1],
      },
    };
    return this._restCache;
  }

  lerpPose(from, to, t) {
    const a = from || this.restPoseObject();
    const b = to || this.restPoseObject();

    // 骨骼：只插值两端都有记录的骨骼。缺失的一端用 rest 兜底，
    // 这样换模型后残留的旧姿态不会把骨骼摆到随机位置。
    const restObj = this.restPoseObject();
    for (const name of this.registry.names()) {
      const bone = this.registry.get(name);
      if (!bone) continue;
      const ra = a.bones?.[name] || restObj.bones[name];
      const rb = b.bones?.[name] || restObj.bones[name];
      if (!ra || !rb) continue;
      this._lerpNode(bone, { rotation: ra }, { rotation: rb }, t);
    }

    // 整体变换
    const ba = a.body || restObj.body;
    const bb = b.body || restObj.body;
    this._lerpNode(this.bodyPivot, ba, bb, t);
  }
}

/** 供调试：导出骨骼 rest pose 的可序列化快照 */
export function dumpRest(registry) {
  const out = {};
  for (const name of registry.names()) {
    const rest = registry.restPose(name);
    if (rest) out[name] = serializeRest(rest);
  }
  return out;
}
