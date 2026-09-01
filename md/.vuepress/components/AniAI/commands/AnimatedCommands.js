import gsap from "gsap";
import { Command } from "./Command.js";

const AXES = ["x", "y", "z"];

/** 从 opts 解析摆动轴：优先 axis，否则取 x/y/z 里第一个出现的键（支持 sway({y:0.4}) 简写） */
function resolveAxis(opts, fallback = "y") {
  if (opts.axis) return opts.axis;
  for (const a of AXES) if (opts[a] !== undefined) return a;
  return fallback;
}

/**
 * 动画指令（gsap 驱动）。
 * 所有旋转 offset 均相对 rest pose 叠加（弧度），禁止 set(0,0,0)。
 */

/** 过渡旋转：rotate({ z: 0.3, duration: 0.2, ease: 'power2.out' }) */
export class RotateTo extends Command {
  constructor(bone, rest, offset = {}, opts = {}) {
    super("rotate");
    this.animated = true;
    this.bone = bone;
    this.rest = rest;
    this.offset = offset;
    this.duration = opts.duration ?? 0.3;
    this.ease = opts.ease ?? "power2.out";
  }
  execute() {
    this.stop();
    const target = {};
    for (const axis of AXES) {
      if (this.offset[axis] !== undefined) {
        target[axis] = this.rest.rotation[axis] + this.offset[axis];
      }
    }
    if (Object.keys(target).length === 0) return null;
    return this._track(
      gsap.to(this.bone.rotation, {
        ...target,
        duration: this.duration,
        ease: this.ease,
      })
    );
  }
}

/** 循环摆动：sway({ axis:'y', angle:0.4, speed:3, loops:-1 })，loops=-1 无限（配合 hold 模式用） */
export class Sway extends Command {
  constructor(bone, rest, opts = {}) {
    super("sway");
    this.animated = true;
    this.bone = bone;
    this.rest = rest;
    this.axis = resolveAxis(opts, "y");
    this.angle = opts.angle ?? (opts[this.axis] ?? 0.3);
    this.speed = opts.speed ?? 2; // 每秒摆动次数
    this.loops = opts.loops ?? -1; // -1 无限
  }
  execute() {
    this.stop();
    const base = this.rest.rotation[this.axis];
    if (base === undefined) return null;
    const dur = this.speed > 0 ? 1 / this.speed : 0.5;
    return this._track(
      gsap.fromTo(
        this.bone.rotation,
        { [this.axis]: base - this.angle },
        {
          [this.axis]: base + this.angle,
          duration: dur,
          ease: "sine.inOut",
          yoyo: true,
          repeat: this.loops,
        }
      )
    );
  }
}

/** 整体弹跳：bounce({ factor: 1.05, duration: 0.15 })，围绕模型 rest 缩放 */
export class Bounce extends Command {
  constructor(model, modelRest, opts = {}) {
    super("bounce");
    this.animated = true;
    this.model = model;
    this.modelRest = modelRest;
    this.factor = opts.factor ?? 1.05;
    this.duration = opts.duration ?? 0.15;
  }
  execute() {
    this.stop();
    const s = this.modelRest.scale;
    return this._track(
      gsap.to(this.model.scale, {
        x: s.x * this.factor,
        y: s.y * this.factor,
        z: s.z * this.factor,
        duration: this.duration,
        yoyo: true,
        repeat: 1,
        ease: "power1.out",
      })
    );
  }
}
