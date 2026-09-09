# FreeFight 实施进度

> 配套文档：[DESIGN.md](./DESIGN.md)（设计方案，含决策依据与坑点清单）
> 本文档记录**实际做到哪一步**，每完成一个里程碑更新一次。

**最后更新**：2026-09-03
**当前状态**：F4 完成（判定 + 规则 + HUD 接真数据，逻辑层全绿：19 断言）
**下一步**：F5 —— `studio/` 编招工房 + 训练模式
**前置**：F4 完成后应先在浏览器做一次整体目视验证（见已知问题），再进 F5

---

## 里程碑总览

| 阶段 | 内容 | 状态 |
|---|---|---|
| **F1** | 资产层 + 归一化 + Rig 适配 + Fighter 实体 | ✅ **完成** |
| **F2** | `FightLoop` / `FightInput` / `Physics` / `ArenaCamera` / 移动态状态机 | ✅ **完成** |
| **F3** | `MoveRunner` / `MoveSet` / `presets` / 攻击态 | ✅ **完成** |
| **F4** | `HitDetector` / `FightRules` / `FightHUD` | ✅ **完成** |
| **F5** | `studio/` 编招工房 + 训练模式 | ⬜ 未开始 |
| **F6** | IndexedDB / DRACO / 键盘压测 / 招式导出 | ⬜ 未开始 |

---

## F1 已完成（2026-09-02）

### 交付物

| 文件 | 行数 | 职责 |
|---|---|---|
| `data/builtins.js` | 58 | 内置模型清单（6 个，已核实 rig 类型） |
| `core/Normalizer.js` | 125 | 缩放/落地/居中/朝向校准的 pivot 链 |
| `core/Rig.js` | 170 | Rig 接口 + 四元数 slerp 插值 + 锚点启发式 |
| `core/SkinnedRig.js` | 153 | 骨骼战士（包装 AniAI BoneRegistry） |
| `core/RigidRig.js` | 95 | 刚体战士（bodyPivot 伪骨架） |
| `core/AssetRegistry.js` | 177 | gltf 缓存 + 克隆分发 + 压缩扩展报错翻译 |
| `core/FighterFactory.js` | 159 | 组装流水线 + `Fighter` 实体 |
| `__f1_test.mjs` | 334 | 23 个断言，全部通过 |

合计 937 行实现 + 334 行测试。

### 验收结果

```
✅ F1 测试：23 通过，0 失败
```

覆盖范围：
- **归一化**（7 项）：标准身高、巨大/微小模型同高、落地、居中、扁平模型特判、退化包围盒不产生 NaN、推挤半径钳制
- **pivot 链**（3 项）：端到端实测落地+居中、朝向校准后仍落地居中、90° 校准确实对调宽深
- **Rig 适配**（3 项）：刚体可摆姿势、前冲撞语义捕获与插值、非等比缩放插值
- **锚点启发式**（5 项）：mimikyu 真实骨骼名命中、人形骨骼名命中、躯干被排除、无匹配时回落整体、mimikyu 产出 7 锚点
- **四元数插值**（2 项）：350°→10° 走最短弧、反复插值无累积漂移
- **Fighter 位姿**（3 项）：朝向角计算、两人对面而立、跨 ±180° 最短弧

### 设计文档之外的实现决策

这些是写代码时才浮现的问题，已在代码注释里说明，此处汇总：

1. **pivot 分四层而非两层**。DESIGN §4.2 只提了 `fighterRoot / bodyPivot`，实现时发现必须再拆出 `facingPivot`（朝向校准）与 `centerPivot`（缩放+居中）。原因：three.js 局部矩阵是 `T*R*S`，若把「居中平移」和「朝向旋转」放同一个 pivot，旋转会连带旋转平移量，模型直接飞出场地。测试 `朝向校准旋转后仍然落地且居中` 专门守这条。

2. **资源释放只能在 `AssetRegistry` 做，不能在 `Fighter` 做**。`SkeletonUtils.clone` 内部走 `source.clone()`，**共享 geometry 与 material 引用**。若每个 Fighter 各自 dispose，会把另一个玩家的资源一起释放（镜像战直接黑屏）。所以 `Fighter.detach()` 只从场景移除，不 dispose；释放统一按缓存条目做一次。

3. **`Fighter.position` 与 `root.position` 分离**。逻辑位置独立于渲染位置，`syncTransform(alpha)` 才把两者按插值系数对齐。这是 F2 固定步长渲染插值的前置条件，现在就留好接口，避免 F2 改 F1 的数据结构。

4. **`SkinnedRig` 的姿态也含 `body` 字段**。骨骼战士的招式同样会动 `bodyPivot`（预设招式全是根节点语义），所以姿态快照不能只存骨骼旋转。

5. **锚点启发式刻意排除躯干**。`Body/Neck/Spine/ROOT` 不产生攻击锚点 —— 否则整个身体都是攻击框，贴身站着就能互相伤害。

### 顺带修掉的 AniAI 缺陷（DESIGN §9.1）

| 文件 | 修改 |
|---|---|
| `AniAI/aniai.js:39` | `new InputManager(options.target)` → `new InputManager({ target: options.target })`。构造函数读 `options.target`，原先传裸值导致自定义 target 被静默忽略 |
| `AniAI/gui/GUIPanel.js:27` | `ConfigStore` 增加可选 `mount.slot` 前缀。原先只按模型名分桶，两个玩家选同一模型时 **P2 的键位会覆盖 P1** |

两处都向后兼容，`slot` 不传时行为与原先一致，AniAI 页面无需改动。

### 附带产生的变化

- 新增 `AniAI/package.json` 与 `FreeFight/package.json`，内容均为 `{ "type": "module" }`。
  Node 在无此标记时把 `.js` 当 CommonJS，导致 `.mjs` 测试无法 import 这些模块。
  **副作用：`AniAI/__m5_test.mjs` 从「完全跑不起来（SyntaxError）」变成「5 通过 / 3 失败」。**
  那 3 个失败是 gsap 在 node ESM 下的 interop 问题（`gsap.timeline is not a function`），
  属于环境限制而非代码缺陷 —— 浏览器里 Vite 处理 ESM 无此问题。若要让它们通过，
  需要在测试里 mock gsap，不在 F1 范围内。
- Vite 只认 ESM，这两个 `package.json` 对构建无影响。

### 尚未做的（F1 范围内但刻意推迟）

- **没有 UI**。`RosterScreen.vue` / `FreeFight.vue` 未创建 —— F1 的验收是「核心层数学正确」，
  用 node 测试比用眼睛看更可靠。UI 与 F2 的相机、场地一起做更省事，
  否则要为一个没有主循环的场景先搭一套临时渲染。
- **朝向校准 UI** 未做，但 `facingOffset` 参数通路已打通并测过（`FighterFactory.create(spec, { facingOffset })`）。
- **模型持久化** 未做，按 DESIGN §9.7 推迟到 F6（localStorage 存不下 6.4MB 的 apple.glb）。

---

## F2 已完成（2026-09-02）

### 交付物

| 文件 | 行数 | 职责 |
|---|---|---|
| `fight/FightLoop.js` | 153 | 固定步长累加器 + rAF + `MAX_CATCHUP` 钳制 + `render(alpha)` 插值 |
| `fight/FightState.js` | 100 | 状态机与能力位（attack/hitstun/… 提前定义，F3/F4 才进入） |
| `fight/CharacterController.js` | 194 | 锁定制「角色相对」输入 → 速度；走/跳/冲/防 |
| `fight/Physics.js` | 174 | 重力/推挤/击退衰减/圆形边界/朝向锁定 |
| `fight/ArenaCamera.js` | 114 | 垂直双人相机，侧别锁定 + 帧率无关平滑 |
| `fight/ArenaScene.js` | 86 | 程序化圆形场地 + 网格地板 + 边界光圈 |
| `fight/Arena.js` | 208 | 组合层：输入→控制器→积分→边界→推挤→朝向→计时 |
| `fight/constants.js` | 87 | 全部调参常量（速度/帧数/场地/相机），帧=1/60s |
| `input/FightInput.js` | 325 | 双人轮询输入 + 边沿/双击冲刺/失焦清键/改键冲突检测 |
| `ui/RosterScreen.vue` | 417 | 选将屏（模型 + 朝向校准 + 同模型镜像战支持） |
| `ui/FightHUD.vue` | 186 | HUD 骨架（血条/计时占位，F4 驱动） |
| `FreeFight.vue` | 229 | 主入口：三屏切换 + Three 生命周期 + 错误兜底 |
| `content/tool/three/freefight.md` | 19 | 页面壳（layout: false + `<FreeFight />`） |
| `__f2_test.mjs` | 841 | 60 个断言，全部通过 |

实现合计 2408 行 + 测试 841 行。

### 验收结果

```
✅ F2 测试：60 通过，0 失败
✅ F1 测试：23 通过，0 失败（无回归）
```

覆盖范围：
- **固定步长**（8 项）：60Hz 与 144Hz 逻辑步数一致、追帧钳制、暂停/恢复、步进、渲染插值系数等
- **状态机**（5 项）：切换/锁定时长/force 越过锁/同状态重入/未知状态拒绝
- **运动学 + 朝向**（15 项）：重力落地、推挤、贴墙不反弹、击退衰减、朝向最短弧锁定等
- **控制器**（14 项）：forward 是「朝对手」而非「朝 +Z」、侧移绕圈、斜向不加速、反向键抵消、走/防/跳/冲切换、空中不可二段跳、冲刺帧数精确、attack 不产生主动速度但受击退
- **输入**（12 项）：边沿只消费一次、失焦清键、P1/P2 键位互不干扰、小键盘 `event.code`、双击冲刺窗口、改键冲突顶掉、跨玩家冲突检测
- **相机**（6 项）：垂直站位、视野包含两人、侧别锁定不翻面、帧率无关平滑、重合不 NaN

### 设计文档之外的实现决策

1. **`Fighter.state` 是 `FightState` 实例，不是字符串**。F1 里 `state` 只是占位字段，Arena 构造时统一换成状态机实例。能力位表一次定义全部状态（含 F3/F4 的 attack/hitstun/…），后续只进状态不改结构。
2. **「冲刺可取消」的实现是 `caps.attack` + `force` 切换**。冲刺带 `lock`，从 dash 出招必须 `force` 越过锁；同样逻辑留给 F4 的「被打断」（hitstun 强切）。
3. **主动速度与击退残速共用 `velocity.x/z`**。走位速度每帧覆盖、击退冲量累加后逐帧摩擦衰减（0.86）。控制器每帧「先看有无移动输入再决定覆不覆盖」，这样攻击/硬直期间击退能把人推开，而走位能立刻接管残速。
4. **姿态/朝向的渲染插值在 `syncTransform(alpha)`，逻辑位姿独立**。fixedUpdate 写 `position/facing`，render 用累加器余量 α 对齐 —— 这是固定步长立住的关键配套（测试里有专门断言）。
5. **着色器预编译再启动**。`startWhenReady` 先 `compileAsync` 再起循环：否则首帧编译几百毫秒被记成一次巨大时间增量，污染丢帧统计（而丢帧统计是「固定步长是否稳定」的验收指标）。
6. **冲刺用双击而不是独立按键**。锁定格斗惯例；双击窗口用逻辑 tick 序号（`DOUBLE_TAP_FRAMES=14`）而非真实时间 —— 帧才是这个游戏的时间基准。
7. **页面路径 `freefight.md` 用 `layout: false` + 全屏组件**。与 anian 页同模式；FreeFight.vue 必须放 components 根目录（`@vuepress/plugin-register-components` 把 `/` 换成 `-` 命名，子组件叫 `<FreeFight-ui-RosterScreen>`）。

### F2 遗留

- **页面从未在浏览器真实跑过**（见下方已知问题）。F2 验收是逻辑层：node 测试证明「同一套帧数据在 60/144Hz 下行为一致」，但 6 个内置 GLB 的加载/归一化/目视效果都还没看过。

---

## F3 已完成（2026-09-02）

### 交付物

| 文件 | 行数 | 职责 |
|---|---|---|
| `studio/presets.js` | 146 | 4 个预设招式（撞击/回旋/上挑/跺地），纯数据可序列化 |
| `fight/MoveRunner.js` | 184 | 招式播放器：相位定位 + easeOut + motion/spin + 收招 blend |
| `fight/MoveSet.js` | 126 | 招式容器 + `pick()` 按态势选招 + `validate()` 数据校验 |
| `__f3_test.mjs` | 605 | 29 个断言，全部通过 |

接线改动（逻辑层已有结构上追加，不破坏 F1/F2 接口）：
- `fight/CharacterController.js`：顶部出招分支（优先级最高）+ `_startMove()` + 松防即时回 idle
- `fight/Arena.js`：挂 `moveSet`、fixedUpdate 顶部驱动 `f.move.tick()`、reset 弃 runner、debug 带招式信息
- `core/FighterFactory.js`：Fighter 加 `move/moveSet` 占位字段
- `ui/FightHUD.vue`：调试行显示当前招式 + 相位 + 帧号/总帧（逐帧验收窗口）

### 验收结果

```
✅ F3 测试：29 通过，0 失败
✅ F2 测试：60 通过，0 失败（无回归）
✅ F1 测试：23 通过，0 失败（无回归）
```

覆盖范围：
- **预设数据**（4 项）：4 招齐全、帧数与 §5.3 表一致、全过 validate、validate 能抓坏数据
- **MoveSet 选招**（4 项）：地面 light/heavy/special 分发、空中 heavy→跺地分流、requires: forward/back 预留语义
- **相位帧精确**（4 项）：相位切换在精确帧号、active 窗口恰好 A 帧且只在窗口内回调、相位末姿态精确等于 key、中途单调过渡
- **motion**（4 项）：窗口内位移精确 = forward 米、方向随出招瞬间 facing、spin 累计 2π 无跳变、rise 净抬升精确
- **收招与 blend**（3 项）：播完恰好回 idle、blend 期间可走位且姿态收敛、招式替换姿态连续
- **攻击态**（8 项）：walk→attack 打断走位、出招不可自打断、dash→attack 取消、空中跺地受重力落地不炸、空中轻击不误出地面招、出招中朝向锁定、招式结束可立刻衔接、防御中不能起招（松防同 tick 可出）
- **回归**（1 项）：无 moveSet 的战士（F2 时代构造）忽略攻击键不炸

### 设计文档之外的实现决策

1. **`motion` 加了 `spin` 字段（弧度，跨 startup+active 匀速累计）**。§5.1 只定义了
   forward/rise，但「回旋 360°」用姿态 key 表达不了：key 插值走四元数最短弧，
   0→2π 的最短弧是 0（原地不动）。spin 作为 pose 之外的累计值叠加在
   bodyPivot.rotation.y 上，收招 blend 结束时残留恰为 2π ≡ 0，无跳变。
2. **`motion.rise` 做了重力逐 tick 补偿**。Physics.integrate 在 y>0 时先扣一格重力再
   位移，若只设 vy=rise/窗口时长，实际抬升会被吃掉近一半。实现：vy = riseSpeed +
   本 tick 将扣的重力（y>0 时 +GRAVITY×STEP），净抬升精确等于 rise 米。
3. **姿态 key 内联在招式里，不引用 PoseStore**。DESIGN 的 `key: <PoseKey>` 原设想是
   骨骼战士查 AniAI PoseStore；但 5 个内置模型没有 PoseStore，刚体招式也无从引用。
   改为相位内联完整 pose 对象（{kind:'rigid', body:{…}}），对两种 rig 都可用
   （SkinnedRig 的 lerpPose 只取 body 通道，骨骼保持 rest）。
4. **招式 `input` 只保留 `requires`，不存 per-move 按键**。§5.1 示例有 `key: 'f'`，
   但 FightInput 是按动作分类的（轻击/重击/必杀各绑一键）。选招 = 动作→类别→
   requires 过滤。F6 若做指令技或 per-move 绑键再扩展。
5. **收招 blend（RETURN_FRAMES=6）是必要配套**。收招 key 未必是中立姿态，若招式
   播完直接放行，会有「定格一秒后瞬回中立」。blend 期间状态已是 idle（可走位可
   再出招），姿态在脚下移动中收敛。
6. **松防必须同 tick 生效**。输入无缓冲，防御中按轻击被 `caps.attack=false` 挡住，
   若松防与轻击同 tick 出招会丢失（玩家要多按一次）。控制器把「松防回 idle」提前
   到出招分支之前处理。防御中持续按住防御仍不能起招。
7. **预设的命中参数与姿态数值是初值**。damage/hitstun/knockback 等命中数据 F4 接
   HitDetector 时按手感调；姿态弧度/位移数值需浏览器目视后微调。防御中松防出招
   优先级：同 tick 轻击 + 防御齐按 = 出招优先（输入优先级设计，写在控制器注释）。

### F3 遗留

- 浏览器验证仍是最大缺口（见已知问题），现在多了一类要目视的东西：4 个预设招式的姿态观感。
- 收招 blend 期间被打断的边界（F4 的 hitstun force 切入）未测 —— 依赖 F4 状态。

---

## F4 已完成（2026-09-03）

### 交付物

| 文件 | 行数 | 职责 |
|---|---|---|
| `fight/HitDetector.js` | 148 | 攻击框 × 受击框判定（sphere×capsule）+ 命中/防御分类 + 施加硬直/击退 |
| `fight/FightRules.js` | 177 | 血量/气槽/连击递减/计时/加赛/三局两胜/K.O. 慢放 + 硬直恢复推进 |
| `__f4_test.mjs` | 361 | 19 个断言，全部通过 |

接线改动（逻辑层已有结构上追加，不破坏 F1–F3 接口）：
- `fight/constants.js`：追加 F4 段（防御阈值/血量/气槽/连击递减/回合/K.O./倒地常量）
- `fight/Arena.js`：挂 `rules` + `hitDetector`；fixedUpdate 在朝向定稿后 `_syncForHit()` →
  双向 `sample()` → 清被打断者招式 → `rules.tick()`；`reset()`/`_beginNextRound()`；
  `debug.hud` 输出血/气/计时/回合/连击/胜负给 HUD
- `ui/FightHUD.vue`：顶部血条/气槽/计时/回合圆点/连击弹字/K.O. 横幅全部接 `debug.hud` 真数据

### 验收结果

```
✅ F4 测试：19 通过，0 失败
✅ F3 测试：29 通过，0 失败（无回归）
✅ F2 测试：60 通过，0 失败（无回归）
✅ F1 测试：23 通过，0 失败（无回归）
```

覆盖范围：
- **几何**（4 项）：sphereVsCapsule 轴线命中/水平错过/边界恰在 sr+cr/头顶端点判定
- **命中结算**（2 项）：掉血=damage + hitstun + 沿攻方击退 + 双方气槽；一次激活只命中一次
- **防御**（2 项）：chip+blockstun+被防气槽；背身防御失效按满伤命中
- **浮空 / 对撞**（2 项）：launch 招式命中后 velocity.y>0；同帧对撞双方各自结算都掉血
- **连击**（3 项）：三段伤害 6→5→5 递减、经 HitDetector 接线两段递减血量精确、硬直结束连击归零
- **气槽**（1 项）：累积封顶 100 不溢出
- **计时 / 回合 / K.O.**（4 项）：计时到点判血多者胜并开下一回合、等血加赛、K.O. → ko 相 + 慢放 0.3、三局两胜 → matchEnd
- **集成**（1 项）：走位逼近 → 出招命中 → 掉血 → hitstun 打断对手招式

### 设计文档之外的实现决策

1. **判定采样时机修正（有意偏离约束 #5）**。PROGRESS 约束 #5 原定「onActiveTick 是判定
   唯一喂入口」，但 onActiveTick 在 `move.tick()` 内触发，那时本帧位移还没积分、锚点世界
   坐标是上帧的 —— 撞击会滞后一帧。改为「位置/朝向定稿后采样 + `runner.isActive` 门控」，
   既保住「判定只属于 active 窗口」的语义，又拿到正确位置。`onActiveTick` 保留（F3 已测），
   供未来命中可视化用。
2. **锚点世界坐标走 `getWorldPosition()`，采样前 `syncTransform + updateMatrixWorld`**。
   骨骼战士的锚点是骨骼（bodyPivot 子树下），只有走场景图才能正确合成「整体变换 + 骨骼局部
   变换」。`body` 类锚点（`target === null`）的球心抬到身高一半 —— 归一化后 bodyPivot 在脚底，
   不抬的话判定球只擦到受击胶囊底部。
3. **模块分工：HitDetector 判「打没打到」并施加效果，FightRules 只记账**。`registerHit` 在施加
   hitstun **之前**调用，所以它读到的守方状态是被命中前的 —— 这正是连击判定需要的（「仍在
   硬直中再被打」才算连段）。血量/气槽直接写 `Fighter.hp/meter`（F1 预留字段）。
4. **同帧对撞（trade）语义**：`sample` 只施加效果、不清任何人的 move。清 move 由 Arena 在两人
   都采样完后按「是否被打断（hitstun/blockstun/…）」统一做。这样两人同 tick 互中时都能各自
   结算伤害与硬直。
5. **blockstun 的恢复不走控制器**。控制器只在 `st.is("block")` 时松防回 idle，而 blockstun 状态下
   玩家未必还按着防御键。blockstun → idle 的恢复统一放 `FightRules._recoverStates`（state.tick 后跑，
   读到 lock 刚归零即恢复）。
6. **回合流程简化为 3 相**：`fighting` →（HP≤0）→ `ko`（慢放倒计时，双方进 ko 态，只跑物理）
   → `matchEnd`（三局两胜达成）或 `pendingReset`（Arena 开下一回合）。省掉独立 `roundEnd` 相，
   K.O. 慢放本身就是演出节拍。`launch` 字段目前是语义标记，浮空实际由 `knockback.y` 驱动。

### F4 遗留

- 浏览器验证缺口依旧（见已知问题），现在多了一类要目视的：命中判定范围、防御手感、
  连击/K.O. 演出节奏、HUD 血条/气槽/回合圆点观感。
- 收招 blend 期间被打断（hitstun force 切入）的边界已实现但未在 node 里专项测 —— 集成测试只覆盖
  「startup 中被打断」，blend 期被打断留待浏览器目视。
- 命中参数（damage/hitstun/knockback/chip）是平衡初值，需按手感调。

---

## 已知问题 / 待验证

| 项 | 说明 | 处理时机 |
|---|---|---|
| **页面级验证没做过** | FreeFight.vue / RosterScreen / Arena 全链路只在代码与 node 测试里存在，`vuepress dev` 里没打开过。register-components 的命名约定（`<FreeFight-ui-RosterScreen>`）与 Three 渲染首屏都未验证 | F4 完成后立即开 dev 服务器目视验证：6 个内置模型逐一选将、走位/跳/冲/防、4 招打一套，验证命中判定范围/防御手感/连击与 K.O. 演出；顺手微调预设姿态与命中数值 |
| 预设姿态数值凭直觉 | 撞击前倾角、回旋姿态、上挑腾起幅度、跺地收腿等弧度/位移未见过真实模型效果 | 同一轮目视验证中调整 |
| 真实 GLB 未跑过 | 全部测试用程序化 BoxGeometry，**未用真实 mimikyu.glb 验证过骨骼解析与归一化** | 同一轮目视验证 |
| `AniAI/__m5_test.mjs` 3 项失败 | gsap 在 node ESM 下 interop 失败，非代码缺陷 | 可选，需 mock gsap |
| 扁平模型阈值 `0.35` 凭直觉 | 鲤鱼王等趴姿模型的归一化基准切换点 | 同一轮目视验证后微调 |
| `apple.glb` 6.4MB | 加载耗时可能影响选将体验 | F6 考虑压缩或预加载提示 |

---

## 关键约束备忘

从 DESIGN §9 里挑出**最容易踩到**的条目（F2/F3 已验证落地，F4 起沿用）：

1. **战斗逻辑不能用 gsap**（§9.2）。gsap 跑自己的 ticker，与固定步长累加器时间基准不同；
   掉帧时 gsap 会跳跃补偿，可能把判定窗口整个跳过。`MoveRunner` 必须在 `fixedUpdate` 里手动插值。
   gsap 只留给工房预览与 UI 动效。

2. **固定步长是架构基石**（§6.1）。144Hz 上「起手 8 帧」若跟 rAF 走会变成 55ms，
   而 60Hz 上是 133ms —— 同一套帧数据变成两个游戏。F2 必须把这条立住，
   `MAX_CATCHUP` 钳制与 `render(alpha)` 插值一起做，别留到 F3。

3. **`window.blur` 必须清空按键 Set**（§7）。切标签页时松开的键收不到 keyup，
   回来后角色会永远朝一个方向走 —— Web 游戏最经典的 bug。

4. **招式播完的姿态收敛靠 blend，招式中途被打断靠 force 清 runner**（F3 落地，F4 接线）。
   F4 的被命中打断：`state.to('hitstun', { force: true })` + 击退冲量 + Arena 采样后统一
   `f.move = null`。倒地动画暂未做「按被打断姿态起势」—— 当前 KO 直接进 ko 态跑物理落地，
   姿态由 `resetPose` 拉回（浏览器目视后再决定要不要补击倒过渡，见 F4 遗留）。

5. **判定只属于 active 窗口，但采样时机在位置定稿之后**（F4 落地，有意修正）。MoveRunner 的
   `onActiveTick` 在 `move.tick()` 内触发，那时本帧位移还没积分，锚点世界坐标是上帧的。F4 改为
   在朝向定稿后 `_syncForHit()` → `sample()`，内部用 `runner.isActive` 门控「只在 active 窗口判定」——
   既保住窗口语义，又拿到正确位置。`onActiveTick` 保留供未来命中可视化，别再另起判定轮询。

---

## 文件结构现状

```
md/.vuepress/components/FreeFight/
├── DESIGN.md              ✅ 设计方案
├── PROGRESS.md            ✅ 本文档
├── package.json           ✅ { "type": "module" }
├── __f1_test.mjs          ✅ 23 断言全通过
├── __f2_test.mjs          ✅ 60 断言全通过
├── __f3_test.mjs          ✅ 29 断言全通过
├── __f4_test.mjs          ✅ 19 断言全通过
├── core/
│   ├── AssetRegistry.js   ✅ gltf 缓存 + 克隆分发
│   ├── FighterFactory.js  ✅ 组装 + Fighter 实体（含 move/moveSet 占位）
│   ├── Normalizer.js      ✅ 归一化 pivot 链
│   ├── Rig.js             ✅ 接口 + slerp + 锚点启发式
│   ├── SkinnedRig.js      ✅ 骨骼战士
│   └── RigidRig.js        ✅ 刚体战士
├── data/
│   └── builtins.js        ✅ 内置模型清单
├── fight/
│   ├── FightLoop.js       ✅ 固定步长主循环
│   ├── FightState.js      ✅ 状态机与能力位
│   ├── CharacterController.js ✅ 移动/跳/冲/防 + 出招裁决
│   ├── MoveRunner.js      ✅ 招式播放器（相位/motion/spin/blend）
│   ├── MoveSet.js         ✅ 招式容器 + pick + validate
│   ├── Physics.js         ✅ 重力/推挤/击退/边界/朝向
│   ├── ArenaScene.js      ✅ 程序化场地
│   ├── ArenaCamera.js     ✅ 垂直双人相机
│   ├── Arena.js           ✅ 组合层（串起全部 + 驱动招式播放）
│   ├── constants.js       ✅ 调参常量
│   ├── HitDetector.js     ✅ 判定采样 + 命中/防御/击退结算
│   └── FightRules.js      ✅ 血/气/连击/计时/回合/KO
├── input/
│   └── FightInput.js      ✅ 双人轮询输入
├── studio/
│   └── presets.js         ✅ 4 个预设招式（数据先行；编辑器属 F5）
├── ui/
│   ├── RosterScreen.vue   ✅ 选将屏
│   └── FightHUD.vue       ✅ 血/气/计时/回合/连击/KO 接真数据
├── FreeFight.vue          ✅ 主入口（components 根目录）
└── (页面) content/tool/three/freefight.md ✅ 页面壳
```
