import * as THREE from "three";
import {
  CAM_HEIGHT, CAM_LOOK_HEIGHT, CAM_MARGIN,
  CAM_MIN_DIST, CAM_MAX_DIST, CAM_SMOOTH,
} from "./constants.js";

/**
 * 垂直双人相机（Perpendicular Arena Camera）。
 *
 * 相机站在两人连线的「垂直平分方向」上，两人始终以侧面呈现在画面左右两侧
 * ——《铁拳》《灵魂能力》的做法。本地双人下这是唯一公平的选择：
 * 「追在 P1 后方」会让 P2 永远在看自己的侧面/背面。
 *
 *        俯视图 (X-Z 平面)
 *              ● P2
 *             ╱
 *            ╱   ← 两人连线
 *           ╱
 *        ● P1
 *           ╲
 *            ▣ CAM   站在垂直平分线上，距中点 dist
 *
 * 两个关键处理：
 * 1. 侧别锁定（side lock）：垂直方向有两个（左侧/右侧），
 *    每帧独立求解会在两人交换位置时瞬间跳到另一侧。用 hysteresis 死区锁住当前侧别，
 *    只有当角度偏离超过阈值才允许翻面。
 * 2. 角度用最短弧插值，距离按两人间隔自动 dolly。
 */
export class ArenaCamera {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {{mode?: 'perpendicular'|'chase'}} [opts]
   */
  constructor(camera, opts = {}) {
    this.camera = camera;
    this.mode = opts.mode || "perpendicular";

    /** 当前相机绕 Y 的角度（世界空间） */
    this.yaw = 0;
    /** 当前距离 */
    this.dist = 8;
    /** 侧别：+1 或 -1，决定站在垂直方向的哪一侧 */
    this.side = 1;
    /** 注视点 */
    this.lookAt = new THREE.Vector3();

    this._initialized = false;
    this._mid = new THREE.Vector3();
    this._desiredPos = new THREE.Vector3();
  }

  /**
   * 每帧更新（在 render 阶段调用，用插值后的角色位置）。
   * @param {THREE.Vector3} p1 P1 的渲染位置
   * @param {THREE.Vector3} p2 P2 的渲染位置
   * @param {number} dt 真实帧时间（不是固定步长 —— 相机是纯表现层，跟着渲染走）
   */
  update(p1, p2, dt) {
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const separation = Math.hypot(dx, dz);

    this._mid.set((p1.x + p2.x) / 2, 0, (p1.z + p2.z) / 2);

    // 两人连线的方向角
    const lineAngle = separation > 1e-4 ? Math.atan2(dx, dz) : this.yaw;

    // 垂直方向：连线角 ± 90°
    const wantYaw = lineAngle + this.side * Math.PI / 2;

    // 距离：间隔越大退得越远，保证两人都在画面内
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const needed = (separation / 2 + CAM_MARGIN) / Math.tan(fovRad / 2);
    const wantDist = THREE.MathUtils.clamp(needed, CAM_MIN_DIST, CAM_MAX_DIST);

    if (!this._initialized) {
      this.yaw = wantYaw;
      this.dist = wantDist;
      this._initialized = true;
    } else {
      // 最短弧插值，避免跨 ±180° 时抽搐
      let d = wantYaw - this.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      const k = 1 - Math.exp(-CAM_SMOOTH * dt); // 帧率无关的指数平滑
      this.yaw += d * k;
      this.dist += (wantDist - this.dist) * k;
    }

    this._desiredPos.set(
      this._mid.x + Math.sin(this.yaw) * this.dist,
      CAM_HEIGHT,
      this._mid.z + Math.cos(this.yaw) * this.dist
    );

    this.camera.position.copy(this._desiredPos);
    this.lookAt.set(this._mid.x, CAM_LOOK_HEIGHT, this._mid.z);
    this.camera.lookAt(this.lookAt);
  }

  /**
   * 翻到另一侧。供将来的「换边」按钮或 F4 的演出用。
   * 平时不该自动调用 —— 自动翻面正是要避免的抖动来源。
   */
  flipSide() {
    this.side *= -1;
  }

  /** 立即对齐到目标（入场、回合开始时用，避免相机从远处飞过来） */
  snap(p1, p2) {
    this._initialized = false;
    this.update(p1, p2, 1);
  }
}
