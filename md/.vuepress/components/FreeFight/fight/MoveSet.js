import { PRESET_MOVES, MOVE_CATEGORIES, PHASE_ORDER } from "../studio/presets.js";

/**
 * MoveSet —— 一个角色的招式集合。
 *
 * 职责（DESIGN §10）：招式定义 / 序列化 / 校验 + 按输入上下文选招。
 *
 * 选招规则：输入动作（轻击/重击/必杀）先映射到类别（light/heavy/special，
 * 见 CharacterController），再由 move.input.requires 决定该类别里哪一招
 * 符合当前态势 —— 例如 heavy 在地面是「回旋」、在空中是「跺地」。
 *
 * 与 AniAI Command 模型的关键区别（DESIGN §9.3）：MoveSet 只负责「选招」，
 * 不负责互斥。起招裁决由状态机能力位（caps.attack）完成 —— 连按出拳只会
 * 在 idle/walk/dash 等可起招状态生效，attack 态里连按自然被忽略。
 */

/** 输入要求：哪些态势下这招可以被选中 */
const VALID_REQUIRES = [null, "forward", "back", "air", "crouch"];

export class MoveSet {
  /**
   * @param {object[]} moves 招式定义数组（见 DESIGN §5.1 的形状）
   */
  constructor(moves = []) {
    this.moves = moves;
    this._byId = new Map(moves.map((m) => [m.id, m]));
  }

  /** 预设 4 招（DESIGN §5.3） */
  static fromPresets() {
    return new MoveSet(PRESET_MOVES);
  }

  get(id) {
    return this._byId.get(id) || null;
  }

  byCategory(category) {
    return this.moves.filter((m) => m.category === category);
  }

  /**
   * 按输入上下文选招。
   * @param {'light'|'heavy'|'special'|'throw'} category
   * @param {{grounded: boolean, forwardHeld?: boolean, backHeld?: boolean}} ctx
   * @returns {object|null} 命中的招式；没有符合当前态势的招返回 null
   *
   * 同类别有多个候选时（如两个 heavy）按声明顺序取第一个命中 ——
   * F5 的自定义招由玩家在工房里排优先级。
   */
  pick(category, ctx) {
    for (const m of this.moves) {
      if (m.category !== category) continue;
      const req = m.input?.requires ?? null;
      if (ctx.grounded) {
        // 地面：只匹配不要求空中（null）或方向要求的招
        if (req === "air") continue;
        if (req === "forward" && !ctx.forwardHeld) continue;
        if (req === "back" && !ctx.backHeld) continue;
        return m;
      }
      // 空中：只匹配 requires: 'air' 的空中招
      if (req === "air") return m;
    }
    return null;
  }

  /**
   * 校验招式定义，返回问题列表（空数组 = 合法）。
   * 给测试、F5 工房与导入的玩家自定义招共用 —— 坏数据在源头拦下，
   * 不要等到 MoveRunner 播放时炸。
   */
  validate(move) {
    const errs = [];
    if (!move) return ["招式定义为空"];
    if (typeof move.id !== "string" || !move.id) errs.push(`缺 id：${move.label || "?"}`);
    if (typeof move.label !== "string" || !move.label) errs.push(`${move.id || "?"} 缺 label`);
    if (!MOVE_CATEGORIES.includes(move.category)) {
      errs.push(`${move.id} 类别「${move.category}」不在 ${MOVE_CATEGORIES.join("/")}`);
    }
    if (!move.phases) {
      errs.push(`${move.id} 缺 phases`);
    } else {
      for (const p of PHASE_ORDER) {
        const ph = move.phases[p];
        if (!ph) { errs.push(`${move.id} 缺相位 ${p}`); continue; }
        const fr = ph.frames;
        if (!Number.isInteger(fr) || fr < 1) {
          errs.push(`${move.id}.${p}.frames 必须是 ≥1 的整数，实际 ${fr}`);
        }
        if (ph.pose != null) {
          const b = ph.pose.body;
          const ok = b && Array.isArray(b.position) && b.position.length === 3
            && Array.isArray(b.rotation) && b.rotation.length === 4
            && Array.isArray(b.scale) && b.scale.length === 3;
          if (!ok) errs.push(`${move.id}.${p}.pose 形状不符（需 body: { position[3], rotation[4], scale[3] }）`);
        }
      }
    }
    const req = move.input?.requires ?? null;
    if (!VALID_REQUIRES.includes(req)) {
      errs.push(`${move.id} requires「${req}」不在 ${VALID_REQUIRES.map((v) => v ?? "null").join("/")}`);
    }
    const mo = move.motion || {};
    for (const k of ["forward", "rise", "spin"]) {
      if (mo[k] != null && (typeof mo[k] !== "number" || !Number.isFinite(mo[k]))) {
        errs.push(`${move.id} motion.${k} 必须是有限数值`);
      }
    }
    const hit = move.hit;
    if (!hit || typeof hit.damage !== "number" || hit.damage < 0) {
      errs.push(`${move.id} hit.damage 缺失或为负`);
    }
    return errs;
  }

  /** 校验全部招式，返回 { moveId: [问题…] }；空对象 = 全部合法 */
  validateAll() {
    const out = {};
    for (const m of this.moves) {
      const errs = this.validate(m);
      if (errs.length) out[m.id] = errs;
    }
    return out;
  }
}
