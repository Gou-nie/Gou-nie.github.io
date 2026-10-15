/*
 * @Autor: LXS
 * @Date: 2026-10-15
 * @Description: 钢琴卷帘的画布绘制与命中测试
 *
 * 框架无关：独占 canvas、布局数学、DPR、重绘时机。不认识 Vue，也不认识播放器。
 * 布局只有一处真源（下面这几个方法），所以「点哪儿跳哪儿」不可能和画面对不上。
 *
 * 两条硬规矩，改动前先读：
 *
 * 1. **全长模式下播放中绝不重绘**。播放头是 DOM 覆盖层（见 StemSplitter.vue），靠 CSS
 *    transform 移动；这里只在 setNotes()、尺寸变化、视窗变化时重画。缩放到局部视图时
 *    视窗会跟着播放头走，那时确实每帧重画 —— 但音符按视窗裁剪过，一屏只有几十块。
 * 2. **模块顶层不碰 window / document**。VuePress 的 SSR 阶段会 import 这个文件，
 *    顶层一旦取值就会多出一条 `window is not defined`。
 */

import { midiName } from '../subComponents/pitch.js'

/** 琴键条宽度（CSS px）。类的布局从这里取，SFC 的播放头偏移也用它 */
export const KEY_W = 30
/** 窄屏（< 480px）换一套，否则琴键吃掉太多宽度 */
export const KEY_W_SMALL = 22
/**
 * 窄屏断点。判据是 **canvas 的实宽**，不是视口宽度 —— 两者差一个页面内边距，
 * 用视口宽度做判据会让播放头和琴键条在中间那一段错开。
 */
export const SMALL_MAX = 480

/**
 * 卷帘高度（CSS px）。**这两个只是给 SFC 的 `.roll-box` 抄的** —— 类的布局从
 * canvas.clientHeight 取，不读这两个常量。改高度要改 `StemSplitter.vue` 的样式。
 */
export const ROLL_H = 190
export const ROLL_H_SMALL = 150

/**
 * 跟随时播放头停在视窗的这个比例处。留 30% 给「已经唱过的」，70% 给「要唱的」——
 * 跟着练唱的人需要看到前面，不需要看身后。
 */
export const HEAD_AT = 0.3

/**
 * 跟随时视窗该从哪儿开始。纯函数，SFC 算播放头位置时用的是同一个 —— 两份实现
 * 一定会漂，所以只留这一份。
 *
 * @param {number} t 当前时刻（秒）
 * @param {number} span 视窗长度（秒），0 = 全长
 * @param {number} duration 曲长（秒）
 * @returns {number} 视窗左边界（秒）
 */
export function viewStartFor(t, span, duration) {
  if (!(span > 0) || !(duration > 0)) return 0
  const vis = Math.min(span, duration)
  const max = Math.max(0, duration - vis)
  const v = t - vis * HEAD_AT
  return Math.min(Math.max(0, v), max)
}

/** 音域上下各留这么多行空白，免得最高/最低音贴着边框 */
const PAD_ROWS = 2
/** 音域再窄也撑到这么多行：单音的歌不应该被放大成一个大色块 */
const MIN_ROWS = 12
/**
 * 缩放模式下想要的行高。行数 = 画布高度 / 这个值，和音符内容无关。
 *
 * 13 而不是更大：块上标音名要求行高 >= 11（NOTE_LABEL_MIN_H），留一点余量。
 * 也不该更小 —— 行矮了音符块就退回成一条线，放大就白做了。
 */
const TARGET_ROW_H = 13
/** 上下各留的像素边距 */
const PAD_Y = 4
/** rowH 小于这个值就不画 C 音的音名了，画了也糊成一团 */
const LABEL_MIN_ROW_H = 9
/** rowH 小于这个值就不画八度横线 */
const GRID_MIN_ROW_H = 5
/** 块窄于这个宽度或矮于这个高度就不标音名了 */
const NOTE_LABEL_MIN_W = 20
const NOTE_LABEL_MIN_H = 11
/** 纵向网格线的可选间隔（秒），挑一个让线数接近 8 的 */
const TIME_STEPS = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300]
/** 音符块窄于这个宽度就直接 fillRect —— 圆角在 3px 里看不出来还更慢 */
const ROUND_MIN_W = 3
const MAX_DPR = 2

/** 黑键的音级：C# D# F# G# A# */
const BLACK_PC = [1, 3, 6, 8, 10]

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** ctx.roundRect 要 Safari 16.4+，手动用 arcTo 画 */
function roundRectPath(g, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  g.beginPath()
  g.moveTo(x + rr, y)
  g.arcTo(x + w, y, x + w, y + h, rr)
  g.arcTo(x + w, y + h, x, y + h, rr)
  g.arcTo(x, y + h, x, y, rr)
  g.arcTo(x, y, x + w, y, rr)
  g.closePath()
}

export class PianoRoll {
  /**
   * @param {object} opt
   * @param {HTMLCanvasElement} opt.canvas
   * @param {number} [opt.duration] 曲长（秒）
   */
  constructor({ canvas, duration = 0 }) {
    this.canvas = canvas
    this.g = canvas.getContext('2d')
    this.duration = duration || 0
    this.notes = []

    /** 视窗长度（秒）。0 = 全长 —— 全长模式不跟随，也不重绘 */
    this.span = 0
    /** 视窗左边界（秒） */
    this.viewStart = 0

    // 整曲音域；缩放到局部时另有「音域带」，见 _recomputeRows
    this._globalLo = 60
    this._globalHi = 71
    /** 当前音域带的带宽（行数）。0 = 当前显示的不是带，是全长音域 */
    this._bandSpan = 0
    this.minRow = 60
    this.maxRow = 71

    this._rafId = 0
    this._disposed = false

    // observe() 本身会先触发一次，正好覆盖「挂载时宽度还是 0、随后才布局」的情况
    this._ro = null
    if (typeof ResizeObserver === 'function') {
      this._ro = new ResizeObserver(() => this._scheduleRedraw())
      this._ro.observe(canvas)
    }
    this._scheduleRedraw()
  }

  // ------------------------------------------------------------------ 输入

  /**
   * 曲长变了才重画。播放器每帧都在报时长（onTime），少了这道守卫就是每帧重绘一次
   * canvas —— 全长模式下播放头之所以用 DOM 覆盖层，就是为了避开这件事。
   */
  setDuration(d) {
    const v = Number(d) > 0 ? Number(d) : 0
    if (v === this.duration) return
    this.duration = v
    this.viewStart = this._clampView(this.viewStart)
    this._recomputeRows()
    this._scheduleRedraw()
  }

  /** @param {{row: number, start: number, end: number, clarity: number}[]} notes */
  setNotes(notes) {
    this.notes = Array.isArray(notes) ? notes : []
    let lo = Infinity
    let hi = -Infinity
    for (const n of this.notes) {
      if (!Number.isFinite(n.row)) continue
      if (n.row < lo) lo = n.row
      if (n.row > hi) hi = n.row
    }
    this._globalLo = Number.isFinite(lo) ? lo : 60
    this._globalHi = Number.isFinite(hi) ? hi : 71
    this._recomputeRows()
    this._scheduleRedraw()
  }

  /**
   * 视窗长度。0 = 全长。只在值真的变了才重画。
   * @param {number} sec
   */
  setSpan(sec) {
    const v = Number(sec) > 0 ? Number(sec) : 0
    if (v === this.span) return
    this.span = v
    this.viewStart = this._clampView(this.viewStart)
    this._recomputeRows()
    this._scheduleRedraw()
  }

  /**
   * 视窗左边界。跟随播放时会每帧调用，所以必须先挡掉没变化的情况。
   * @param {number} sec
   */
  setView(sec) {
    const v = this._clampView(sec)
    if (v === this.viewStart) return
    this.viewStart = v
    // 局部音域随视窗变，行高和音名跟着变
    this._recomputeRows()
    this._scheduleRedraw()
  }

  /**
   * 画布上某个横坐标对应的时刻。
   * @param {number} clientX
   * @returns {number|null} 秒（已夹到 [0, duration]）；点在琴键条上返回 null ——
   *          误倒回开头比什么都不做更糟
   */
  timeAtClientX(clientX) {
    const w = this.canvas.clientWidth
    if (!(w > 0)) return null
    const keyW = this._keyW(w)
    const x = clientX - this.canvas.getBoundingClientRect().left
    if (x < keyW) return null
    if (!(this.duration > 0) || w <= keyW) return 0
    const vis = this.visibleSpan
    if (!(vis > 0)) return 0
    const t = this.viewStart + ((x - keyW) / (w - keyW)) * vis
    return Math.min(Math.max(0, t), this.duration)
  }

  /** 音符实际占用的行数（供 SFC 显示音域） */
  get rowSpan() {
    return this.maxRow - this.minRow + 1
  }

  /** 当前琴键条宽度。播放头靠它定位，必须和 _layout 用的是同一个判据 */
  get keyW() {
    return this._keyW(this.canvas.clientWidth)
  }

  /** 视窗实际覆盖的时长。span 超过曲长时按曲长算 */
  get visibleSpan() {
    if (!(this.span > 0)) return this.duration > 0 ? this.duration : 0
    if (!(this.duration > 0)) return this.span
    return Math.min(this.span, this.duration)
  }

  /** 视窗左边界能取到的最大值 —— 滚到最后时右边不出白 */
  get maxViewStart() {
    return Math.max(0, (this.duration > 0 ? this.duration : 0) - this.visibleSpan)
  }

  /**
   * 横向拖动浏览。dx > 0 是手指往右拖，内容跟着右移，所以视窗左移。
   * 放在类里而不是 SFC 里：像素↔秒的换算是布局的一部分，摊到外面就会和 xOf 漂开。
   * @param {number} dxPx
   * @returns {number} 视窗实际移动的秒数（被夹紧后可能小于请求值）
   */
  panBy(dxPx) {
    const w = this.canvas.clientWidth
    const rollW = w - this._keyW(w)
    const vis = this.visibleSpan
    if (!(rollW > 0) || !(vis > 0)) return 0
    const before = this.viewStart
    this.setView(before - (dxPx / rollW) * vis)
    return this.viewStart - before
  }

  /**
   * 播放头在图区里的位置（0~1）。可能落在 [0,1] 之外 —— 用户拖走视窗去浏览时，
   * 播放头本来就该跑到屏幕外，由 CSS 的 overflow 裁掉。
   * @param {number} t
   * @returns {number|null}
   */
  headFrac(t) {
    const vis = this.visibleSpan
    if (!(vis > 0)) return null
    return (t - this.viewStart) / vis
  }

  // ------------------------------------------------------------------ 布局

  _clampView(v) {
    const n = Number(v)
    if (!Number.isFinite(n)) return 0
    return Math.min(Math.max(0, n), this.maxViewStart)
  }

  /**
   * 重算纵轴显示的音域。
   *
   * 全长和缩放走两条完全不同的路子，因为两者对稳定性的要求相反：
   *
   * - **全长**：一次算完就永远不动。按整曲音域铺开，不设上限 —— 音域宽的歌就该有
   *   那么多行，削行比音符细更糟。
   * - **缩放**：视窗在滚，可见音符每帧都在变。如果音域跟着可见音符走，整屏音符会
   *   随着旋律轮廓上下跳 —— 同一行的 y 在换音区时能跳三十多个像素，比「太密」更难受。
   *   所以这里改成**带宽固定、只在音符真的跑出带外时最小幅度平移**：行高恒定，
   *   音符不跳，只在旋律换了音区时整带挪一次。
   */
  _recomputeRows() {
    if (!(this.span > 0)) {
      this._bandSpan = 0 // 下次回到缩放时要重新摆一次带
      let lo = this._globalLo - PAD_ROWS
      let hi = this._globalHi + PAD_ROWS
      while (hi - lo + 1 < MIN_ROWS) {
        lo--
        hi++
      }
      this.minRow = lo
      this.maxRow = hi
      return
    }

    // 带宽只由画布高度决定，和内容无关。clientHeight 为 0 时（还没布局）用桌面高度兜底
    const h = this.canvas.clientHeight || ROLL_H
    const span = Math.max(MIN_ROWS, Math.round((h - PAD_Y * 2) / TARGET_ROW_H))

    const vs = this.viewStart
    const ve = vs + this.visibleSpan
    let lo = Infinity
    let hi = -Infinity
    for (const n of this.notes) {
      if (!Number.isFinite(n.row)) continue
      if (n.end < vs || n.start > ve) continue
      if (n.row < lo) lo = n.row
      if (n.row > hi) hi = n.row
    }
    if (!Number.isFinite(lo)) {
      // 空视窗（前奏 / 间奏）：带已经在带宽上了就一动不动
      if (this._bandSpan === span) return
      const mid = Math.round((this.minRow + this.maxRow) / 2)
      lo = mid
      hi = mid
    }
    lo -= PAD_ROWS
    hi += PAD_ROWS

    // 带宽刚变过（刚进缩放 / 画布高度变了）：以可见音域为中心重摆
    const recenter = Math.round((lo + hi) / 2 - (span - 1) / 2)
    let start
    if (this._bandSpan !== span || hi - lo + 1 > span) {
      // 后一种：可见音符本身就比带宽还多，只能居中，两头都裁
      start = recenter
    } else {
      // 装得下：能不动就不动，装不下时最小幅度平移
      start = this.minRow
      if (lo < start) start = lo
      else if (hi > start + span - 1) start = hi - span + 1
    }
    this.minRow = start
    this.maxRow = start + span - 1
    this._bandSpan = span
  }

  _keyW(w) {
    return w > 0 && w < SMALL_MAX ? KEY_W_SMALL : KEY_W
  }

  _layout(w, h) {
    const keyW = this._keyW(w)
    const rowSpan = Math.max(1, this.rowSpan)
    const rowH = Math.max(1, (h - PAD_Y * 2) / rowSpan)
    const vis = this.visibleSpan
    const rollW = w - keyW
    return {
      keyW,
      rowH,
      rowSpan,
      vis,
      rollW,
      xOf: (t) => keyW + (vis > 0 ? ((t - this.viewStart) / vis) * rollW : 0),
      yOf: (midi) => PAD_Y + (this.maxRow - midi) * rowH,
    }
  }

  // ------------------------------------------------------------------ 绘制

  _scheduleRedraw() {
    if (this._disposed || this._rafId) return
    if (typeof requestAnimationFrame !== 'function') return
    this._rafId = requestAnimationFrame(() => {
      this._rafId = 0
      this.redraw()
    })
  }

  redraw() {
    if (this._disposed) return
    const canvas = this.canvas
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    // 挂载瞬间宽度为 0（SSR 水合 / 面板还没布局），整趟跳过，等 ResizeObserver 再来
    if (!(w > 0) || !(h > 0)) return

    // 音域带的带宽由画布高度决定，所以尺寸一变就得重算 —— 这也是它放在 _layout
    // 之前、而不是只放在那几个 setter 里的原因
    this._recomputeRows()

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const pw = Math.round(w * dpr)
    const ph = Math.round(h * dpr)
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw
      canvas.height = ph
    }
    const g = this.g
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, w, h)

    const L = this._layout(w, h)
    const theme = this._theme()
    this._drawGrid(g, w, h, L)
    this._drawNotes(g, w, h, L, theme)
    this._drawKeys(g, h, L)
  }

  /** 主题色从 CSS 变量读，兜底和 SFC 里的 var(--theme-color, #3eaf7c) 保持一致 */
  _theme() {
    try {
      const v = getComputedStyle(this.canvas).getPropertyValue('--theme-color').trim()
      return v || '#3eaf7c'
    } catch {
      return '#3eaf7c'
    }
  }

  _drawGrid(g, w, h, L) {
    const { keyW, rowH, rollW, xOf, yOf } = L
    if (rollW <= 0) return

    g.save()
    g.beginPath()
    g.rect(keyW, 0, rollW, h)
    g.clip()

    // 每个八度一条淡横线 —— 看旋律跳跃最有用的网格
    if (rowH >= GRID_MIN_ROW_H) {
      g.strokeStyle = 'rgba(128, 128, 128, 0.22)'
      g.lineWidth = 1
      for (let m = this.minRow; m <= this.maxRow; m++) {
        if (((m % 12) + 12) % 12 !== 0) continue
        // floor + 0.5 而不是 round + 0.5：后者恒偏向 +1px，1px 线会整体右下移
        const y = Math.floor(yOf(m)) + 0.5
        g.beginPath()
        g.moveTo(keyW, y)
        g.lineTo(w, y)
        g.stroke()
      }
    }

    // 纵向时间网格：挑一个让线数接近 8 的间隔。
    // 线的位置取**绝对时刻的整数倍**，不是相对视窗起点的 —— 否则滚动时网格会跟着滑，
    // 看起来像画面在抖。
    const vis = L.vis
    if (vis > 0) {
      const step = TIME_STEPS.find((s) => vis / s <= 8) || TIME_STEPS[TIME_STEPS.length - 1]
      const from = Math.ceil(this.viewStart / step) * step
      g.strokeStyle = 'rgba(128, 128, 128, 0.16)'
      g.setLineDash([3, 4])
      g.lineWidth = 1
      for (let t = from; t < this.viewStart + vis; t += step) {
        const x = Math.floor(xOf(t)) + 0.5
        g.beginPath()
        g.moveTo(x, 0)
        g.lineTo(x, h)
        g.stroke()
      }
      g.setLineDash([])
    }
    g.restore()
  }

  _drawNotes(g, w, h, L, theme) {
    const { keyW, rowH, xOf, yOf, vis } = L
    const rollW = w - keyW
    if (rollW <= 0) return

    // 视窗外的音符直接跳过：缩放到局部时这是每帧重绘还能跑得动的原因
    const vs = this.viewStart
    const ve = vs + (vis > 0 ? vis : 0)

    g.save()
    g.beginPath()
    g.rect(keyW, 0, rollW, h)
    g.clip()
    g.fillStyle = theme

    const noteH = Math.max(2, rowH - 1)
    const labelled = noteH >= NOTE_LABEL_MIN_H
    const drawn = []
    for (const n of this.notes) {
      if (!Number.isFinite(n.row)) continue
      if (vis > 0 && (n.end < vs || n.start > ve)) continue
      const x0 = xOf(n.start)
      const x1 = xOf(n.end)
      // 1.5px 下限：窄屏下退化成可读的音高轮廓条，而不是消失
      const bw = Math.max(1.5, x1 - x0)
      const y = yOf(n.row) + (rowH - noteH) / 2
      // 置信度用透明度：色相已经被黑白键占了；用大小/长度编码会谎报时间，
      // 那是钢琴卷帘唯一不能撒谎的轴
      g.globalAlpha = 0.45 + 0.55 * clamp01((n.clarity - 0.5) / 0.5)
      if (bw < ROUND_MIN_W) g.fillRect(x0, y, bw, noteH)
      else {
        roundRectPath(g, x0, y, bw, noteH, Math.min(2.5, noteH / 2))
        g.fill()
      }
      if (labelled && bw >= NOTE_LABEL_MIN_W) drawn.push([x0, y, bw, n.row])
    }
    g.globalAlpha = 1

    // 音名画在块里。用深色而不是白色：块是半透明的主题色叠在浅底上，
    // 白字的对比度反而不够
    if (drawn.length) {
      g.fillStyle = 'rgba(18, 38, 30, 0.92)'
      g.font = '9px system-ui, -apple-system, sans-serif'
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      for (const [x0, y, bw, row] of drawn) {
        g.fillText(midiName(row), x0 + bw / 2, y + noteH / 2)
      }
    }
    g.restore()
  }

  _drawKeys(g, h, L) {
    const { keyW, rowH } = L
    if (keyW <= 0) return

    g.save()
    for (let m = this.minRow; m <= this.maxRow; m++) {
      const y = L.yOf(m)
      const isBlack = BLACK_PC.includes(((m % 12) + 12) % 12)
      g.fillStyle = isBlack ? 'rgba(32, 32, 36, 0.88)' : 'rgba(244, 244, 246, 0.95)'
      g.fillRect(0, y, keyW - 1, rowH)
    }
    // 琴键条与图区的分隔线
    g.fillStyle = 'rgba(128, 128, 128, 0.45)'
    g.fillRect(keyW - 1, 0, 1, h)

    // 只给 C 音标音名；行太矮就不标
    if (rowH >= LABEL_MIN_ROW_H) {
      g.font = `${Math.min(9, rowH - 1).toFixed(0)}px system-ui, -apple-system, sans-serif`
      g.textAlign = 'left'
      g.textBaseline = 'middle'
      for (let m = this.minRow; m <= this.maxRow; m++) {
        if (((m % 12) + 12) % 12 !== 0) continue
        g.fillStyle = 'rgba(40, 40, 44, 0.85)'
        g.fillText(midiName(m), 2, L.yOf(m) + rowH / 2)
      }
    }
    g.restore()
  }

  dispose() {
    if (this._disposed) return
    this._disposed = true
    if (this._rafId && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this._rafId)
    this._rafId = 0
    this._ro?.disconnect()
    this._ro = null
    this.notes = []
  }
}
