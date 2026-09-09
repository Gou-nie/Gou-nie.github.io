# FreeFight —— 自定义 GLB 3D 格斗 设计方案

> 玩家导入自己的 GLB（或选用项目内置模型）→ 在工房里设计招式与判定 → 进场开打。
> 三段式流程：**选将 Roster → 编招 Studio → 开打 Arena**。

---

## 0. 已确认的四个决策

| 决策点 | 结论 | 影响 |
|---|---|---|
| 空间模型 | **3D 锁定环绕**：X-Z 平面 8 向走位 + 跳跃，始终锁定对手 | 判定用 3D 球体 + 面向夹角；需要转身插值与背身判定 |
| 对战模式 | **本地双人同键盘**（AI / 联网不在本期） | 零网络零 AI；键位冲突与键盘卡键（ghosting）成为真问题 |
| 与 AniAI 关系 | **import 复用 AniAI 核心** | 不重复造轮子，但必须先修 AniAI 的两个既有缺陷（见 §9.1） |
| 静态模型 | **支持「刚体战士」** | 6 个内置模型全部可用；需要 Rig 适配层统一骨骼/刚体两类角色 |

### 0.1 相机：一处对决策的修正

「3D 锁定环绕」原始描述里的相机是「追在 P1 后方」。**本地双人下这对 P2 不公平**——P2 永远在看自己的侧面/背面。

本方案默认改用 **垂直双人相机（Perpendicular Arena Camera）**：相机站在两人连线的**垂直平分方向**上，两人始终以侧面呈现在画面左右两侧。这是《铁拳》《灵魂能力》的做法，天然对称，且在保留 3D 走位自由度的同时给出接近 2.5D 的清晰读招手感。

```
        俯视图 (X-Z 平面)

              ● P2
             ╱
            ╱  ← 两人连线
           ╱
        ● P1
           ╲
            ╲  ← 相机在垂直平分线上
             ▣ CAM     yaw = atan2(Δ) + 90°，平滑 lerp
                       dist = clamp(base + k·separation)
                       lookAt = 两人中点 + 抬高偏移
```

- `yaw` 每帧朝目标角度插值（避免两人绕圈时相机抽搐），并**锁定翻转方向**：当连线旋转越过 180° 时不做瞬时 180° 翻面，而是沿最短弧继续跟随，且加 hysteresis 死区。
- 「追在 P1 后方」保留为 `ArenaCamera` 的 `mode: 'chase'`，供将来单人/AI 模式使用。
- 分屏（真正的双人各自视角）不在本期，但 `ArenaCamera` 设计成可实例化多份，为将来留口。

---

## 1. 目标与非目标

### 目标
1. **任意 GLB 可参战**：带骨骼的作为「骨骼战士」，无骨骼的作为「刚体战士」，两类同场对打。
2. **自定义招式**：在工房里手捏姿态 / 摆刚体变换 → 组成「起手-判定-收招」三段招式 → 摆判定球 → 绑键。
3. **完整对战循环**：血量、硬直、击退、防御、连击、回合、K.O.。
4. **可确定复现**：固定步长逻辑，帧数据在任何刷新率的显示器上表现一致。

### 非目标（本期不做）
- AI 对手、联网对战、分屏。
- IK、布娃娃物理、破坏。
- 为静态模型自动生成骨骼与蒙皮。
- 指令技（↓↘→+拳）—— 输入缓冲区预留接口，招式识别留到 F6。

---

## 2. 现状盘点（已验证）

### 2.1 内置模型资产

| 模型 | skins | joints | animations | 体积 | 参战身份 |
|---|---|---|---|---|---|
| `mimikyu.glb` | 1 | 11 | 1（**时长 0.042s，单关键帧，无实际动作**） | 320K | 骨骼战士 |
| `Snorlax.glb` | 0 | — | 0 | 296K | 刚体战士 |
| `magikarp.glb` | 0 | — | 0 | 2.4M | 刚体战士 |
| `tape_recorder.glb` | 0 | — | 0 | 72K | 刚体战士 |
| `spellbook.glb` | 0 | — | 0 | 3.2M | 刚体战士 |
| `apple.glb` | 0 | — | 0 | 6.4M | 刚体战士 |

> mimikyu 的 11 根骨骼：`Armature_rootJoint / ROOT_Armature / Body_Armature / Neck_Armature / Head_Armature / Ear.R_Armature / Ear_tip.R_Armature / Ear.L_Armature / Ear_tip.L_Armature / Tail_Armature / Tail_tip_Armature`。
> **注意：没有手臂和腿。**所以即便是唯一的骨骼战士，它的「拳脚」也必须靠身体/头/耳/尾的变换 + 根节点冲刺来表达。这反过来印证了「刚体战士」路线的必要性——它不是妥协，而是本项目的主玩法形态。

### 2.2 依赖与环境

| 项 | 状态 |
|---|---|
| three | `0.176.0` ✅ |
| gsap | `^3.13.0` ✅（仅用于工房预览/UI，**不用于战斗逻辑**，见 §9.2） |
| lil-gui | `^0.21.0` ✅ |
| `SkeletonUtils.clone` | ✅ `three/examples/jsm/utils/SkeletonUtils.js` |
| `TransformControls` | ✅ `three/examples/jsm/controls/TransformControls.js` |
| 3D 物理引擎 | ❌ 无（matter-js 是 2D）→ 自写轻量运动学，见 §6.4 |
| DRACOLoader / KTX2Loader | 模块存在，但 **decoder 未放进 public/**，见 §9.6 |

内置模型的 `extensionsRequired` 全为空，仅 mimikyu 用了 `KHR_materials_unlit`（GLTFLoader 原生支持）。**内置资产无需任何额外 decoder**。

---

## 3. 总体架构

```
┌──────────────────────────────────────────────────────┐
│                    FreeFight.vue                      │
│         (三屏切换 · Three 生命周期 · 主循环挂载)          │
└──────────┬───────────────┬───────────────┬───────────┘
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Roster   │ →  │  Studio  │ →  │  Arena   │
    │ 选将     │    │  编招     │    │  开打     │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         ▼               ▼               ▼
  ┌────────────────────────────────────────────────┐
  │              FighterFactory                     │
  │  GLB → 归一化 → Rig 适配 → Fighter 实体          │
  └────────────┬───────────────────────────────────┘
               ▼
        ┌─────────────┐
        │  Rig 适配层  │  SkinnedRig  |  RigidRig
        └──────┬──────┘
               ▼
   ┌───────────────────────────────┐
   │   复用 AniAI 核心（import）     │
   │ ModelLoader / SkeletonParser  │
   │ BoneRegistry / PoseStore      │
   └───────────────────────────────┘

  战斗层（全部新写，固定步长驱动）
   FightLoop → [Fighter × 2] → FightState → MoveRunner
                    ↓              ↓
                 Physics      HitDetector → FightRules → HUD
```

**分层原则**：`core/` 与 `fight/` 不碰 DOM，可 node 环境单测（项目已有 `__m5_test.mjs` / `__cache_test.mjs` 的先例）；`studio/` 与 `ui/` 才依赖 lil-gui / Vue。

---

## 4. Rig 适配层 —— 统一骨骼战士与刚体战士

这是让 6 个模型全部可战的关键抽象。战斗层**只认 Rig 接口，不认骨骼**。

```js
/**
 * Rig：一具「可摆姿势的躯体」。
 * 骨骼战士的可动节点是 Bone；刚体战士的可动节点是几个人为插入的 pivot。
 */
interface Rig {
  kind: 'skinned' | 'rigid';
  root: THREE.Object3D;          // 参与世界位移的根（由 Fighter 持有）
  nodes(): string[];             // 可动节点名
  node(name): THREE.Object3D;
  rest(name): { position, rotation, scale };
  reset(): void;
  anchors(): Anchor[];           // 判定采样点（拳/脚/头/整体）
  bounds(): THREE.Box3;          // 局部空间包围盒（用于受击框与推挤半径）
}
```

### 4.1 `SkinnedRig`
直接包装 AniAI 的 `BoneRegistry`：

```js
new SkinnedRig(registry)
  nodes()  → registry.names()
  node(n)  → registry.get(n)
  rest(n)  → registry.restPose(n)
  reset()  → registry.reset()
```

`anchors()` 用**骨骼名启发式**自动建议，命中不了就回落到「整体」：

| 正则（大小写不敏感） | 建议锚点角色 |
|---|---|
| `hand\|fist\|wrist\|palm` | 拳 |
| `foot\|toe\|ankle\|leg\|shin` | 脚 |
| `head\|skull\|jaw` | 头 |
| `tail` | 尾（尾击） |
| `ear\|horn\|wing` | 特殊部位 |

mimikyu 会命中 `Head_Armature`（头）、`Tail_Armature`/`Tail_tip_Armature`（尾）、`Ear.L/R`（耳）——足够设计出「头槌 / 尾扫 / 耳刺」三套招。**匹配结果只是默认值，工房里可任意增删改。**

### 4.2 `RigidRig`
无骨骼模型加载后，包一层 pivot 树，让「整体变换」变成可编排的姿态：

```
fighterRoot (世界位移/朝向，由 Physics 驱动)
└── bodyPivot   ← RigidRig 的唯一可动节点，招式动它
    └── modelScene (归一化后的 GLB)
```

- 姿态通道 = `bodyPivot` 的 `position / rotation / scale`（9 个自由度）。
- 可表达：前冲撞（+z 位移）、回旋（y 旋转）、上挑（x 旋转 + y 位移）、蓄力挤压（scale 非等比）、跺地（y 位移骤降）。
- `anchors()` 默认给一个包围盒中心的球；工房里手动增加并拖动（用 `TransformControls`）。

> **可选增强（F5）**：`RigidRig` 支持「多段刚体」——把模型按包围盒切成 2~3 个 pivot（上/中/下）分别挂载**同一个** mesh 的引用是做不到的，所以多段刚体需要复制 mesh 或用 clipping。本期不做，单 pivot 已足够表达全部预设招式。

### 4.3 归一化（`Normalizer.js`）—— 必做，否则苹果有房子那么大

导入的 GLB 尺度、朝向、原点位置完全不可控（内置资产里 apple 6.4M 与 tape_recorder 72K 的世界尺寸差了两个数量级）。入场前统一处理：

1. **落地**：`Box3.setFromObject` 求包围盒，把模型下移使 `box.min.y === 0`（脚踩地面）。
2. **缩放**：按包围盒高度归一到标准身高 `FIGHTER_HEIGHT = 1.8`。以**高度**而非最大边为基准，避免趴着的鲤鱼王被压扁；对极端扁平模型（`height / max(width,depth) < 0.35`）改用最大边归一并给出提示。
3. **居中**：X-Z 方向把包围盒中心对齐到原点，避免模型绕着一个偏远的原点自转。
4. **朝向校准**：GLB 的「正面」无法自动判定。默认假设 `+Z` 为正面，在工房里提供 **朝向校准滑杆（0°/90°/180°/270° 快捷 + 自由微调）**，把结果存进战士配置的 `facingOffset`。
   - 校准 UI：把角色摆在场地上，画一个从脚下指向前方的箭头，玩家转到箭头对准屏幕外即可。

```js
normalize(scene) → {
  scale: number,
  offset: THREE.Vector3,
  facingOffset: number,   // 弧度，玩家校准
  height: number,         // 归一化后实际高度（用于受击框）
  radius: number,         // X-Z 包围半径（用于推挤）
}
```

---

## 5. 招式系统

### 5.1 招式定义（可序列化）

招式 = 三段相位。这与 AniAI 现有的 `PoseStore` + `Sequence` 结构天然同构，是本项目最大的复用红利。

```js
{
  id: 'p1-move-3',
  label: '头槌',
  category: 'light' | 'heavy' | 'special' | 'throw',
  input: { key: 'f', requires: null },        // requires: 'forward' | 'back' | 'air' | 'crouch'

  phases: {
    startup:  { key: <PoseKey>, frames: 8  },  // 起手：不可打断（除非 armor）
    active:   { key: <PoseKey>, frames: 4  },  // 判定窗口：唯一产生 hit 的相位
    recovery: { key: <PoseKey>, frames: 14 },  // 收招：可被 cancel 规则覆盖
  },

  hit: {
    anchors: ['Head_Armature'],   // 该招启用哪些判定锚点
    radiusScale: 1.0,
    damage: 8,
    chip: 1,                      // 被防御时的削减伤害
    hitstun: 16,                  // 命中硬直（帧）
    blockstun: 8,
    knockback: { x: 0.18, y: 0 }, // 沿「攻方→守方」水平方向 + 垂直分量
    launch: false,                // true = 浮空，进入 air 状态
    hitsPerActivation: 1,
  },

  motion: { forward: 0.25, rise: 0 },   // 根节点位移（前冲撞类招式）
  invuln: [],                            // 无敌相位，如 ['startup']
  cancel: { onHit: ['p1-move-5'], onBlock: [], onWhiff: [] },
  meterCost: 0,
}
```

**`PoseKey` 的两种形态**（由 Rig 类型决定，序列化时带 `kind` 标签）：

```js
// 骨骼战士：沿用 AniAI PoseStore 的格式 { 骨骼名: [x,y,z,order] }
{ kind: 'skinned', bones: { 'Head_Armature': [0.3, 0, 0, 'XYZ'], ... } }

// 刚体战士：bodyPivot 的完整变换
{ kind: 'rigid', body: { position:[0,0,0.3], rotation:[0.2,0,0,'XYZ'], scale:[1,0.9,1.1] } }
```

**帧 vs 秒**：定义与 UI 一律用**帧**（@60fps），运行时换算成固定步长的 tick 数。这样「起手 8 帧」是个精确的整数，不受浮点秒数漂移影响。

### 5.2 `MoveRunner` —— 不用 gsap，自己插值

见 §9.2 的完整理由。运行时逻辑：

```js
tick(dt) {
  this.elapsed++;                                  // 固定步长，dt 恒定
  const { phase, t } = this.locate(this.elapsed);  // 当前相位 + 相位内进度 0..1
  const eased = easeOut(t);
  this.rig.lerpPose(this.prevKey, this.phaseKey(phase), eased);
  if (phase === 'active') this.emitActiveWindow(); // HitDetector 只在这里被喂数据
  if (this.elapsed >= this.totalFrames) this.finish();
}
```

`rig.lerpPose(a, b, t)`：
- 骨骼：逐骨 `Quaternion.slerp`（**不是 Euler lerp**，见 §9.4），位置/缩放用 `Vector3.lerp`。
- 刚体：`bodyPivot` 的三组变换直接插值。

### 5.3 通用预设招式（`studio/presets.js`）—— 开箱即战

**任何模型刚导入就必须能立刻打**，不能强迫玩家先当动画师。预设招式全部用 `RigidRig` 语义编写（只动根/pivot），因此**对骨骼战士同样有效**（作用在其 `ROOT` 通道上）：

| 预设 | 相位（帧） | 表现 | 伤害 | 特点 |
|---|---|---|---|---|
| 撞击 `light` | 5 / 3 / 10 | 前倾 + 小前冲 | 6 | 快，可连段起手 |
| 回旋 `heavy` | 12 / 6 / 20 | 原地 360° 旋转 | 14 | 慢，击退大 |
| 上挑 `special` | 10 / 5 / 22 | 后仰蓄力 → 上挑 | 12 | `launch: true` 浮空 |
| 跺地 `heavy` | 14 / 4 / 18 | 腾起 → 砸下 | 15 | 命中地面时波及范围 |

装配逻辑：`Fighter` 创建时若无自定义招式，自动注入这 4 招 + 通用移动/跳跃/防御。玩家在工房里可以改参数、改姿态、加招，也可以直接开打。

### 5.4 输入映射

复用 AniAI `KeyBindingGUI` 的「点击绑定 → 等待按键 → 完成」交互模式与冲突检测逻辑（`KeyBindingGUI.js:111` 的覆盖处理已经很完善），但底层换成 `FightInput`（§7）。

默认键位：

| 动作 | P1（左手区） | P2（右手区） |
|---|---|---|
| 前进 / 后退 | `W` / `S` | `↑` / `↓` |
| 左侧移 / 右侧移 | `A` / `D` | `←` / `→` |
| 跳跃 | `Q` | `Numpad0` |
| 防御 | `E` | `Numpad.` |
| 轻击 | `F` | `Numpad1` |
| 重击 | `G` | `Numpad2` |
| 必杀 | `R` | `Numpad3` |

> **笔记本无小键盘**：P2 默认键位不可用，必须改绑。Roster 界面检测到无小键盘输入时主动提示，并提供一套「无小键盘备选」预设（P2 用 `↑↓←→` + `,` `.` `/` `;` `'`）。全部键位可自由改绑并按「玩家槽位」缓存。

---

## 6. 战斗层

### 6.1 固定步长主循环（`FightLoop.js`）—— 架构基石

```js
const STEP = 1 / 60;
const MAX_CATCHUP = 5;      // 单帧最多补 5 步，防止切标签页回来后爆炸式追帧

loop(now) {
  raf(this.loop);
  this.acc += Math.min((now - this.last) / 1000, 0.25);  // 卡顿钳制
  this.last = now;
  let steps = 0;
  while (this.acc >= STEP && steps < MAX_CATCHUP) {
    this.fixedUpdate(STEP);   // 输入采样 → 状态机 → 招式 → 物理 → 判定 → 规则
    this.acc -= STEP;
    steps++;
  }
  if (steps === MAX_CATCHUP) this.acc = 0;               // 追不上就丢弃，宁可跳帧不要慢放
  this.render(this.acc / STEP);                          // 渲染插值 alpha
}
```

**为什么必须固定步长**：144Hz 显示器上 rAF 每秒回调 144 次。若逻辑跟着 rAF 走，「起手 8 帧」在 60Hz 上是 133ms、在 144Hz 上是 55ms——同一套帧数据在不同机器上是两个游戏。格斗游戏的一切平衡都建立在帧数确定性上，这一条没有商量余地。

**渲染插值**：`render(alpha)` 里把角色的视觉位置在 `prevPos → curPos` 之间按 alpha 插值，避免 60Hz 逻辑在 144Hz 屏幕上看起来一顿一顿。

### 6.2 角色状态机（`FightState.js`）

```
                  ┌──────────────────────────────┐
                  ▼                              │
  idle ⇄ walk ⇄ dash ──┐                        │
    │                   │                        │
    ├──→ jump → air ────┤                        │
    │                   ▼                        │
    ├──────────→ attack ──(结束/cancel)──────────┘
    │                   │
    ├──→ block ⇄ blockstun                       
    │                   ▲                        
    └──← hitstun ←──────┴──← (被命中)             
              │                                  
              └──→ knockdown → getup → idle      
                                                 
  任意状态 ──(HP ≤ 0)──→ ko
```

每个状态声明能力位：

| 状态 | 接受移动 | 可出招 | 可转身 | 受重力 | 可被打断 |
|---|---|---|---|---|---|
| `idle` / `walk` | ✅ | ✅ | ✅ | — | ✅ |
| `dash` | 锁定方向 | ✅ | ❌ | — | ✅ |
| `jump` / `air` | 微调 | ✅（空中招） | ❌ | ✅ | ✅ |
| `attack` | ❌ | 仅 cancel 窗口 | ❌ | 视招式 | **❌（核心规则）** |
| `block` | 后退速度 ×0.5 | ❌ | ✅ | — | ✅ |
| `hitstun` / `blockstun` | ❌ | ❌ | ❌ | ✅ | ❌（硬直结束前） |
| `knockdown` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `ko` | ❌ | ❌ | ❌ | ✅ | ❌ |

**所有输入必须先过状态机再落到招式**。这直接解决了 AniAI 现有的「连按出拳键 → 拳永远出不完」以及「同时按两个键 → 两个 Command 抢同一根骨骼导致抖动」两个问题（§9.3）。

### 6.3 判定（`HitDetector.js`）

**攻击框（hitbox）**：招式 `active` 相位内，从 `rig.anchors()` 里取该招启用的锚点，每帧 `bone.getWorldPosition()` 得球心，半径 = 锚点基础半径 × 招式 `radiusScale`。

> 这里直接复用 AniAI `SkeletonLines.update()`（`SkeletonLines.js:93`）已经验证过的「每帧取骨骼世界坐标」模式，连调试可视化都可以照搬——把线换成线框球即可。

**受击框（hurtbox）**：由归一化结果自动生成的**胶囊**（沿 Y 轴，半径 = `radius`，高 = `height`），随根节点移动。蹲下/浮空时按状态缩放。刚体战士同样如此——不需要玩家配置。

**判定流程**（每 tick，攻方 → 守方）：

```
for anchor of attacker.activeAnchors:
    if sphereVsCapsule(anchor, defender.hurtbox):
        if move.alreadyHit.has(defender): continue      // 一次激活只命中一次
        move.alreadyHit.add(defender)
        → resolve()
```

**`resolve()` 判定防御成立的条件**（三者全真才算防住）：
1. 守方处于 `block` 状态；
2. 守方**面向攻方**：`dot(defenderForward, toAttacker) > cos(70°)`（背身防御无效，这是 3D 走位的核心战术价值）；
3. 招式不是 `throw` 类。

**同帧对撞（trade）**：两人同 tick 互相命中 → 双方各自结算伤害与硬直。若 `category` 不同，重击优先（轻击方多吃 50% 硬直）。

### 6.4 运动学（`Physics.js`）—— 自写，无引擎

只需要四件事，不值得引入物理引擎：

1. **重力与地面**：`vy -= G * dt`，`y = max(0, y + vy*dt)`，触地清零并结束 `air`。
2. **推挤（push-out）**：两人 X-Z 圆盘重叠时沿连线各推开半个重叠量。`knockdown` 状态的角色不参与推挤（可以被踩过）。
3. **击退与摩擦**：命中时给守方一个沿「攻→守」水平方向的冲量，之后每 tick 乘摩擦系数衰减。
4. **场地边界**：半径 `ARENA_R` 的圆形场地。撞墙时**不反弹**，改为「贴墙 + 触发 wall-stun」——被压在墙角是格斗游戏的重要战术资源，且比反弹更符合直觉。

刻意不做：斜面、台阶、可破坏物、真实碰撞体。

### 6.5 规则（`FightRules.js`）

| 项 | 默认值 |
|---|---|
| 血量 | 100 |
| 回合制 | 三局两胜 |
| 单局时限 | 99 秒（时间到血多者胜，等血则平局加赛） |
| 连击计数 | `hitstun` 未结束时再次命中 → combo +1，并按 `0.9^(n-1)` 递减伤害（**必须有伤害递减，否则任何能连的招都会一套带走**） |
| 必杀气槽 | 造成/承受伤害积攒，满槽可用 `meterCost > 0` 的招 |
| K.O. | HP ≤ 0 → 双方进入 `ko`，慢放 0.3 倍速 1.5 秒 + 镜头推近 |

---

## 7. 输入（`input/FightInput.js`）

**不复用 AniAI 的 `InputManager`**——它是「事件 → 触发 Command」模型，而格斗需要「每 tick 轮询按键状态」。但保留它的两个正确设计：捕获阶段监听（绕过 lil-gui 的 `stopPropagation`）与输入框聚焦时不触发。

```js
class FightInput {
  isDown(key)                    // ← AniAI 缺失的核心能力
  pressedThisTick(key)           // 边沿检测（出招用，避免长按连发）
  releasedThisTick(key)
  buffer(playerId)               // 最近 N tick 的输入环形缓冲（预留给指令技）
  snapshot(playerId) → { forward, back, left, right, jump, block, light, heavy, special }
}
```

- 内部 `_down = new Set()`，`keydown` 加、`keyup` 删。
- **`window.blur` / `visibilitychange` 时清空整个 Set**。否则切走标签页时松开的键收不到 keyup，回来后角色会永远朝一个方向走——这是 Web 游戏最经典的 bug。
- 边沿检测在每个 fixedUpdate 开头结算，末尾清空 `_pressedEdge`，保证一次按下只被一个 tick 消费。

**输入方向是角色相对的**（锁定模式）：`forward` = 朝对手，`back` = 背离，`left/right` = 绕着对手侧移。这让双人在任意相机角度下操作都一致，是锁定制格斗的标准做法。

### 7.1 键盘卡键（Key Ghosting）—— 本地双人的真实物理限制

廉价薄膜键盘的按键矩阵决定了**同时按下 3~6 个键时会漏键**。两个玩家各按「移动 + 攻击」很容易触发。应对：

- 默认键位刻意让 P1（左区）与 P2（右区）落在键盘矩阵的不同行列区块，降低冲突概率。
- Roster 界面提供**「按键压力测试」**：让双方同时按住各自的移动+攻击键，界面实时显示实际收到的按键数，漏键则提示改绑或换键盘。
- 文档明示：全键无冲（NKRO）键盘无此问题。

---

## 8. 三屏流程与 UI

### 8.1 Roster 选将

```
┌──────────────────────────────────────────────────────────┐
│  FREE FIGHT                                    [键位] [?] │
├───────────────────────┬──────────────────────────────────┤
│        P1             │              P2                  │
│   ┌─────────────┐     │        ┌─────────────┐           │
│   │   3D 预览    │     │        │   3D 预览    │           │
│   │   (旋转展示) │     │        │   (旋转展示) │           │
│   └─────────────┘     │        └─────────────┘           │
│   ▸ mimikyu   🦴骨骼   │        ▸ Snorlax   🧱刚体         │
│   ▸ Snorlax   🧱刚体   │        ▸ apple     🧱刚体         │
│   ▸ magikarp  🧱刚体   │        ▸ ...                     │
│   ▸ 📁 导入 GLB…       │        ▸ 📁 导入 GLB…             │
│                       │                                  │
│   招式组: [预设4招 ▾]  │        招式组: [我的组合 ▾]        │
├───────────────────────┴──────────────────────────────────┤
│         [🔧 进入工房]              [⚔️ 开始战斗]           │
└──────────────────────────────────────────────────────────┘
```

- 每个模型条目标注 🦴骨骼 / 🧱刚体，导入后自动检测并归类。
- 导入即走 §4.3 归一化 + 朝向校准（首次导入强制走一遍校准，之后记住）。
- 允许两边选同一个模型（**镜像战必须走 `SkeletonUtils.clone`**，见 §9.5）。

### 8.2 Studio 编招工房

```
┌──────────────────────────────────────────────────────────┐
│ [招式列表]  撞击 · 回旋 · 上挑 · 跺地 · ➕新建             │
├────────────────────────────────┬─────────────────────────┤
│                                │  ▾ 相位帧数              │
│         3D 编辑视口             │    起手  [ 8]           │
│      (角色 + 半透明对手影子)     │    判定  [ 4]           │
│      (判定球线框 + Gizmo)        │    收招  [14]           │
│                                │                         │
│                                │  ▾ 姿态（当前相位）       │
│                                │    骨骼: [Head_Armature▾]│
│                                │    X [——●——] Y [—●———]  │
│                                │    Z [———●—]            │
│                                │    [📸 捕获当前姿态]      │
│                                │                         │
│                                │  ▾ 判定                  │
│                                │    锚点 ☑Head ☐Tail     │
│                                │    伤害 [ 8] 硬直 [16]   │
│                                │    击退 [0.18] ☐浮空     │
│                                │                         │
│                                │  ▾ 输入                  │
│                                │    按键 [F] [🔑改绑]      │
├────────────────────────────────┴─────────────────────────┤
│ 起手 ████████ 判定 ████ 收招 ██████████████   ◀ ▶ ▶▶ 1x   │
│      ↑ 时间轴可拖动擦洗，红色段 = 判定窗口                  │
└──────────────────────────────────────────────────────────┘
```

**关键交互**：
- **姿态编辑**：骨骼战士用 AniAI 现成的骨骼下拉 + XYZ 滑杆（`GUIPanel._buildSkeleton`），外加 `TransformControls` 直接拖拽骨骼的 gizmo 模式；刚体战士编辑 `bodyPivot` 的位移/旋转/缩放。
- **捕获**：摆好后点「📸 捕获当前姿态」写进当前相位——完全就是 AniAI 的 `pose.save()`，只是存进招式而非全局姿态库。
- **对手影子**：视口里放一个半透明的「对手」占位胶囊，可拖远近，用来目测攻击距离是否合理。
- **时间轴擦洗**：拖动播放头实时预览插值结果；判定窗口染红，判定球在窗口内才显形——所见即所得地调「这招到底打不打得到」。
- **测试对打**：一键跳到 Arena 的训练模式（对手不还手、显示帧数与判定框）。

### 8.3 Arena HUD

```
┌──────────────────────────────────────────────────────────┐
│ P1 ████████████████░░░░  [99]  ░░░░████████████████ P2   │
│    ▓▓▓▓░░ 气槽                        气槽 ░░▓▓▓▓         │
│    ●●○ 回合                          回合 ○○●            │
│                                                          │
│              5 HIT COMBO!                                │
│                                                          │
│                    (3D 战斗画面)                          │
│                                                          │
│  [训练模式] 起手8 判定4 收招14 · 有利+3                    │
└──────────────────────────────────────────────────────────┘
```

训练模式额外显示：判定框线框、帧数据、命中/被防后的帧有利差（frame advantage）——这是调平衡的必需工具。

---

## 9. 关键坑点（务必在实现中处理）

### 9.1 AniAI 现有的两个缺陷，复用前必须先修

| 位置 | 问题 | 修法 |
|---|---|---|
| `gui/GUIPanel.js:27` | `new ConfigStore(aniai.modelName)` —— 两个玩家选同一模型时 storageKey 完全相同，**P2 的键位会覆盖 P1 的** | 加槽位前缀：`ConfigStore(\`p${slot}:${modelName}\`)` |
| `aniai.js:39` | `new InputManager(options.target)` —— `InputManager` 的构造函数签名是 `(options = {})` 且读 `options.target`（`InputManager.js:15`），这里传的是**裸值**，所以自定义 target 被静默忽略，永远退化成 `window` | 改为 `new InputManager({ target: options.target })` |

第二条对 FreeFight 影响不大（双人共用 window 监听本就是对的），但既然要 import 复用，顺手修掉，避免将来踩。

### 9.2 战斗逻辑不能用 gsap

AniAI 全程用 gsap 驱动骨骼，但 **gsap 跑在自己的 ticker 上（跟随 rAF），而战斗逻辑跑在固定步长累加器上**。两者的时间基准不同，会导致：
- 判定窗口的开合与姿态的实际插值进度**错帧**；
- 慢放（K.O. 演出）、暂停、逐帧调试无法作用于姿态动画；
- 掉帧时 gsap 会「跳跃补偿」，判定窗口可能被整个跳过——一招明明该打中却穿过去了。

**方案**：`MoveRunner` 在 `fixedUpdate` 里手动插值（§5.2）。gsap 只保留给工房预览与 UI 动效（血条掉血、连击数弹出、菜单过渡）——那些不需要帧精确。

### 9.3 招式互斥必须由状态机保证，不能靠 Command

`AnimatedCommands.js:30` 的 `RotateTo.execute()` 第一行是 `this.stop()`，所以连按同一个键 = 招式永远重新起手、永远打不完。更隐蔽的是：**两个不同的 Command 同时动同一根骨骼时，`Command.stop()`（`Command.js:19`）只 kill 自己追踪的 tween**，gsap 3 默认不 overwrite，两条 tween 会同时写同一个 `bone.rotation` 属性 → 骨骼抖动。

FreeFight 的解法是结构性的：**一个 Fighter 在任意时刻只有一个 `MoveRunner` 在跑**，输入先过状态机（`attack` 状态默认拒绝新招，除非在 cancel 窗口内）。姿态写入只有一个出口，物理上不可能冲突。

### 9.4 姿态插值用四元数 slerp，不要 Euler lerp

`PoseCommands.js:117` 用 gsap 对 `bone.rotation` 的 x/y/z 做线性补间。对小角度没问题，但招式常有大幅旋转（回旋 360°、上挑 90°+），Euler 线性插值会：
- 走「万向锁」路径，产生诡异的扭曲；
- 从 `350°` 补到 `10°` 时绕远路转 340° 而不是就近转 20°。

`Rig.lerpPose` 必须转 `Quaternion` 后 `slerp`。存储可以继续用 Euler（可读、好序列化），插值前转换即可。

### 9.5 镜像战必须用 `SkeletonUtils.clone`

两边选同一模型时，**绝不能 `gltf.scene.clone()`**——`Object3D.clone()` 不会重建 `SkinnedMesh` 与 `Skeleton` 的绑定关系，克隆体的 mesh 会仍然引用原始骨架，结果是**两个角色的动作完全同步**（动 P1 的头，P2 的头跟着动）。

必须用 `SkeletonUtils.clone(gltf.scene)`（已验证存在于 `three/examples/jsm/utils/SkeletonUtils.js:388`）。

更稳妥的做法：**同一个 URL 只加载一次，缓存 gltf，两个玩家各自 `SkeletonUtils.clone`**，连原始的那份都不直接用。这样两边行为完全对称，不会出现「P1 用原件、P2 用克隆」的隐性差异。

### 9.6 导入的 GLB 可能带压缩扩展

内置资产干净（`extensionsRequired` 全空），但玩家从 Sketchfab 下载的模型**大概率带 DRACO 网格压缩或 KTX2 纹理压缩**。`DRACOLoader.js` / `KTX2Loader.js` 模块在 `node_modules` 里存在，但 **decoder 的 wasm/js 文件没有放进 `public/`**，直接用会加载失败。

处理：
1. 把 `node_modules/three/examples/jsm/libs/draco/` 复制到 `md/.vuepress/public/draco/`，`basis/` 复制到 `public/basis/`，在 `ModelLoader` 里挂上 `setDRACOLoader` / `setKTX2Loader`。
2. **无论是否配置成功，都要捕获加载失败并给出人话提示**（「这个模型用了 DRACO 压缩，暂不支持，请用 gltf-transform 解压后重试」），而不是丢一个红色堆栈。

### 9.7 导入的模型不能存进 localStorage

AniAI 的 `ConfigStore` 用 localStorage 存配置，这对键位/招式数据完全够用。但**导入的 GLB 二进制不行**：localStorage 上限约 5MB 且只存字符串（base64 还要膨胀 33%），而 `apple.glb` 单个就 6.4MB。

- **招式、键位、朝向校准、归一化参数** → localStorage（沿用 `ConfigStore`，按 `freefight:p{slot}:{modelKey}` 分桶）。
- **导入的模型文件本身** → IndexedDB（存 `ArrayBuffer`，无实际大小限制），或者干脆不持久化、每次会话重新导入。
- 建议：**F1 先不持久化模型**（每次重新选文件），F5 再上 IndexedDB。招式配置用「模型文件名 + 文件大小」做 key，重新导入同一个文件时自动恢复招式。

### 9.8 Blob URL 的释放时机

`AniAI.vue:447` 在 `await ai.loadModel(url)` 之后立刻 `URL.revokeObjectURL(url)`。对自包含的 GLB 没问题，但**对引用外部资源的 .gltf 会炸**（GLTFLoader 解析主文件后才去取 .bin 和贴图，那时 URL 已失效）。

FreeFight 只接受 `.glb`（自包含）可以规避；若要支持 `.gltf`，需要用 `LoadingManager` 的 URL 修改器把整个文件夹映射进去。**建议本期只收 `.glb`，在文件选择器和错误提示里说清楚。**

### 9.9 其他

10. **骨骼名 sanitize**：GLTFLoader 删除 `.` `[` `]` `:` `/`。mimikyu 的 `Ear.L_Armature` 加载后叫 `EarL_Armature`。招式序列化存的是**加载后**的名字；换模型时找不到骨骼要跳过并提示（`CustomActionGUI.js:97` 已有这个正确处理，照抄）。
11. **rest pose 叠加**：一切旋转基于 `bone.rotation.clone()` 的初始值叠加，禁止 `set(0,0,0)`（否则耳朵尾巴被掰直）。
12. **组件注册命名**：`registerComponentsPlugin` 把路径 `/` 换成 `-`。主入口必须是 `components/FreeFight.vue` 才能用 `<FreeFight>`；`FreeFight/ui/*.vue` 会被注册成 `<FreeFight-ui-RosterScreen>`（无害，但要知道它们是全局组件）。
13. **资源释放**：切换模型/离开页面要 `dispose` geometry/material/texture、移除键盘监听、停掉 rAF、`renderer.dispose()`。参照 `AniAI.vue:148` 的 `beforeUnmount`，但要对两个 Fighter 都做。
14. **判定球可视化的深度**：判定球在模型内部，`depthTest: true` 会被挡住。沿用 `SkeletonLines.js:64` 的做法：`depthTest: false` + `depthWrite: false` + `renderOrder` 置顶。
15. **不要在 `active` 相位改变朝向**：出招中转身会让判定球瞬移，产生「隔空打到」的观感。`attack` 状态的 `canTurn: false` 已在 §6.2 表中约定，实现时别漏。

---

## 10. 文件结构

```
md/.vuepress/components/
├── FreeFight.vue                  # 主入口（必须在 components 根目录，见 §9.9-12）
└── FreeFight/
    ├── DESIGN.md                  # 本文档
    ├── freefight.js               # 门面：三屏状态机 + Three 上下文
    ├── core/
    │   ├── AssetRegistry.js       # 内置模型清单 + 导入 + gltf 缓存
    │   ├── FighterFactory.js      # GLB → 归一化 → Rig → Fighter
    │   ├── Normalizer.js          # 缩放/落地/居中/朝向校准
    │   ├── Rig.js                 # Rig 接口 + lerpPose
    │   ├── SkinnedRig.js          # 包装 AniAI BoneRegistry
    │   └── RigidRig.js            # bodyPivot 伪骨架
    ├── fight/
    │   ├── FightLoop.js           # 固定步长主循环 + 渲染插值
    │   ├── Fighter.js             # 角色实体（Rig + 状态 + 数值）
    │   ├── FightState.js          # 状态机与能力位
    │   ├── MoveRunner.js          # 招式播放（固定步长插值）
    │   ├── MoveSet.js             # 招式定义 / 序列化 / 校验
    │   ├── HitDetector.js         # hitbox × hurtbox 判定与结算
    │   ├── Physics.js             # 重力/推挤/击退/边界
    │   ├── FightRules.js          # 血量/回合/连击/气槽/KO
    │   └── ArenaCamera.js         # 垂直双人相机（+ chase 模式预留）
    ├── input/
    │   └── FightInput.js          # 双人轮询式输入 + 边沿检测 + 缓冲
    ├── studio/
    │   ├── MoveEditor.js          # 相位/姿态/时间轴
    │   ├── HitboxEditor.js        # 判定锚点摆放（TransformControls）
    │   ├── FacingCalibrator.js    # 朝向校准
    │   └── presets.js             # 4 个通用预设招式
    ├── ui/
    │   ├── RosterScreen.vue
    │   ├── StudioScreen.vue
    │   └── FightHUD.vue
    └── data/
        └── builtins.js            # 内置模型元数据（路径/名称/rig 类型）
```

复用自 AniAI（`import`，不复制）：

```js
import { ModelLoader }     from '../AniAI/core/ModelLoader.js';
import { SkeletonParser }  from '../AniAI/core/SkeletonParser.js';
import { BoneRegistry }    from '../AniAI/core/BoneRegistry.js';
import { SkeletonLines }   from '../AniAI/core/SkeletonLines.js';   // 调试可视化
import { ConfigStore }     from '../AniAI/core/ConfigStore.js';     // 修 §9.1 后
```

---

## 11. 实现里程碑

| 阶段 | 交付 | 验收标准 |
|---|---|---|
| **F1** | `AssetRegistry` + `Normalizer` + `Rig` 三件套 + `FighterFactory` + Roster 屏 | 6 个内置模型任选两个（含同模型镜像战），都能等高落地、面朝对方站在场地上，骨骼/刚体各自识别正确 |
| **F2** | `FightLoop`（固定步长）+ `FightInput` + `Physics` + `ArenaCamera` + `FightState`（仅移动态） | 双人各自 8 向走位、跳跃、自动锁定转身、互相推开、撞墙停住；相机始终把两人摆在画面两侧；144Hz 与 60Hz 下移动速度一致 |
| **F3** | `MoveRunner` + `MoveSet` + `presets` + 状态机攻击态 | 4 个预设招式可用，出招不可自打断，走位中出招会打断走位，招式播放帧精确（逐帧步进可验证） |
| **F4** | `HitDetector` + `FightRules` + `FightHUD` | 打到掉血、有硬直击退、能防御（背身防不住）、连击计数与伤害递减、三局两胜与 K.O. 演出 |
| **F5** | `studio/` 全套 + 训练模式 | 能新建招式、编辑三相位姿态、摆判定球、擦洗时间轴预览、绑键、保存后在对战中生效；训练模式显示帧数据与判定框 |
| **F6** | 打磨：IndexedDB 存模型、DRACO/KTX2 支持、键盘压力测试、招式导入导出 JSON、指令技输入识别 | 玩家能把自己的招式组合导出成 JSON 分享给别人 |

F1+F2 是「两个模型能在场地上跑起来」，F3+F4 是「这是个格斗游戏」，F5 才兑现「玩家设计动作」的核心承诺。**建议 F1→F4 一口气做完再回头做 F5**——先有能打的游戏，才知道工房该暴露哪些参数；反过来先做编辑器，多半会做出一堆没人调的旋钮。

---

## 12. 待定项

以下问题不阻塞 F1 开工，但在对应阶段前需要拍板：

1. **场地**：空场 + 网格地板即可，还是要建模场景？（F2 前定，先用程序化圆形场地 + 边界光圈）
2. **音效**：出招/命中/防御音是手感的重要一半，但项目内无音效资产。（F4 前定，可先用 Web Audio 合成简单的打击音）
3. **必杀技演出**：气槽满时的必杀要不要独立运镜与特效？（F4 后定）
4. **模型体型差异**：apple 和 tape_recorder 归一化后都是 1.8 高，但胖瘦差异巨大，受击框大小不同 → 胖角色天然吃亏。是否引入体型平衡（血量/防御力按体积微调）？（F4 平衡期定）
