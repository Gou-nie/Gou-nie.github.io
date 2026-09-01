# AniAI —— GLB 骨骼动画操纵工具 设计方案

> 一个可复用的 three.js 工具：加载 GLB 模型 → 自动识别骨骼 → 把「操纵骨骼」封装成高级指令 → 通过 GUI 把指令绑定到键盘按键。

---

## 1. 目标与非目标

### 目标
1. **输入 GLB**：加载任意带骨骼（SkinnedMesh）的 GLB/GLTF 模型。
2. **识别骨骼**：自动解析 skeleton，输出骨骼清单与层级树，可视化选中。
3. **封装指令**：把底层 `THREE.Bone` 的旋转/位移/缩放，封装成语义化、可参数化的「指令」。
4. **GUI + 键位**：提供面板，用户为指令配置触发按键，实现「按一个键 → 骨骼做一个动作」。

### 非目标（本期不做）
- 不做关键帧编辑器 / 时间轴剪辑。
- 不做 IK（反向动力学）求解。
- 不做动作录制导出（可后续扩展）。

---

## 2. 技术选型

| 关注点 | 选型 | 说明 |
|---|---|---|
| 3D 引擎 | three.js `0.176.0` | 已有 |
| 模型加载 | `GLTFLoader` | 已有，`three/examples/jsm/loaders/GLTFLoader` |
| 动画过渡 | **gsap** | 已有，timeline/yoyo/ease 最适合做「指令动画」 |
| GUI 面板 | **lil-gui**（**已确认**，需 `npm i lil-gui`） | dat.gui 的现代续作，ES module，`DegRadHelper` 等现成 helper 直接复用 |
| 键位监听 | 原生 `keydown`/`keyup` | 无额外依赖 |
| 模块组织 | 纯 ES module（`aniai.js` 为入口） | 与现有 `public/html&js/three3D/*.js` 风格一致 |

### GUI 选型说明（已拍板）
- **采用 lil-gui**：API 与 dat.gui 几乎一致，项目里 `ThreeGUIHelper.js` 的 `DegRadHelper`（角度显示）、`MinMaxGUIHelper` 可直接拿来用，无需改写。
- 安装：`npm i lil-gui`（当前未安装，`package.json` 无此依赖，需先安装）。
- 放弃自写 Vue 面板：键位「点击后等待按键」交互手写成本高；后续若需深度定制再迁移。

---

## 3. 总体架构

分层设计，核心逻辑与 GUI/输入解耦，便于单独测试和复用。

```
┌─────────────────────────────────────────────┐
│              AniAI (门面 / 入口)              │
│   loadModel / bone / pose / bindKey / gui    │
└───────────────┬─────────────────────────────┘
                │ 组合
   ┌────────────┼────────────┬───────────────┐
   ▼            ▼            ▼               ▼
 Skeleton      Command       Input           GUI
 Parser        指令体系       Manager         Panel
   │            │            │               │
   ▼            ▼            ▼               ▼
 BoneRegistry  gsap 动画   keydown/up     lil-gui
   │
   ▼
 GLTFLoader → THREE.SkinnedMesh.skeleton
```

- **core**：加载与骨骼识别（不依赖 DOM/GUI）。
- **commands**：指令封装（纯逻辑，可独立单测）。
- **input**：键位绑定与键盘派发。
- **gui**：面板渲染与键位设置交互。

---

## 4. 模块设计

### 4.1 `core/ModelLoader.js`
封装 GLB 加载，返回结构化结果：

```js
class ModelLoader {
  async load(url) {
    // 用 Promise 包装 GLTFLoader.load
    return {
      gltf,                    // 原始 gltf 对象
      scene,                   // gltf.scene
      skeletons,               // gltf.skins
      animations,              // gltf.animations（自带动画）
      bones,                   // 见 SkeletonParser
    };
  }
}
```

### 4.2 `core/SkeletonParser.js` —— 骨骼识别核心
职责：从 `gltf.scene` 中识别骨骼，构建清单与树。

```js
class SkeletonParser {
  parse(scene) {
    // 1. traverse 找 isSkinnedMesh，取其 .skeleton
    // 2. skeleton.bones 即为骨骼数组（THREE.Bone）
    // 3. 记录：名字（注意 sanitize）、rest pose、parent 关系
    // 4. 输出扁平清单 + 层级树
    return {
      hasSkeleton,      // 是否含骨骼（无则提示）
      bones: Map<name, Bone>,
      tree,             // 层级树
      restPose,         // 每个骨骼的初始 rotation
    };
  }
}
```

**关键坑**（ShelfShow 里踩过）：GLTFLoader 会 `sanitizeNodeName`，把骨骼名里的 `.` `[` `]` `:` `/` **删掉**。例如 `Ear.L_Armature` 加载后实际叫 `EarL_Armature`。SkeletonParser 必须用**加载后的实际名字**做 key，同时保留原始名用于展示。

### 4.3 `core/BoneRegistry.js`
骨骼注册表，统一访问入口：

```js
class BoneRegistry {
  get(name)      // 精确查找
  find(fragment) // 模糊/子串查找（容错）
  list()         // 扁平列表
  tree()         // 层级树
  restPose()     // 各骨骼初始姿态
  reset()        // 恢复 rest pose
}
```

### 4.4 `commands/` —— 指令体系（核心抽象）

统一接口：

```js
// 每个指令可被「执行」，动画型指令返回 gsap tween/timeline 便于组合
interface Command {
  name: string;
  execute(): any;   // 执行；动画型返回 tween/timeline
  stop(): void;     // 中断
}
```

指令分四类：

**A. 即时指令 `BoneCommands.js`**
- `setRotation(bone, {x,y,z})` —— 直接设骨骼旋转
- `setPosition(bone, {x,y,z})`
- `resetPose()` —— 恢复 rest pose

**B. 动画指令（gsap 过渡）`AnimatedCommands.js`**
- `rotateTo(bone, {x,y,z}, {duration, ease})` —— 过渡旋转
- `sway(bone, {axis, angle, speed, loops})` —— 循环摆动（`gsap.to` + yoyo/repeat）
- `bounce(model, {scale, duration})` —— 整体弹跳

**C. 姿态指令 `PoseCommands.js`**
- `savePose(name)` —— 记录当前各骨骼 rotation
- `applyPose(name, {duration})` —— 过渡回某姿态
- `resetPose()` —— 回 rest pose

**D. 组合指令 `CompositeCommands.js`**
- `sequence([...cmds])` —— 顺序执行
- `parallel([...cmds])` —— 并行执行
- `loop(cmd, times)` —— 循环

### 4.5 `input/InputManager.js`
键位绑定与派发：

```js
class InputManager {
  bind(key, command, mode)   // mode: press | hold | toggle
  unbind(key)
  getBindings()              // 供 GUI 展示
  // 内部：keydown/keyup 监听，按 mode 触发 command.execute() / stop()
}
```

触发模式：
- **press**：按下触发一次（keydown 去抖，防止长按连发）
- **hold**：按下开始，松开停止（适合 sway 循环）
- **toggle**：按一下开，再按一下关

### 4.6 `gui/`
- `GUIPanel.js` —— lil-gui 面板组装
- `KeyBindingGUI.js` —— 键位设置交互（点击「绑定」→ 进入等待态 → 按任意键 → 完成绑定）

---

## 5. 骨骼识别方案（详细）

1. `gltf.skins` 给出 skin 数量与 joint 索引（若无 skin → 提示「该模型无骨骼」）。
2. 加载完成后 `scene.traverse(obj => obj.isSkinnedMesh)`，每个 SkinnedMesh 的 `obj.skeleton.bones` 是 `THREE.Bone[]`。
3. 骨骼名字：用加载后的 `bone.name`（sanitize 后的）作 key；`bone.userData.name` 常保留原始名（GLTFLoader 会存）。
4. rest pose：加载时 `bone.rotation.clone()` 记录，**操纵骨骼永远基于 rest pose 叠加，绝不 `set(0,0,0)`**（否则耳朵/尾巴会被掰直）。
5. 层级：`bone.parent` 递归，得到 `Root → Body → Neck → Head`、`Ear.L → Ear_tip.L` 等树。
6. 若模型带 `gltf.animations`（如 mimikyu 的 `Take 01`），可选提供 `AnimationMixer` 播放，但**注意很多导出的动画是单帧静态 pose（时长 0）**，实际无动作，需判断 clip.duration。

---

## 6. 指令封装 API（面向使用者的最终形态）

```js
const ai = new AniAI({ canvas, modelUrl });

await ai.loadModel('/models/mimikyu.glb');   // 加载 + 识别骨骼
ai.showSkeleton();                            // 控制台打印骨骼树

// 单个骨骼操作（语义化、可参数化）
ai.bone('EarL_Armature').rotate({ z: 0.3, duration: 0.2 });
ai.bone('Tail_Armature').sway({ axis: 'y', angle: 0.4, speed: 3 });

// 姿态
ai.pose.save('idle');
ai.pose.apply('idle', { duration: 0.4 });

// 组合
ai.sequence([
  ai.cmd.rotate('Head_Armature', { x: 0.2, duration: 0.3 }),
  ai.cmd.sway('Tail_Armature', { y: 0.5, loops: 3 }),
]);

// 键位绑定
ai.bindKey('a', ai.cmd.sway('EarL_Armature', { z: 0.3 }), 'press');
ai.bindKey('d', ai.cmd.sway('Tail_Armature', { y: 0.5 }), 'hold');
```

设计原则：**调用者不直接碰 `Bone.rotation`，一切通过指令**，指令内部统一处理 rest pose 叠加、gsap 过渡、循环与中断。

---

## 7. GUI 与键位设置设计

面板（lil-gui）分 4 个文件夹：

1. **Model 模型**
   - `模型`（只读显示文件名）、`导入 GLB`（按钮 → 触发文件选择，加载本地 `.glb/.gltf` 并重建场景）
   - `重置视角`（相机回位）
   - `显示骨骼`（开关，渲染骨骼线；选中某骨骼时自动打开）

2. **Skeleton 骨骼树**
   - 下拉列出骨骼（按名字，加载后 sanitize 名）
   - 选中某个骨骼 → 显示其 rotation（度）+ **对应骨骼线标红**（`SkeletonLines`：每根骨骼一条线段，默认蓝绿，选中那条变红，穿透模型始终可见）
   - 拖动滑杆可实时微调（验证骨骼作用）

3. **Commands 指令库**
   - 预置指令列表（sway/rotate/bounce/pose…）
   - 每个指令展开后可调参数（axis/angle/speed/loops/duration）

4. **Key Bindings 键位**
   - 每行：`[指令名]  →  [当前绑定键]  [绑定按钮]  [清除]`
   - 交互：点「绑定」→ 面板进入「等待按键」→ 用户按任意键 → 完成绑定
   - 冲突检测：同一键已绑定其它指令时给出提示/覆盖确认

---

## 8. 文件结构

```
md/.vuepress/components/
├── AniAI.vue                 # Vue 组件（页面嵌入用，注册为 <AniAI>）
└── AniAI/
    ├── DESIGN.md             # 本文档
    ├── aniai.js              # 入口 / AniAI 主类（门面）
    ├── core/
    │   ├── ModelLoader.js    # GLB 加载
    │   ├── SkeletonParser.js # 骨骼识别
    │   ├── BoneRegistry.js   # 骨骼注册表
    │   └── SkeletonLines.js   # 骨骼线可视化（蓝绿线，选中标红）
    ├── commands/
    │   ├── Command.js        # 指令基类
    │   ├── BoneCommands.js   # 即时指令
    │   ├── AnimatedCommands.js # gsap 动画指令
    │   ├── PoseCommands.js   # 姿态指令
    │   └── CompositeCommands.js # 组合指令
    ├── input/
    │   └── InputManager.js   # 键位监听与派发
    ├── gui/
    │   ├── GUIPanel.js       # 面板组装
    │   └── KeyBindingGUI.js  # 键位设置
    └── utils/
        └── math.js           # 角度/向量工具
```

集成方式：核心为纯 ES module；`AniAI.vue`（放在 components 根目录）提供 `<canvas>` 与生命周期管理，供 markdown 页面 `<AniAI>` 直接使用。

> **为什么 `AniAI.vue` 要放 components 根目录而不是 `AniAI/` 子目录**：`@vuepress/plugin-register-components` 用 `getComponentName = n => trimExt(n.replace(/[\/\\]/g, "-"))` 命名组件——相对路径里的 `/` 会变成 `-`，所以 `AniAI/AniAI.vue` 会被注册成 `<AniAI-AniAI>`，只有放到根目录才是 `<AniAI>`。

---

## 9. 实现里程碑

| 阶段 | 交付 | 验收 |
|---|---|---|
| **M1** | `ModelLoader` + `SkeletonParser` + `BoneRegistry` | 加载 mimikyu.glb，控制台打印完整骨骼树与 rest pose |
| **M2** | `Command` 基类 + `BoneCommands` + `AnimatedCommands` | 命令行调用 `rotate`/`sway` 能正确驱动骨骼 |
| **M3** | `InputManager` | 按 A/D 能触发对应指令（press/hold 模式） |
| **M4** | `GUIPanel` + `KeyBindingGUI` | GUI 能浏览骨骼、设置键位 |
| **M5** | `PoseCommands` + `CompositeCommands` + `AniAI.vue` + 打磨 | 完整工具可用，嵌入页面演示 |

---

## 10. 关键坑点（务必在实现中处理）

1. **骨骼名 sanitize**：GLTFLoader 删除 `.`/`[`/`]`/`:`/`/`，用加载后 `bone.name` 作 key。
2. **rest pose 叠加**：所有旋转基于 `bone.rotation.clone()` 的初始值叠加，禁止 `set(0,0,0)`。
3. **Euler ↔ Quaternion**：直接设 `.rotation` three.js 会自动同步 quaternion；注意多轴联合旋转的 gimbal lock，必要时用 `.quaternion`。
4. **动画与渲染循环解耦**：gsap 自带 ticker 驱动骨骼，但 `renderer.render()` 仍须每帧执行（`requestAnimationFrame` 常驻）。
5. **hold/toggle 模式的清理**：组件卸载要 `command.stop()`、解绑键盘、`dispose` geometry/material、`gsap.killTweensOf`。
6. **自带动画可能是静态 pose**：`clip.duration === 0` 时不要用 mixer 播，直接走骨骼指令。
7. **lil-gui 键盘事件拦截**：lil-gui 0.21 已移除 `gui.keyboard.disable()`，改为在其自身 `domElement` 上 `keydown/keyup` 里 `stopPropagation()`（冒泡阶段）阻止事件外泄。因此 `InputManager` 必须用**捕获阶段**监听（`addEventListener('keydown', fn, true)`），在 lil-gui 拦截前先拿到按键；否则在面板里点「绑定按键」后按下的键会被吞掉。lil-gui 仍默认注册 `h`（隐藏面板）/`~`（开关面板）等面板级快捷键，只在面板 DOM 内生效，不影响全局。
   - 附：lil-gui 改**面板标题**用 `folder.title(str)`（folder 是 GUI 实例），改**控制器标签**才用 `controller.name(str)`；`folder.name()` 不是函数。
8. **组件注册命名**：`@vuepress/plugin-register-components` 把相对路径 `/` 换成 `-` 来命名，`AniAI.vue` 必须放 components 根目录才能用 `<AniAI>`（详见 §8）。
9. **选骨高亮要穿透模型**：骨骼关节通常在网格内部，若高亮标记 `depthTest: true` 会被模型挡住看不见。用 `depthTest: false` + `depthWrite: false` + `renderOrder` 置顶，让它始终浮在模型表面之上。注意 `THREE.SkeletonHelper` 是单一材质，无法给单根骨骼单独上色——要「选中某骨骼标红」需自绘每根骨骼一条独立 `Line`（见 `SkeletonLines.js`）。
