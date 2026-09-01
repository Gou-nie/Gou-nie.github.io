import { Command } from "./Command.js";

const AXES = ["x", "y", "z"];

/**
 * 即时指令：直接设置骨骼 transform，不经过动画过渡。
 * offset 为「相对 rest pose 的偏移」；只改传入的轴，未传的轴保持原值。
 */

/** 立即设置骨骼旋转（offset 单位：弧度） */
export class SetBoneRotation extends Command {
  constructor(bone, rest, offset = {}) {
    super("setRotation");
    this.bone = bone;
    this.rest = rest;
    this.offset = offset;
  }
  execute() {
    this.stop();
    for (const axis of AXES) {
      if (this.offset[axis] !== undefined) {
        this.bone.rotation[axis] = this.rest.rotation[axis] + this.offset[axis];
      }
    }
  }
}

/** 立即设置骨骼位置（offset 单位：世界/局部一致，取决于骨骼结构） */
export class SetBonePosition extends Command {
  constructor(bone, rest, offset = {}) {
    super("setPosition");
    this.bone = bone;
    this.rest = rest;
    this.offset = offset;
  }
  execute() {
    this.stop();
    for (const axis of AXES) {
      if (this.offset[axis] !== undefined) {
        this.bone.position[axis] = this.rest.position[axis] + this.offset[axis];
      }
    }
  }
}

/** 复位单根骨骼到 rest pose */
export class ResetBone extends Command {
  constructor(bone, rest) {
    super("resetBone");
    this.bone = bone;
    this.rest = rest;
  }
  execute() {
    this.stop();
    this.bone.position.copy(this.rest.position);
    this.bone.rotation.copy(this.rest.rotation);
    this.bone.scale.copy(this.rest.scale);
  }
}

/** 复位所有骨骼到 rest pose（需要 BoneRegistry） */
export class ResetAll extends Command {
  constructor(registry) {
    super("resetAll");
    this.registry = registry;
  }
  execute() {
    this.stop();
    this.registry?.reset();
  }
}
