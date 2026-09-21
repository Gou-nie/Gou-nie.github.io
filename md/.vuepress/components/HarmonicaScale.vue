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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

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

const MIN_FREQ = 120
const MAX_FREQ = 4000
const MIN_CLARITY = 0.5

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
const midiName = (m) => {
  const name = NOTE_NAMES[((m % 12) + 12) % 12]
  const oct = Math.floor(m / 12) - 1
  return name + oct
}

const degreeLabel = (d) => (d === 1 ? '半音' : d === 2 ? '全音' : d === 3 ? '1½音' : '')

const fmtCents = (c) => (c > 0 ? '+' : '') + c.toFixed(0) + ' 音分'

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

// 自相关法求基频（对复音/泛音丰富的口琴更稳健）
function detectPitch(samples, sampleRate) {
  const n = samples.length
  let mean = 0
  for (let i = 0; i < n; i++) mean += samples[i]
  mean /= n

  let sumSq = 0
  for (let i = 0; i < n; i++) { const d = samples[i] - mean; sumSq += d * d }
  const variance = sumSq / n
  const rms = Math.sqrt(variance)
  if (rms < 0.01) return { freq: -1, clarity: 0 }

  const minLag = Math.max(2, Math.floor(sampleRate / MAX_FREQ))
  const maxLag = Math.min(Math.floor(sampleRate / MIN_FREQ), n - 2)
  if (maxLag <= minLag) return { freq: -1, clarity: 0 }

  const corr = new Float32Array(maxLag + 1)
  let bestLag = -1
  let bestClarity = -Infinity
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0
    for (let i = 0; i < n - lag; i++) s += (samples[i] - mean) * (samples[i + lag] - mean)
    const c = (s / (n - lag)) / variance
    corr[lag] = c
    if (c > bestClarity) { bestClarity = c; bestLag = lag }
  }

  if (bestClarity < MIN_CLARITY) return { freq: -1, clarity: bestClarity }

  // 防八度错误：若半周期/三分之一周期处相关度相近，取更短延迟（更高频、更可能是基频）
  for (const div of [2, 3]) {
    const l = Math.round(bestLag / div)
    if (l >= minLag && corr[l] >= 0.9 * bestClarity) {
      bestLag = l
      bestClarity = corr[l]
      break
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
  if (freq < MIN_FREQ || freq > MAX_FREQ) return { freq: -1, clarity: bestClarity }
  return { freq, clarity: bestClarity }
}

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
}
</style>
