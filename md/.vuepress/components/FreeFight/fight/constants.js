/**
 * 战斗调参常量。
 *
 * 单位：距离 = 米，时间 = 秒，角度 = 弧度。帧 = 1/60 秒。
 * 所有「帧」数值都是整数，因为逻辑跑在固定步长上（见 FightLoop）。
 *
 * 归一化后角色身高恒为 1.8 米（Normalizer.FIGHTER_HEIGHT），
 * 所有空间数值都以此为尺度基准。
 */

/** 逻辑步长：60Hz。帧数据的一切平衡都建立在这个常量上，不要改。 */
export const STEP = 1 / 60;

/** 单个 rAF 回调里最多补几步逻辑。防止切标签页回来后爆炸式追帧。 */
export const MAX_CATCHUP = 5;

/** 单帧最大时间增量（秒）。超过就丢弃，宁可跳帧不要慢放。 */
export const MAX_FRAME_TIME = 0.25;

// ---- 移动 ----
/** 前进速度（米/秒） */
export const WALK_SPEED = 3.2;
/** 后退速度：比前进慢，让「拉开距离」有代价 */
export const BACK_SPEED = 2.4;
/** 侧移（绕圈）速度 */
export const SIDE_SPEED = 2.7;
/** 防御中的移动速度倍率 */
export const BLOCK_MOVE_MULT = 0.45;
/** 空中水平微调速度 */
export const AIR_CONTROL_SPEED = 1.3;

// ---- 冲刺 ----
export const DASH_SPEED = 6.4;
/** 冲刺持续帧数 */
export const DASH_FRAMES = 13;
/** 冲刺后的僵直帧数（不能立刻再冲） */
export const DASH_COOLDOWN_FRAMES = 8;
/** 双击判定窗口（帧）：这个窗口内两次同向按下 = 冲刺 */
export const DOUBLE_TAP_FRAMES = 14;

// ---- 跳跃与重力 ----
/**
 * 起跳初速度（米/秒）。与 GRAVITY 一起决定：
 *   跳跃高度 = JUMP_VELOCITY² / (2 * GRAVITY) ≈ 1.11 米（约 0.6 个身高）
 *   滞空时间 = 2 * JUMP_VELOCITY / GRAVITY ≈ 0.64 秒（约 38 帧）
 * 比真实重力大得多 —— 格斗游戏的跳跃要「脆」，滞空太久会让空中攻防失控。
 */
export const JUMP_VELOCITY = 7.0;
export const GRAVITY = 22.0;

// ---- 击退与摩擦 ----
/** 击退速度每帧的衰减系数 */
export const KNOCKBACK_FRICTION = 0.86;
/** 击退速度低于此值就归零，避免无限小数漂移 */
export const KNOCKBACK_EPSILON = 0.05;

// ---- 场地 ----
/** 圆形场地半径（米） */
export const ARENA_RADIUS = 7.0;
/** 两人推挤时的额外间隙，避免贴到完全重合 */
export const PUSH_SKIN = 0.02;

// ---- 锁定与朝向 ----
/**
 * 转身角速度（弧度/秒）。锁定制下角色自动面向对手，
 * 但不能瞬移朝向 —— 否则绕后时模型会瞬间翻面，观感很差。
 */
export const TURN_SPEED = 11.0;
/** 两人水平距离小于此值时视为「重合」，此时保持上一帧朝向不变 */
export const MIN_SEPARATION = 0.05;

// ---- 相机 ----
/** 相机高度（米） */
export const CAM_HEIGHT = 2.6;
/** 注视点在中点之上的抬高量 */
export const CAM_LOOK_HEIGHT = 1.0;
/** 画面左右留白（米），保证角色不贴边 */
export const CAM_MARGIN = 2.2;
/** 相机距离的钳制区间 */
export const CAM_MIN_DIST = 5.5;
export const CAM_MAX_DIST = 16.0;
/** 相机角度/距离的平滑系数（每秒收敛比例，越大越跟手） */
export const CAM_SMOOTH = 6.0;

// ---- 入场 ----
/** 开局两人各自距原点的距离 */
export const START_OFFSET = 2.2;

// ---- 判定与规则（F4）----
/**
 * 背身防御判定阈值：守方面向与「指向攻方」方向的点积需大于此值才算防住。
 * cos(70°) —— 允许一定的侧身容差，但正后方攻击（点积 ≤ 0）必然破防。
 */
export const BLOCK_FACING_DOT = Math.cos((70 * Math.PI) / 180);

/** 血量上限 */
export const MAX_HP = 100;
/** 气槽上限（格斗惯例取满槽 = 100） */
export const MAX_METER = 100;
/** 命中时攻方积攒的气槽 */
export const METER_GAIN_HIT = 12;
/** 被防时攻方积攒的气槽（比命中少） */
export const METER_GAIN_BLOCK = 6;
/** 承受伤害时守方积攒的气槽 */
export const METER_GAIN_TAKEN = 8;

/** 连击伤害递减底数：第 n 段伤害 = 基础伤害 × 0.9^(n-1) */
export const COMBO_DAMAGE_FALLOFF = 0.9;

// ---- 回合与 K.O.（F4）----
/** 单局时限（秒） */
export const ROUND_TIME = 99;
/** 回合制局数（三局两胜） */
export const BEST_OF = 3;
/** 时间到双方等血时的加赛时长（秒） */
export const OVERTIME = 5;
/** K.O. 慢放倍率 */
export const KO_SLOWMO = 0.3;
/** K.O. 慢放持续的逻辑帧数（40 帧 ≈ 0.67s 游戏时间 ≈ 2.2s 真实时间 @0.3x） */
export const KO_FRAMES = 40;

// ---- 倒地与起身（F4）----
/** 倒地硬直帧数 */
export const KNOCKDOWN_FRAMES = 40;
/** 起身帧数 */
export const GETUP_FRAMES = 12;
/** 倒地时受击胶囊的高度缩放（趴下后变矮） */
export const KNOCKDOWN_HEIGHT_SCALE = 0.35;
