<template>
  <div class="pixel-reborn-anchor" aria-hidden="true"></div>
</template>

<script>
// 像素小人背景：把 canvas 挂到首页 hero 里，处于背景图和 hero 文字之间
const ART_PX = 3 // 一个像素美术格对应的 CSS 像素
const OUTLINE = '#16161e'

// 把十六进制颜色调暗，用来区分远侧腿和近侧腿，走路时前后关系更清楚
function shade(hex, factor) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * factor)
  const g = Math.round(((n >> 8) & 255) * factor)
  const b = Math.round((n & 255) * factor)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * 每个角色 = 字符点阵（rows）+ 调色板（palette）。
 * rows 从上到下、每行从左到右逐字符绘制：
 *   - '.'    透明，不画
 *   - 其他字符  去 palette[字符] 查颜色，画成 1 个美术像素
 * 最终整张低分辨率画布再按 ART_PX 放大，得到像素颗粒感。
 *
 * 每个角色的 palette 是独立的，同一个字母在不同角色身上含义可能不同
 * （例如 k 在四名少年身上是眉毛，在蓝波身上是奶牛衫的黑斑），以各自注释为准。
 * 常见的几个：o 深色衣身、s 皮肤、e 眼白、p 瞳孔、w 白衬衫、m 嘴。
 * 眨眼时 e / p 会统一替换成 s（见 buildFrames 的 closedEyes 参数）。
 *
 * rows 之外的字段：
 *   legLen: 腿长（美术像素行数，默认 3），腿不写在字符矩阵里
 *   legs:   [站立时左腿 x, 站立时右腿 x, 裤子颜色, 鞋子颜色]
 *   props:  道具点阵，x / y 是相对人物矩阵左上角的偏移
 *           默认先于人物绘制（挡在身后）；front: true 时改为人物画完再叠上去
 *
 * 走路动画由 buildFrames 生成 4 帧循环 + 1 帧站立（索引 4）：
 *   0 前后脚同时着地 / 1 远侧腿抬起前摆 / 2 换脚着地 / 3 近侧腿抬起前摆。
 * 两腿绕胯部中心交替斜向迈出，远侧腿用暗一号的颜色画，避免两条腿糊成一块。
 */
const SPRITES = {
  reborn: {
    palette: {
      h: '#24242c', // 头发 / 礼帽（深黑）
      a: '#f08a2a', // 礼帽帽带的橙色
      y: '#f4c542', // 奶嘴 + 列恩的黄色嘴
      g: '#4caf6d', // 列恩亮绿
      G: '#2f7d4a', // 列恩暗绿
      o: '#15151b', // 黑色西装
      s: '#f4cba1', // 皮肤
      e: '#ffffff', // 眼白
      p: '#241a17', // 瞳孔
      w: '#6b4a8c', // 紫色衬衫（里包恩的经典内搭）
      m: '#a45c4a', // 嘴
    },
    rows: [
      '.................',  
      '...hhhhhhhhhh....',
      '...aaaaaaaaaa....',// 橙色帽带
      '...hhhhhhhhhh....',
      'gygghhhhhhhhhhhh.', // 列恩 
      'gGghhhhhhhhhhhhh.', // 帽檐
      '.hhsssssssssshh..', // 脸压扁、加宽：额头
      '.hhshepsspesssh..', // 眼睛
      '..hhssssssssss...', // 右脸蛋：比正常脸宽出 1px
      '...ssssmmssss....', // 嘴（在脸蛋下方）
      '......yyyy.......', // 黄色奶嘴 
      '..oowwwwwwwwoo...', // 紫色衬衫
      '...oooooooooo....', // 西装下摆
    ],
    legLen: 1, // 不要腿，只留脚
    legs: [5, 9, '#1c1c24', '#3a3a46'], // 深灰黑皮鞋（比西装亮一点，避免糊成一团）
  },

  tsuna: {
    palette: {
      h: '#7a4f2d', // 棕色头发
      H: '#9a6a3d', // 头发高光
      k: '#4e3119', // 眉毛（深棕）
      o: '#242c40', // 藏青色校服外套
      s: '#f4cba1', // 皮肤
      e: '#ffffff', // 眼白
      p: '#5b3a1e', // 棕色瞳孔
      w: '#f7f7f2', // 白衬衫
      r: '#d8382f', // 红领带（并盛夏装）
      m: '#a45c4a', // 嘴
    },
    rows: [
      '....h..h..h.....', // 圆头顶上削出的三根发尖
      '...hhh.hhh.hhh..', // 发尖根部：缺口收窄，像从圆头上削下去
      '..hhhhhhhhhhhh..', // 圆头轮廓，别再把两侧往外炸
      '..hhHhhhhHhhhh..', // 头发高光
      '..hhhhhhhhhhhh..', // 头发和下面鬓角连成一整块
      '..hhssshhssshh..', // 额头：中间垂一小撮刘海，脸缩短一行
      '..hhskksskkshh..', // 眉毛
      '...hsepsspesh...', // 眼睛
      '..hhsssssssshh..', // 脸颊
      '...hsssmmsssh...', // 嘴
      '...hssssssssh...', // 下巴
      '.....ssssss.....', // 脖子
      '....oooooooo....',
      '...oooooooooo...',
      '...oowwrrwwoo...',
      '...oowwrrwwoo...',
      '...oowwwwwwoo...',
      '...oooooooooo...',
      '....oooooooo....',
    ],
    legLen: 6,
    legs: [5, 9, '#3f5078', '#14151c'], // 蓝色校裤 + 黑鞋
  },

  gokudera: {
    palette: {
      h: '#d9dbe3', // 银白色头发
      H: '#f5f7fb', // 头发高光
      k: '#9aa0ad', // 灰色眉毛
      o: '#1a1c24', // 黑色校服外套
      s: '#f4cba1', // 皮肤
      e: '#ffffff', // 眼白
      p: '#3f5d3a', // 绿色瞳孔
      w: '#f7f7f2', // 白衬衫
      t: '#2f5f9e', // 蓝色领带（并盛冬装）
      m: '#a45c4a', // 嘴
      r: '#c0392b', // 炸药红色
      R: '#8b2c23', // 炸药暗部
      f: '#8a8d96', // 引线
      y: '#d8b45a', // 炸药上的金属箍
    },
    rows: [
      '................',
      '...hhhh.hhhh....',
      '..hhhHhhhhhhh...',
      '..hhhhhhhhhhh...',
      '...hhhssssshh...',
      '...hhhssssshh...',
      '...hhkksskksh...',
      '...hhepsspesh...',
      '...hhsssssshh...',
      '..hhhssmmshhh...',
      '..hhssssssshh...',
      '.....ssssss.....',
      '....oooooooo....',
      '...oooooooooo...',
      '...oowwttwwoo...',
      '...oowwttwwoo...',
      '...oowwttwwoo...',
      '...oooooooooo...',
      '....oooooooo....',
    ],
    legLen: 6,
    legs: [5, 9, '#5a6070', '#22242c'], // 灰色校裤 + 黑鞋
    props: [{
      x: 0,
      y: 13,
      front: true, // 手和炸药画在身体前面
      rows: [
        '...........ss...', // 握着炸药的手
        '............yy..', // 炸药金属箍
        '.............rR.', // 炸药（略向右倾）
        '.............rR.', // 炸药
        '.............f..', // 引线
        '..............f.', // 引线头朝下斜着，随时准备扔出去
      ],
    }],
  },

  yamamoto: {
    palette: {
      h: '#2a2a33', // 黑色短发
      H: '#3d3d4a', // 头发高光
      k: '#14141a', // 眉毛
      o: '#2c4a78', // 棒球服藏青拼色
      s: '#f4cba1', // 皮肤
      e: '#ffffff', // 眼白
      p: '#241a17', // 深棕瞳孔
      w: '#f4f6f2', // 白色棒球服
      b: '#5c8fd2', // 棒球服蓝色条纹
      m: '#a45c4a', // 嘴
      d: '#c08a4e', // 球棒浅色
      D: '#8a5c30', // 球棒深色 / 握把
    },
    rows: [
      '......h.........',
      '.....hhhhh......',
      '...hhhhhhhhh....',
      '..hhhhhHhhhhhh..',
      '..hhhhhhhhhhhh..',
      '..hhsssssssshh..',
      '...hssssssssh...',
      '...hskksskksh...',
      '...hsepsspesh...',
      '...hssssssssh...',
      '...hssmmmmssh...',
      '....hssssssh....',
      '.....ssssss.....',
      '....oooooooo....',
      '...oooooooooo...',
      '...oowwwwwwoo...',
      '...owbwwwwbwo...',
      '...owbwwwwbwo...',
      '...oooooooooo...',
      '....oooooooo....',
    ],
    legLen: 6,
    legs: [5, 9, '#e6ebf1', '#22304a'], // 白色棒球裤 + 深蓝鞋
    props: [{
      x: 8,
      y: 3,
      front: true, // 球棒扛在肩上，画在身体前面
      rows: [
        '.......d', // 球棒端头
        '.......d',
        '......dd',
        '......dD',
        '......dD',
        '......dD',
        '.....dD.',
        '.....dD.',
        '.....d..', // 握把开始变细
        '....D...',
        '....D...',
        '....D...',
        '...D....',
        '..sD....', // 握住球棒的手
        '..sD....',
      ],
    }],
  },

  hibari: {
    palette: {
      h: '#23232c', // 黑色头发
      H: '#393947', // 头发高光
      k: '#101016', // 眉毛
      o: '#20232e', // 黑色学兰（并盛旧校服）
      s: '#f4cba1', // 皮肤
      e: '#ffffff', // 眼白（眯眼造型当前未使用）
      p: '#6c7280', // 灰色瞳孔
      w: '#e9e9e1', // 白衬衫
      r: '#c62828', // 红色“风纪”袖章
      m: '#a45c4a', // 嘴
      g: '#c9ced6', // 浮萍拐（警棍）亮银
      G: '#59616e', // 浮萍拐暗部 / 握柄
    },
    rows: [ 
      '....hhhhhhhh....',
      '...hhhhhHhhhh...',
      '..hhhhhhhhhhhh..',
      '..hhhhhhhhhhhh..',
      '..hhsshhhhsshh..',
      '..hhsshhhssshh..',
      '..hsskkshkkssh..',
      '..hssppssppssh..',
      '..ssssssssssss..',
      '...ssssmmssss...',
      '....ssssssss....',
      '......ssss......',
      '....oooooooo....',
      '...oooooooooo...',
      '...rroowwwwoo...',
      '...rroowwwwoo...',
      '...oooooooooo...',
      '...oooooooooo...',
      '....oooooooo....',
    ],
    legLen: 6,
    legs: [5, 9, '#262a36', '#111117'], // 黑色学兰裤 + 黑鞋
    props: [{
      x: 13,
      y: 11,
      rows: ['ggg', 'ggG', 'gg.', 'gg.', 'gg.', 'GG.', 'GG.'],
    }],
  },

  lambo: {
    palette: {
      h: '#3a2a22', // 深棕色爆炸头
      s: '#f4cba1', // 皮肤
      e: '#ffffff', // 眼白
      p: '#241a17', // 瞳孔
      w: '#f3f1e7', // 奶牛衫白色底
      y: '#f2c53d', // 黄色牛角
      m: '#a45c4a', // 嘴
      k: '#202027', // 奶牛衫的黑色斑块（注意：不是眉毛）
    },
    rows: [
      '.....y....y......', // 牛角
      '....yy....yy.....',
      '..hhhhhhhhhhhh...', // 爆炸头放大、加宽
      '.hhhhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhhh.',
      '.hhsssssssssshh..', // 脸压扁、加宽：额头
      '.hhssepsspesss...', // 眼睛
      '.hhsssssssssss...', // 右脸蛋：比正常脸宽出 1px
      '.hhssssmmssss....', // 嘴（在脸蛋下方）
      '...wwwwwwwwww....', // 奶牛衫白色肩部
      '..kwwwwwwwwwwk...', // 两侧黑色袖子
      '..wwwkwwwwkwww...', // 白底 + 黑斑
      '...wwwwwwwwww....',
    ],
    legLen: 1, // 不要腿，只留脚
    legs: [5, 9, '#f0eee4', '#3a2a22'], // 深棕牛蹄（比纯黑更容易看清两只脚）
  },
}

const CHAR_DEFS = [
  { key: 'reborn', at: 0.06, dir: 1, speed: 7 },
  { key: 'tsuna', at: 0.22, dir: -1, speed: 10 },
  { key: 'gokudera', at: 0.4, dir: 1, speed: 12 },
  { key: 'yamamoto', at: 0.58, dir: -1, speed: 9 },
  { key: 'hibari', at: 0.76, dir: 1, speed: 8 },
  { key: 'lambo', at: 0.92, dir: -1, speed: 6.5 },
]

const NARROW_KEYS = ['reborn', 'tsuna', 'gokudera', 'lambo']

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function buildFrames(sprite, closedEyes = false) {
  const rows = sprite.rows
  const w = rows[0].length
  const bodyH = rows.length
  const legLen = sprite.legLen || 3
  const h = bodyH + legLen
  const cw = w + 2
  const frameH = h + 2

  const stamp = (ctx, x, y, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x + 1, y + 1, 1, 1)
  }

  const phases = []
  for (let phase = 0; phase < 5; phase++) {
    const colorCanvas = makeCanvas(cw, frameH)
    const silCanvas = makeCanvas(cw, frameH)
    const cg = colorCanvas.getContext('2d')
    const sg = silCanvas.getContext('2d')

    // 画道具；front 为 true 的等身体画完再叠上去（比如扛在肩上的球棒）
    const drawProps = (front) => {
      for (const prop of sprite.props || []) {
        if (Boolean(prop.front) !== front) continue
        prop.rows.forEach((row, y) => {
          for (let x = 0; x < row.length; x++) {
            const ch = row[x]
            if (ch === '.') continue
            stamp(cg, prop.x + x, prop.y + y, sprite.palette[ch])
            stamp(sg, prop.x + x, prop.y + y, OUTLINE)
          }
        })
      }
    }
    drawProps(false)

    // 逐字符翻译矩阵：'.' 透明，其余字符按 palette 取色，画成 1 个像素
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x]
        if (ch === '.') continue
        const color = closedEyes && (ch === 'e' || ch === 'p')
          ? sprite.palette.s
          : sprite.palette[ch]
        stamp(cg, x, y, color)
        stamp(sg, x, y, OUTLINE)
      }
    })
    drawProps(true)

    // 走路四相位 + 站立：两腿绕胯部中心交替斜着迈出
    const [lx, rx, legColor, shoeColor] = sprite.legs
    const hip = Math.round((lx + rx) / 2) // 胯部中心 x
    const stride = 2 // 前后脚落点离胯部的距离，太大腿会像劈叉
    const lift = legLen <= 2 ? legLen : Math.max(2, legLen - 2) // 抬腿时露出的腿长（腿长为 1 时只挪脚）
    const farLegColor = shade(legColor, 0.7)
    const farShoeColor = shade(shoeColor, 0.75)
    // 数组顺序 = 绘制顺序：先远侧腿，再近侧腿，才有前后遮挡
    const poses = [
      [{ x: hip - stride, len: legLen }, { x: hip + stride, len: legLen }], // 0 前后脚着地
      [{ x: hip + 1, len: lift }, { x: hip - 1, len: legLen }], // 1 远腿抬起前摆
      [{ x: hip + stride, len: legLen }, { x: hip - stride, len: legLen }], // 2 换脚着地
      [{ x: hip - 1, len: legLen }, { x: hip + 1, len: lift }], // 3 近腿抬起前摆
      [{ x: lx, len: legLen }, { x: rx, len: legLen }], // 4 站着不动
    ]
    poses[phase].forEach((leg, i) => {
      const isFar = i === 0
      // 裤腿从胯部到脚逐行平移，形成斜线
      for (let row = 0; row < leg.len - 1; row++) {
        const t = (row + 1) / (leg.len - 1)
        const px = Math.round(hip + (leg.x - hip) * t)
        cg.fillStyle = isFar ? farLegColor : legColor
        cg.fillRect(px + 1, bodyH + row + 1, 2, 1)
        sg.fillStyle = OUTLINE
        sg.fillRect(px + 1, bodyH + row + 1, 2, 1)
      }
      // 鞋头多 1px，朝行进方向
      cg.fillStyle = isFar ? farShoeColor : shoeColor
      cg.fillRect(leg.x + 1, bodyH + leg.len, 3, 1)
      sg.fillStyle = OUTLINE
      sg.fillRect(leg.x + 1, bodyH + leg.len, 3, 1)
    })

    // 用剪影四向偏移做成描边，压在彩色图层下面
    const frame = makeCanvas(cw, frameH)
    const fg = frame.getContext('2d')
    fg.imageSmoothingEnabled = false
    fg.drawImage(silCanvas, 0, 1)
    fg.drawImage(silCanvas, 2, 1)
    fg.drawImage(silCanvas, 1, 0)
    fg.drawImage(silCanvas, 1, 2)
    fg.drawImage(colorCanvas, 1, 1)

    const mirror = makeCanvas(cw, frameH)
    const mg = mirror.getContext('2d')
    mg.imageSmoothingEnabled = false
    mg.translate(cw, 0)
    mg.scale(-1, 1)
    mg.drawImage(frame, 0, 0)

    phases.push({ r: frame, l: mirror })
  }
  return phases
}

export default {
  name: 'PixelRebornBg',
  mounted() {
    this.$nextTick(() => this.init())
  },
  beforeUnmount() {
    this.destroy()
  },
  methods: {
    init() {
      if (this.initialized || typeof window === 'undefined') return
      // 只挂在博客首页的 hero 上；其它 layout 直接跳过
      const hero = document.querySelector('.vp-blog-hero')
      if (!hero) return

      this.hero = hero
      this.frames = {}
      this.blinkFrames = {}
      for (const key of Object.keys(SPRITES)) {
        this.frames[key] = buildFrames(SPRITES[key])
        this.blinkFrames[key] = buildFrames(SPRITES[key], true)
      }

      const canvas = document.createElement('canvas')
      canvas.className = 'pixel-reborn-canvas'
      canvas.setAttribute('aria-hidden', 'true')
      Object.assign(canvas.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '1',
        pointerEvents: 'none',
        imageRendering: 'pixelated',
        opacity: '0.96',
      })
      hero.appendChild(canvas)

      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
      this.ctx.imageSmoothingEnabled = false

      this.chars = null
      this.sparks = []
      this.ambient = []
      this.elapsed = 0
      this.raf = null
      this.last = 0
      this.reduced = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false

      this.resize()

      if (typeof ResizeObserver !== 'undefined') {
        this.ro = new ResizeObserver(() => this.resize())
        this.ro.observe(hero)
      }

      this.onVisibility = () => {
        if (document.hidden) {
          if (this.raf) cancelAnimationFrame(this.raf)
          this.raf = null
        } else if (!this.reduced && !this.raf) {
          this.last = performance.now()
          this.raf = requestAnimationFrame(this.tick)
        }
      }
      document.addEventListener('visibilitychange', this.onVisibility)

      if (this.reduced) {
        this.render(0)
      } else {
        this.last = performance.now()
        this.raf = requestAnimationFrame(this.tick)
      }
      this.initialized = true
    },

    destroy() {
      if (!this.initialized) return
      if (this.raf) cancelAnimationFrame(this.raf)
      this.raf = null
      if (this.ro) this.ro.disconnect()
      document.removeEventListener('visibilitychange', this.onVisibility)
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas)
      }
      this.canvas = null
      this.ctx = null
      this.initialized = false
    },

    resize() {
      if (!this.hero || !this.canvas) return
      const cssW = Math.max(1, this.hero.clientWidth)
      const cssH = Math.max(1, this.hero.clientHeight)
      const vw = Math.max(80, Math.round(cssW / ART_PX))
      const vh = Math.max(80, Math.round(cssH / ART_PX))

      const oldW = this.vw
      this.vw = vw
      this.vh = vh
      this.groundY = vh - 13

      this.canvas.width = vw
      this.canvas.height = vh
      this.ctx.imageSmoothingEnabled = false

      const narrow = vw < 190
      if (this.chars && oldW) {
        const k = vw / oldW
        for (const c of this.chars) c.x *= k
      }
      if (!this.chars || narrow !== this.narrow) {
        this.narrow = narrow
        this.chars = this.createChars()
      }
      this.ambient = this.createAmbient()
      this.makeGradient()
    },

    createChars() {
      const defs = this.narrow
        ? CHAR_DEFS.filter(d => NARROW_KEYS.includes(d.key))
        : CHAR_DEFS
      return defs.map((def) => {
        const frames = this.frames[def.key]
        return {
          key: def.key,
          dir: def.dir,
          speed: def.speed,
          frames,
          blinkFrames: this.blinkFrames[def.key],
          x: Math.round(this.vw * def.at),
          seed: Math.random() * 10,
          phase: Math.random() * 4,
          pauseLeft: 0,
          pauseAcc: 0,
          nextPause: 5 + Math.random() * 7,
          blinkIn: 1 + Math.random() * 5,
          blinkLeft: 0,
          emberAcc: 0,
          fuseAcc: 0,
        }
      })
    },

    createAmbient() {
      const count = Math.max(10, Math.round(this.vw / 24))
      return Array.from({ length: count }, () => ({
        x: Math.random() * this.vw,
        y: Math.random() * this.vh,
        vx: (Math.random() - 0.5) * 3,
        vy: -(2 + Math.random() * 5),
        size: Math.random() < 0.25 ? 2 : 1,
        seed: Math.random() * 10,
        color: ['#ffd76a', '#ffbe55', '#9fe3ff', '#ffffff'][Math.floor(Math.random() * 4)],
      }))
    },

    makeGradient() {
      if (!this.ctx) return
      const grad = this.ctx.createLinearGradient(0, this.vh - 32, 0, this.vh)
      grad.addColorStop(0, 'rgba(8, 10, 18, 0)')
      grad.addColorStop(1, 'rgba(8, 10, 18, 0.32)')
      this.groundGradient = grad
    },

    tick(now) {
      this.raf = requestAnimationFrame(this.tick)
      const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000))
      this.last = now
      this.elapsed += dt
      this.update(dt)
      this.render(this.elapsed)
    },

    update(dt) {
      for (const c of this.chars) {
        c.blinkIn -= dt
        if (c.blinkIn <= 0) {
          c.blinkLeft = 0.13
          c.blinkIn = 2.2 + Math.random() * 4.5
        }
        if (c.blinkLeft > 0) c.blinkLeft -= dt

        if (c.pauseLeft > 0) {
          c.pauseLeft -= dt
          if (c.pauseLeft <= 0 && Math.random() < 0.3) c.dir *= -1
          continue
        }
        c.pauseAcc += dt
        if (c.pauseAcc >= c.nextPause) {
          c.pauseAcc = 0
          c.nextPause = 6 + Math.random() * 8
          c.pauseLeft = 1.5 + Math.random() * 2.5
          continue
        }

        c.x += c.dir * c.speed * dt
        c.phase += dt * c.speed * 0.35

        const fw = c.frames[0].r.width
        const margin = 14
        if (c.dir > 0 && c.x > this.vw + margin) c.x = -fw - margin
        else if (c.dir < 0 && c.x < -fw - margin) c.x = this.vw + margin
      }

      for (const p of this.ambient) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.y < -4) {
          p.y = this.vh + 4
          p.x = Math.random() * this.vw
        }
        if (p.x < -4) p.x = this.vw + 4
        else if (p.x > this.vw + 4) p.x = -4
      }

      // 纲吉头顶的火焰星屑 & 狱寺炸药引线的火星
      for (const c of this.chars) {
        if (c.key === 'tsuna') {
          c.emberAcc += dt
          if (c.emberAcc > 0.2) {
            c.emberAcc = 0
            const g = this.charGeom(c)
            this.sparks.push({
              x: g.x + g.w / 2 + (Math.random() * 5 - 2.5),
              y: g.y + (Math.random() * 3 - 1),
              vx: (Math.random() - 0.5) * 5,
              vy: -(10 + Math.random() * 7),
              life: 0.4 + Math.random() * 0.4,
              max: 0.8,
              size: Math.random() < 0.2 ? 2 : 1,
              color: Math.random() < 0.5 ? '#ffd24a' : '#ff9a2e',
            })
          }
        } else if (c.key === 'gokudera') {
          c.fuseAcc += dt
          if (c.fuseAcc > 0.32) {
            c.fuseAcc = 0
            const tip = this.dynamiteTip(c, this.charGeom(c))
            this.sparks.push({
              x: tip.x + (Math.random() * 2 - 1),
              y: tip.y,
              vx: (Math.random() - 0.5) * 4,
              vy: -(7 + Math.random() * 5),
              life: 0.3 + Math.random() * 0.3,
              max: 0.6,
              size: 1,
              color: Math.random() < 0.5 ? '#ffd24a' : '#ff8a2e',
            })
          }
        }
      }

      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const p = this.sparks[i]
        p.life -= dt
        if (p.life <= 0) {
          this.sparks.splice(i, 1)
          continue
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 7 * dt
      }
      if (this.sparks.length > 48) this.sparks.splice(0, this.sparks.length - 48)
    },

    charGeom(c) {
      const fw = c.frames[0].r.width
      const fh = c.frames[0].r.height
      let offset = 0
      if (c.pauseLeft > 0) {
        offset = Math.round(Math.sin((this.elapsed + c.seed) * 2))
      } else if (c.key === 'lambo') {
        offset = -Math.round(Math.abs(Math.sin((this.elapsed + c.seed) * 4)) * 2)
      } else {
        // 抬腿帧已经有高度变化，整个人不再上下跳，避免支撑脚离地
        offset = 0
      }
      return {
        x: Math.round(c.x),
        y: Math.round(this.groundY - fh + offset),
        w: fw,
        h: fh,
      }
    },

    dynamiteTip(c, g) {
      // 引线头在角色帧里的位置：人物矩阵 (14, 18) + 2px 描边留白
      // 镜像帧里用 17 - 帧坐标 翻转，保持火星跟着手里的炸药走
      return {
        x: c.dir > 0 ? g.x + 16 : g.x + 1,
        y: g.y + 20,
      }
    },

    render(t) {
      const ctx = this.ctx
      if (!ctx) return
      ctx.clearRect(0, 0, this.vw, this.vh)

      if (this.groundGradient) {
        ctx.fillStyle = this.groundGradient
        ctx.fillRect(0, this.vh - 32, this.vw, 32)
      }

      // 远处飘动的像素萤火
      for (const p of this.ambient) {
        const alpha = 0.22 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.7 + p.seed))
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
      }
      ctx.globalAlpha = 1

      // 小人
      for (const c of this.chars) {
        const g = this.charGeom(c)
        ctx.fillStyle = 'rgba(10, 10, 16, 0.2)'
        ctx.fillRect(g.x + 4, this.groundY - 1, g.w - 8, 1)
        ctx.fillRect(g.x + 6, this.groundY, g.w - 12, 1)

        const phase = c.pauseLeft > 0 ? 4 : Math.floor(c.phase) % 4
        const set = c.blinkLeft > 0 ? c.blinkFrames : c.frames
        const frame = c.dir > 0 ? set[phase].r : set[phase].l
        ctx.drawImage(frame, g.x, g.y)
      }

      // 角色身上的小特效
      for (const c of this.chars) {
        const g = this.charGeom(c)
        if (c.key === 'tsuna') {
          this.drawFlame(ctx, g, t + c.seed)
        } else if (c.key === 'gokudera') {
          this.drawDynamiteSpark(ctx, c, g, t + c.seed)
        } else if (c.key === 'reborn') {
          this.drawLeonTongue(ctx, c, g, t)
        }
      }

      for (const p of this.sparks) {
        ctx.globalAlpha = Math.max(0, p.life / p.max)
        ctx.fillStyle = p.color
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
      }
      ctx.globalAlpha = 1
    },

    drawFlame(ctx, g, t) {
      // 头顶火焰：宽 4px、高 5~6px，别盖过整个头
      const cx = g.x + Math.round(g.w / 2) + Math.round(Math.sin(t * 9) * 0.6)
      const base = g.y + 3
      const flick = Math.sin(t * 11) + Math.sin(t * 17.3)
      const h = Math.max(3, 4 + Math.round(flick * 0.7))

      ctx.fillStyle = '#ff7a18'
      ctx.fillRect(cx - 2, base - h + 1, 4, Math.max(1, h - 1))
      ctx.fillRect(cx - 1, base - h, 2, 2)

      ctx.fillStyle = '#ffb627'
      ctx.fillRect(cx - 1, base - h + 2, 2, Math.max(1, h - 2))

      ctx.fillStyle = '#ffe066'
      ctx.fillRect(cx, base - h + 3, 1, Math.max(1, h - 3))
      ctx.fillStyle = '#fff7d6'
      ctx.fillRect(cx, base - h + 4, 1, Math.max(1, h - 4))
    },

    drawDynamiteSpark(ctx, c, g, t) {
      const tip = this.dynamiteTip(c, g)
      const up = Math.sin(t * 26) > 0
      ctx.fillStyle = up ? '#fff7d6' : '#ffd24a'
      ctx.fillRect(tip.x, tip.y - (up ? 1 : 0), 1, 1)
      if (up) {
        ctx.fillStyle = '#ff8a2e'
        ctx.fillRect(tip.x, tip.y, 1, 1)
      }
    },

    drawLeonTongue(ctx, c, g, t) {
      const cycle = (t + c.seed) % 5
      if (cycle > 0.6) return
      const len = Math.max(1, Math.round(5 * Math.sin((cycle / 0.6) * Math.PI)))
      const y = g.y + 5
      ctx.fillStyle = '#ff6b8a'
      if (c.dir > 0) {
        ctx.fillRect(g.x + 1 - len, y, len, 1)
      } else {
        ctx.fillRect(g.x + g.w - 2, y, len, 1)
      }
    },
  },
}
</script>

<style>
.pixel-reborn-anchor {
  display: none;
}
</style>
