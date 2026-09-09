import * as THREE from "three";
import { Rig, radiusForRole } from "./Rig.js";

/**
 * 刚体战士：无骨骼模型的伪骨架，唯一可动节点是 bodyPivot。
 *
 * 这不是对静态模型的妥协，而是本项目的主玩法形态 —— 6 个内置模型里 5 个没有骨骼，
 * 而唯一有骨骼的 mimikyu 也没有手臂和腿。所以「整体做变换」的招式语义是通用底座：
 *   前冲撞  → +z 位移
 *   回旋    → y 旋转
 *   上挑    → x 旋转 + y 位移
 *   蓄力    → scale 非等比挤压
 *   跺地    → y 位移骤降
 *
 * 姿态通道 = bodyPivot 的 position / rotation / scale（9 个自由度）。
 */
export class RigidRig extends Rig {
  constructor(parts) {
    super("rigid", parts);
    this._anchors = [
      {
        id: "__body__",
        label: "整体",
        role: "body",
        target: null, // null = 用 bodyPivot 取世界坐标
        radius: radiusForRole("body"),
      },
    ];
  }

  nodes() {
    return ["__body__"];
  }

  node(name) {
    return name === "__body__" || name == null ? this.bodyPivot : null;
  }

  rest() {
    return REST;
  }

  reset() {
    this.bodyPivot.position.set(0, 0, 0);
    this.bodyPivot.rotation.set(0, 0, 0);
    this.bodyPivot.scale.setScalar(1);
  }

  anchors() {
    return this._anchors;
  }

  capturePose() {
    return {
      kind: "rigid",
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

  restPoseObject() {
    return REST_POSE;
  }

  lerpPose(from, to, t) {
    const a = (from || REST_POSE).body || REST_POSE.body;
    const b = (to || REST_POSE).body || REST_POSE.body;
    this._lerpNode(this.bodyPivot, a, b, t);
  }
}

/** bodyPivot 的 rest 变换（恒等） */
const REST_POSE = {
  kind: "rigid",
  body: {
    position: [0, 0, 0],
    rotation: [0, 0, 0, "XYZ"],
    scale: [1, 1, 1],
  },
};

/** rest() 的返回值，形状与 BoneRegistry.restPose() 一致（真 THREE 对象，不是打桩） */
const REST = {
  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0, "XYZ"),
  scale: new THREE.Vector3(1, 1, 1),
};
