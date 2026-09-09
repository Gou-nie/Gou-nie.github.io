/**
 * 通用预设招式 —— 开箱即战。
 *
 * 任何模型刚导入就必须能立刻打，不能强迫玩家先当动画师。这 4 招全部用
 * RigidRig 语义编写（只动 bodyPivot 的 position/rotation/scale），因此对
 * 骨骼战士同样有效（骨骼保持 rest，整体变换作用在 ROOT 通道上）。
 *
 * 姿态数值约定（见 DESIGN §5.1）：
 * - 旋转用弧度；本地 +Z = 模型前进方向（朝向校准后即「面朝对手」）
 * - position 相对 bodyPivot 原点，rotation.x 正向 = 前倾
 * - 帧 = 1/60s 固定步长（见 fight/constants.js 的 STEP）
 *
 * 数值状态：damage/hitstun/knockback 等命中参数是平衡初值，F4 接
 * HitDetector 时按手感调；姿态数值是程序化初值，浏览器目视验证后微调
 * （见 PROGRESS.md 已知问题）。
 */

/** 招式类别（DESIGN §5.1）：light / heavy / special / throw */
export const MOVE_CATEGORIES = ["light", "heavy", "special", "throw"];

/** 相位名顺序：startup → active → recovery */
export const PHASE_ORDER = ["startup", "active", "recovery"];

/** 内联姿态的便捷构造（产物是纯可序列化对象） */
const P = (position, rotation, scale = [1, 1, 1]) => ({
  kind: "rigid",
  body: {
    position,
    rotation: [...rotation, "XYZ"],
    scale,
  },
});

export const PRESET_MOVES = [
  {
    id: "preset-ram",
    label: "撞击",
    category: "light",
    description: "前倾 + 小前冲，快，可作连段起手",
    input: { requires: null }, // null = 地面任意方向
    phases: {
      startup: { frames: 5, pose: P([0, 0, 0.02], [0.35, 0, 0]) },   // 蓄势前倾
      active: { frames: 3, pose: P([0, 0, 0.06], [0.75, 0, 0]) },    // 撞出
      recovery: { frames: 10, pose: P([0, 0, 0], [0, 0, 0]) },       // 收势
    },
    hit: {
      anchors: null, // null = 用该 rig 的全部建议锚点（F4 解析）
      radiusScale: 1.0,
      damage: 6,
      chip: 1,
      hitstun: 16,
      blockstun: 8,
      knockback: { x: 0.08, y: 0 },
      launch: false,
      hitsPerActivation: 1,
    },
    motion: { forward: 0.22, rise: 0, spin: 0 },
    invuln: [],
    cancel: { onHit: [], onBlock: [], onWhiff: [] },
    meterCost: 0,
  },
  {
    id: "preset-spin",
    label: "回旋",
    category: "heavy",
    description: "原地 360° 旋转横扫，慢，击退大",
    input: { requires: null },
    phases: {
      startup: { frames: 12, pose: P([0, 0, 0], [0.12, 0, 0], [1.02, 0.94, 1.02]) },  // 下沉蓄力
      active: { frames: 6, pose: P([0, 0, 0.03], [-0.18, 0, 0], [1.05, 0.92, 1.05]) }, // 甩开横扫
      recovery: { frames: 20, pose: P([0, 0, 0], [0, 0, 0]) },                        // 站定
    },
    hit: {
      anchors: null,
      radiusScale: 1.25, // 旋转横扫的范围本来就大
      damage: 14,
      chip: 2,
      hitstun: 24,
      blockstun: 12,
      knockback: { x: 0.18, y: 0 },
      launch: false,
      hitsPerActivation: 1,
    },
    // spin：整个招式期间绕本地 Y 累计旋转的弧度（跨过 startup+active 匀速施加，
    // recovery 与收招 blend 期间保持该累积值）。姿态 key 的 y 通道刻意不用
    // —— pose 走四元数最短弧，一个 key 表达不了 360°（2π ≡ 0）。
    motion: { forward: 0.1, rise: 0, spin: Math.PI * 2 },
    invuln: [],
    cancel: { onHit: [], onBlock: [], onWhiff: [] },
    meterCost: 0,
  },
  {
    id: "preset-launch",
    label: "上挑",
    category: "special",
    description: "后仰蓄力 → 上挑浮空",
    input: { requires: null },
    phases: {
      startup: { frames: 10, pose: P([0, 0, -0.04], [-0.42, 0, 0], [0.96, 1.08, 0.96]) }, // 后仰蓄力拉伸
      active: { frames: 5, pose: P([0, 0.07, 0.07], [0.5, 0, 0], [1.05, 0.95, 1.05]) },   // 上挑腾起
      recovery: { frames: 22, pose: P([0, 0, 0], [0, 0, 0]) },                            // 落回
    },
    hit: {
      anchors: null,
      radiusScale: 1.1,
      damage: 12,
      chip: 2,
      hitstun: 20,
      blockstun: 10,
      knockback: { x: 0.1, y: 0.45 },
      launch: true, // 命中 → 浮空，进入 air 态（F4 实现）
      hitsPerActivation: 1,
    },
    motion: { forward: 0.15, rise: 0.2, spin: 0 },
    invuln: [],
    cancel: { onHit: [], onBlock: [], onWhiff: [] },
    meterCost: 0,
  },
  {
    id: "preset-stomp",
    label: "跺地",
    category: "heavy",
    description: "空中收腿腾起 → 砸下，命中地面波及范围（F4 的 AOE 语义预留）",
    input: { requires: "air" }, // 只有空中能起手
    phases: {
      startup: { frames: 14, pose: P([0, 0.03, 0], [0.1, 0, 0], [0.9, 1.18, 0.9]) },      // 收腿腾空
      active: { frames: 4, pose: P([0, -0.02, 0.05], [0.55, 0, 0], [1.12, 0.85, 1.12]) }, // 前倾砸下
      recovery: { frames: 18, pose: P([0, 0, 0], [0, 0, 0]) },                            // 站定
    },
    hit: {
      anchors: null,
      radiusScale: 1.3,
      damage: 15,
      chip: 2,
      hitstun: 26,
      blockstun: 12,
      knockback: { x: 0.12, y: 0.4 },
      launch: false,
      hitsPerActivation: 1,
    },
    motion: { forward: 0, rise: 0, spin: 0 },
    invuln: [],
    cancel: { onHit: [], onBlock: [], onWhiff: [] },
    meterCost: 0,
  },
];
