/*
 * @Autor: LXS
 * @Date: 2026-10-15
 * @Description: 从人声轨整曲提取旋律 → 钢琴卷帘的音符序列
 *
 * 流程：decodeAudioData → 降采样 → 逐帧自相关测音高 → 帧序列切音符。
 * 只分析「人声」那一轨，单声部假设；伴奏是多声部，转谱不在范围内。
 *
 * 三个容易踩的坑，改动前先读：
 *
 * 1. **采样率不能假设**。decodeAudioData 会把结果重采样到上下文的 sampleRate，
 *    所以用低采样率解码能省内存和算力；但规范保证的下界是 8000Hz，Safari 历史上
 *    却只接受 >= 44100（旧版还会抛 SyntaxError 而不是 NotSupportedError）。
 *    所以用 RATE_LADDER 从低到高探测，再统一兜底降到 <= TARGET_RATE。
 *
 * 2. **不要用原生采样率分析**。自相关的代价按 sr² 涨：44.1kHz 要 20~60s，8kHz 只要
 *    0.4~0.8s。而且 512 点的窗口在 44.1kHz 下只有 11.6ms，连 70Hz 的一个周期都不到，
 *    pitch.js 里 `maxLag <= minLag` 的守卫会直接失效、什么都测不出来。
 *
 * 3. **别让界面卡住**。分块 + 让出主线程（见下方的 yieldToMain）。音频走的是媒体/
 *    音频线程，主线程卡顿不会断音，只会让播放头一秒跳几下。
 *
 * 本文件顶层的纯函数（decimate / downmix / segmentFrames）不碰 window、document 或
 * 任何 Web Audio API —— 既让 VuePress 的 SSR 阶段安全，也便于在 Node 里直接测。
 * 将来要挪进 Web Worker，只需要改下半部分的编排。
 */

import { detectPitch } from '../subComponents/pitch.js'

/**
 * 分析窗口 1024、步进 512（50% 重叠）。
 *
 * 窗口是**实测选出来的**，不是为了好看：同样一条带颤音的旋律，
 *   512/512  碎片率 1.25、音高错 3/15
 *   1024/512 碎片率 1.00、音高错 0/12（脏信号下也是 1.00/0）
 * 窗口越长，相关系数的峰越稳，颤音在窗内造成的抖动就被平均掉了。
 *
 * 代价是自相关总量翻倍（每帧的乘法数 ∝ 窗口长度）。实测 4 分钟的歌从 ~0.8s 变 ~1.4s，
 * 分块让出主线程，播放不受影响。
 *
 * 步进保持 512（64ms）而不是跟着翻倍：时间量化直接决定放大后的卷帘好不好看，
 * 8 秒视窗下 64ms ≈ 5px，128ms 就糊成一片了。
 */
export const FRAME_SIZE = 1024
export const HOP_SIZE = 512

/** 降采样目标：窗口在这个采样率下仍有 93ms 以上，够测 70Hz 了 */
export const TARGET_RATE = 11025

/**
 * 采样率探测阶梯，从低到高。
 * 第一个构造成功的就用来当纯解码宿主 —— 我们从不 startRendering()，
 * 这也顺带绕开了 iOS Safari 反复 render 后 OfflineAudioContext 状态损坏的老问题。
 */
export const RATE_LADDER = [8000, 11025, 16000, 22050, 44100]

/**
 * 人声的音域与清晰度要求（比口琴低得多也窄得多）。
 *
 * `firstPeak: true` 是必须的，不是可选项：整曲分析拿到的是**持续、周期性**的乐音，
 * 而这类信号的相关系数在每一个 k×周期 处都接近 1，argmax 会落到"最接近整数采样"
 * 的那个倍数上 —— 那往往不是基频。实测 80~1100Hz 扫描（人声常见的谐波堆叠音色）：
 * 稳态长音的错误率 47.9% → 2.9%，带颤音的真实人声 4.1% → 0.8%。
 * 口琴页是实时循环、信号没这么周期性，那边不传这个开关，行为逐字节不变。
 */
export const MELODY_PITCH = { minFreq: 70, maxFreq: 1200, minClarity: 0.5, firstPeak: true }

/** 短于这个时长的段丢掉：比任何可唱音节都短 */
const MIN_NOTE_MS = 120
/** 同音高、间隔在这个时长以内的相邻段合并（气口 / 辅音 / 检测丢帧） */
const MAX_GAP_MS = 200
/** 中值滤波修倍频的判据：偏差超过这么多半音才认为是倍频错误（倍频误差是 ±12） */
const OCTAVE_JUMP = 6
/**
 * 容差带半宽（半音）。可被 segmentFrames 的 opts.pitchTolerance 覆盖，方便实测调参。
 * 颤音 ±20~50 音分，半音级进是 100 音分 —— 0.6 两边都照顾得到。
 * 注意别再往宽了调：到 1.0 就会把半音级进（C→C#）当成同一个音。
 */
export const PITCH_TOLERANCE_DEFAULT = 0.6
/** 锚点取最近这么多帧的中位数，见 withinBand */
const ANCHOR_FRAMES = 5
/** 段内音高离段首最多漂这么远（半音）。撞上就是真的在滑音或换音，断开 */
const PITCH_MAX_SPAN = 1.3

// ────────────────────────────────────────────────────────── 解码后的降采样

/**
 * 因果滑动均值（box 滤波器）。
 * @param {Float32Array} src
 * @param {number} D 窗口宽度
 * @returns {Float32Array}
 */
function boxMean(src, D) {
  const n = src.length
  const out = new Float32Array(n)
  let sum = 0
  for (let i = 0; i < n; i++) {
    sum += src[i]
    if (i >= D) sum -= src[i - D]
    out[i] = sum / Math.min(i + 1, D)
  }
  return out
}

/**
 * 整数倍抽取降采样：两级滑动均值级联抗混叠，再每 D 个取一个。
 *
 * 为什么是两级 box 而不是一个陡峭的 biquad：级联后是长度 2D-1 的三角核，阻带已经
 * 够用，而代价只有约 4 flops/采样 —— 4 分钟 44.1kHz 约 45M flops，对比二阶 biquad
 * 的 95M（和整个自相关一样贵），不值得换那么陡的滚降。
 *
 * 群延迟是 D-1 个输入采样（44.1kHz、D=4 时 68µs），相对 64ms 的帧量子可以忽略，
 * 不做补偿。
 *
 * @param {Float32Array} src 单声道采样
 * @param {number} srcRate
 * @param {number} [targetRate]
 * @returns {{samples: Float32Array, sampleRate: number, factor: number}}
 *          已经是目标频率时**原样返回入参**（省掉 44100 下 7.7MB 的复制），调用方只读
 */
export function decimate(src, srcRate, targetRate = TARGET_RATE) {
  const D = Math.max(1, Math.ceil(srcRate / targetRate))
  if (D === 1) return { samples: src, sampleRate: srcRate, factor: 1 }

  const once = boxMean(src, D)
  const twice = boxMean(once, D)
  const n = Math.floor(twice.length / D)
  const out = new Float32Array(n)
  for (let j = 0; j < n; j++) out[j] = twice[j * D]
  return { samples: out, sampleRate: srcRate / D, factor: D }
}

/**
 * 多声道下混成单声道。
 *
 * 常规是取各声道平均，但人声如果被做了反相/硬声像，左右相加会互相抵消 ——
 * 这时改用第 0 声道，至少还能测到东西。
 *
 * @param {Float32Array[]} channels
 * @param {number} length
 * @returns {Float32Array}
 */
export function downmix(channels, length) {
  const ch0 = channels[0]
  if (!channels || channels.length < 2) return ch0.slice(0, length)

  const ch1 = channels[1]
  const mono = new Float32Array(length)
  let sumSq0 = 0
  let sumSqM = 0
  for (let i = 0; i < length; i++) {
    const a = ch0[i]
    const b = ch1[i]
    const m = (a + b) / 2
    mono[i] = m
    sumSq0 += a * a
    sumSqM += m * m
  }
  // 下混后能量掉得太狠 → 两声道有抵消，退回单声道
  if (sumSqM < 0.25 * sumSq0) return ch0.slice(0, length)
  return mono
}

// ──────────────────────────────────────────────────────── 帧序列 → 音符序列

/** 三值中位数（热路径，避免每次分配数组） */
function median3(a, b, c) {
  if (a > b) { const t = a; a = b; b = t }
  if (b > c) b = c
  return a > b ? a : b
}

/** @param {number[]|Float64Array} arr */
function median(arr) {
  const a = Array.from(arr)
  a.sort((x, y) => x - y)
  const m = a.length >> 1
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2
}

/** Hz → MIDI 编号（A4 = 69 = 440Hz） */
export function freqToMidi(freq) {
  return 69 + 12 * Math.log2(freq / 440)
}

/**
 * Pass B：中值-3 修倍频，跑两遍（≈中值-5 的效果，但不会像真中值-5 那样糊掉起音）。
 *
 * 两侧邻居都必须是有效帧才动手 —— 孤零零一帧被静音包围时，没有依据去"纠正"它，
 * 而且那种段本来就过不了 Pass D。所以连续的倍频错误（>= 2 帧）修不掉，
 * 这是中值滤波的固有边界，接受。
 *
 * @param {(number|Float64Array)[]} midi NaN 表示这一帧没测到
 * @param {number} jump
 */
function fixOctaves(midi, jump) {
  let cur = midi
  for (let pass = 0; pass < 2; pass++) {
    const next = cur.slice()
    for (let i = 1; i < cur.length - 1; i++) {
      const v = cur[i]
      if (!Number.isFinite(v)) continue
      const a = cur[i - 1]
      const b = cur[i + 1]
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue
      const med = median3(a, v, b)
      if (Math.abs(v - med) > jump) next[i] = med
    }
    cur = next
  }
  return cur
}

/**
 * Pass C：带容差带的游程编码。判定条件见 withinBand（滑动中位数锚点 + 段内跨度护栏）。
 *
 * @param {(number|Float64Array)[]} midi
 * @param {ArrayLike<number>} clarity
 * @param {number} tol 容差带半宽（半音）
 * @param {number} maxSpan 段内音高离段首的最大漂移（半音）
 */
function runLength(midi, clarity, tol, maxSpan) {
  const segs = []
  let cur = null
  for (let i = 0; i < midi.length; i++) {
    const v = midi[i]
    if (!Number.isFinite(v)) {
      if (cur) { segs.push(cur); cur = null }
      continue
    }
    if (cur && withinBand(cur, v, tol, maxSpan)) {
      cur.end = i
      cur.mids.push(v)
      cur.recent.push(v)
      if (cur.recent.length > ANCHOR_FRAMES) cur.recent.shift()
      if (clarity[i] > cur.clarity) cur.clarity = clarity[i]
      continue
    }
    if (cur) segs.push(cur)
    cur = { start: i, end: i, mids: [v], recent: [v], clarity: clarity[i] }
  }
  if (cur) segs.push(cur)
  for (const s of segs) s.row = Math.round(median(s.mids))
  return segs
}

/**
 * 当前帧还算不算这个段里的音。两条同时成立才算：
 *
 * 1. `|v - 近几帧中位数| <= tol` —— 锚点必须跟着颤音走。锚在**段首帧**是原设计，
 *    但颤音从 +45 音分摆到 -45 音分时离段首就是 0.9 半音，超带就断，
 *    一个长音被切成好几块 —— 实测碎片率 1.25。
 * 2. `|v - 段首| <= maxSpan` —— 护栏。只有第 1 条的话，滑动锚点会一路跟着慢滑音漂，
 *    整段滑音被连成一个巨大的「音符」。滑音是单调漂移的，迟早撞上这条护栏断开，
 *    而颤音是绕着中位数来回摆的，永远撞不上。
 *
 * 这样半音级进（100 音分）仍然干净断开：近几帧中位数还是旧音高，差 1.0 半音 > tol。
 */
function withinBand(cur, v, tol, maxSpan) {
  if (Math.abs(v - cur.mids[0]) > maxSpan) return false
  return Math.abs(v - median(cur.recent)) <= tol
}

/**
 * Pass E1：丢掉夹在同音高邻居中间、又短又不同音的毛刺段。
 *
 * "短"的门槛就是 minFrames 本身 —— 一个刚刚够长的段夹在两个同音高邻居中间时，
 * 判它更像检测毛刺而不是真音符。这个区间不能写死帧数：帧率随解码采样率变，
 * 写死会让规则在不同机器上松紧不一。
 */
function dropOutliers(segs, outlierFrames) {
  if (segs.length < 3) return segs
  const out = []
  for (let i = 0; i < segs.length; i++) {
    if (i > 0 && i < segs.length - 1) {
      const s = segs[i]
      const a = segs[i - 1]
      const b = segs[i + 1]
      if (s.mids.length <= outlierFrames && a.row === b.row && s.row !== a.row) continue
    }
    out.push(segs[i])
  }
  return out
}

/** Pass E2：合并同音高、间隔不超过 maxGapFrames 的相邻段 */
function mergeAdjacent(segs, maxGapFrames) {
  const out = []
  for (const s of segs) {
    const prev = out[out.length - 1]
    if (prev && prev.row === s.row && s.start - prev.end - 1 <= maxGapFrames) {
      prev.end = s.end
      for (const v of s.mids) prev.mids.push(v)
      if (s.clarity > prev.clarity) prev.clarity = s.clarity
      prev.row = Math.round(median(prev.mids))
      continue
    }
    out.push({
      start: s.start,
      end: s.end,
      row: s.row,
      clarity: s.clarity,
      mids: s.mids.slice(),
    })
  }
  return out
}

/**
 * 帧序列 → 音符序列（Pass B~F）。
 *
 * @param {ArrayLike<number>} midi 每帧的 MIDI 编号，NaN = 这一帧没测到
 * @param {ArrayLike<number>} clarity 每帧的清晰度（0~1）
 * @param {object} opts
 * @param {number} opts.hopSec  帧步进（秒）= HOP_SIZE / 分析采样率
 * @param {number} opts.frameSec 窗口长度（秒）= FRAME_SIZE / 分析采样率
 * @param {number} [opts.minNoteMs]
 * @param {number} [opts.maxGapMs]
 * @returns {{row: number, start: number, end: number, clarity: number}[]}
 *          start/end 单位是秒。start 取"窗口中心减半窗"、end 取"窗口中心加半窗"，
 *          合起来就是 hop 对齐的边界，正好消掉窗口本身 32ms 的延迟
 */
export function segmentFrames(midi, clarity, opts) {
  const {
    hopSec,
    frameSec,
    minNoteMs = MIN_NOTE_MS,
    maxGapMs = MAX_GAP_MS,
    pitchTolerance = PITCH_TOLERANCE_DEFAULT,
  } = opts

  // 阈值按**时长**给、再换算成帧数：分析采样率会随解码结果变（8820/11025/…），
  // 写死帧数会让同一条规则在不同机器上松紧不一
  const frameRate = 1 / hopSec
  const minFrames = Math.max(1, Math.round((minNoteMs / 1000) * frameRate))
  const maxGapFrames = Math.max(0, Math.round((maxGapMs / 1000) * frameRate))

  let segs = runLength(fixOctaves(midi, OCTAVE_JUMP), clarity, pitchTolerance, PITCH_MAX_SPAN)

  // Pass D：太短的段（严格小于 minFrames）
  segs = segs.filter((s) => s.mids.length >= minFrames)

  // Pass E：毛刺剔除与合并交替跑两轮 —— 合并会制造出新的"夹在中间"的段
  for (let k = 0; k < 2; k++) {
    segs = dropOutliers(segs, minFrames)
    segs = mergeAdjacent(segs, maxGapFrames)
  }

  // Pass F：row 取段内中位数，clarity 取段内最大值
  return segs.map((s) => ({
    row: Math.round(median(s.mids)),
    start: s.start * hopSec,
    end: s.end * hopSec + frameSec,
    clarity: s.clarity,
  }))
}

// ────────────────────────────────────────────────────────── 解码 + 分块编排

/** 超过这个长度就干脆不分析：瞬时内存和耗时都开始不划算 */
export const MAX_ANALYZE_SEC = 8 * 60

/** 每片最多干这么多毫秒，然后让出主线程给播放头和交互 */
const CHUNK_BUDGET_MS = 10
/**
 * 每片最多这么多帧。和上面的时间预算**两个都要**。
 *
 * 时间预算在时钟精确时才是有效的：隐私模式会把 performance.now() 的精度降到
 * 1~100ms，100ms 那一档下整片的时间差一直是 0，时间检查形同虚设 —— 没有这个上限，
 * 4 分钟的歌（5167 帧）会在一片里跑完，主线程直接冻 0.5 秒。
 *
 * 取值依据实测：detectPitch 约 0.105ms/帧（本机，4 分钟 5167 帧共 541ms），
 * 128 帧 ≈ 13ms，再慢 3~4 倍的手机也在 50ms 以内。调大之前先想清楚这个代价。
 */
const CHUNK_MAX_FRAMES = 128

/** 取消哨兵。AbortError 不能被当成错误显示出来（见 StemSplitter.vue 的处理） */
function abortError() {
  const err = new Error('已取消')
  err.name = 'AbortError'
  return err
}

/**
 * 让出主线程。
 *
 * 用 MessageChannel 而不是 setTimeout(0)：后者在嵌套 5 层以后会被钳到 4ms，
 * 3750 帧就会被白等十几秒。MessageChannel 是宏任务，间隔只有 0.2~1ms。
 * 每次新建一个端口、resolved 后立刻 close —— 不留任何跨 await 的状态，
 * 所以中途取消也不会有悬挂的回调往已经卸载的组件里写东西。
 */
function yieldToMain() {
  if (typeof MessageChannel !== 'function') {
    return new Promise((resolve) => setTimeout(resolve, 0))
  }
  return new Promise((resolve) => {
    const ch = new MessageChannel()
    ch.port1.onmessage = () => {
      ch.port1.close()
      resolve()
    }
    ch.port2.postMessage(0)
  })
}

/**
 * 探测浏览器接受的解码采样率，从低到高。
 *
 * 纯构造函数调用，不渲染、不喂数据，在 fetch 之前跑，成本为零。
 * 规范保证 8000Hz 是下界，但 Safari 历史上只接受 >= 44100（旧版还会抛
 * SyntaxError 而不是 NotSupportedError），所以只能实测。
 */
function usableRates() {
  // @ts-ignore 老版 Safari 的私有前缀
  const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext
  if (!OC) throw new Error('当前浏览器不支持音频解码')
  const rates = RATE_LADDER.filter((rate) => {
    try {
      // length 给 1 就够：这个上下文只当纯解码宿主用，我们从不 startRendering()。
      // 这也顺带绕开了 iOS Safari 反复 render 后 OfflineAudioContext 状态损坏的老问题。
      new OC(1, 1, rate)
      return true
    } catch {
      return false
    }
  })
  return rates.length ? rates : [44100]
}

/**
 * 解码成 AudioBuffer，并返回实际用的采样率。
 *
 * 先用构造函数探一遍，再逐个真去解 —— 构造通过但 decodeAudioData 仍可能失败，
 * 那时退到阶梯上的下一个采样率。重试路径要给一份新副本，因为规范规定
 * decodeAudioData 会把入参 ArrayBuffer **摘走（detach）**，同一份不能喂第二次。
 */
async function decodeToBuffer(arrayBuffer) {
  const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext
  const rates = usableRates()
  let lastErr = null
  for (let k = 0; k < rates.length; k++) {
    try {
      const ctx = new OC(1, 1, rates[k])
      const data = k === 0 ? arrayBuffer : arrayBuffer.slice(0)
      const audio = await ctx.decodeAudioData(data)
      return { audio, rate: ctx.sampleRate }
    } catch (err) {
      lastErr = err
    }
  }
  throw new Error('音轨解码失败' + (lastErr?.message ? `：${lastErr.message}` : ''))
}

/**
 * 人声轨 → 音符序列。整曲分析，分块让出主线程。
 *
 * @param {string} url 人声轨的 blob URL
 * @param {object} [opt]
 * @param {AbortSignal} [opt.signal] 取消用。fetch/decodeAudioData 本身不可中断，
 *        所以每个 await 边界都查一次信号，把迟到的结果直接丢弃
 * @param {(fraction: number) => void} [opt.onProgress] 分析进度 0~1（不含解码阶段）
 * @returns {Promise<{notes: Array, durationSec: number, analysisRate: number,
 *                    frameRate: number, tooLong: boolean}>}
 * @throws {Error} name === 'AbortError' 时是主动取消，调用方应静默返回
 */
export async function extractMelody(url, opt) {
  const { signal, onProgress } = opt || {}
  const checkAbort = () => {
    if (signal?.aborted) throw abortError()
  }

  checkAbort()
  const res = await fetch(url, { signal })
  checkAbort()
  if (!res.ok) throw new Error(`读取音轨失败（HTTP ${res.status}）`)
  const arrayBuffer = await res.arrayBuffer()
  checkAbort()

  const { audio, rate } = await decodeToBuffer(arrayBuffer)
  checkAbort()

  const durationSec = audio.duration

  // 下混成单声道，然后立刻松开 AudioBuffer —— 这几步之间瞬时内存能到上百 MB
  const channels = []
  for (let c = 0; c < audio.numberOfChannels; c++) channels.push(audio.getChannelData(c))
  const monoSrc = downmix(channels, audio.length)
  channels.length = 0

  const dec = decimate(monoSrc, rate)
  // dec.samples 在 factor === 1 时就是 monoSrc 本身，所以这个赋值不会提前释放它
  const mono = dec.samples
  const sr = dec.sampleRate

  const hopSec = HOP_SIZE / sr
  const frameSec = FRAME_SIZE / sr
  const frameRate = 1 / hopSec

  if (durationSec > MAX_ANALYZE_SEC) {
    return { notes: [], durationSec, analysisRate: sr, frameRate, tooLong: true }
  }

  // 只保留能装下完整窗口的那些帧
  const nFrames = mono.length >= FRAME_SIZE ? Math.floor((mono.length - FRAME_SIZE) / HOP_SIZE) + 1 : 0
  const midis = new Float64Array(nFrames)
  const clarities = new Float32Array(nFrames)
  // 复用同一个相关度缓冲，省掉几千次分配。长度必须 > maxLag，留够余量
  const scratch = new Float32Array(Math.max(FRAME_SIZE, Math.ceil(sr / MELODY_PITCH.minFreq) + 2))

  onProgress?.(0)
  let i = 0
  while (i < nFrames) {
    const t0 = performance.now()
    const chunkStart = i
    while (
      i < nFrames &&
      i - chunkStart < CHUNK_MAX_FRAMES &&
      performance.now() - t0 < CHUNK_BUDGET_MS
    ) {
      const off = i * HOP_SIZE
      const { freq, clarity } = detectPitch(
        mono.subarray(off, off + FRAME_SIZE),
        sr,
        { ...MELODY_PITCH, corr: scratch },
      )
      midis[i] = freq > 0 ? freqToMidi(freq) : NaN
      clarities[i] = clarity > 0 ? clarity : 0
      i++
    }
    if (i < nFrames) {
      onProgress?.(i / nFrames)
      await yieldToMain()
      checkAbort() // 让出的这段里用户可能已经换歌/离开了
    }
  }
  checkAbort()

  const notes = segmentFrames(midis, clarities, { hopSec, frameSec })

  return { notes, durationSec, analysisRate: sr, frameRate, tooLong: false }
}
