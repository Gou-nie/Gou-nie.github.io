/*
 * @Autor: LXS
 * @Date: 2026-10-23
 * @Description: 人声旋律音符 → 可下载的乐谱（MIDI / MusicXML）
 *
 * 输入是 melody.js / demo.js 产出的 {row, start, end, clarity}（秒），单声部假设，
 * 和 extractMelody 一致。
 *
 * 时间怎么落到谱面上：先按 BPM 换算成 tick，再按十六分音符量化。旋律是从真实演唱
 * 里测出来的，起音本来就不会正好落在格子线上；不量化的话五线谱上全是奇怪的时值。
 * 量化可以在界面上关掉 —— MIDI 进 DAW 时保留原始时间反而更有用。
 *
 * 音高一律按升号拼写，调号写死 C 大调（没有调性检测）。音符的绝对音高不受影响，
 * 需要的话到打谱软件里改调号即可。
 *
 * 模块顶层不碰 window / document（Blob 只在函数里创建），SSR 阶段安全。
 */

import { NOTE_NAMES } from '../subComponents/pitch.js'

/** 每四分音符的 tick 数。MIDI 和 MusicXML 共用一套时间轴 */
export const DIVISIONS = 480
/** 默认量化网格：十六分音符 */
const GRID = DIVISIONS / 4
/** 每小节拍数（4/4） */
const BEATS_PER_MEASURE = 4
/** MusicXML 的 <divisions> 和 MIDI 的 PPQ 一致 */
export const DEFAULT_BPM = 120

const clampBpm = (bpm) => {
  const v = Number(bpm)
  return Number.isFinite(v) && v >= 20 && v <= 400 ? v : DEFAULT_BPM
}

/**
 * 秒 → tick，量化，并处理单声部下的重叠。
 *
 * @param {{row: number, start: number, end: number}[]} notes
 * @param {{bpm?: number, quantize?: boolean}} [opt]
 * @returns {{row: number, start: number, end: number}[]} tick 单位，已排序
 */
export function toScoreNotes(notes, opt) {
  const { bpm = DEFAULT_BPM, quantize = true } = opt || {}
  const secPerQuarter = 60 / clampBpm(bpm)
  const grid = quantize ? GRID : 1
  const snap = (sec) =>
    Math.max(0, Math.round(((sec / secPerQuarter) * DIVISIONS) / grid) * grid)

  const out = []
  for (const n of Array.isArray(notes) ? notes : []) {
    if (!n || !Number.isFinite(n.start) || !Number.isFinite(n.end)) continue
    const row = Math.round(n.row)
    if (row < 0 || row > 127) continue
    const start = snap(n.start)
    let end = snap(n.end)
    // 量化可能把短音压成 0 长。给一个最小格子，至少能在谱上看见一个音符
    if (end - start < grid) end = start + grid
    if (end <= start) continue
    out.push({ row, start, end })
  }
  out.sort((a, b) => a.start - b.start || a.row - b.row)

  // 单声部：上一个音还没收尾就到下一个音时截短它。两个音叠在同一时刻，
  // 谱面只会画成并排的符头，读不出这是一条旋律
  for (let i = 1; i < out.length; i++) {
    if (out[i].start < out[i - 1].end) out[i - 1].end = out[i].start
  }

  // 截短后同音高首尾相接的合并成一个音（量化边界上很容易出现），零长度的丢掉
  const clean = []
  for (const n of out) {
    const prev = clean[clean.length - 1]
    if (prev && prev.row === n.row && n.start <= prev.end) {
      if (n.end > prev.end) prev.end = n.end
      continue
    }
    if (n.end > n.start) clean.push(n)
  }
  return clean
}

// ──────────────────────────────────────────────────────────────── MIDI

/** MIDI 变长整数（delta time） */
function varLen(n) {
  const bytes = [n & 0x7f]
  let v = n >> 7
  while (v > 0) {
    bytes.unshift((v & 0x7f) | 0x80)
    v >>= 7
  }
  return bytes
}

/**
 * 生成标准 MIDI 文件（format 0，单轨）。钢琴音色，力度固定 96。
 *
 * @param {{row: number, start: number, end: number}[]} notes 秒为单位
 * @param {{bpm?: number, quantize?: boolean, title?: string}} [opt]
 * @returns {Blob}
 */
export function buildMidi(notes, opt) {
  const { bpm = DEFAULT_BPM, quantize = true, title = 'Melody' } = opt || {}
  const tempo = clampBpm(bpm)
  const evs = toScoreNotes(notes, { bpm: tempo, quantize })

  const track = []
  const push = (...bytes) => track.push(...bytes)

  // 曲名（UTF-8）
  const nameBytes = Array.from(new TextEncoder().encode(String(title)))
  push(0x00, 0xff, 0x03, ...varLen(nameBytes.length), ...nameBytes)

  // 速度：每四分音符的微秒数
  const usPerQuarter = Math.round(60000000 / tempo)
  push(
    0x00, 0xff, 0x51, 0x03,
    (usPerQuarter >> 16) & 0xff,
    (usPerQuarter >> 8) & 0xff,
    usPerQuarter & 0xff
  )
  // 拍号 4/4
  push(0x00, 0xff, 0x58, 0x04, BEATS_PER_MEASURE, 0x02, 0x18, 0x08)
  // 音色：Acoustic Grand Piano
  push(0x00, 0xc0, 0x00)

  const list = []
  for (const n of evs) {
    list.push({ tick: n.start, on: true, row: n.row })
    list.push({ tick: n.end, on: false, row: n.row })
  }
  // 同一 tick 上先 note-off 再 note-on：同音高首尾相接时不会被新音符掐断
  list.sort((a, b) => a.tick - b.tick || Number(a.on) - Number(b.on))

  let last = 0
  for (const e of list) {
    const delta = Math.max(0, e.tick - last)
    last = e.tick
    push(...varLen(delta))
    push(e.on ? 0x90 : 0x80, e.row, e.on ? 96 : 0)
  }
  push(0x00, 0xff, 0x2f, 0x00) // End of Track

  const bytes = []
  // MThd：format 0，1 条轨道，PPQ
  const ascii = (s) => {
    for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i))
  }
  ascii('MThd')
  bytes.push(0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01)
  bytes.push((DIVISIONS >> 8) & 0xff, DIVISIONS & 0xff)

  ascii('MTrk')
  const len = track.length
  bytes.push((len >> 24) & 0xff, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff)
  bytes.push(...track)

  return new Blob([new Uint8Array(bytes)], { type: 'audio/midi' })
}

// ──────────────────────────────────────────────────────────── MusicXML

/** 标准时值（tick），从全音符到 64 分音符。用于给 <note> 补 <type> 和 <dot> */
const TYPE_TICKS = [
  ['whole', DIVISIONS * 4],
  ['half', DIVISIONS * 2],
  ['quarter', DIVISIONS],
  ['eighth', DIVISIONS / 2],
  ['16th', DIVISIONS / 4],
  ['32nd', DIVISIONS / 8],
  ['64th', DIVISIONS / 16],
]

/**
 * tick 长度 → {type, dots}。对不上标准时值就返回 null —— <type> 在 MusicXML 里
 * 是可选的，读谱软件会按 <duration> 算时值，硬编一个错的 type 反而会画错。
 */
function noteType(ticks) {
  for (const [type, base] of TYPE_TICKS) {
    if (ticks === base) return { type, dots: 0 }
    if (ticks === base * 1.5) return { type, dots: 1 }
  }
  return null
}

const typeXml = (t) => (t ? `<type>${t.type}</type>${'<dot/>'.repeat(t.dots)}` : '')

/** MIDI 编号 → MusicXML 音高。一律按升号拼写 */
function pitchXml(row) {
  const name = NOTE_NAMES[((row % 12) + 12) % 12]
  const alter = name.includes('#') ? '<alter>1</alter>' : ''
  const octave = Math.floor(row / 12) - 1
  return `<pitch><step>${name[0]}</step>${alter}<octave>${octave}</octave></pitch>`
}

const escXml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c])

function noteXml(seg) {
  const ties = []
  if (seg.tiedFromPrev) ties.push('stop')
  if (seg.tiedToNext) ties.push('start')
  const tieXml = ties.map((t) => `<tie type="${t}"/>`).join('')
  const notations = ties.length
    ? `<notations>${ties.map((t) => `<tied type="${t}"/>`).join('')}</notations>`
    : ''
  const dur = seg.end - seg.start
  return (
    '<note>' +
    pitchXml(seg.row) +
    `<duration>${dur}</duration>` +
    tieXml +
    '<voice>1</voice>' +
    typeXml(noteType(dur)) +
    notations +
    '</note>'
  )
}

function restXml(ticks) {
  return `<note><rest/><duration>${ticks}</duration><voice>1</voice>${typeXml(noteType(ticks))}</note>`
}

/**
 * 生成 MusicXML（partwise，3.1）。4/4 拍、C 大调、高音谱号。
 *
 * 跨小节的音符会被切成几段，用连音线（tie）连起来 —— MusicXML 里音符不能
 * 越过节线，不切开的话读谱软件会拒绝打开或把时值算乱。
 *
 * @param {{row: number, start: number, end: number}[]} notes 秒为单位
 * @param {{bpm?: number, quantize?: boolean, title?: string}} [opt]
 * @returns {Blob}
 */
export function buildMusicXml(notes, opt) {
  const { bpm = DEFAULT_BPM, quantize = true, title = 'Melody' } = opt || {}
  const tempo = clampBpm(bpm)
  const evs = toScoreNotes(notes, { bpm: tempo, quantize })

  const measureTicks = DIVISIONS * BEATS_PER_MEASURE
  const last = evs.length ? evs[evs.length - 1].end : 0
  const measureCount = Math.max(1, Math.ceil(last / measureTicks))

  // 先按小节边界切开，每段记住自己是不是连音线的中间段
  const segs = []
  for (const n of evs) {
    let s = n.start
    while (s < n.end) {
      const barEnd = (Math.floor(s / measureTicks) + 1) * measureTicks
      const e = Math.min(n.end, barEnd)
      segs.push({
        row: n.row,
        start: s,
        end: e,
        tiedFromPrev: s > n.start,
        tiedToNext: e < n.end,
      })
      s = e
    }
  }

  let body = ''
  for (let m = 0; m < measureCount; m++) {
    const mStart = m * measureTicks
    const mEnd = mStart + measureTicks
    let cursor = mStart
    let content = ''

    if (m === 0) {
      content +=
        '<attributes>' +
        `<divisions>${DIVISIONS}</divisions>` +
        '<key><fifths>0</fifths></key>' +
        `<time><beats>${BEATS_PER_MEASURE}</beats><beat-type>4</beat-type></time>` +
        '<clef><sign>G</sign><line>2</line></clef>' +
        '</attributes>' +
        '<direction placement="above">' +
        '<direction-type><metronome><beat-unit>quarter</beat-unit>' +
        `<per-minute>${Math.round(tempo)}</per-minute></metronome></direction-type>` +
        `<sound tempo="${tempo}"/>` +
        '</direction>'
    }

    for (const s of segs) {
      if (s.start < mStart || s.start >= mEnd) continue
      if (s.start > cursor) content += restXml(s.start - cursor)
      content += noteXml(s)
      cursor = s.end
    }
    if (cursor < mEnd) content += restXml(mEnd - cursor)

    body += `<measure number="${m + 1}">${content}</measure>`
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" ' +
    '"http://www.musicxml.org/dtds/partwise.dtd">\n' +
    '<score-partwise version="3.1">' +
    `<work><work-title>${escXml(title)}</work-title></work>` +
    '<identification><encoding><software>StemSplitter</software>' +
    `<encoding-date>${new Date().toISOString().slice(0, 10)}</encoding-date></encoding></identification>` +
    '<part-list><score-part id="P1"><part-name>Melody</part-name></score-part></part-list>' +
    `<part id="P1">${body}</part>` +
    '</score-partwise>\n'

  return new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' })
}
