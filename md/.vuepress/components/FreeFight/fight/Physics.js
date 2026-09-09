import * as THREE from "three";
import {
  GRAVITY, ARENA_RADIUS, PUSH_SKIN,
  KNOCKBACK_FRICTION, KNOCKBACK_EPSILON,
  TURN_SPEED, MIN_SEPARATION,
} from "./constants.js";

/**
 * 运动学。只做四件事，不值得引入物理引擎（项目里的 matter-js 是 2D 的）：
 * 1. 重力与地面
 * 2. 两人推挤（X-Z 圆盘）
 * 3. 击退冲量与摩擦衰减
 * 4. 圆形场地边界（贴墙不反弹）
 *
 * 刻意不做：斜面、台阶、可破坏物、真实碰撞体。
 */

const _tmp = new THREE.Vector3();
const _dir = new THREE.Vector3();

/**
 * 对单个角色积分一步。
 * @param {import('../core/FighterFactory.js').Fighter} f
 * @param {number} dt
 */
export function integrate(f, dt) {
  // 上一帧位置留给渲染插值
  f.prevPosition.copy(f.position);
  f.prevFacing = f.facing;

  const caps = f.state.caps;

  // ---- 重力 ----
  if (caps.gravity || f.position.y > 0) {
    f.velocity.y -= GRAVITY * dt;
  }

  // ---- 位移积分 ----
  f.position.x += f.velocity.x * dt;
  f.position.y += f.velocity.y * dt;
  f.position.z += f.velocity.z * dt;

  // ---- 地面约束 ----
  if (f.position.y <= 0) {
    f.position.y = 0;
    if (f.velocity.y < 0) f.velocity.y = 0;
    f.grounded = true;
  } else {
    f.grounded = false;
  }

  // ---- 水平击退衰减 ----
  // 主动移动产生的速度每帧由控制器重设，这里衰减的是残留的击退冲量
  f.velocity.x *= KNOCKBACK_FRICTION;
  f.velocity.z *= KNOCKBACK_FRICTION;
  if (Math.abs(f.velocity.x) < KNOCKBACK_EPSILON) f.velocity.x = 0;
  if (Math.abs(f.velocity.z) < KNOCKBACK_EPSILON) f.velocity.z = 0;
}

/**
 * 把角色约束在圆形场地内。贴墙不反弹 —— 被压在墙角是重要战术资源，
 * 且比反弹更符合直觉。
 * @returns {boolean} 是否撞到了边界（供 F4 触发 wall-stun）
 */
export function clampToArena(f) {
  const r = f.metrics().radius;
  const limit = ARENA_RADIUS - r;
  const distSq = f.position.x * f.position.x + f.position.z * f.position.z;
  if (distSq <= limit * limit) return false;

  const dist = Math.sqrt(distSq) || 1;
  const k = limit / dist;
  f.position.x *= k;
  f.position.z *= k;
  // 撞墙时消掉朝墙的速度分量，避免沿墙滑行时速度累积
  const nx = f.position.x / limit;
  const nz = f.position.z / limit;
  const vn = f.velocity.x * nx + f.velocity.z * nz;
  if (vn > 0) {
    f.velocity.x -= vn * nx;
    f.velocity.z -= vn * nz;
  }
  return true;
}

/**
 * 两人推挤：X-Z 圆盘重叠时沿连线各推开半个重叠量。
 * knockdown 状态不参与推挤（可以被踩过）。
 */
export function resolveOverlap(a, b) {
  if (a.state.is("knockdown") || b.state.is("knockdown")) return;

  const dx = b.position.x - a.position.x;
  const dz = b.position.z - a.position.z;
  const distSq = dx * dx + dz * dz;
  const minDist = a.metrics().radius + b.metrics().radius + PUSH_SKIN;

  if (distSq >= minDist * minDist) return;

  let dist = Math.sqrt(distSq);
  let nx, nz;
  if (dist < 1e-5) {
    // 完全重合：随机推开一个方向，避免除零卡死
    nx = 1;
    nz = 0;
    dist = 0;
  } else {
    nx = dx / dist;
    nz = dz / dist;
  }
  const push = (minDist - dist) / 2;
  a.position.x -= nx * push;
  a.position.z -= nz * push;
  b.position.x += nx * push;
  b.position.z += nz * push;
}

/**
 * 施加击退冲量（沿「攻方 → 守方」水平方向 + 垂直分量）。
 * @param {object} defender
 * @param {object} attacker
 * @param {{x: number, y: number}} kb
 */
export function applyKnockback(defender, attacker, kb) {
  _dir.set(
    defender.position.x - attacker.position.x,
    0,
    defender.position.z - attacker.position.z
  );
  if (_dir.lengthSq() < 1e-8) {
    // 完全重合时沿守方背面推
    _dir.set(Math.sin(defender.facing), 0, Math.cos(defender.facing)).negate();
  }
  _dir.normalize();
  defender.velocity.x += _dir.x * kb.x * 60; // kb 以「每帧位移」给出，转成每秒
  defender.velocity.z += _dir.z * kb.x * 60;
  if (kb.y) defender.velocity.y += kb.y * 60;
}

/**
 * 朝向锁定：把角色朝向朝「面对对手」的目标角平滑推进。
 * 不瞬移 —— 绕后时模型瞬间翻面观感极差。走最短弧。
 */
export function updateFacing(f, target, dt) {
  if (!f.state.caps.turn) return;

  const dx = target.position.x - f.position.x;
  const dz = target.position.z - f.position.z;
  // 两人几乎重合时保持上一帧朝向，避免抖动
  if (dx * dx + dz * dz < MIN_SEPARATION * MIN_SEPARATION) return;

  const want = Math.atan2(dx, dz);
  let diff = want - f.facing;
  // 最短弧
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  const maxStep = TURN_SPEED * dt;
  if (Math.abs(diff) <= maxStep) {
    f.facing = want;
  } else {
    f.facing += Math.sign(diff) * maxStep;
  }
  // 归一化到 (-π, π]，避免长时间绕圈后数值无限增长
  if (f.facing > Math.PI) f.facing -= Math.PI * 2;
  if (f.facing < -Math.PI) f.facing += Math.PI * 2;
}

/** 两人水平距离 */
export function horizontalDistance(a, b) {
  const dx = b.position.x - a.position.x;
  const dz = b.position.z - a.position.z;
  return Math.sqrt(dx * dx + dz * dz);
}
