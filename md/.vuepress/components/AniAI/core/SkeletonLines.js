import * as THREE from "three";

/**
 * 骨骼线可视化：把每根骨骼画成一条线段（父关节 → 本关节），
 * 默认蓝绿色；选中某骨骼时把对应线段标红，方便对照名字定位关节。
 *
 * 相比 THREE.SkeletonHelper（单一材质、无法给单根骨骼改色），
 * 这里每根骨骼一条独立 Line + 独立材质，可单独上色。
 * 线条 depthTest: false 穿透模型始终可见，选中线再加大不透明度突出。
 *
 * 用法：
 *   const sl = new SkeletonLines(scene);
 *   sl.build(registry);        // 构建全部骨骼线段
 *   sl.setVisible(true);       // 显示/隐藏
 *   sl.highlight('EarL_Armature'); // 标红该骨骼
 *   // 每帧 sl.update() 跟随骨骼动画
 */
export class SkeletonLines {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.color = opts.color ?? 0x00e0ff; // 默认蓝绿色
    this.highlightColor = opts.highlightColor ?? 0xff2a2a; // 选中红
    this.highlighted = null;

    this.entries = new Map(); // boneName -> { bone, line }
    this.group = new THREE.Group();
    this.group.visible = false;
    scene.add(this.group);

    this._p = new THREE.Vector3();
    this._pp = new THREE.Vector3();
  }

  get visible() {
    return this.group.visible;
  }

  /** 依据注册表构建骨骼线段（父 Bone → 本 Bone） */
  build(registry) {
    this._clearLines();
    if (!registry) return;
    for (const name of registry.names()) {
      const bone = registry.get(name);
      if (!bone) continue;
      const parent = bone.parent;
      if (!parent || !parent.isBone) continue; // 根骨骼无父线段
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]);
      const line = new THREE.Line(geo, this._makeMaterial(false));
      line.frustumCulled = false;
      line.renderOrder = 900;
      line.userData.boneName = name;
      this.group.add(line);
      this.entries.set(name, { bone, line });
    }
  }

  _makeMaterial(highlighted) {
    return new THREE.LineBasicMaterial({
      color: highlighted ? this.highlightColor : this.color,
      transparent: true,
      opacity: highlighted ? 1.0 : 0.6,
      depthTest: false,
      depthWrite: false,
    });
  }

  setVisible(v) {
    this.group.visible = v;
  }

  /** 高亮某骨骼：其线段变红，其余保持蓝绿 */
  highlight(name) {
    this.highlighted = name;
    for (const [n, { line }] of this.entries) {
      const isSel = n === name;
      line.material.color.set(isSel ? this.highlightColor : this.color);
      line.material.opacity = isSel ? 1.0 : 0.6;
    }
  }

  clearHighlight() {
    this.highlighted = null;
    for (const { line } of this.entries.values()) {
      line.material.color.set(this.color);
      line.material.opacity = 0.6;
    }
  }

  /** 每帧调用：跟随骨骼世界位置 */
  update() {
    for (const { bone, line } of this.entries.values()) {
      bone.getWorldPosition(this._p);
      bone.parent.getWorldPosition(this._pp);
      const pos = line.geometry.attributes.position;
      pos.setXYZ(0, this._pp.x, this._pp.y, this._pp.z);
      pos.setXYZ(1, this._p.x, this._p.y, this._p.z);
      pos.needsUpdate = true;
    }
  }

  _clearLines() {
    for (const { line } of this.entries.values()) {
      this.group.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    }
    this.entries.clear();
    this.highlighted = null;
  }

  dispose() {
    this._clearLines();
    this.scene.remove(this.group);
  }
}
