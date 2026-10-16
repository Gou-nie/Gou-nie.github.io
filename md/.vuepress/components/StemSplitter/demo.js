/*
 * @Autor: LXS
 * @Date: 2026-10-16
 * @Description: 「试看播放界面」用的合成素材
 *
 * 调播放界面的 UI，每次都要导入一首歌、等模型下载、再等推理，一轮就是几分钟。
 * 这里现场合成十几秒的两轨 WAV 和一份音符表，点一下直接进播放界面。
 *
 * 音符表是照同一份乐谱**算**出来的，不是分析出来的 —— 所以卷帘、高亮、音名
 * 一定和听到的对得上。代价是它验证不了旋律分析本身，那部分的事别拿它当证据。
 *
 * 模块顶层不碰 window / document（URL、Blob 都在函数里创建），SSR 阶段安全。
 */

/** 每拍几秒。只影响听感：音符表整个按「拍」算，改它不会让卷帘和声音错开 */
const BEAT_SEC = 0.5
/** 合成采样率。示例素材够用就行，低一点 blob 小一半 */
const SAMPLE_RATE = 22050
/**
 * 发声占整拍的比例。留出空隙，高亮才会一跳一跳的 —— 边界对不对，用眼睛就能看出来。
 * 音符表的 end 用的是同一个系数，所以看到的就是听到的。
 */
const GATE = 0.88
/** 起振 / 收尾时长。从 0 起从 0 收，接缝处不会有咔哒声 */
const FADE_SEC = 0.012

/** 主旋律：[MIDI, 拍数]。C 大调绕一圈，跨两个八度，音域和行高都看得出变化 */
const LEAD = [
  [64, 1], [67, 1], [72, 1], [71, 0.5], [69, 0.5],
  [67, 1], [64, 2],
  [62, 1], [65, 1], [69, 1], [67, 0.5], [65, 0.5],
  [64, 1], [60, 2],
  [72, 1], [71, 1], [69, 1], [65, 0.5], [67, 0.5],
  [69, 2], [67, 2],
]

/** 伴奏：[MIDI, 拍数]，每小节一个和弦根音，总拍数和主旋律一样 */
const BASS = [
  [48, 4], [43, 4], [41, 4], [48, 4], [45, 4], [48, 2],
]

/** 总拍数。旋律和伴奏得一样长，否则最后那一小截只剩一轨在响 */
const TOTAL_BEATS = LEAD.reduce((s, n) => s + n[1], 0)
/** 示例时长（秒） */
export const DEMO_SECONDS = TOTAL_BEATS * BEAT_SEC

const midiFreq = (m) => 440 * Math.pow(2, (m - 69) / 12)

/**
 * 往缓冲里叠一个乐音。谐波就是几个正弦相加 —— 示例只要「听得出是哪个音」，
 * 不值得为它上振荡器或者采样。
 *
 * @param {Float32Array} out 目标缓冲（按采样点叠加，不覆盖）
 * @param {number} midi
 * @param {number} at 起始秒
 * @param {number} dur 发声时长（秒）
 * @param {number} gain
 * @param {number[]} harmonics 各次谐波的相对幅度，第 0 项是基频
 */
function addTone(out, midi, at, dur, gain, harmonics) {
  const hz = midiFreq(midi)
  const total = Math.round(dur * SAMPLE_RATE)
  const i0 = Math.round(at * SAMPLE_RATE)
  const fade = Math.max(1, Math.round(FADE_SEC * SAMPLE_RATE))
  for (let i = 0; i < total; i++) {
    const idx = i0 + i
    if (idx >= out.length) break
    // 两头线性进出。音比别人短的时候两段会重叠，取小的那个
    let env = 1
    if (i < fade) env = i / fade
    if (i >= total - fade) env = Math.min(env, (total - i) / fade)
    const t = i / SAMPLE_RATE
    let v = 0
    for (let h = 0; h < harmonics.length; h++) {
      v += harmonics[h] * Math.sin(2 * Math.PI * hz * (h + 1) * t)
    }
    out[idx] += v * env * gain
  }
}

/** 缩放到指定峰值。谐波叠加的峰值超过 1 会被 toWav 削平，听起来就是破音 */
function normalize(pcm, peak) {
  let max = 0
  for (let i = 0; i < pcm.length; i++) {
    const a = Math.abs(pcm[i])
    if (a > max) max = a
  }
  if (!(max > 0)) return
  const k = peak / max
  for (let i = 0; i < pcm.length; i++) pcm[i] *= k
}

/** 16 位单声道 WAV。素材只有十几秒，手写那 44 字节头就够 */
function toWav(pcm, sampleRate) {
  const n = pcm.length
  const buf = new ArrayBuffer(44 + n * 2)
  const v = new DataView(buf)
  const ascii = (off, s) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i))
  }
  ascii(0, 'RIFF')
  v.setUint32(4, 36 + n * 2, true)
  ascii(8, 'WAVE')
  ascii(12, 'fmt ')
  v.setUint32(16, 16, true) // fmt 块长度
  v.setUint16(20, 1, true) // PCM
  v.setUint16(22, 1, true) // 单声道
  v.setUint32(24, sampleRate, true)
  v.setUint32(28, sampleRate * 2, true) // 字节率 = 采样率 × 声道 × 位深/8
  v.setUint16(32, 2, true) // 块对齐
  v.setUint16(34, 16, true) // 位深
  ascii(36, 'data')
  v.setUint32(40, n * 2, true)
  for (let i = 0; i < n; i++) {
    const s = pcm[i] < -1 ? -1 : pcm[i] > 1 ? 1 : pcm[i]
    v.setInt16(44 + i * 2, Math.round(s * 32767), true)
  }
  return new Blob([buf], { type: 'audio/wav' })
}

/**
 * 合成一份示例素材。
 *
 * @returns {{vocals: string, instrumental: string, notes: object[], durationSec: number}}
 *          vocals / instrumental 是 WAV 的 blob URL，撤 URL 是调用方的事
 *          （和分离出来的两轨走同一条 release 路径）
 */
export function buildDemo() {
  const frames = Math.round(DEMO_SECONDS * SAMPLE_RATE)
  const lead = new Float32Array(frames)
  const pad = new Float32Array(frames)

  const notes = []
  let at = 0
  for (let i = 0; i < LEAD.length; i++) {
    const [midi, beats] = LEAD[i]
    const span = beats * BEAT_SEC
    addTone(lead, midi, at, span * GATE, 0.8, [1, 0.32, 0.14, 0.06])
    notes.push({
      row: midi,
      start: at,
      end: at + span * GATE,
      // 清晰度错开一点，卷帘那层「越含糊越淡」的透明度编码才不是一片死白
      clarity: 0.66 + (i % 4) * 0.1,
    })
    at += span
  }

  let bat = 0
  for (const [midi, beats] of BASS) {
    const span = beats * BEAT_SEC
    // 根音 + 五度 + 八度。这一轨要比人声轨轻，混音滑块推来推去才听得出差别
    addTone(pad, midi, bat, span * 0.98, 0.3, [1, 0.5])
    addTone(pad, midi + 7, bat, span * 0.98, 0.18, [1, 0.4])
    addTone(pad, midi + 12, bat, span * 0.98, 0.12, [1, 0.3])
    bat += span
  }

  normalize(lead, 0.9)
  normalize(pad, 0.55)

  return {
    vocals: URL.createObjectURL(toWav(lead, SAMPLE_RATE)),
    instrumental: URL.createObjectURL(toWav(pad, SAMPLE_RATE)),
    notes,
    durationSec: DEMO_SECONDS,
  }
}
