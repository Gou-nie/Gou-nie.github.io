import * as THREE from "three";
import { ARENA_RADIUS } from "./constants.js";

/**
 * 场地：圆形地面 + 边界光圈 + 网格。程序化生成，不依赖美术资产。
 */
export class ArenaScene {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "ff-arena";
    this._disposables = [];

    const accent = new THREE.Color(opts.accent || 0x4a9eff);

    // 地面圆盘
    const floorGeo = new THREE.CircleGeometry(ARENA_RADIUS, 64);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1b2138,
      roughness: 0.92,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    this.group.add(floor);
    this._disposables.push(floorGeo, floorMat);

    // 边界光圈
    const ringGeo = new THREE.RingGeometry(ARENA_RADIUS - 0.12, ARENA_RADIUS, 96);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.01;
    this.group.add(ring);
    this._disposables.push(ringGeo, ringMat);

    // 网格：给 3D 走位一个空间参照，否则很难判断自己走了多远
    const grid = new THREE.PolarGridHelper(ARENA_RADIUS, 8, 6, 64, 0x2a3550, 0x222a44);
    grid.position.y = 0.005;
    grid.material.transparent = true;
    grid.material.opacity = 0.55;
    this.group.add(grid);
    this._gridHelper = grid;

    scene.add(this.group);
  }

  dispose() {
    for (const d of this._disposables) d.dispose?.();
    this._gridHelper?.geometry?.dispose?.();
    this._gridHelper?.material?.dispose?.();
    this.scene.remove(this.group);
  }
}

/** 标准三点布光 + 环境光。返回创建的灯，供调用方释放。 */
export function setupLights(scene, opts = {}) {
  const lights = [];

  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);
  lights.push(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(4, 8, 5);
  scene.add(key);
  lights.push(key);

  const fill = new THREE.DirectionalLight(0x88aaff, 0.7);
  fill.position.set(-5, 4, -4);
  scene.add(fill);
  lights.push(fill);

  const rim = new THREE.DirectionalLight(opts.accent || 0x4a9eff, 0.6);
  rim.position.set(0, 3, -8);
  scene.add(rim);
  lights.push(rim);

  return lights;
}
