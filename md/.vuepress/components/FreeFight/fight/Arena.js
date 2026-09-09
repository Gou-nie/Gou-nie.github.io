import * as THREE from "three";
import { FightLoop } from "./FightLoop.js";
import { FightState } from "./FightState.js";
import { CharacterController } from "./CharacterController.js";
import { MoveSet } from "./MoveSet.js";
import { FightRules } from "./FightRules.js";
import { HitDetector } from "./HitDetector.js";
import { ArenaCamera } from "./ArenaCamera.js";
import { ArenaScene, setupLights } from "./ArenaScene.js";
import {
  integrate, clampToArena, resolveOverlap, updateFacing, horizontalDistance,
} from "./Physics.js";
import { START_OFFSET, STEP, MAX_HP } from "./constants.js";

/**
 * Arena：把固定步长循环、输入、物理、相机、场景串起来。
 *
 * 每个 fixedUpdate 的顺序是有讲究的：
 *   输入采样 → 招式播放 → 控制器（写速度）→ 积分（位移+重力）→ 边界 → 推挤 → 朝向
 *   → 判定采样 → 状态计时 → 规则推进
 * 招式播放先于控制器：控制器读到的状态是招式推进后的（招式播完 → force 回 idle
 * 的裁决在控制器运行前生效）；招式 motion 写的速度随后被积分消费。
 * 推挤放在边界之后，否则被推出场地的角色会在下一帧才被拉回，出现瞬时穿墙。
 * 朝向放在判定之前，因为它依赖两人最终位置；判定采样前会把逻辑位姿同步进场景图
 * （HitDetector 用 getWorldPosition 取锚点世界坐标）。
 */
export class Arena {
  /**
   * @param {{
   *   scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer,
   *   input: import('../input/FightInput.js').FightInput,
   *   fighters: [object, object],
   *   accent?: number,
   *   onTick?: Function,
   * }} cfg
   */
  constructor(cfg) {
    this.scene = cfg.scene;
    this.camera = cfg.camera;
    this.renderer = cfg.renderer;
    this.input = cfg.input;
    this.onTick = cfg.onTick || null;

    this.fighters = cfg.fighters;
    this.p1 = cfg.fighters[0];
    this.p2 = cfg.fighters[1];

    // 每个角色配一套状态机、控制器与招式集合
    for (const f of this.fighters) {
      f.state = new FightState();
      f.grounded = true;
      f.controller = new CharacterController(f);
      // F3：预设 4 招开箱即战；F5 的自定义招式在 Fighter 创建时注入替换
      f.moveSet = MoveSet.fromPresets();
      f.move = null;
    }

    this.arenaScene = new ArenaScene(this.scene, { accent: cfg.accent });
    this.lights = setupLights(this.scene, { accent: cfg.accent });
    this.arenaCamera = new ArenaCamera(this.camera);

    // F4：规则（血量/气槽/回合/计时/KO）与判定（hitbox × hurtbox）
    this.rules = new FightRules(this.fighters);
    this.hitDetector = new HitDetector({ rules: this.rules });

    // 调试信息（F2 验收用）
    this.debug = {
      tick: 0,
      distance: 0,
      p1: null,
      p2: null,
      stalls: 0,
    };

    this._renderP1 = new THREE.Vector3();
    this._renderP2 = new THREE.Vector3();
    this._lastRenderTime = this._now();

    this.loop = new FightLoop({
      fixedUpdate: (dt, tick) => this._fixedUpdate(dt, tick),
      render: (alpha) => this._render(alpha),
      onStall: () => { this.debug.stalls++; },
    });

    this.reset();
  }

  _now() {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  }

  /** 完整重置：两人对面而立 + 规则归零（HUD 的「重置站位」与重新开打都走这里） */
  reset() {
    this._resetFighters();
    for (const f of this.fighters) {
      if (!f.root.parent) this.scene.add(f.root);
    }
    this.rules.reset();
    this.loop.timeScale = 1;
    this.arenaCamera.snap(this.p1.position, this.p2.position);
  }

  /** 把两名战士复位到入场站位与满状态（不碰规则记分） */
  _resetFighters() {
    for (const f of this.fighters) {
      f.state = new FightState();
      f.hp = MAX_HP;
      f.meter = 0;
      f.velocity.set(0, 0, 0);
      f.grounded = true;
      f.controller.cancelDash();
      f.move = null; // 弃掉上回合残留的招式播放器（resetPose 已把姿态拉回 rest）
      f.resetPose();
    }
    this.p1.placeAt(-START_OFFSET, 0);
    this.p2.placeAt(START_OFFSET, 0);
    this.p1.faceTowards(this.p2.position);
    this.p2.faceTowards(this.p1.position);
    this.p1.syncTransform();
    this.p2.syncTransform();
  }

  /** 回合结束 → 开下一回合（由 FightRules.pendingReset 触发） */
  _beginNextRound() {
    this._resetFighters();
    this.rules.beginRound();
    this.arenaCamera.snap(this.p1.position, this.p2.position);
  }

  start() {
    this.loop.start();
  }

  /**
   * 预编译着色器后再启动循环。
   *
   * 不预编译的话，第一次 render() 要编译全部着色器（几百毫秒），
   * 于是「下一帧」看到一个巨大的时间增量，累加器直接触发 MAX_CATCHUP 丢帧告警。
   * 这不是逻辑缺陷，但它会污染丢帧统计 —— 而丢帧统计是判断
   * 「固定步长是否真的稳定」的关键指标，必须干净。
   */
  async startWhenReady() {
    try {
      await this.renderer.compileAsync?.(this.scene, this.camera);
    } catch (err) {
      // 编译失败不阻塞开局，正常渲染会重试
      console.warn("[FreeFight] 着色器预编译失败，继续启动", err);
    }
    this.loop.start();
  }

  stop() {
    this.loop.stop();
  }

  pause() {
    this.loop.pause();
    this.input.clearAll();
  }

  resume() {
    this.loop.resume();
  }

  stepOnce() {
    this.loop.stepOnce();
  }

  _fixedUpdate(dt, tick) {
    this.input.beginTick();

    const s1 = this.input.snapshot("p1");
    const s2 = this.input.snapshot("p2");

    // 演出相（ko / matchEnd）不处理输入、招式与判定，只跑物理让被击飞的角色落地
    const fighting = this.rules.phase === "fighting";

    if (fighting) {
      // 招式播放：推进相位/姿态/收招 blend；播完的招在此被移除
      for (const f of this.fighters) f.move?.tick();

      // 控制器：把输入翻译成速度（不移动位置）
      this.p1.controller.update(s1, this.p2, dt);
      this.p2.controller.update(s2, this.p1, dt);
    }

    // 积分：位移 + 重力 + 击退衰减
    integrate(this.p1, dt);
    integrate(this.p2, dt);

    // 边界 → 推挤（顺序见类注释）
    clampToArena(this.p1);
    clampToArena(this.p2);
    resolveOverlap(this.p1, this.p2);
    // 推挤可能把人推出边界，再钳一次
    clampToArena(this.p1);
    clampToArena(this.p2);

    // 朝向锁定（依赖最终位置）
    updateFacing(this.p1, this.p2, dt);
    updateFacing(this.p2, this.p1, dt);

    if (fighting) {
      // 判定采样：把逻辑位姿同步进场景图后，双向各判一次（顺序固定，不偏袒）。
      // 采样只施加效果、不清 move —— 同 tick 对撞（trade）双方都能各自结算完。
      this._syncForHit();
      this.hitDetector.sample(this.p1, this.p2);
      this.hitDetector.sample(this.p2, this.p1);
      // 被打断者清掉招式播放器（hitstun/blockstun/… 意味着招式已中止）
      for (const f of this.fighters) {
        if (f.state.is("hitstun", "blockstun", "knockdown", "ko")) f.move = null;
      }
    }

    // 状态计时（锁递减）
    this.p1.state.tick();
    this.p2.state.tick();

    // 规则推进：计时 / KO 倒计时 / 硬直恢复
    this.rules.tick();
    this.loop.timeScale = this.rules.timeScale;

    // 回合结束 → 开下一回合
    if (this.rules.pendingReset) {
      this.rules.pendingReset = false;
      this._beginNextRound();
    }

    this.input.endTick();

    this.debug.tick = tick;
    this.debug.distance = horizontalDistance(this.p1, this.p2);
    this.debug.p1 = this._debugOf(this.p1);
    this.debug.p2 = this._debugOf(this.p2);
    this.debug.hud = this._hudState();
    this.onTick?.(this.debug);
  }

  /** 判定采样前：把逻辑位姿精确同步进场景图并刷新世界矩阵（HitDetector 用 getWorldPosition） */
  _syncForHit() {
    for (const f of this.fighters) {
      f.syncTransform();
      f.root.updateMatrixWorld(true);
    }
  }

  /** 供 HUD 消费的对局快照 */
  _hudState() {
    const r = this.rules;
    return {
      hp: { p1: this.p1.hp, p2: this.p2.hp },
      meter: { p1: this.p1.meter, p2: this.p2.meter },
      timer: Math.max(0, Math.ceil(r.timer)),
      round: r.round,
      wins: { p1: r.wins.p1, p2: r.wins.p2 },
      neededWins: r.neededWins,
      phase: r.phase,
      combo: { p1: r.combo.p1, p2: r.combo.p2 },
      winner: r.winner,
    };
  }

  _debugOf(f) {
    return {
      state: f.state.name,
      frames: f.state.frames,
      hp: f.hp,
      meter: f.meter,
      y: f.position.y,
      grounded: f.grounded,
      speed: Math.hypot(f.velocity.x, f.velocity.z),
      move: f.move
        ? { label: f.move.move.label, phase: f.move.phaseName, frame: f.move.elapsed, total: f.move.totalFrames }
        : null,
    };
  }

  _render(alpha) {
    // 角色：逻辑位置 → 渲染位置（固定步长的余量作为插值系数）
    this.p1.syncTransform(alpha);
    this.p2.syncTransform(alpha);

    // 相机用真实帧时间平滑（纯表现层，不受固定步长约束）
    const now = this._now();
    const rdt = Math.min((now - this._lastRenderTime) / 1000, 0.1);
    this._lastRenderTime = now;

    this._renderP1.copy(this.p1.root.position);
    this._renderP2.copy(this.p2.root.position);
    this.arenaCamera.update(this._renderP1, this._renderP2, rdt || STEP);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    for (const f of this.fighters) f.detach();
    this.arenaScene.dispose();
    for (const l of this.lights) this.scene.remove(l);
    this.lights = [];
  }
}
