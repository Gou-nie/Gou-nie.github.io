/**
 * 内置模型清单。
 *
 * rig 字段是「预期」的 rig 类型，仅用于 Roster 列表先行展示徽章（🦴/🧱），
 * 真正的类型由 FighterFactory 加载后按有无 SkinnedMesh 判定 —— 以实际解析结果为准。
 *
 * 已核实（解析各 GLB 的 JSON chunk）：只有 mimikyu 有 skin（11 根 joint），其余 5 个 skins 为 0。
 * mimikyu 自带的 "Take 01" 动画只有单关键帧、时长 0.042s，是静态 pose，不可用于动作。
 */
export const BUILTIN_FIGHTERS = [
  {
    id: "mimikyu",
    name: "谜拟丘",
    url: "/models/mimikyu.glb",
    rig: "skinned",
    note: "11 根骨骼（身/颈/头/双耳/尾），无手臂与腿",
  },
  {
    id: "snorlax",
    name: "卡比兽",
    url: "/models/Snorlax.glb",
    rig: "rigid",
    note: "静态模型",
  },
  {
    id: "magikarp",
    name: "鲤鱼王",
    url: "/models/magikarp.glb",
    rig: "rigid",
    note: "静态模型，体型细长",
  },
  {
    id: "tape_recorder",
    name: "录音机",
    url: "/models/tape_recorder.glb",
    rig: "rigid",
    note: "静态模型",
  },
  {
    id: "spellbook",
    name: "魔法书",
    url: "/models/spellbook.glb",
    rig: "rigid",
    note: "静态模型",
  },
  {
    id: "apple",
    name: "苹果",
    url: "/models/apple.glb",
    rig: "rigid",
    note: "静态模型",
  },
];

/** 按 id 取内置模型元数据 */
export function getBuiltin(id) {
  return BUILTIN_FIGHTERS.find((m) => m.id === id) || null;
}
