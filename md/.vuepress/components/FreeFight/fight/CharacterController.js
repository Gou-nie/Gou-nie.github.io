import * as THREE from "three";
import {
  WALK_SPEED, BACK_SPEED, SIDE_SPEED, AIR_CONTROL_SPEED,
  JUMP_VELOCITY, DASH_SPEED, DASH_FRAMES, DASH_COOLDOWN_FRAMES,
} from "./constants.js";
import { MoveRunner, moveTotalFrames } from "./MoveRunner.js";

/**
 * 角色控制器：把「角色相对」的输入语义翻译成世界速度。
 *
 * 锁定制下 forward 永远是「朝对手」，而不是「朝 +Z」——
 * 这样任意相机角度下操作都一致，是锁定格斗的标准做法。
 *
 * 走位速度直接写进 velocity 的水平分量（每帧重设），
 * 击退冲量则是累加并逐帧衰减的（见 Physics.integrate）。
 * 两者共用 velocity.x/z，所以这里必须「先清零主动分量、再加回击退残留」。
 */

const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();

export class CharacterController {
  constructor(fighter) {
    this.f = fighter;
    /** 冲刺剩余帧数 */
    this.dashFrames = 0;
    /** 冲刺冷却 */
    this.dashCooldown = 0;
    /** 冲刺方向（世界空间，归一化） */
    this.dashDir = new THREE.Vector3();
  }

  /**
   * 一步逻辑更新。
   * @param {object} input FightInput.snapshot() 的结果
   * @param {object} opponent 对手（用于计算 forward 方向）
   * @param {number} dt
   */
  update(input, opponent, dt) {
    const f = this.f;
    const st = f.state;

    if (this.dashCooldown > 0) this.dashCooldown--;

    // 松开防御立即回 idle —— 必须在出招分支之前：输入不缓冲，
    // 若松开与轻击同 tick，错过了这一下玩家就要多按一次，手感很糟。
    if (st.is("block") && !input.block) st.to("idle", { force: true });

    // caps 在松防之后取：同 tick 松防+出招看到的是 idle 的能力位
    const caps = st.caps;

    // ---- 出招（优先级最高：可从走位/冲刺中取消进入；防御态按状态表不能起招）----
    // caps.attack 是唯一裁决点：attack/hitstun/block 等状态到不了这里，
    // 进入 attack 后 caps 变化，后续连按自然被挡在门外（DESIGN §9.3）。
    // 轻/重/必杀同 tick 齐按只认第一个；无招可出时（如空中按轻击）
    // 不 return，继续走下面的移动逻辑。
    if (caps.attack && f.moveSet) {
      const tap = input.lightTap ? "light" : input.heavyTap ? "heavy" : input.specialTap ? "special" : null;
      if (tap) {
        const move = f.moveSet.pick(tap, {
          grounded: f.grounded,
          forwardHeld: input.forward,
          backHeld: input.back,
        });
        if (move) {
          this._startMove(move);
          return;
        }
      }
    }

    // ---- 朝向基准：forward = 朝对手的水平方向 ----
    _fwd.set(
      opponent.position.x - f.position.x,
      0,
      opponent.position.z - f.position.z
    );
    if (_fwd.lengthSq() < 1e-8) {
      // 重合时退回自身朝向
      _fwd.set(Math.sin(f.facing), 0, Math.cos(f.facing));
    }
    _fwd.normalize();
    // 右手方向 = forward 绕 Y 轴 -90°（three.js 右手系，Y 向上）
    _right.set(_fwd.z, 0, -_fwd.x);

    // ---- 冲刺进行中 ----
    if (this.dashFrames > 0) {
      this.dashFrames--;
      f.velocity.x = this.dashDir.x * DASH_SPEED;
      f.velocity.z = this.dashDir.z * DASH_SPEED;
      if (this.dashFrames === 0) {
        this.dashCooldown = DASH_COOLDOWN_FRAMES;
        // 冲刺结束回到地面态，让后续输入能立刻接管
        if (st.is("dash")) st.to("idle", { force: true });
      }
      return;
    }

    // ---- 冲刺起动 ----
    if (input.dash && caps.dash && this.dashCooldown === 0) {
      const d = input.dash;
      this.dashDir.set(0, 0, 0);
      if (d === "forward") this.dashDir.copy(_fwd);
      else if (d === "back") this.dashDir.copy(_fwd).negate();
      else if (d === "right") this.dashDir.copy(_right);
      else if (d === "left") this.dashDir.copy(_right).negate();

      if (this.dashDir.lengthSq() > 0) {
        this.dashDir.normalize();
        this.dashFrames = DASH_FRAMES;
        st.to("dash", { lock: DASH_FRAMES });
        f.velocity.x = this.dashDir.x * DASH_SPEED;
        f.velocity.z = this.dashDir.z * DASH_SPEED;
        return;
      }
    }

    // ---- 跳跃 ----
    if (input.jumpTap && caps.jump && f.grounded) {
      f.velocity.y = JUMP_VELOCITY;
      st.to("jump");
      // 起跳瞬间保留当前水平速度（跳跃冲刺）
      return;
    }

    // ---- 空中：落地检测 ----
    if (st.is("jump", "air")) {
      if (f.grounded && f.velocity.y <= 0) {
        st.to("idle", { force: true });
      } else if (st.is("jump") && f.velocity.y < 0) {
        st.to("air", { force: true });
      }
    }

    // ---- 防御 ----
    if (input.block && caps.block && f.grounded) {
      if (!st.is("block")) st.to("block");
    } else if (st.is("block") && !input.block) {
      st.to("idle", { force: true });
    }

    // ---- 走位 ----
    // 重新读取能力位：上面的 block/jump 切换可能已经改变状态，
    // 用函数顶部捕获的 caps 会拿到过期的 moveMult（例如防御中仍按常规速度移动）
    const moveCaps = st.caps;
    if (!moveCaps.move) {
      // 不接受移动的状态（attack/hitstun…）：清掉主动速度，只留击退残留
      return;
    }

    // 反向键抵消：同时按前后（或左右）视为中立，与主流格斗游戏一致。
    // 不抵消的话前后同按会得到 WALK_SPEED - BACK_SPEED 的净前进速度，很反直觉。
    const wantFwd = input.forward && !input.back;
    const wantBack = input.back && !input.forward;
    const wantRight = input.right && !input.left;
    const wantLeft = input.left && !input.right;

    let vx = 0;
    let vz = 0;
    const airborne = !f.grounded || st.is("jump", "air");
    const sideSpeed = airborne ? AIR_CONTROL_SPEED : SIDE_SPEED;

    if (wantFwd) {
      const s = airborne ? AIR_CONTROL_SPEED : WALK_SPEED;
      vx += _fwd.x * s;
      vz += _fwd.z * s;
    }
    if (wantBack) {
      const s = airborne ? AIR_CONTROL_SPEED : BACK_SPEED;
      vx -= _fwd.x * s;
      vz -= _fwd.z * s;
    }
    if (wantRight) {
      vx += _right.x * sideSpeed;
      vz += _right.z * sideSpeed;
    }
    if (wantLeft) {
      vx -= _right.x * sideSpeed;
      vz -= _right.z * sideSpeed;
    }

    // 斜向不加速：归一化到单一速度上限
    const mag = Math.hypot(vx, vz);
    if (mag > 1e-6) {
      // 上限取当前实际使用的最大速度分量
      const cap = airborne ? AIR_CONTROL_SPEED : Math.max(WALK_SPEED, SIDE_SPEED, BACK_SPEED);
      const want = Math.min(mag, cap);
      vx = (vx / mag) * want * moveCaps.moveMult;
      vz = (vz / mag) * want * moveCaps.moveMult;
    }

    // 地面态的状态切换：有输入 → walk，无输入 → idle
    if (f.grounded && !st.is("block", "dash")) {
      if (mag > 1e-6) {
        if (st.is("idle")) st.to("walk");
      } else if (st.is("walk")) {
        st.to("idle");
      }
    }

    if (airborne) {
      // 空中：主动输入是「微调」，叠加在既有水平速度上而非覆盖
      f.velocity.x += vx * dt * 6;
      f.velocity.z += vz * dt * 6;
    } else {
      // 地面：主动速度直接覆盖水平分量。
      // 击退残留由 Physics 的摩擦衰减处理，若这里无输入则不覆盖，
      // 让击退能把角色推开。
      if (mag > 1e-6) {
        f.velocity.x = vx;
        f.velocity.z = vz;
      }
    }
  }

  /** 被打断时清掉冲刺状态 */
  cancelDash() {
    this.dashFrames = 0;
    this.dashDir.set(0, 0, 0);
  }

  /**
   * 起招（由出招分支调用，见 update 顶部）。
   * @param {object} move MoveSet 选出的招式定义
   */
  _startMove(move) {
    const f = this.f;
    const st = f.state;

    this.cancelDash(); // 冲刺中起招：清掉冲刺推进
    // 清掉走位/冲刺残速，位移由招式的 motion 接管（收招时清残速见 MoveRunner）
    f.velocity.x = 0;
    f.velocity.z = 0;

    // 从出招瞬间的身姿开始播（衔接走位前倾等既有姿态）
    f.move = new MoveRunner({ fighter: f, move });
    // 锁到招式播完为止：期间除 force（被命中/K.O.）外不切换状态
    // 冲刺带着自己的 lock，dash → attack 必须 force 越过（冲刺可被出招取消）
    st.to("attack", { lock: moveTotalFrames(move), force: st.is("dash") });
  }
}
