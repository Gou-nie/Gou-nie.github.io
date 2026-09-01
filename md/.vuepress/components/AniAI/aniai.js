import * as THREE from "three";
import { ModelLoader } from "./core/ModelLoader.js";
import { SkeletonParser } from "./core/SkeletonParser.js";
import { BoneRegistry } from "./core/BoneRegistry.js";
import { InputManager } from "./input/InputManager.js";
import {
  SetBoneRotation,
  SetBonePosition,
  ResetBone,
  ResetAll,
} from "./commands/BoneCommands.js";
import { RotateTo, Sway, Bounce } from "./commands/AnimatedCommands.js";
import { PoseStore, SavePose, ApplyPose } from "./commands/PoseCommands.js";
import { Sequence, Parallel, Loop } from "./commands/CompositeCommands.js";

/**
 * AniAI 门面：加载模型 → 识别骨骼 → 封装指令 → 键位绑定。
 *
 * 用法：
 *   const ai = new AniAI();
 *   await ai.loadModel('/models/mimikyu.glb');
 *   ai.showSkeleton();
 *
 *   // 便捷执行（立即）
 *   ai.bone('EarL_Armature').rotate({ z: 0.3, duration: 0.2 });
 *   ai.bone('Tail_Armature').sway({ axis: 'y', angle: 0.4, speed: 3 });
 *
 *   // 指令工厂（返回未执行的 Command）
 *   const cmd = ai.cmd.sway('Tail_Armature', { axis: 'y', angle: 0.4 });
 *   cmd.execute(); cmd.stop();
 *
 *   // 键位绑定
 *   ai.bindKey('a', ai.cmd.rotate('EarL_Armature', { z: 0.3 }), 'press');
 *   ai.bindKey('d', ai.cmd.sway('Tail_Armature', { y: 0.5 }), 'hold');
 */
export class AniAI {
  constructor(options = {}) {
    this.loader = options.loader || new ModelLoader();
    this.input = new InputManager(options.target);

    this.gltf = null; // 原始 gltf
    this.model = null; // gltf.scene（模型根节点）
    this.modelRest = null; // 模型根节点 rest 变换（供 bounce 等整体动画）
    this.skeletons = []; // gltf.skins
    this.animations = []; // gltf.animations

    this.parseResult = null; // SkeletonParser 输出
    this.registry = null; // BoneRegistry
    this.poseStore = new PoseStore(); // 姿态存储（savePose/applyPose 共用）

    // 指令工厂：返回「未执行」的 Command，供直接执行或 bindKey 绑定
    this.cmd = {
      setRotation: (name, offset) => this._makeBoneCmd(SetBoneRotation, name, offset),
      setPosition: (name, offset) => this._makeBoneCmd(SetBonePosition, name, offset),
      reset: (name) => this._makeBoneCmd(ResetBone, name),
      resetAll: () => (this.registry ? new ResetAll(this.registry) : null),
      rotate: (name, offset, opts) => this._makeBoneCmd(RotateTo, name, offset, opts),
      sway: (name, opts) => this._makeBoneCmd(Sway, name, opts),
      bounce: (opts) =>
        this.model && this.modelRest
          ? new Bounce(this.model, this.modelRest, opts)
          : null,
      savePose: (name) =>
        this.registry ? new SavePose(this.poseStore, this.registry, name) : null,
      applyPose: (name, opts) =>
        this.registry ? new ApplyPose(this.poseStore, this.registry, name, opts) : null,
      sequence: (...cmds) => new Sequence(cmds.flat().filter(Boolean)),
      parallel: (...cmds) => new Parallel(cmds.flat().filter(Boolean)),
      loop: (cmd, opts) => (cmd ? new Loop(cmd, opts) : null),
    };

    // 姿态便捷 API：ai.pose.save('idle') / ai.pose.apply('idle', { duration: 0.4 })
    this.pose = {
      save: (name) => this.cmd.savePose(name)?.execute(),
      apply: (name, opts) => this.cmd.applyPose(name, opts)?.execute(),
      names: () => this.poseStore.names(),
      has: (name) => this.poseStore.has(name),
      delete: (name) => this.poseStore.delete(name),
      serialize: () => this.poseStore.serialize(),
      hydrate: (data) => this.poseStore.hydrate(data),
    };
  }

  /**
   * 加载模型并识别骨骼
   * @param {string} url
   * @param {(event: ProgressEvent) => void} [onProgress]
   * @returns {Promise<BoneRegistry>}
   */
  async loadModel(url, onProgress) {
    const result = await this.loader.load(url, onProgress);
    this.gltf = result.gltf;
    this.model = result.scene;
    this.skeletons = result.skeletons;
    this.animations = result.animations;
    this.modelRest = {
      position: this.model.position.clone(),
      rotation: this.model.rotation.clone(),
      scale: this.model.scale.clone(),
    };

    this.parseResult = new SkeletonParser().parse(this.model);
    this.registry = new BoneRegistry(this.parseResult);

    if (!this.registry.hasSkeleton) {
      console.warn(`[AniAI] 模型「${url}」未检测到骨骼（无 SkinnedMesh / skeleton）。`);
    }
    return this.registry;
  }

  /**
   * 获取某骨骼的操作句柄（立即执行的便捷 API）：
   *   ai.bone('EarL_Armature').rotate({ z: 0.3, duration: 0.2 });
   *   ai.bone('Tail_Armature').sway({ axis: 'y', angle: 0.4, speed: 3 });
   *   ai.bone('Tail_Armature').reset();
   */
  bone(name) {
    if (!this.registry || !this.registry.get(name)) {
      console.warn(`[AniAI] 未找到骨骼「${name}」`);
      return null;
    }
    return {
      name,
      bone: this.registry.get(name),
      setRotation: (offset) => this.cmd.setRotation(name, offset)?.execute(),
      setPosition: (offset) => this.cmd.setPosition(name, offset)?.execute(),
      reset: () => this.cmd.reset(name)?.execute(),
      rotate: (offset, opts) => this.cmd.rotate(name, offset, opts)?.execute(),
      sway: (opts) => this.cmd.sway(name, opts)?.execute(),
    };
  }

  /**
   * 绑定指令到按键
   * @param {string} key 按键（event.key，如 'a' / ' ' / 'ArrowUp'）
   * @param {import('./commands/Command.js').Command} command
   * @param {'press'|'hold'|'toggle'} mode
   */
  bindKey(key, command, mode = "press") {
    return this.input.bind(key, command, mode);
  }

  /** 解绑按键 */
  unbindKey(key) {
    this.input.unbind(key);
  }

  /** 当前所有键位绑定（供 GUI 展示） */
  getBindings() {
    return this.input.getBindings();
  }

  /** 复位所有骨骼到 rest pose */
  reset() {
    this.registry?.reset();
  }

  /** 释放资源：解绑所有键位、停掉指令、移除键盘监听 */
  dispose() {
    this.input?.dispose();
    this.input = null;
  }

  /** 内部：构造骨骼指令，找不到骨骼时告警并返回 null */
  _makeBoneCmd(Cls, name, ...args) {
    if (!this.registry) {
      console.warn("[AniAI] 尚未加载模型");
      return null;
    }
    const bone = this.registry.get(name);
    if (!bone) {
      console.warn(`[AniAI] 未找到骨骼「${name}」`);
      return null;
    }
    const rest = this.registry.restPose(name);
    return new Cls(bone, rest, ...args);
  }

  /** 打印骨骼树与 rest pose（以度显示）到控制台 */
  showSkeleton() {
    if (!this.registry) {
      console.warn("[AniAI] 尚未加载模型，请先 await loadModel(url)。");
      return;
    }
    console.log(this.describeSkeleton());
  }

  /** 生成骨骼树文本描述 */
  describeSkeleton() {
    if (!this.registry) return "[AniAI] 尚未加载模型";
    const deg = THREE.MathUtils.radToDeg;
    const fmt = (v) => v.toFixed(1) + "°";

    const lines = [];
    const render = (node, prefix, isRoot, isLast) => {
      const rest = this.registry.restPose(node.name);
      const r = rest ? rest.rotation : null;
      const connector = isRoot ? "" : isLast ? "└─ " : "├─ ";
      const rot = r ? `  rot(${fmt(deg(r.x))}, ${fmt(deg(r.y))}, ${fmt(deg(r.z))})` : "";
      lines.push(`${prefix}${connector}${node.name}${rot}`);

      const childPrefix = prefix + (isRoot ? "" : isLast ? "   " : "│  ");
      node.children.forEach((child, i) => {
        render(child, childPrefix, false, i === node.children.length - 1);
      });
    };

    const header = `[AniAI] 骨骼树（共 ${this.registry.size} 根骨骼）`;
    this.registry.tree().forEach((root, i) => {
      render(root, "", true, i === this.registry.tree().length - 1);
    });
    return [header, ...lines].join("\n");
  }
}
