/**
 * 骨骼注册表：骨骼访问的统一入口。
 * 基于 SkeletonParser 的解析结果，提供精确/模糊查找、树遍历、rest pose 复位。
 */
export class BoneRegistry {
  constructor(parseResult = {}) {
    this._bones = parseResult.bones || new Map();
    this._restPose = parseResult.restPose || new Map();
    this._tree = parseResult.tree || [];
    this._roots = parseResult.roots || [];
  }

  /** 骨骼总数 */
  get size() {
    return this._bones.size;
  }

  /** 是否含骨骼 */
  get hasSkeleton() {
    return this._bones.size > 0;
  }

  /** 精确查找（按加载后的骨骼名） */
  get(name) {
    return this._bones.get(name) || null;
  }

  /** 模糊查找：返回名字包含 fragment 的所有骨骼（子串匹配，大小写不敏感） */
  find(fragment) {
    const q = String(fragment).toLowerCase();
    const out = [];
    for (const [name, bone] of this._bones) {
      if (name.toLowerCase().includes(q)) out.push(bone);
    }
    return out;
  }

  /** 所有骨骼名 */
  names() {
    return Array.from(this._bones.keys());
  }

  /** 扁平骨骼列表 */
  list() {
    return Array.from(this._bones.values());
  }

  /** 层级树 */
  tree() {
    return this._tree;
  }

  /** 根骨骼列表 */
  roots() {
    return this._roots;
  }

  /** 取某骨骼的 rest pose；不传 name 则返回全部 */
  restPose(name) {
    return name ? this._restPose.get(name) || null : this._restPose;
  }

  /**
   * 复位骨骼到 rest pose。
   * @param {string} [name] 传入则只复位单根骨骼，否则复位全部
   */
  reset(name) {
    if (name) {
      const bone = this._bones.get(name);
      const rest = this._restPose.get(name);
      if (bone && rest) this._applyRest(bone, rest);
      return;
    }
    for (const [boneName, bone] of this._bones) {
      const rest = this._restPose.get(boneName);
      if (rest) this._applyRest(bone, rest);
    }
  }

  _applyRest(bone, rest) {
    bone.position.copy(rest.position);
    bone.rotation.copy(rest.rotation);
    bone.scale.copy(rest.scale);
  }
}
