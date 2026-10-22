<template>
  <div class="harmonica">

    <!-- 控制栏 -->
    <div class="controls">
      <label class="key-select">
        <span class="key-label">调式 / Key</span>
        <select v-model="key">
          <option v-for="k in KEYS" :key="k.label" :value="k.offset">{{ k.label }}</option>
        </select>
      </label>

      <button class="mic-btn" :class="{ running }" @click="toggleMic" :disabled="micUnavailable">
        <span class="mic-dot" :class="{ live: running }"></span>
        {{ running ? '停止录音' : (starting ? '请求麦克风…' : '开始录音') }}
      </button>
    </div>

    <!-- 节拍器 -->
    <div class="metronome">
      <div class="metro-head">
        <button class="metro-toggle" :class="{ on: metroRunning }" @click="toggleMetro">
          <span class="metro-icon">{{ metroRunning ? '■' : '▶' }}</span>
          <span>{{ metroRunning ? '停止节拍器' : '节拍器' }}</span>
        </button>

        <div class="metro-beats" :class="{ dense: beatsPerBar > 8 }">
          <span
            v-for="i in beatsPerBar"
            :key="i"
            class="beat-dot"
            :class="{ accent: i === 1, on: metroRunning && currentBeat === i - 1 }"
          ></span>
        </div>
      </div>

      <div class="metro-row">
        <div class="metro-field bpm-field">
          <span class="metro-label">速度</span>
          <input class="bpm-range" type="range" min="40" max="240" step="1" v-model.number="bpm" aria-label="每分钟拍数" />
          <input class="bpm-number" type="number" min="40" max="240" step="1" v-model.number="bpm" @change="clampBpm" aria-label="BPM" />
          <span class="bpm-unit">BPM</span>
        </div>

        <div class="metro-field">
          <span class="metro-label">拍号</span>
          <select v-model="timeSig" class="metro-select" aria-label="拍号">
            <option v-for="t in TIME_SIGS" :key="t.label" :value="t.label">{{ t.label }}</option>
          </select>
        </div>

        <button class="tap-btn" @click="tapTempo" title="连续点击以测速">TAP</button>

        <div class="metro-field">
          <span class="metro-label">音量</span>
          <input class="vol-range" type="range" min="0" max="1" step="0.05" v-model.number="volume" aria-label="节拍器音量" />
        </div>
      </div>

      <div v-if="running && metroRunning" class="metro-tip">
        ⓘ 节拍声可能被麦克风拾取，练习时建议戴耳机
      </div>
    </div>

    <!-- 手机竖屏：自动尝试横屏，失败则显示按钮 -->
    <button v-if="needsLandscape" class="portrait-hint" @click="enterLandscape">🔄 点击进入横屏</button>

    <div v-if="micError" class="error">⚠️ {{ micError }}</div>

    <!-- 实时状态 -->
    <div class="status-card" :class="{ active: hasNote }">
      <template v-if="hasNote">
        <div class="status-main">
          <div class="status-note">{{ detection.noteName }}</div>
          <div class="status-meta">
            <span class="freq">{{ detection.freq.toFixed(1) }} Hz</span>
            <span class="cents" :class="{ off: Math.abs(detection.cents) > 25 }">{{ fmtCents(detection.cents) }}</span>
          </div>
        </div>

        <div v-if="detection.entries.length" class="status-holes">
          <div
            v-for="(e, i) in detection.entries"
            :key="i"
            class="hit"
            :style="{ '--c': KIND_META[e.kind].color }"
          >
            <span class="hit-hole">第 {{ e.hole }} 孔</span>
            <span class="hit-kind">{{ KIND_META[e.kind].label }}{{ e.degreeLabel ? ' · ' + e.degreeLabel : '' }}</span>
          </div>
        </div>
        <div v-else class="status-out">该音超出当前调式音域</div>
      </template>

      <div v-else class="status-idle">
        <span class="idle-dot" :class="{ live: running }"></span>
        <span>{{ running ? '正在聆听…（请吹奏口琴）' : '点击“开始录音”后吹奏口琴' }}</span>
      </div>
    </div>

    <!-- 口琴孔位图 -->
    <div class="harp-wrap">
      <div class="harp">
        <!-- 超吹 / 超吸（上方） -->
        <div v-for="h in harp" :key="'o' + h.hole" class="cell over" :class="cellClass(h.hole, h.over.kind, h.over.midi)">
          <span class="cell-side">{{ KIND_META[h.over.kind].label }}</span>
          <span class="cell-note">{{ midiName(h.over.midi) }}</span>
        </div>

        <!-- 吹（口琴上方音） -->
        <div v-for="h in harp" :key="'bl' + h.hole" class="cell blow" :class="cellClass(h.hole, 'blow', h.blow)">
          <span class="cell-side">吹</span>
          <span class="cell-note">{{ midiName(h.blow) }}</span>
        </div>

        <!-- 模拟口琴本体：分隔吹 / 吸 -->
        <div class="harp-body">
          <div v-for="h in harp" :key="'hb' + h.hole" class="body-hole">
            <span class="body-hole-num">{{ h.hole }}</span>
          </div>
        </div>

        <!-- 吸（口琴下方音） -->
        <div v-for="h in harp" :key="'dr' + h.hole" class="cell draw" :class="cellClass(h.hole, 'draw', h.draw)">
          <span class="cell-side">吸</span>
          <span class="cell-note">{{ midiName(h.draw) }}</span>
        </div>

        <!-- 压音（下方，按最多层数占位以保持对齐） -->
        <template v-for="level in MAX_BENDS" :key="'lv' + level">
          <div
            v-for="h in harp"
            :key="'bd' + level + '-' + h.hole"
            class="cell bend"
            :class="h.bends[level - 1] ? cellClass(h.hole, h.bends[level - 1].kind, h.bends[level - 1].midi) : 'empty'"
          >
            <template v-if="h.bends[level - 1]">
              <span class="cell-side">{{ KIND_META[h.bends[level - 1].kind].label }}</span>
              <span class="cell-note">{{ midiName(h.bends[level - 1].midi) }}</span>
            </template>
          </div>
        </template>
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <span v-for="(m, k) in KIND_META" :key="k" class="legend-item">
        <i :style="{ background: m.color }"></i>{{ m.label }}
      </span>
    </div>

    <!-- 参考音位表 -->
    <details class="ref">
      <summary>参考音位表（{{ keyName }} 调十孔口琴全部可发音，共 {{ refRows.length }} 个音）</summary>
      <div class="ref-table">
        <table>
          <thead>
            <tr><th>音名</th><th>孔</th><th>技法</th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in refRows" :key="i">
              <td class="td-note">{{ row.name }}</td>
              <td>{{ row.hole }}</td>
              <td>
                <span class="kind-tag" :style="{ color: KIND_META[row.kind].color, borderColor: KIND_META[row.kind].color }">
                  {{ KIND_META[row.kind].label }}{{ row.degreeLabel ? ' · ' + row.degreeLabel : '' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { detectPitch, midiName, fmtCents } from './subComponents/pitch.js'

// 各调式相对 C 调的音高偏移（以 1 孔吹音为基准，C = 0）
const KEYS = [
  { label: 'C', offset: 0 },
  { label: 'C# / Db', offset: 1 },
  { label: 'D', offset: 2 },
  { label: 'Eb', offset: 3 },
  { label: 'E', offset: 4 },
  { label: 'F', offset: 5 },
  { label: 'F# / Gb', offset: 6 },
  { label: 'G', offset: -5 },
  { label: 'Ab', offset: -4 },
  { label: 'A', offset: -3 },
  { label: 'Bb', offset: -2 },
  { label: 'B', offset: -1 },
]

// C 调十孔布鲁斯口琴（Richter）完整音位表，数值为 MIDI 编号（C4 = 60）。
// blow/draw：基本吹/吸音；drawBends/blowBends：压音（数值越低 = 压得越深）；
// overblow/overdraw：超吹 / 超吸。
const C_HARP = [
  { hole: 1,  blow: 60, draw: 62, drawBends: [61],          blowBends: [],       overblow: 63, overdraw: null },
  { hole: 2,  blow: 64, draw: 67, drawBends: [65, 66],      blowBends: [],       overblow: 68, overdraw: null },
  { hole: 3,  blow: 67, draw: 71, drawBends: [68, 69, 70],  blowBends: [],       overblow: 72, overdraw: null },
  { hole: 4,  blow: 72, draw: 74, drawBends: [73],          blowBends: [],       overblow: 75, overdraw: null },
  { hole: 5,  blow: 76, draw: 77, drawBends: [],            blowBends: [],       overblow: 78, overdraw: null },
  { hole: 6,  blow: 79, draw: 81, drawBends: [80],          blowBends: [],       overblow: 82, overdraw: null },
  { hole: 7,  blow: 84, draw: 83, drawBends: [],            blowBends: [],       overblow: null, overdraw: 85 },
  { hole: 8,  blow: 88, draw: 86, drawBends: [],            blowBends: [87],     overblow: null, overdraw: 89 },
  { hole: 9,  blow: 91, draw: 89, drawBends: [],            blowBends: [90],     overblow: null, overdraw: 92 },
  { hole: 10, blow: 96, draw: 93, drawBends: [],            blowBends: [94, 95], overblow: null, overdraw: 97 },
]

// 最大压音层数（用于孔位图下方占位对齐）
const MAX_BENDS = Math.max(...C_HARP.map(h => Math.max(h.drawBends.length, h.blowBends.length)))

const KIND_META = {
  blow:     { label: '吹奏',   color: '#2e86de' },
  draw:     { label: '吸奏',   color: '#10ac84' },
  drawBend: { label: '压音',   color: '#f39c12' },
  blowBend: { label: '吹压音', color: '#e67e22' },
  overblow: { label: '超吹',   color: '#e74c3c' },
  overdraw: { label: '超吸',   color: '#9b59b6' },
}

// ── 状态 ──
const key = ref(0)
const running = ref(false)
const starting = ref(false)
const micError = ref('')
const detection = ref(null) // { freq, noteName, cents, entries: [{hole, kind, degreeLabel, midi}] }

const hasNote = computed(() => !!detection.value && detection.value.freq > 0)

const keyName = computed(() => KEYS.find(k => k.offset === key.value)?.label || 'C')
const offset = computed(() => key.value)

// ── 工具函数 ──
// midiName / fmtCents 见 subComponents/pitch.js
const degreeLabel = (d) => (d === 1 ? '半音' : d === 2 ? '全音' : d === 3 ? '1½音' : '')

// ── 音位数据 ──
const harp = computed(() =>
  C_HARP.map(h => {
    const o = offset.value
    return {
      hole: h.hole,
      blow: h.blow + o,
      draw: h.draw + o,
      bends: [
        ...h.drawBends.map(m => ({ midi: m + o, kind: 'drawBend' })),
        ...h.blowBends.map(m => ({ midi: m + o, kind: 'blowBend' })),
      ].sort((a, b) => b.midi - a.midi),
      over: h.overblow != null
        ? { midi: h.overblow + o, kind: 'overblow' }
        : h.overdraw != null
          ? { midi: h.overdraw + o, kind: 'overdraw' }
          : null,
    }
  })
)

// midi -> [{ hole, kind, degreeLabel, midi }]
const lookup = computed(() => {
  const map = new Map()
  const add = (midi, hole, kind, degree) => {
    if (midi == null) return
    if (!map.has(midi)) map.set(midi, [])
    map.get(midi).push({ hole, kind, degreeLabel: degree, midi })
  }
  for (const h of C_HARP) {
    const o = offset.value
    add(h.blow + o, h.hole, 'blow', '')
    add(h.draw + o, h.hole, 'draw', '')
    h.drawBends.forEach(b => add(b + o, h.hole, 'drawBend', degreeLabel(h.draw - b)))
    h.blowBends.forEach(b => add(b + o, h.hole, 'blowBend', degreeLabel(h.blow - b)))
    add(h.overblow != null ? h.overblow + o : null, h.hole, 'overblow', '')
    add(h.overdraw != null ? h.overdraw + o : null, h.hole, 'overdraw', '')
  }
  return map
})

const refRows = computed(() => {
  const rows = []
  const push = (midi, hole, kind, degree) => {
    if (midi == null) return
    const m = midi + offset.value
    rows.push({ midi: m, name: midiName(m), hole, kind, degreeLabel: degree })
  }
  for (const h of C_HARP) {
    push(h.blow, h.hole, 'blow', '')
    push(h.draw, h.hole, 'draw', '')
    h.drawBends.forEach(b => push(b, h.hole, 'drawBend', degreeLabel(h.draw - b)))
    h.blowBends.forEach(b => push(b, h.hole, 'blowBend', degreeLabel(h.blow - b)))
    push(h.overblow, h.hole, 'overblow', '')
    push(h.overdraw, h.hole, 'overdraw', '')
  }
  rows.sort((a, b) => a.midi - b.midi)
  return rows
})

// ── 孔位图高亮 ──
const activeKeySet = computed(() => {
  const d = detection.value
  if (!d || !d.freq) return null
  return new Set(d.entries.map(e => `${e.hole}|${e.kind}|${e.midi}`))
})

const cellClass = (hole, kind, midi) => {
  const s = activeKeySet.value
  return s && s.has(`${hole}|${kind}|${midi}`) ? 'active ' + kind : ''
}

// ── 音频 & 音高检测 ──
let audioCtx = null
let analyser = null
let stream = null
let rafId = null
let buf = null
let frame = 0

// ── 麦克风错误诊断 ──
const micUnavailable = computed(() => {
  if (typeof window === 'undefined') return false
  if (window.isSecureContext === false) return true // 非 HTTPS：mediaDevices 直接不可用
  return !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
})

const describeMicError = (err) => {
  if (typeof window !== 'undefined' && window.isSecureContext === false) {
    return '当前页面不是 HTTPS 安全连接，浏览器会禁用麦克风，请改用 https:// 打开本页后重试。'
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return '当前浏览器不支持麦克风 API，请升级到最新版 Chrome / Edge / Safari。'
  }
  const name = err && err.name
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return '麦克风权限被拒绝：请点地址栏的锁/盾图标，在网站设置里允许麦克风后重试。'
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return '没有检测到麦克风设备，请连接或开启麦克风后重试。'
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return '麦克风被其它应用占用，请关闭占用麦克风的应用后重试。'
  }
  return '麦克风启动失败：' + (err && err.message ? err.message : err)
}

const toggleMic = async () => {
  if (running.value) { stopMic(); return }
  starting.value = true
  micError.value = ''
  try {
    const AC = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext))
    if (!AC || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      micError.value = describeMicError(null)
      starting.value = false
      return
    }
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    })
    audioCtx = new AC()
    await audioCtx.resume()
    const src = audioCtx.createMediaStreamSource(stream)
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0
    src.connect(analyser)
    buf = new Float32Array(analyser.fftSize)
    running.value = true
    starting.value = false
    frame = 0
    loop()
  } catch (err) {
    console.error('[HarmonicaScale] 麦克风失败', err)
    starting.value = false
    running.value = false
    micError.value = describeMicError(err)
  }
}

const stopMic = () => {
  running.value = false
  detection.value = null
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
  if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null }
  analyser = null
}

const loop = () => {
  if (!running.value) return
  rafId = requestAnimationFrame(loop)
  frame++
  if (frame % 3 !== 0) return // 约 20 次/秒，避免重复分析同一段音频

  if (!analyser) return
  analyser.getFloatTimeDomainData(buf)
  const r = detectPitch(buf, audioCtx.sampleRate)
  if (r.freq > 0) {
    const midi = Math.round(69 + 12 * Math.log2(r.freq / 440))
    const cents = Math.round(1200 * Math.log2(r.freq / 440) - (midi - 69) * 100)
    detection.value = {
      freq: r.freq,
      noteName: midiName(midi),
      cents,
      entries: lookup.value.get(midi) || [],
    }
  } else {
    detection.value = { freq: 0, noteName: '', cents: 0, entries: [] }
  }
}

// ── 节拍器 ──
// 拍号按「每小节拍数」计时：x/4 与 x/8 分别以四分、八分音符为一拍
const TIME_SIGS = [
  { label: '1/4', beats: 1 },
  { label: '2/4', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '5/4', beats: 5 },
  { label: '6/4', beats: 6 },
  { label: '2/2', beats: 2 },
  { label: '3/2', beats: 3 },
  { label: '3/8', beats: 3 },
  { label: '5/8', beats: 5 },
  { label: '6/8', beats: 6 },
  { label: '7/8', beats: 7 },
  { label: '9/8', beats: 9 },
  { label: '12/8', beats: 12 },
]

const bpm = ref(90)
const timeSig = ref('4/4')
const volume = ref(0.6)
const metroRunning = ref(false)
const currentBeat = ref(-1)

const beatsPerBar = computed(() =>
  TIME_SIGS.find(t => t.label === timeSig.value)?.beats || 4
)

const safeBpm = computed(() => {
  const v = Number(bpm.value)
  return Math.min(240, Math.max(40, Number.isFinite(v) && v > 0 ? v : 90))
})

const clampBpm = () => { bpm.value = Math.round(safeBpm.value) }

let metroCtx = null
let metroGain = null
let metroTimer = null
let nextBeatTime = 0
let nextBeatIndex = 0
let beatTimeouts = []
const METRO_INTERVAL = 25   // 调度器轮询间隔 (ms)
const METRO_AHEAD = 0.12    // 提前调度的时长 (s)

// 短促的木鱼式 click：首拍更高更响
const scheduleClick = (time, accent) => {
  const osc = metroCtx.createOscillator()
  const env = metroCtx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(accent ? 1760 : 1174.66, time)
  env.gain.setValueAtTime(0.0001, time)
  env.gain.exponentialRampToValueAtTime(accent ? 0.9 : 0.55, time + 0.002)
  env.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
  osc.connect(env)
  env.connect(metroGain)
  osc.start(time)
  osc.stop(time + 0.06)
}

const metroScheduler = () => {
  if (!metroCtx) return
  while (nextBeatTime < metroCtx.currentTime + METRO_AHEAD) {
    const idx = nextBeatIndex
    scheduleClick(nextBeatTime, idx === 0)
    const delay = Math.max(0, (nextBeatTime - metroCtx.currentTime) * 1000)
    const t = setTimeout(() => {
      currentBeat.value = idx
      beatTimeouts = beatTimeouts.filter(x => x !== t)
    }, delay)
    beatTimeouts.push(t)
    nextBeatTime += 60 / safeBpm.value
    nextBeatIndex = (nextBeatIndex + 1) % Math.max(1, beatsPerBar.value)
  }
}

const stopMetro = () => {
  metroRunning.value = false
  currentBeat.value = -1
  if (metroTimer) { clearInterval(metroTimer); metroTimer = null }
  beatTimeouts.forEach(clearTimeout)
  beatTimeouts = []
  if (metroCtx) { metroCtx.close().catch(() => {}); metroCtx = null }
  metroGain = null
}

const toggleMetro = async () => {
  if (metroRunning.value) { stopMetro(); return }
  const AC = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext))
  if (!AC) return
  try {
    metroCtx = new AC()
    await metroCtx.resume()
    metroGain = metroCtx.createGain()
    metroGain.gain.value = volume.value
    metroGain.connect(metroCtx.destination)
    nextBeatIndex = 0
    nextBeatTime = metroCtx.currentTime + 0.06
    currentBeat.value = -1
    metroRunning.value = true
    metroScheduler()
    metroTimer = setInterval(metroScheduler, METRO_INTERVAL)
  } catch (e) {
    console.warn('[HarmonicaScale] 节拍器启动失败', e)
    stopMetro()
  }
}

// TAP 测速：取最近几次点击的平均间隔
let tapTimes = []
const tapTempo = () => {
  const now = performance.now()
  if (tapTimes.length && now - tapTimes[tapTimes.length - 1] > 2000) tapTimes = []
  tapTimes.push(now)
  if (tapTimes.length > 5) tapTimes.shift()
  if (tapTimes.length < 2) return
  const intervals = tapTimes.slice(1).map((t, i) => t - tapTimes[i])
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
  bpm.value = Math.min(240, Math.max(40, Math.round(60000 / avg)))
}

watch(volume, v => { if (metroGain) metroGain.gain.value = v })
watch(timeSig, () => {
  nextBeatIndex = 0
  currentBeat.value = -1
})

// ── 手机端自动横屏 ──
const needsLandscape = ref(false)

const checkOrientation = () => {
  needsLandscape.value = typeof window !== 'undefined'
    && window.matchMedia('(max-width: 640px) and (orientation: portrait)').matches
}

const enterLandscape = async () => {
  try {
    // Android Chrome 等需先全屏才能锁方向
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {})
    }
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape')
    }
  } catch (e) {
    console.warn('[HarmonicaScale] 锁定横屏失败', e)
  }
}

onMounted(() => {
  if (micUnavailable.value) {
    micError.value = describeMicError(null)
  }

  checkOrientation()
  window.addEventListener('orientationchange', checkOrientation)
  window.addEventListener('resize', checkOrientation)

  if (needsLandscape.value) {
    // 无手势时调用通常会被拒绝，首次触摸时再自动试一次
    enterLandscape()
    const tryOnce = () => enterLandscape()
    window.addEventListener('pointerdown', tryOnce, { once: true })
    window.addEventListener('touchstart', tryOnce, { once: true })
  }
})

onBeforeUnmount(() => {
  stopMic()
  stopMetro()
  window.removeEventListener('orientationchange', checkOrientation)
  window.removeEventListener('resize', checkOrientation)
})
</script>

<style scoped>
.harmonica {
  max-width: 640px;
  margin: 0 auto;
  padding: 4px 0 40px;
  font-family: inherit;
}

/* ── 控制栏 ── */
.controls {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.key-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 180px;
}

.key-label {
  font-size: 12px;
  color: var(--text-color-light, #999);
  letter-spacing: 0.06em;
}

.key-select select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #ddd);
  background: var(--bg-color-secondary, #f5f5f5);
  color: var(--text-color, #2c3e50);
  font-size: 15px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}

.key-select select:focus {
  border-color: var(--theme-color, #3eaf7c);
}

.mic-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: 12px;
  border: none;
  background: var(--theme-color, #3eaf7c);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s, background 0.2s;
}

.mic-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.mic-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
.mic-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.mic-btn.running { background: #e74c3c; }

.mic-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
}
.mic-dot.live {
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

/* ── 节拍器 ── */
.metronome {
  padding: 14px 16px;
  margin-bottom: 16px;
  border-radius: 16px;
  background: var(--bg-color-secondary, #f5f5f5);
  border: 1.5px solid var(--border-color, #e5e5e5);
}

.metro-head {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.metro-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #ddd);
  background: transparent;
  color: var(--text-color, #2c3e50);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
}
.metro-toggle:hover { border-color: var(--theme-color, #3eaf7c); }
.metro-toggle:active { transform: scale(0.97); }
.metro-toggle.on {
  background: var(--theme-color, #3eaf7c);
  border-color: transparent;
  color: #fff;
}

.metro-icon { font-size: 11px; line-height: 1; }

.metro-beats {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 9px;
  max-width: 100%;
}

/* 拍数多（如 9/8、12/8）时缩小指示灯 */
.metro-beats.dense { gap: 6px; }
.metro-beats.dense .beat-dot { width: 7px; height: 7px; }
.metro-beats.dense .beat-dot.accent { width: 9px; height: 9px; }

.beat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border-color, #ddd);
  transition: background 0.08s, transform 0.08s, box-shadow 0.08s;
}
.beat-dot.accent { width: 12px; height: 12px; }
.beat-dot.on {
  background: var(--theme-color, #3eaf7c);
  transform: scale(1.4);
  box-shadow: 0 0 10px rgba(62, 175, 124, 0.55);
}
.beat-dot.accent.on {
  background: #f39c12;
  box-shadow: 0 0 10px rgba(243, 156, 18, 0.55);
}

.metro-row {
  display: flex;
  align-items: center;
  gap: 14px 18px;
  flex-wrap: wrap;
}

.metro-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metro-label {
  font-size: 12px;
  color: var(--text-color-light, #999);
  white-space: nowrap;
}

.bpm-field { flex: 1 1 240px; }
.bpm-range { flex: 1; min-width: 90px; accent-color: var(--theme-color, #3eaf7c); cursor: pointer; }
.vol-range { width: 76px; accent-color: var(--theme-color, #3eaf7c); cursor: pointer; }

.bpm-number {
  width: 58px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1.5px solid var(--border-color, #ddd);
  background: var(--bg-color, #fff);
  color: var(--text-color, #2c3e50);
  font-size: 14px;
  text-align: center;
  outline: none;
}
.bpm-number:focus { border-color: var(--theme-color, #3eaf7c); }

.bpm-unit { font-size: 11px; color: var(--text-color-light, #999); }

.metro-select {
  padding: 7px 10px;
  border-radius: 8px;
  border: 1.5px solid var(--border-color, #ddd);
  background: var(--bg-color-secondary, #f5f5f5);
  color: var(--text-color, #2c3e50);
  font-size: 14px;
  cursor: pointer;
  outline: none;
}
.metro-select:focus { border-color: var(--theme-color, #3eaf7c); }

.tap-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1.5px dashed var(--border-color, #ccc);
  background: transparent;
  color: var(--text-color-light, #888);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.15s, color 0.15s, transform 0.1s;
}
.tap-btn:hover { border-color: var(--theme-color, #3eaf7c); color: var(--theme-color, #3eaf7c); }
.tap-btn:active { transform: scale(0.94); background: rgba(62, 175, 124, 0.1); }

.metro-tip {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-color-light, #999);
}

.error {
  margin-bottom: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  font-size: 13px;
  line-height: 1.6;
}

/* ── 状态卡 ── */
.status-card {
  min-height: 96px;
  padding: 20px 22px;
  border-radius: 16px;
  background: var(--bg-color-secondary, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  transition: background 0.2s, box-shadow 0.2s;
}

.status-card.active {
  background: var(--bg-color-secondary, #eef7f2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.status-main {
  text-align: center;
}

.status-note {
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  color: var(--text-color, #2c3e50);
}

.status-meta {
  margin-top: 8px;
  display: flex;
  gap: 12px;
  justify-content: center;
  font-size: 13px;
  color: var(--text-color-light, #888);
}

.cents.off { color: #e67e22; font-weight: 600; }

.status-holes {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.hit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 16px;
  border-radius: 12px;
  background: var(--c);
  color: #fff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
}

.hit-hole {
  font-size: 12px;
  opacity: 0.92;
}

.hit-kind {
  font-size: 16px;
  font-weight: 700;
}

.status-out {
  font-size: 14px;
  color: var(--text-color-light, #999);
}

.status-idle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: var(--text-color-light, #999);
}

.idle-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ccc;
  flex-shrink: 0;
}
.idle-dot.live { background: var(--theme-color, #3eaf7c); animation: blink 1s infinite; }

/* ── 口琴孔位图 ── */
.harp-wrap {
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 14px;
}

.harp {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
  min-width: 480px;
}

.cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 48px;
  border-radius: 10px;
  background: var(--bg-color-secondary, #f5f5f5);
  border: 1.5px solid var(--border-color, #e5e5e5);
  transition: transform 0.1s, background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.cell.blow { border-top-width: 3px; }
.cell.draw { border-bottom-width: 3px; }

/* 超吹/超吸（上方）与压音（下方）的方格 */
.cell.over,
.cell.bend {
  height: 36px;
}

.cell.over .cell-side,
.cell.bend .cell-side {
  font-size: 9px;
}

.cell.over .cell-note,
.cell.bend .cell-note {
  font-size: 12px;
  margin-top: 1px;
}

.cell-side {
  font-size: 10px;
  color: var(--text-color-light, #bbb);
  line-height: 1;
}

.cell-note {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, #2c3e50);
  margin-top: 2px;
}

.cell.active {
  color: #fff;
  border-color: transparent;
  transform: scale(1.04);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}
.cell.active .cell-side,
.cell.active .cell-note { color: #fff; }

.cell.active.blow     { background: #2e86de; }
.cell.active.draw     { background: #10ac84; }
.cell.active.drawBend { background: #f39c12; }
.cell.active.blowBend { background: #e67e22; }
.cell.active.overblow { background: #e74c3c; }
.cell.active.overdraw { background: #9b59b6; }

/* ── 模拟口琴本体：分隔吹 / 吸 ── */
.harp-body {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 6px;
  padding: 8px 0;
  margin: 4px 0 8px;
  background: linear-gradient(180deg, #e8e3d6, #cfc8b8);
  border-radius: 14px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.1);
}

.body-hole {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  border-radius: 6px;
  background: #2f2a24;
  box-shadow: inset 0 3px 7px rgba(0, 0, 0, 0.65);
}

.body-hole-num {
  font-size: 12px;
  font-weight: 700;
  color: #e8e4da;
  line-height: 1;
}

/* 无压音的占位格：保持对齐但不可见 */
.cell.bend.empty {
  visibility: hidden;
}

/* ── 图例 ── */
.legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 6px 0 18px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-color-light, #888);
}

.legend-item i {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

/* ── 参考音位表 ── */
.ref {
  border: 1.5px solid var(--border-color, #e5e5e5);
  border-radius: 12px;
  padding: 0 16px;
}

.ref summary {
  cursor: pointer;
  padding: 14px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, #2c3e50);
  outline: none;
}

.ref-table {
  max-height: 340px;
  overflow-y: auto;
  border-top: 1px solid var(--border-color, #eee);
}

.ref table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.ref th,
.ref td {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
}

.ref th {
  position: sticky;
  top: 0;
  background: var(--bg-color-secondary, #f5f5f5);
  color: var(--text-color-light, #888);
  font-size: 12px;
  letter-spacing: 0.04em;
}

.td-note {
  font-weight: 600;
  color: var(--text-color, #2c3e50);
}

.kind-tag {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 20px;
  font-size: 12px;
  white-space: nowrap;
}

/* ── 手机端横屏按钮 ── */
.portrait-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 14px;
  border: none;
  border-radius: 10px;
  background: rgba(243, 156, 18, 0.12);
  color: #b9770e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* 手机横屏：占满宽度、更紧凑 */
@media (max-width: 900px) and (orientation: landscape) {
  .harmonica {
    max-width: none;
    padding: 4px 10px 28px;
  }
  .harp {
    min-width: 0;
    gap: 4px;
  }
  .harp-body {
    gap: 4px;
    padding: 7px 0;
    margin: 3px 0 6px;
  }
  .body-hole { height: 24px; }
  .cell { height: 46px; }
  .cell.over,
  .cell.bend { height: 30px; }

  .metronome {
    padding: 10px 14px;
    margin-bottom: 12px;
  }
  .metro-head { margin-bottom: 8px; }
}
</style>
