/**
 * 骨骼识别：从已加载的场景中提取骨骼清单、rest pose 与层级树。
 *
 * 关键点（ShelfShow 里踩过的坑）：
 * 1. 用 scene.traverse 找 isSkinnedMesh，取其 .skeleton.bones（THREE.Bone[]）。
 * 2. 骨骼名必须用「加载后」的名字 —— GLTFLoader 的 sanitizeNodeName 会删掉
 *    `.` `[` `]` `:` `/`（例如 Ear.L → EarL），这里直接用 bone.name。
 * 3. rest pose 记录初始 position/rotation/scale，操纵时永远基于它叠加，
 *    禁止直接 set(0,0,0)（否则耳朵/尾巴会被掰直）。
 */
export class SkeletonParser {
  /**
   * @param {import('three').Object3D} scene 模型根节点
   * @returns {{
   *   hasSkeleton: boolean,
   *   bones: Map<string, import('three').Bone>,
   *   restPose: Map<string, {position: import('three').Vector3, rotation: import('three').Euler, scale: import('three').Vector3}>,
   *   tree: Array<object>,
   *   roots: import('three').Bone[],
   *   skinnedMeshes: import('three').SkinnedMesh[],
   * }}
   */
  parse(scene) {
    const skinnedMeshes = [];
    scene.traverse((obj) => {
      if (obj.isSkinnedMesh) skinnedMeshes.push(obj);
    });

    // 收集所有骨骼（去重：多个 SkinnedMesh 可能共享同一 skeleton）
    const boneSet = new Set();
    for (const mesh of skinnedMeshes) {
      const skeleton = mesh.skeleton;
      if (skeleton && Array.isArray(skeleton.bones)) {
        for (const bone of skeleton.bones) {
          if (bone && bone.isBone) boneSet.add(bone);
        }
      }
    }

    const bones = new Map();
    const restPose = new Map();
    for (const bone of boneSet) {
      bones.set(bone.name, bone);
      restPose.set(bone.name, {
        position: bone.position.clone(),
        rotation: bone.rotation.clone(),
        scale: bone.scale.clone(),
      });
    }

    // 找根骨骼：父节点不在骨骼集合里，即为层级树的根
    const roots = [];
    for (const bone of boneSet) {
      if (!boneSet.has(bone.parent)) roots.push(bone);
    }

    const tree = roots.map((root) => this._buildTreeNode(root, boneSet));

    return {
      hasSkeleton: boneSet.size > 0,
      bones,
      restPose,
      tree,
      roots,
      skinnedMeshes,
    };
  }

  /** 递归构建层级树节点 */
  _buildTreeNode(bone, boneSet) {
    const node = { name: bone.name, bone, children: [] };
    for (const child of bone.children) {
      if (boneSet.has(child)) {
        node.children.push(this._buildTreeNode(child, boneSet));
      }
    }
    return node;
  }
}
