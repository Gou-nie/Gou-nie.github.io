/*
 * @Autor: LXS
 * @Date: 2026-10-23
 * @Description: 人声旋律音符 → 可下载的乐谱（MIDI / MusicXML / 五线谱 SVG / 简谱 SVG）
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

/** 每四分音符的 tick 数。MIDI、MusicXML、五线谱/简谱 SVG 共用一套时间轴 */
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
 * 把音符按小节边界切开。MusicXML 里音符不能越过节线，简谱跨小节也要用
 * 连音弧（tie）接起来，所以两种谱面共用这套切分。noteId 标记「这几段原本是
 * 同一个音」，简谱靠它画连音弧。
 */
function splitAtMeasures(evs, measureTicks) {
  const segs = []
  evs.forEach((n, noteId) => {
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
        noteId,
      })
      s = e
    }
  })
  return segs
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
  const segs = splitAtMeasures(evs, measureTicks)

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

// ──────────────────────────────────────────────────────────── 简谱（SVG）

/** 十六分音符占一格的 tick 数。简谱按每小节 16 格排版 */
const SLOT_TICKS = DIVISIONS / 4
/** 4/4 每小节 16 格 */
const SLOTS_PER_MEASURE = BEATS_PER_MEASURE * 4
/** C 大调音级：C=1 … B=7，黑键按升号写成 ♯1 这种 */
const JIANPU_DEGREE = ['1', '♯1', '2', '♯2', '3', '4', '♯4', '5', '♯5', '6', '♯6', '7']
/** 音符时值可拆成的标准单位（单位是十六分音符格） */
const NOTE_UNITS = [16, 12, 8, 6, 4, 3, 2, 1]

/** 把 n 格拆成若干个标准时值。最大单位从 16 往下贪心就够覆盖所有整数 */
function splitUnits(n, units) {
  const out = []
  for (const u of units) {
    while (n >= u) {
      out.push(u)
      n -= u
    }
  }
  return out
}

/** 一个时值单位的写法：延长线、减时线、附点 */
function unitStyle(n) {
  if (n >= 8) return { dashes: n / 4 - 1, underlines: 0, dot: false }
  if (n === 6) return { dashes: 0, underlines: 0, dot: true }
  if (n === 4) return { dashes: 0, underlines: 0, dot: false }
  if (n === 3) return { dashes: 0, underlines: 1, dot: true }
  if (n === 2) return { dashes: 0, underlines: 1, dot: false }
  return { dashes: 0, underlines: 2, dot: false } // 1 格 = 十六分音符
}

/**
 * 生成简谱 SVG。和 MusicXML 共用同一套量化后的音符，4/4 拍、C 大调。
 *
 * 排版用固定的十六分音符格：每小节 16 格，音符按起始格定位。真实演唱量化后
 * 时值千奇百怪，按固定格子摆至少不会互相压字。超过一拍的音画延长线（–），
 * 不到一拍的画减时线，附点音画附点；跨小节和拆开的时值用连音弧连起来。
 *
 * @param {{row: number, start: number, end: number}[]} notes 秒为单位
 * @param {{bpm?: number, quantize?: boolean, title?: string}} [opt]
 * @returns {Blob}
 */
export function buildJianpuSvg(notes, opt) {
  const { bpm = DEFAULT_BPM, quantize = true, title = 'Melody' } = opt || {}
  const tempo = clampBpm(bpm)
  const evs = toScoreNotes(notes, { bpm: tempo, quantize })

  const measureTicks = DIVISIONS * BEATS_PER_MEASURE
  const last = evs.length ? evs[evs.length - 1].end : 0
  const measureCount = Math.max(1, Math.ceil(last / measureTicks))
  const segs = splitAtMeasures(evs, measureTicks)

  // 按小节收集谱面块。音符块和补齐的休止块都在这里排好序
  const byMeasure = Array.from({ length: measureCount }, () => [])
  for (const seg of segs) {
    const m = Math.floor(seg.start / measureTicks)
    if (m >= 0 && m < measureCount) byMeasure[m].push(seg)
  }

  // 休止符尽量落在拍点上：先填掉当前拍到拍点的零头，再按整拍补，
  // 避免出现从半拍开始、横跨拍点的奇怪附点休止
  const addRests = (into, from, to) => {
    let p = from
    while (p < to) {
      const toBeat = 4 - (p % 4)
      const u = Math.min(toBeat, to - p)
      const whole = u >= 4 ? 4 : 0
      if (whole) {
        into.push({ kind: 'rest', slot: p, slots: 4, tieId: null })
        p += 4
      } else {
        const part = u >= 3 ? 3 : u >= 2 ? 2 : 1
        into.push({ kind: 'rest', slot: p, slots: part, tieId: null })
        p += part
      }
    }
  }

  for (let m = 0; m < measureCount; m++) {
    const mStart = m * measureTicks
    const chunks = []
    let cursor = 0
    for (const seg of byMeasure[m].sort((a, b) => a.start - b.start)) {
      if (cursor >= SLOTS_PER_MEASURE) break
      // 没量化时 tick 可能落在格子中间，按最近格摆放；先保证和上一个音不重叠
      let s = Math.max(cursor, Math.round((seg.start - mStart) / SLOT_TICKS))
      let e = Math.round((seg.end - mStart) / SLOT_TICKS)
      s = Math.min(s, SLOTS_PER_MEASURE - 1)
      e = Math.min(Math.max(e, s + 1), SLOTS_PER_MEASURE)
      if (s > cursor) addRests(chunks, cursor, s)
      for (const u of splitUnits(e - s, NOTE_UNITS)) {
        chunks.push({ kind: 'note', slot: s, slots: u, row: seg.row, tieId: seg.noteId })
        s += u
      }
      cursor = e
    }
    if (cursor < SLOTS_PER_MEASURE) addRests(chunks, cursor, SLOTS_PER_MEASURE)
    byMeasure[m] = chunks
  }

  const WIDTH = 1600
  const MARGIN = 90
  const PER_SYSTEM = 4
  /** 音符和谱线之间的留白，避免十六分音符贴到小节线上 */
  const PAD = 10
  const HEADER_H = 180
  const SYSTEM_H = 150
  const BASELINE = 82
  const systems = Math.ceil(measureCount / PER_SYSTEM)
  // 均分到各行（5 小节排成 3+2，而不是 4+1），最后一行不会孤零零一小节
  const baseRow = Math.floor(measureCount / systems)
  const extraRows = measureCount % systems
  const rowCounts = Array.from(
    { length: systems },
    (_, i) => baseRow + (i < extraRows ? 1 : 0)
  )
  const height = HEADER_H + systems * SYSTEM_H + 30

  const parts = []
  const add = (s) => parts.push(s)
  add(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" ` +
      `width="${WIDTH}" height="${height}" ` +
      `font-family="'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans SC',sans-serif">`
  )
  add(`<rect width="${WIDTH}" height="${height}" fill="#fff"/>`)
  add(
    `<text x="${WIDTH / 2}" y="66" font-size="34" font-weight="600" text-anchor="middle" ` +
      `fill="#1a1a1a">${escXml(title)}</text>`
  )
  add(
    `<text x="${WIDTH / 2}" y="108" font-size="20" text-anchor="middle" fill="#555">` +
      `1 = C　4/4　♩ = ${Math.round(tempo)}</text>`
  )

  const tiePoints = []

  let first = 0
  for (let sys = 0; sys < systems; sys++) {
    const top = HEADER_H + sys * SYSTEM_H
    const baseline = top + BASELINE
    const barTop = top + 30
    const barBottom = baseline + 30
    const rowCount = rowCounts[sys]
    const end = first + rowCount
    const sysLeftX = MARGIN
    // 每行的小节摊满整行宽度；最后一行不足四小节时也不会空出一大截
    const rowMeasureW = (WIDTH - MARGIN * 2) / rowCount
    const rowSlotW = (rowMeasureW - PAD * 2) / SLOTS_PER_MEASURE
    const sysEndX = MARGIN + rowCount * rowMeasureW

    for (let m = first; m < end; m++) {
      const mx = MARGIN + (m - first) * rowMeasureW
      add(
        `<line x1="${mx}" y1="${barTop}" x2="${mx}" y2="${barBottom}" ` +
          `stroke="#333" stroke-width="1.5"/>`
      )

      for (const c of byMeasure[m]) {
        const x = mx + PAD + (c.slot + 0.5) * rowSlotW
        const style = unitStyle(c.slots)
        const isRest = c.kind === 'rest'
        const label = isRest ? '0' : JIANPU_DEGREE[((c.row % 12) + 12) % 12]

        add(
          `<text x="${x.toFixed(1)}" y="${baseline}" font-size="24" text-anchor="middle" ` +
            `fill="#1a1a1a">${label}</text>`
        )

        if (!isRest) {
          // 高八度点在上、低八度点在下，两点就是两个八度
          const oct = Math.floor(c.row / 12) - 5
          for (let k = 0; k < Math.abs(oct); k++) {
            const y = oct > 0 ? baseline - 26 - k * 8 : baseline + 17 + k * 8
            add(`<circle cx="${x.toFixed(1)}" cy="${y}" r="2.3" fill="#1a1a1a"/>`)
          }
        }

        if (style.dot) {
          add(`<circle cx="${(x + 12).toFixed(1)}" cy="${baseline - 8}" r="2.3" fill="#1a1a1a"/>`)
        }

        for (let k = 0; k < style.underlines; k++) {
          const y = baseline + 6 + k * 4.5
          add(
            `<line x1="${(x - 8).toFixed(1)}" y1="${y}" x2="${(x + 8).toFixed(1)}" y2="${y}" ` +
              `stroke="#1a1a1a" stroke-width="1.6"/>`
          )
        }

        // 延长线是同一音符的延续，连音弧从最后一条延长线后面起笔，
        // 而不是从数字本身拉起跨过整个小节
        let endX = x
        for (let k = 1; k <= style.dashes; k++) {
          endX = mx + PAD + (c.slot + k * 4 + 0.5) * rowSlotW
          add(
            `<text x="${endX.toFixed(1)}" y="${baseline}" font-size="24" text-anchor="middle" ` +
              `fill="#1a1a1a">–</text>`
          )
        }

        // 每个音符块都记下位置，同一 noteId 的块之间画连音弧
        if (!isRest) tiePoints.push({ id: c.tieId, sys, x, endX, baseline, sysLeftX, sysEndX })
      }
    }

    // 每行最后一小节收尾，全曲最后一行画双线
    add(
      `<line x1="${sysEndX}" y1="${barTop}" x2="${sysEndX}" y2="${barBottom}" ` +
        `stroke="#333" stroke-width="${sys === systems - 1 ? 4 : 1.5}"/>`
    )
    if (sys === systems - 1) {
      add(
        `<line x1="${sysEndX - 7}" y1="${barTop}" x2="${sysEndX - 7}" y2="${barBottom}" ` +
          `stroke="#333" stroke-width="1.5"/>`
      )
    }
    first = end
  }

  // 同一原始音符被拆开的块按顺序连起来。跨行的在行尾/行首各画一小段
  const tieById = new Map()
  for (const p of tiePoints) {
    if (p.id == null) continue
    if (!tieById.has(p.id)) tieById.set(p.id, [])
    tieById.get(p.id).push(p)
  }
  const tiePath = (x1, x2, baseline) => {
    if (x2 - x1 < 6) return ''
    const y = baseline - 42
    const mx = (x1 + x2) / 2
    return (
      `<path d="M${(x1 + 3).toFixed(1)} ${y} Q${mx.toFixed(1)} ${y - 12} ` +
      `${(x2 - 3).toFixed(1)} ${y}" fill="none" stroke="#1a1a1a" stroke-width="1.6"/>`
    )
  }
  for (const pts of tieById.values()) {
    pts.sort((a, b) => a.sys - b.sys || a.x - b.x)
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]
      const b = pts[i]
      if (a.sys === b.sys) add(tiePath(a.endX, b.x, a.baseline))
      else {
        add(tiePath(a.endX, a.sysEndX - 7, a.baseline))
        add(tiePath(b.sysLeftX + 7, b.x, b.baseline))
      }
    }
  }

  add('</svg>')
  const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + parts.join('') + '\n'
  return new Blob([svg], { type: 'image/svg+xml' })
}

// ──────────────────────────────────────────────────────────── 五线谱（SVG）

/**
 * 十六分音符格 → VexFlow 时值。附点用 'd' 后缀（VexFlow 会同时算进 tick），
 * 休止符再加 'r'。格数和简谱共用同一套 NOTE_UNITS 拆分。
 */
const UNIT_DURATION = {
  16: { base: 'w', dots: 0 },
  12: { base: 'h', dots: 1 },
  8: { base: 'h', dots: 0 },
  6: { base: 'q', dots: 1 },
  4: { base: 'q', dots: 0 },
  3: { base: '8', dots: 1 },
  2: { base: '8', dots: 0 },
  1: { base: '16', dots: 0 },
}

/** MIDI 编号 → VexFlow 的 key（如 61 → 'c#/4'）。和简谱一样一律按升号拼写 */
function vexKey(row) {
  return NOTE_NAMES[((row % 12) + 12) % 12].toLowerCase() + '/' + (Math.floor(row / 12) - 1)
}

/**
 * 把量化后的音符排到每小节 16 格上：音符按标准时值拆开，空隙补休止。
 * 返回的块是 { kind: 'note'|'rest', slot, slots, row?, noteId? }。
 * noteId 指向原始音符，五线谱靠它把拆开的段用连音线接起来。
 */
function layoutSlots(evs, measureTicks) {
  const last = evs.length ? evs[evs.length - 1].end : 0
  const measureCount = Math.max(1, Math.ceil(last / measureTicks))
  const byMeasure = Array.from({ length: measureCount }, () => [])
  for (const seg of splitAtMeasures(evs, measureTicks)) {
    const m = Math.floor(seg.start / measureTicks)
    if (m >= 0 && m < measureCount) byMeasure[m].push(seg)
  }

  // 休止符尽量用整拍/整小节的写法；填不整的零头从短时值往下拆
  const addRests = (into, from, to) => {
    let p = from
    while (p < to) {
      const rem = to - p
      let u = 1
      if (p % 16 === 0 && rem >= 16) u = 16
      else if (p % 8 === 0 && rem >= 12) u = 12
      else if (p % 8 === 0 && rem >= 8) u = 8
      else if (p % 4 === 0 && rem >= 6) u = 6
      else if (p % 4 === 0 && rem >= 4) u = 4
      else if (p % 4 === 0 && rem >= 3) u = 3
      else if (p % 2 === 0 && rem >= 2) u = 2
      into.push({ kind: 'rest', slot: p, slots: u })
      p += u
    }
  }

  for (let m = 0; m < measureCount; m++) {
    const mStart = m * measureTicks
    const chunks = []
    let cursor = 0
    for (const seg of byMeasure[m].sort((a, b) => a.start - b.start)) {
      if (cursor >= SLOTS_PER_MEASURE) break
      // 不量化时 tick 可能落在格子中间，按最近格摆放；先保证和上一个音不重叠
      let s = Math.max(cursor, Math.round((seg.start - mStart) / SLOT_TICKS))
      let e = Math.round((seg.end - mStart) / SLOT_TICKS)
      s = Math.min(s, SLOTS_PER_MEASURE - 1)
      e = Math.min(Math.max(e, s + 1), SLOTS_PER_MEASURE)
      if (s > cursor) addRests(chunks, cursor, s)
      for (const u of splitUnits(e - s, NOTE_UNITS)) {
        chunks.push({ kind: 'note', slot: s, slots: u, row: seg.row, noteId: seg.noteId })
        s += u
      }
      cursor = e
    }
    if (cursor < SLOTS_PER_MEASURE) addRests(chunks, cursor, SLOTS_PER_MEASURE)
    byMeasure[m] = chunks
  }

  return { measureCount, byMeasure }
}

/** 五线谱里文字的统一字体。中文标题和速度行都靠系统字体渲染 */
const SVG_FONT = "'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans SC',sans-serif"

/**
 * 生成五线谱 SVG。和简谱共用量化后的音符、4/4 拍、C 大调、高音谱号。
 *
 * VexFlow 按需加载：只有点「五线谱」导出时才下载这块代码，不拖慢页面。
 * VexFlow 的 SVG 后端需要一个真实 DOM 节点来量文字宽度，所以临时挂一个
 * 屏幕外容器，画完序列化再删掉。音高字形是 path，导出的文件自带全部轮廓。
 *
 * @param {{row: number, start: number, end: number}[]} notes 秒为单位
 * @param {{bpm?: number, quantize?: boolean, title?: string}} [opt]
 * @returns {Promise<Blob>}
 */
export async function buildStaffSvg(notes, opt) {
  const {
    Renderer,
    Stave,
    StaveNote,
    Voice,
    Formatter,
    Beam,
    Accidental,
    Dot,
    StaveTie,
    Barline,
    Fraction,
  } = await import('vexflow/bravura')

  const { bpm = DEFAULT_BPM, quantize = true, title = 'Melody' } = opt || {}
  const tempo = clampBpm(bpm)
  const evs = toScoreNotes(notes, { bpm: tempo, quantize })

  const measureTicks = DIVISIONS * BEATS_PER_MEASURE
  const { measureCount, byMeasure } = layoutSlots(evs, measureTicks)

  const WIDTH = 1600
  const MARGIN = 90
  const PER_SYSTEM = 4
  const HEADER_H = 150
  const SYSTEM_H = 170
  const CLEF_W = 42
  const systems = Math.ceil(measureCount / PER_SYSTEM)
  // 均分到各行（5 小节排成 3+2，而不是 4+1）
  const baseRow = Math.floor(measureCount / systems)
  const extraRows = measureCount % systems
  const rowCounts = Array.from(
    { length: systems },
    (_, i) => baseRow + (i < extraRows ? 1 : 0)
  )
  const height = HEADER_H + systems * SYSTEM_H + 30

  const host = document.createElement('div')
  host.style.cssText = 'position:absolute;left:-10000px;top:0;'
  document.body.appendChild(host)

  try {
    const renderer = new Renderer(host, Renderer.Backends.SVG)
    renderer.resize(WIDTH, height)
    const ctx = renderer.getContext()

    // 白底：下载后用浏览器打开，深色主题下也能看清
    ctx.save()
    ctx.setFillStyle('#fff')
    ctx.fillRect(0, 0, WIDTH, height)
    ctx.restore()

    ctx.setFillStyle('#1a1a1a')
    ctx.setFont(SVG_FONT, '34px', '600')
    const titleWidth = ctx.measureText(title).width
    ctx.fillText(title, WIDTH / 2 - titleWidth / 2, 62)
    ctx.setFillStyle('#555')
    ctx.setFont(SVG_FONT, '20px')
    const subtitle = `4/4　C 大调　♩ = ${Math.round(tempo)}`
    const subtitleWidth = ctx.measureText(subtitle).width
    ctx.fillText(subtitle, WIDTH / 2 - subtitleWidth / 2, 100)

    // noteId → 按出现顺序排列的 StaveNote。同一原始音符被拆成几段时靠它画连音线
    const notesById = new Map()
    const beams = []
    let first = 0

    for (let sys = 0; sys < systems; sys++) {
      const rowCount = rowCounts[sys]
      const staveY = HEADER_H + sys * SYSTEM_H
      // 每行第一个小节要画谱号，匀一点宽度给它，其余小节均分
      const rowWidth = (WIDTH - MARGIN * 2) / rowCount
      const widths = Array.from({ length: rowCount }, () => rowWidth)
      if (rowCount > 1) {
        widths[0] += CLEF_W
        for (let i = 1; i < rowCount; i++) widths[i] -= CLEF_W / (rowCount - 1)
      }

      let x = MARGIN
      for (let i = 0; i < rowCount; i++) {
        const m = first + i
        const stave = new Stave(x, staveY, widths[i])
        if (i === 0) stave.addClef('treble')
        if (sys === 0 && i === 0) stave.addTimeSignature('4/4')
        // 全曲最后一小节用终止线收尾
        if (sys === systems - 1 && i === rowCount - 1) stave.setEndBarType(Barline.type.END)
        stave.setContext(ctx).draw()

        const tickables = []
        for (const c of byMeasure[m]) {
          const unit = UNIT_DURATION[c.slots]
          const isRest = c.kind === 'rest'
          const duration = unit.base + (unit.dots ? 'd' : '') + (isRest ? 'r' : '')
          const note = new StaveNote({
            keys: [isRest ? 'b/4' : vexKey(c.row)],
            duration,
            auto_stem: !isRest,
          })
          if (unit.dots) Dot.buildAndAttach([note], { all: true })
          tickables.push(note)

          if (!isRest) {
            if (!notesById.has(c.noteId)) notesById.set(c.noteId, [])
            notesById.get(c.noteId).push(note)
          }
        }

        const voice = new Voice({ num_beats: BEATS_PER_MEASURE, beat_value: 4 })
        voice.addTickables(tickables)
        Accidental.applyAccidentals([voice], 'C')

        // 每拍一组符杠；休止符不参与（默认行为）。符杠会统一起这一组音的方向，
        // 所以要在 format / draw 之前生成
        beams.push(
          ...Beam.generateBeams(tickables, {
            groups: [new Fraction(1, 4)],
            maintain_stem_directions: false,
          })
        )

        new Formatter().joinVoices([voice]).formatToStave([voice], stave)
        voice.draw(ctx, stave)

        x += widths[i]
      }
      first += rowCount
    }

    for (const beam of beams) beam.setContext(ctx).draw()

    // 同一原始音符拆出来的相邻段用连音线接起来。跨行时两端各画一小段
    for (const list of notesById.values()) {
      for (let i = 1; i < list.length; i++) {
        const a = list[i - 1]
        const b = list[i]
        const indices = { first_indices: [0], last_indices: [0] }
        // 同一行相邻小节可以直接连；换行时才拆成行尾/行首两小段
        const sameSystem = a.getStave().getY() === b.getStave().getY()
        if (sameSystem) {
          new StaveTie({ first_note: a, last_note: b, ...indices })
            .setContext(ctx)
            .draw()
        } else {
          new StaveTie({ first_note: a, last_note: null, ...indices })
            .setContext(ctx)
            .draw()
          new StaveTie({ first_note: null, last_note: b, ...indices })
            .setContext(ctx)
            .draw()
        }
      }
    }

    const svg = host.querySelector('svg')
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg)
    return new Blob([xml], { type: 'image/svg+xml' })
  } finally {
    host.remove()
  }
}
