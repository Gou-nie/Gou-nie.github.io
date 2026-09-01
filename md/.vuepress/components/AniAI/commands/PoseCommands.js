import gsap from "gsap";
import * as THREE from "three";
import { Command } from "./Command.js";

/**
 * 姿态指令：把「各骨骼当前旋转」快照为一个命名姿态，之后可过渡回去。
 * 姿态 = 骨骼旋转的集合（Euler），不含位置/缩放（GLB 骨架以旋转为主）。
 */

/** 姿态存储：name -> Map<boneName, Euler> */
export class PoseStore {
  constructor() {
    this.poses = new Map();
  }

  has(name) {
    return this.poses.has(name);
  }

  names() {
    return Array.from(this.poses.keys());
  }

  get(name) {
    return this.poses.get(name) || null;
  }

  delete(name) {
    return this.poses.delete(name);
  }

  /** 快照当前所有骨骼的 rotation */
  save(name, registry) {
    const snap = new Map();
    for (const boneName of registry.names()) {
      const bone = registry.get(boneName);
      if (bone) snap.set(boneName, bone.rotation.clone());
    }
    this.poses.set(name, snap);
    return snap;
  }

  /** 导出为纯 JSON（供 localStorage 缓存）：{ 姿态名: { 骨骼名: [x, y, z, order] } } */
  serialize() {
    const out = {};
    for (const [poseName, snap] of this.poses) {
      const bones = {};
      for (const [boneName, rot] of snap) {
        bones[boneName] = [rot.x, rot.y, rot.z, rot.order];
      }
      out[poseName] = bones;
    }
    return out;
  }

  /** 从 serialize() 的结果恢复；已存在的同名姿态会被覆盖 */
  hydrate(data) {
    if (!data || typeof data !== "object") return 0;
    let count = 0;
    for (const [poseName, bones] of Object.entries(data)) {
      if (!bones || typeof bones !== "object") continue;
      const snap = new Map();
      for (const [boneName, arr] of Object.entries(bones)) {
        if (!Array.isArray(arr) || arr.length < 3) continue;
        const [x, y, z, order] = arr;
        snap.set(boneName, new THREE.Euler(x, y, z, order || "XYZ"));
      }
      if (snap.size) {
        this.poses.set(poseName, snap);
        count++;
      }
    }
    return count;
  }
}

/** 记录当前姿态（即时指令） */
export class SavePose extends Command {
  constructor(poseStore, registry, name) {
    super("savePose");
    this.poseStore = poseStore;
    this.registry = registry;
    this.poseName = name;
  }

  execute() {
    const snap = this.poseStore.save(this.poseName, this.registry);
    console.log(`[AniAI] 已保存姿态「${this.poseName}」（${snap.size} 根骨骼）`);
    return null;
  }
}

/** 过渡到已保存姿态（动画指令） */
export class ApplyPose extends Command {
  constructor(poseStore, registry, name, opts = {}) {
    super("applyPose");
    this.animated = true;
    this.poseStore = poseStore;
    this.registry = registry;
    this.poseName = name;
    this.duration = opts.duration ?? 0.5;
    this.ease = opts.ease ?? "power2.inOut";
  }

  execute() {
    this.stop();
    const snap = this.poseStore.get(this.poseName);
    if (!snap) {
      console.warn(`[AniAI] 姿态「${this.poseName}」不存在，可先 ai.pose.save('${this.poseName}')`);
      return null;
    }
    const tl = gsap.timeline();
    let touched = false;
    for (const [boneName, rot] of snap) {
      const bone = this.registry.get(boneName);
      if (!bone) continue;
      tl.to(
        bone.rotation,
        { x: rot.x, y: rot.y, z: rot.z, duration: this.duration, ease: this.ease },
        0
      );
      touched = true;
    }
    if (!touched) return null;
    return this._track(tl);
  }
}
