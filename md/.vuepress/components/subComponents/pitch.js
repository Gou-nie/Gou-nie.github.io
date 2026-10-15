/*
 * @Autor: LXS
 * @Date: 2026-10-15
 * @Description: 共享的基频（音高）检测与音名工具
 *
 * 从 HarmonicaScale.vue 抽出来的，现在两个页面共用：
 *  - HarmonicaScale.vue  麦克风实时检测（每帧一次，44.1kHz、512 点窗口）
 *  - StemSplitter/melody 人声轨的整曲旋律提取（低频窗口，见 melody.js）
 *
 * 检测算法本身**逐字节**保持原样（见下方注释里标出的几个易被误改的点）——
 * 口琴页的指针稳定性依赖这些行为，改动会被听出来。
 * 模块顶层不访问 window / document，VuePress 的 SSR 阶段安全。
 */

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/** detectPitch 的默认阈值：口琴的音域与清晰度要求（两参调用即走这套） */
export const PITCH_DEFAULTS = { minFreq: 120, maxFreq: 4000, minClarity: 0.5 }

/** MIDI 编号 → 音名（C4 = 60） */
export function midiName(m) {
  const name = NOTE_NAMES[((m % 12) + 12) % 12]
  const oct = Math.floor(m / 12) - 1
  return name + oct
}

/** 音分偏差的显示文本，如 "+17 音分" */
export function fmtCents(c) {
  return (c > 0 ? '+' : '') + c.toFixed(0) + ' 音分'
}

/**
 * `opts.firstPeak` 的门槛：局部极大值要达到全局最大值的这个比例才算「够强的峰」。
 * 周期性信号在每个 k×周期 处相关系数都接近 1，所以 0.9 足以把真正的基频周期和
 * 噪声毛刺区分开，又不会漏掉泛音结构不同的音色。
 */
const FIRST_PEAK_RATIO = 0.9

/**
 * 自相关法求基频（对复音/泛音丰富的口琴更稳健）。
 *
 * @param {Float32Array|number[]} samples 时域采样
 * @param {number} sampleRate
 * @param {object} [opts]
 * @param {number} [opts.minFreq=120]
 * @param {number} [opts.maxFreq=4000]
 * @param {number} [opts.minClarity=0.5]
 * @param {Float32Array} [opts.corr] 可选的复用缓冲（长度需 > maxLag）。
 *        只有 minLag..maxLag 会被写、只有 >= minLag 会被读，所以上一轮的残留值
 *        不可能被观测到，**无需清零**。整曲分析里能省掉几千次分配。
 * @param {boolean} [opts.firstPeak=false] 取第一个够强的局部极大值作为基频，而不是
 *        全局 argmax。**只有当信号足够周期性时才需要打开**（整曲旋律提取就是这种），
 *        实时的口琴检测不打开 —— 那条路径的行为逐字节保持原样。理由见下面那段注释。
 * @returns {{freq: number, clarity: number}} freq 为 -1 表示没测到（失败哨兵，调用方一律判 > 0）
 */
export function detectPitch(samples, sampleRate, opts) {
  const {
    minFreq = PITCH_DEFAULTS.minFreq,
    maxFreq = PITCH_DEFAULTS.maxFreq,
    minClarity = PITCH_DEFAULTS.minClarity,
    firstPeak = false,
    corr: scratch,
  } = opts || {}

  const n = samples.length
  let mean = 0
  for (let i = 0; i < n; i++) mean += samples[i]
  mean /= n

  let sumSq = 0
  for (let i = 0; i < n; i++) { const d = samples[i] - mean; sumSq += d * d }
  const variance = sumSq / n
  const rms = Math.sqrt(variance)
  // 注意：这两个早退返回 clarity: 0，而下面的 clarity 不足那一处返回的是真实 bestClarity
  if (rms < 0.01) return { freq: -1, clarity: 0 }

  const minLag = Math.max(2, Math.floor(sampleRate / maxFreq))
  const maxLag = Math.min(Math.floor(sampleRate / minFreq), n - 2)
  if (maxLag <= minLag) return { freq: -1, clarity: 0 }

  const corr = scratch && scratch.length > maxLag ? scratch : new Float32Array(maxLag + 1)
  let bestLag = -1
  let bestClarity = -Infinity
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0
    for (let i = 0; i < n - lag; i++) s += (samples[i] - mean) * (samples[i + lag] - mean)
    const c = (s / (n - lag)) / variance
    corr[lag] = c
    if (c > bestClarity) { bestClarity = c; bestLag = lag }
  }

  if (bestClarity < minClarity) return { freq: -1, clarity: bestClarity }

  if (firstPeak) {
    // 取第一个够强的**局部极大值**，而不是全局 argmax。
    //
    // 为什么必要：只要是周期性信号，相关系数在**每一个** k×周期 处都接近 1，
    // 于是 argmax 落在"最接近整数采样"的那个倍数上，而它常常不是基频。
    // 例：700Hz @11025，真周期 15.75 采样，4×15.75=63 正好是整数 → corr[63]=1.000，
    // 而 corr[16] 只有 0.9955。argmax 取 63，守卫只除一次 → 32 → 测成 350Hz。
    // 实测（80~1100Hz 扫描）：稳态乐音的错误率 47.9% → 2.9%，带颤音的真实人声 4.1% → 0.8%。
    const thresh = FIRST_PEAK_RATIO * bestClarity
    for (let l = minLag + 1; l < maxLag; l++) {
      if (corr[l] >= corr[l - 1] && corr[l] >= corr[l + 1] && corr[l] >= thresh) {
        bestLag = l
        bestClarity = corr[l]
        break
      }
    }
    // 一个都没找到就退回 argmax 的结果，即下面的行为
  } else {
    // 防八度错误：若半周期/三分之一周期处相关度相近，取更短延迟（更高频、更可能是基频）
    // 命中即 break —— 2 命中时不能再去试 3
    for (const div of [2, 3]) {
      const l = Math.round(bestLag / div)
      if (l >= minLag && corr[l] >= 0.9 * bestClarity) {
        bestLag = l
        bestClarity = corr[l]
        break
      }
    }
  }

  // 二次插值提高精度
  let lagF = bestLag
  if (bestLag > minLag && bestLag < maxLag) {
    const c0 = corr[bestLag - 1]
    const c1 = corr[bestLag]
    const c2 = corr[bestLag + 1]
    const denom = c0 - 2 * c1 + c2
    if (denom !== 0) {
      const delta = 0.5 * (c0 - c2) / denom
      if (Math.abs(delta) < 1) lagF = bestLag + delta
    }
  }

  const freq = sampleRate / lagF
  if (freq < minFreq || freq > maxFreq) return { freq: -1, clarity: bestClarity }
  return { freq, clarity: bestClarity }
}
