<!--
  @Autor: LXS
  @Date: 2026-10-14
  @Description: 导入 MP3 → 浏览器本地分离人声/伴奏 → 切换/混合播放

  注意：本组件顶层只 import vue 和两个自己写的轻量模块（它们内部才用动态 import
  去拉 onnxruntime-web / web-audio-separation），这样 VuePress 的 SSR 阶段
  完全不会碰到浏览器专用的依赖。
-->
<template>
  <div class="stem-splitter">
    <p class="intro">
      导入本地音频，用 AI 把人声和伴奏拆成两轨，可切换、混合播放，也能降速跟练。
      <strong>音频不会上传</strong>，全部在本机浏览器里计算。
    </p>

    <!-- ① 选文件 -->
    <template v-if="phase === 'idle' || phase === 'ready'">
      <div
        class="drop-zone"
        :class="{ over: dragOver, has: !!file }"
        @click="pick"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="onDrop"
      >
        <input
          ref="inputRef"
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.opus,.mp4"
          hidden
          @change="onPick"
        />
        <template v-if="!file">
          <div class="drop-icon">🎵</div>
          <div class="drop-main">点击选择音频，或把文件拖到这里</div>
          <div class="drop-sub">支持 mp3 / wav / m4a / flac / ogg</div>
        </template>
        <template v-else>
          <div class="file-name">🎵 {{ file.name }}</div>
          <div class="file-meta">
            <span>{{ sizeText }}</span>
            <span v-if="duration">· {{ fmt(duration) }}</span>
            <span v-if="probing">· 解析中…</span>
          </div>
          <div class="drop-sub">点击可重新选择</div>
        </template>
      </div>

      <label class="field">
        <span class="field-label">分离模型</span>
        <select v-model="modelId" :disabled="busy">
          <option v-for="m in MODELS" :key="m.id" :value="m.id">
            {{ m.id }}（{{ m.size }}）
          </option>
        </select>
      </label>
      <p class="model-desc">{{ model.description }}</p>

      <p v-if="!webgpu" class="warn">
        当前浏览器未启用 WebGPU，将使用 CPU 推理，速度大约是音频时长的 2~6 倍。
        换用桌面版 Chrome / Edge，或改选体积更小的卡拉OK模型会快很多。
      </p>
      <p v-if="sizeWarn" class="warn">{{ sizeWarn }}</p>

      <button class="btn-primary" :disabled="!file || busy || probing" @click="start">
        开始分离
      </button>
      <p class="hint">
        首次使用需下载约 30~67MB 模型，之后由浏览器缓存，不再重复下载。
      </p>
    </template>

    <!-- ② 进度 -->
    <div v-else-if="busy" class="progress-panel">
      <ol class="steps">
        <li
          v-for="(s, i) in STEPS"
          :key="s.key"
          :class="{ active: stepIndex === i, done: stepIndex > i }"
        >
          <span class="step-dot"></span>
          <span class="step-text">
            {{ s.label }}
            <em v-if="stepIndex === i" class="step-hint">{{ s.hint }}</em>
          </span>
        </li>
      </ol>

      <div class="bar">
        <div class="bar-fill" :style="{ width: Math.round(fraction * 100) + '%' }"></div>
      </div>
      <div class="progress-meta">
        <span>{{ Math.round(fraction * 100) }}%</span>
        <span v-if="phase === 'demixing' && totalChunks">第 {{ chunk }}/{{ totalChunks }} 段</span>
        <span v-if="etaText">{{ etaText }}</span>
      </div>

      <p v-if="stallHint" class="warn">
        模型下载似乎没有进展。模型文件托管在 HuggingFace，如果你所在的网络无法访问，
        可以从别的网络重试。也可以在浏览器控制台查看具体地址。
      </p>
      <p class="hint">分离过程中请保持本页面在前台，不要关闭标签页。</p>
    </div>

    <!-- ③ 播放 -->
    <div v-else class="player-panel">
      <div class="done-head">
        <span class="done-badge">✓ 分离完成</span>
        <span v-if="elapsedSec" class="done-meta">用时 {{ fmt(elapsedSec) }}</span>
        <button class="btn-ghost" @click="reset">重新选择</button>
      </div>

      <div class="controls">
        <button class="btn-play" :aria-label="playing ? '暂停' : '播放'" @click="togglePlay">
          <span v-if="playing">⏸</span>
          <span v-else>▶</span>
        </button>
        <div class="progress-wrap">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            <input
              class="progress"
              type="range"
              min="0"
              :max="duration || 0"
              step="0.05"
              :value="currentTime"
              @input="onSeek"
            />
          </div>
          <div class="time-row">
            <span>{{ fmt(currentTime) }}</span>
            <span>{{ fmt(duration) }}</span>
          </div>
        </div>
      </div>

      <!-- 旋律卷帘：人声轨的音高轮廓。点图区跳转，缩放后横向拖动浏览 -->
      <div
        class="roll-box"
        :class="{ 'roll-grab': canPan }"
        @click="onRollSeek"
        @pointerdown="onRollDown"
        @pointermove="onRollMove"
        @pointerup="onRollUp"
        @pointercancel="onRollUp"
      >
        <canvas ref="rollCanvas" class="roll-canvas"></canvas>

        <!-- 播放头：left 是琴键条宽度，所以内层宽度恰好等于图区宽度，
             translateX(headPercent%) 就落在 xOf(当前时刻) 上 —— 播放中不碰 canvas -->
        <div class="roll-head" :style="{ left: rollKeyW + 'px' }" aria-hidden="true">
          <div class="roll-head-line" :style="{ transform: `translateX(${headPercent}%)` }"></div>
        </div>

        <div v-if="melodyState === 'running'" class="roll-cover">
          <span class="roll-msg">分析旋律… {{ Math.round(melodyProgress * 100) }}%</span>
          <span class="roll-sub">只读人声轨，不影响播放</span>
        </div>
        <div v-else-if="melodyState === 'empty'" class="roll-cover">
          <span class="roll-msg">{{ melodyNotice }}</span>
        </div>
        <div v-else-if="melodyState === 'error'" class="roll-cover">
          <span class="roll-msg roll-err">{{ melodyError }}</span>
          <button class="btn-ghost roll-retry" @click.stop="runMelody">重试分析</button>
        </div>
      </div>

      <div class="roll-meta">
        <span class="roll-meta-text">
          <template v-if="melodyState === 'done' && melody.notes.length">
            检测到 {{ melody.notes.length }} 个音 · 音域 {{ melodyRangeText }}
          </template>
          <template v-else>旋律由 AI 自动提取，仅供参考</template>
        </span>
        <div v-if="canPan" class="roll-zoom">
          <button
            v-for="z in zoomOptions"
            :key="z.span"
            class="pill pill-xs"
            :class="{ on: zoomSpan === z.span }"
            @click="setZoom(z.span)"
          >
            {{ z.label }}
          </button>
        </div>
      </div>
      <p v-if="canPan" class="roll-hint">
        {{ zoomSpan > 0 ? '播放时窗口跟着走，拖动可自己翻；点图区跳到该处' : '选一个缩放档位就能看清单个音符' }}
      </p>

      <div class="row">
        <span class="field-label">播放</span>
        <div class="pill-group">
          <button
            v-for="m in MIX_MODES"
            :key="m.key"
            class="pill"
            :class="{ on: mixMode === m.key }"
            @click="setMix(m.key)"
          >
            {{ m.label }}
          </button>
        </div>
      </div>

      <div class="row fade-row">
        <span class="fade-label">人声</span>
        <input
          class="slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="mixValue"
          @input="onMix"
        />
        <span class="fade-label">伴奏</span>
      </div>

      <div class="row">
        <span class="field-label">速度</span>
        <div class="pill-group">
          <button
            v-for="r in RATE_PRESETS"
            :key="r"
            class="pill"
            :class="{ on: rate === r }"
            @click="setRate(r)"
          >
            {{ r }}×
          </button>
        </div>
        <span class="pill-note">变速不变调</span>
      </div>

      <div class="row tools">
        <label class="check">
          <input type="checkbox" :checked="loop" @change="setLoop($event.target.checked)" />
          循环
        </label>
        <label class="check">
          <input type="checkbox" :checked="swapped" @change="setSwap($event.target.checked)" />
          两轨对调
        </label>
        <a class="btn-dl" :href="stems.vocals" :download="baseName + '-人声.wav'">下载人声</a>
        <a class="btn-dl" :href="stems.instrumental" :download="baseName + '-伴奏.wav'">下载伴奏</a>
      </div>

      <details class="debug">
        <summary>同步状态</summary>
        <div class="debug-body" :class="{ bad: Math.abs(driftMs) > 50 }">
          两轨时间差 {{ driftMs.toFixed(0) }} ms
        </div>
      </details>
    </div>

    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

    <!-- 隐藏的 <audio> 元素挂载点（由 StemPlayer 命令式创建并挂进来） -->
    <div ref="mountEl" class="audio-mount"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { StemPlayer, RATE_PRESETS } from './StemSplitter/player.js'
import { extractMelody, MAX_ANALYZE_SEC } from './StemSplitter/melody.js'
import {
  PianoRoll,
  viewStartFor,
  KEY_W,
  KEY_W_SMALL,
  SMALL_MAX,
} from './StemSplitter/pianoRoll.js'
import { midiName } from './subComponents/pitch.js'
import * as separation from './StemSplitter/separation.js'

const STEPS = [
  { key: 'loading-model', label: '载入模型', hint: '首次约 30~67MB，仅此一次' },
  { key: 'demixing', label: '分离人声与伴奏', hint: '本地 AI 推理中' },
  { key: 'writing-output', label: '写出音轨', hint: '马上就好' },
]

const MIX_MODES = [
  { key: 'vocals', label: '纯人声' },
  { key: 'both', label: '人声+伴奏' },
  { key: 'inst', label: '伴奏' },
]

/* 与 web-audio-separation 的 MODEL_REGISTRY 保持一致。
   这里写死是为了首屏不去 import 那个库——它会连带拉进 413KB 的 onnxruntime-web。 */
const MODELS = [
  {
    id: 'UVR-MDX-NET-Inst_HQ_3',
    size: '约 67MB',
    description: '伴奏质量最好：去掉全部人声（含和声），伴奏最干净。想跟着练就用这个。',
  },
  {
    id: 'UVR_MDXNET_KARA_2',
    size: '约 30MB',
    description: '卡拉OK模式：去掉主唱但保留和声。体积最小、速度最快。',
  },
  {
    id: 'Kim_Vocal_2',
    size: '约 67MB',
    description: '人声精度最高：去掉全部人声，得到的人声轨最干净。',
  },
  {
    id: 'UVR-MDX-NET-Voc_FT',
    size: '约 67MB',
    description: '微调版人声模型：去掉全部人声。',
  },
  {
    id: 'UVR_MDXNET_Main',
    size: '约 67MB',
    description: '通用人声模型：去掉全部人声。',
  },
]

const AUDIO_EXT = /\.(mp3|wav|m4a|aac|flac|ogg|opus|mp4|webm)$/i
const HARD_BYTES = 200 * 1024 * 1024
const SOFT_BYTES = 40 * 1024 * 1024

const phase = ref('idle')
const file = ref(null)
const duration = ref(0)
const probing = ref(false)
const modelId = ref(MODELS[0].id)
const fraction = ref(0)
const chunk = ref(0)
const totalChunks = ref(0)
const errorMsg = ref('')
const stallHint = ref(false)
const stems = ref({ vocals: '', instrumental: '' })
const elapsedSec = ref(0)
const webgpu = ref(false)

const currentTime = ref(0)
const playing = ref(false)
const mixMode = ref('both')
const mixValue = ref(0.5)
const rate = ref(1)
const loop = ref(false)
const swapped = ref(false)
const driftMs = ref(0)

const mountEl = ref(null)
const inputRef = ref(null)
const dragOver = ref(false)

const rollCanvas = ref(null)
/** 播放头的左偏移 = 琴键条宽度。不能写死在 CSS 里：媒体查询看的是视口宽度，
    而琴键宽度看的是 canvas 宽度，两者差一个页面内边距，中间那一段会对不齐。
    这里用和 PianoRoll 完全相同的判据和常量，保证播放头正好落在 xOf(当前时刻) 上。 */
const rollKeyW = ref(KEY_W)
/** 分析结果：{notes, durationSec, analysisRate, frameRate, tooLong} */
const melody = ref({ notes: [] })
/** idle | running | done | empty | error —— empty 同时覆盖「没旋律」和「太长跳过」 */
const melodyState = ref('idle')
const melodyProgress = ref(0)
const melodyError = ref('')
const melodyNotice = ref('')
/** 视窗长度（秒），0 = 全长。档位取 ZOOM_LEVELS */
const zoomSpan = ref(0)
/** 视窗左边界（秒）。播放跟随时由 syncFollow 推，拖动浏览时由 panBy 推 */
const viewStart = ref(0)
/** 拖动浏览后先别让跟随把视窗拽回去，直到用户按播放或换档位 */
const followPaused = ref(false)

let player = null
let stallTimer = 0
let startedAt = 0
/** PianoRoll 实例。它是命令式对象，不能放进 ref，否则会被 Vue 代理包一层 */
let roll = null
let rollRO = null
let melodyCtrl = null
/** 拖动状态：{x: 上一次的 clientX}；null = 没在拖 */
let rollDrag = null
/** pointerup 之后紧跟一个 click，拖动浏览完不该顺带跳转，用这个一次性标志吃掉它 */
let rollSwallowClick = false

const busy = computed(() => STEPS.some((s) => s.key === phase.value))
const stepIndex = computed(() => STEPS.findIndex((s) => s.key === phase.value))
const model = computed(() => MODELS.find((m) => m.id === modelId.value) || MODELS[0])
const progressPercent = computed(() =>
  duration.value ? Math.min(100, (currentTime.value / duration.value) * 100) : 0
)
const baseName = computed(() => (file.value?.name || 'audio').replace(/\.[^.]+$/, ''))

/** 缩放档位。0 = 全长；其余是视窗秒数 */
const ZOOM_LEVELS = [
  { span: 0, label: '全长' },
  { span: 60, label: '60s' },
  { span: 30, label: '30s' },
  { span: 15, label: '15s' },
  { span: 8, label: '8s' },
]
/** 比曲子还长的档位没有意义，直接不显示；曲长未知时只剩全长 */
const zoomOptions = computed(() => {
  const d = duration.value
  if (!(d > 0)) return ZOOM_LEVELS.slice(0, 1)
  return ZOOM_LEVELS.filter((z) => z.span === 0 || z.span < d)
})
/** 有音符、有曲长才谈得上缩放和拖动 */
const canPan = computed(
  () => melodyState.value === 'done' && melody.value.notes.length > 0 && duration.value > 0
)
/** 视窗实际覆盖的时长。档位超过曲长时按曲长算，和 PianoRoll 里的口径一致 */
const visibleSpan = computed(() => {
  if (zoomSpan.value <= 0) return duration.value || 0
  if (!(duration.value > 0)) return zoomSpan.value
  return Math.min(zoomSpan.value, duration.value)
})
/**
 * 播放头在图区里的位置。可能超出 [0,100] —— 用户拖走视窗去浏览时播放头本来就该
 * 跑到屏幕外，由 .roll-head 的 overflow 裁掉。/ 0 时退回全长口径。
 */
const headPercent = computed(() => {
  const vis = visibleSpan.value
  if (!(vis > 0)) return 0
  return ((currentTime.value - viewStart.value) / vis) * 100
})

const melodyRangeText = computed(() => {
  let lo = Infinity
  let hi = -Infinity
  for (const n of melody.value.notes) {
    if (n.row < lo) lo = n.row
    if (n.row > hi) hi = n.row
  }
  if (!Number.isFinite(lo)) return ''
  const a = midiName(lo)
  const b = midiName(hi)
  return a === b ? a : `${a}–${b}`
})

const sizeText = computed(() => {
  const b = file.value?.size || 0
  if (!b) return ''
  return b >= 1024 * 1024 ? (b / 1024 / 1024).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB'
})

const sizeWarn = computed(() => {
  if (!file.value) return ''
  if (file.value.size > SOFT_BYTES || duration.value > 360) {
    return '这个音频偏长：分离会比较慢，内存占用也较大（每轨约 42MB / 4 分钟）。建议先裁剪到 5 分钟以内。'
  }
  return ''
})

const etaText = computed(() => {
  if (phase.value !== 'demixing' || fraction.value < 0.03) return ''
  const elapsed = (performance.now() - startedAt) / 1000
  const remain = (elapsed / fraction.value) * (1 - fraction.value)
  if (!Number.isFinite(remain) || remain <= 0) return ''
  return '约还需 ' + fmt(remain)
})

const fmt = (t) => {
  if (!t && t !== 0) return '--:--'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ---------------------------------------------------------------- 选文件

const pick = () => {
  if (!busy.value) inputRef.value?.click()
}

function onPick(e) {
  const f = e.target.files?.[0]
  e.target.value = '' // 允许重复选同一个文件
  if (f) acceptFile(f)
}

function onDrop(e) {
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) acceptFile(f)
}

async function acceptFile(f) {
  errorMsg.value = ''
  stallHint.value = false
  // .m4a 在部分系统上 file.type 是空的，所以以扩展名为准
  if (!AUDIO_EXT.test(f.name) && !(f.type || '').startsWith('audio/')) {
    errorMsg.value = '这个文件看起来不是音频，请换一个（支持 mp3 / wav / m4a / flac / ogg）。'
    return
  }
  if (f.size > HARD_BYTES) {
    errorMsg.value = '文件超过 200MB，太大了，请先裁剪。'
    return
  }
  file.value = f
  duration.value = 0
  probing.value = true
  phase.value = 'ready'
  const d = await probeDuration(f).catch(() => 0)
  probing.value = false
  duration.value = d
  if (!d) errorMsg.value = '读不出这个文件的音频信息，分离可能会失败，建议换一个文件试试。'
}

/** 用一个临时 <audio> 读出时长，带超时，读完立刻释放对象 URL */
function probeDuration(f) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(f)
    const el = document.createElement('audio')
    el.preload = 'metadata'
    const cleanup = () => {
      el.removeAttribute('src')
      try {
        el.load()
      } catch {
        /* 忽略 */
      }
      URL.revokeObjectURL(url)
    }
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('超时'))
    }, 5000)
    el.addEventListener('loadedmetadata', () => {
      clearTimeout(timer)
      const d = Number.isFinite(el.duration) ? el.duration : 0
      cleanup()
      resolve(d)
    })
    el.addEventListener('error', () => {
      clearTimeout(timer)
      cleanup()
      reject(new Error('解码失败'))
    })
    el.src = url
  })
}

// ---------------------------------------------------------------- 分离

function armStallTimer() {
  clearTimeout(stallTimer)
  // 只在载入模型阶段盯：这段没有持续进度，卡住基本都是模型源连不上
  if (phase.value !== 'loading-model') return
  stallTimer = setTimeout(() => {
    if (phase.value === 'loading-model') stallHint.value = true
  }, 30000)
}

function onProgress(p) {
  if (!p) return
  if (p.stage && p.stage !== phase.value) {
    phase.value = p.stage
    fraction.value = 0
    chunk.value = 0
    totalChunks.value = 0
  }
  if (typeof p.fraction === 'number') fraction.value = p.fraction
  if (p.chunk != null) chunk.value = p.chunk
  if (p.totalChunks != null) totalChunks.value = p.totalChunks
  if (phase.value === 'loading-model') armStallTimer()
}

async function start() {
  if (!file.value || busy.value) return
  errorMsg.value = ''
  stallHint.value = false
  startedAt = performance.now()
  elapsedSec.value = 0
  fraction.value = 0
  chunk.value = 0
  totalChunks.value = 0
  phase.value = 'loading-model'
  armStallTimer()
  try {
    const sep = await separation.loadModel(modelId.value, onProgress)
    const res = await separation.separateFile(sep, file.value, modelId.value, onProgress)
    clearTimeout(stallTimer)
    stems.value = res
    elapsedSec.value = (performance.now() - startedAt) / 1000
    phase.value = 'done'
    await nextTick()
    await setupPlayer()
    // 不 await：播放立刻可用，旋律在后台分块分析。放在 setupPlayer 之后，
    // 免得被它开头那次 disposePlayer() 里的 disposeMelody() 当场取消
    runMelody()
  } catch (err) {
    clearTimeout(stallTimer)
    console.error('[音轨分离] 失败：', err)
    errorMsg.value = describeError(err)
    // 保留已选文件，方便直接重试
    phase.value = file.value ? 'ready' : 'idle'
  }
}

function describeError(err) {
  const msg = String(err?.message || err || '未知错误')
  if (/download model|Failed to fetch|NetworkError|fetch/i.test(msg)) {
    return `模型下载失败：可能是当前网络访问不了 HuggingFace。换个网络重试，或把模型放到自己的存储上再引用。`
  }
  if (/SharedArrayBuffer|threads/i.test(msg)) {
    return '浏览器的线程环境不支持这次推理，请更新浏览器，或改用桌面版 Chrome / Edge。'
  }
  return '分离失败：' + msg
}

// ---------------------------------------------------------------- 旋律卷帘

/**
 * 整曲分析人声轨，画成钢琴卷帘。
 * 只认「人声」那一轨：两轨对调改的是音频路由，不改这里 —— 所以对调后卷帘不变，是设计如此。
 */
async function runMelody() {
  melodyCtrl?.abort()
  const ctrl = new AbortController()
  melodyCtrl = ctrl

  melodyState.value = 'running'
  melodyProgress.value = 0
  melodyError.value = ''
  melodyNotice.value = ''

  try {
    const res = await extractMelody(stems.value.vocals, {
      signal: ctrl.signal,
      onProgress: (p) => {
        // 已经被后一次分析顶替了就别再写状态
        if (melodyCtrl === ctrl) melodyProgress.value = p
      },
    })
    if (ctrl.signal.aborted || melodyCtrl !== ctrl) return

    if (res.tooLong || !res.notes.length) {
      melody.value = { notes: [] }
      roll?.setNotes([])
      resetZoom()
      melodyState.value = 'empty'
      melodyNotice.value = res.tooLong
        ? `曲长超过 ${Math.round(MAX_ANALYZE_SEC / 60)} 分钟，已跳过旋律分析`
        : '人声轨里没检测到旋律'
      return
    }

    // 卷帘的时长必须和进度条用的是同一个 —— 播放头才压得准
    roll?.setDuration(duration.value || res.durationSec)
    roll?.setNotes(res.notes)
    melody.value = res
    melodyState.value = 'done'
    applyZoom()
  } catch (err) {
    // 主动取消（换歌 / 离开路由 / 重新选择）不是错误
    if (err?.name === 'AbortError' || ctrl.signal.aborted) return
    console.error('[旋律分析] 失败：', err)
    roll?.setNotes([])
    resetZoom()
    melodyState.value = 'error'
    melodyError.value = describeMelodyError(err)
  }
}

function describeMelodyError(err) {
  const msg = String(err?.message || err || '未知错误')
  if (/HTTP \d/.test(msg)) return `旋律分析失败：读不出人声轨（${msg}）`
  if (/解码/.test(msg)) return '旋律分析失败：浏览器解不开这条音轨。'
  return '旋律分析失败：' + msg
}

/** 拆掉卷帘。必须在 blob URL 被撤销之前调用 —— abort 先于 fetch 失败落地 */
function disposeMelody() {
  melodyCtrl?.abort()
  melodyCtrl = null
  rollRO?.disconnect()
  rollRO = null
  roll?.dispose()
  roll = null
  melody.value = { notes: [] }
  melodyState.value = 'idle'
  melodyProgress.value = 0
  melodyError.value = ''
  melodyNotice.value = ''
  // 下一首从全长开始：留着上一首的档位会让新卷帘（默认全长）和档位按钮对不上
  resetZoom()
}

// -------------------------------------------------------------- 缩放与跟随

/**
 * 把档位和视窗推给卷帘。**任何改变音符的路径最后都要调一次** ——
 * 卷帘里的 span/viewStart 是命令式状态，只有这一个出口能改，才不会和 ref 漂开。
 */
function applyZoom() {
  if (!roll) return
  roll.setSpan(zoomSpan.value)
  followPaused.value = false
  // span 为 0 时 viewStartFor 返回 0，setSpan 也已经把 viewStart 夹到 0，这里统一走一遍
  snapViewToHead()
}

function setZoom(span) {
  zoomSpan.value = span
  applyZoom()
}

/**
 * 退回全长档位。卷帘一旦没有音符就得调 —— 留着 8 秒视窗，headPercent 会按一个
 * 不存在的窗口算，播放头位置全是错的。
 */
function resetZoom() {
  zoomSpan.value = 0
  viewStart.value = 0
  followPaused.value = false
  rollDrag = null
  roll?.setSpan(0)
}

/** 把视窗挪到播放头该在的位置（全长档位是空操作） */
function snapViewToHead() {
  if (!roll || zoomSpan.value <= 0) return
  roll.setView(viewStartFor(currentTime.value, zoomSpan.value, duration.value))
  viewStart.value = roll.viewStart
}

/** 播放中让视窗跟着播放头走。暂停时不动 —— 用户拖到哪就停在哪 */
function syncFollow() {
  if (!playing.value || followPaused.value || rollDrag) return
  snapViewToHead()
}

// 拖动浏览。只在缩放状态下接管 —— 全长没什么可翻的，让页面正常滚动
function onRollDown(e) {
  // 上一次拖动如果没等到 click（指针在元素外抬起，浏览器就不会派发 click），
  // 这个标志会留着把下一次真点击吃掉。每次按下重新清零
  rollSwallowClick = false
  if (!roll || !canPan.value || zoomSpan.value <= 0) return
  if (e.pointerType === 'mouse' && e.button !== 0) return
  rollDrag = { x: e.clientX, moved: false }
  // 指针捕获后 pointermove/up 一定回到这个元素上，手指滑出去也不会丢
  e.currentTarget.setPointerCapture?.(e.pointerId)
}

function onRollMove(e) {
  if (!rollDrag || !roll) return
  const dx = e.clientX - rollDrag.x
  // 4px 死区：点击时手抖一两像素不该被当成拖动。越过死区之后就逐帧增量跟随
  if (!rollDrag.moved) {
    if (Math.abs(dx) < 4) return
    rollDrag.moved = true
  } else if (dx === 0) {
    return
  }
  rollDrag.x = e.clientX
  roll.panBy(dx)
  viewStart.value = roll.viewStart
  followPaused.value = true
}

function onRollUp() {
  if (!rollDrag) return
  // 拖完不该顺带跳转。指针捕获会在 pointerup 时自动释放，不用手动 release
  rollSwallowClick = !!rollDrag.moved
  rollDrag = null
}

function onRollSeek(e) {
  if (rollSwallowClick) {
    rollSwallowClick = false
    return
  }
  if (!player || !roll) return
  // 点在琴键条上返回 null：误倒回开头比什么都不做更糟
  const t = roll.timeAtClientX(e.clientX)
  if (t === null) return
  player.seek(t)
  currentTime.value = t
}

// ---------------------------------------------------------------- 播放

async function setupPlayer() {
  disposePlayer()
  player = new StemPlayer({
    mountEl: mountEl.value || document.body,
    onTime: (t, d) => {
      currentTime.value = t
      if (d) {
        duration.value = d
        // 音频的真实时长可能和探测值差一点，卷帘跟着走，否则播放头会偏
        roll?.setDuration(d)
      }
      // 缩放档位的视窗跟着播放头滚。全长时这里直接早退，不做任何事
      syncFollow()
    },
    onState: (s) => {
      playing.value = s === 'playing'
    },
    onDrift: (ms) => {
      driftMs.value = ms
    },
  })
  await player.attach([stems.value.vocals, stems.value.instrumental])
  player.setMixValue(mixValue.value)
  player.setRate(rate.value)
  player.setLoop(loop.value)
  if (swapped.value) player.setSwapTracks(true)

  // attach 之后播放面板才一定已经渲染，canvas ref 这时才可靠
  if (!rollCanvas.value) return
  roll = new PianoRoll({ canvas: rollCanvas.value, duration: duration.value })
  rollKeyW.value = roll.keyW

  if (typeof ResizeObserver === 'function') {
    rollRO = new ResizeObserver(() => {
      const w = rollCanvas.value?.clientWidth || 0
      rollKeyW.value = w > 0 && w < SMALL_MAX ? KEY_W_SMALL : KEY_W
    })
    rollRO.observe(rollCanvas.value)
  }
}

function disposePlayer() {
  // 放在最前面：abort 必须先于 player.dispose() / releaseStems() 把 blob URL 撤掉
  disposeMelody()
  if (player) {
    player.dispose()
    player = null
  }
  playing.value = false
  currentTime.value = 0
  driftMs.value = 0
}

function releaseStems() {
  // 必须在 disposePlayer() 之后：dispose 已经把 <audio> 的 src 解绑了
  for (const url of [stems.value.vocals, stems.value.instrumental]) {
    if (url) {
      try {
        URL.revokeObjectURL(url)
      } catch {
        /* 忽略 */
      }
    }
  }
  stems.value = { vocals: '', instrumental: '' }
}

async function togglePlay() {
  if (!player) return
  // 按播放 = 收回「自己翻」的意图，跟随重新接管。放在 await 之前：
  // 此刻 playing 还是 false，syncFollow 会早退，所以直接调 snapViewToHead
  if (!playing.value) {
    followPaused.value = false
    snapViewToHead()
  }
  try {
    await player.toggle()
  } catch (err) {
    errorMsg.value = '播放失败：' + (err?.message || err)
  }
}

function onSeek(e) {
  const t = Number(e.target.value)
  player?.seek(t)
  currentTime.value = t
  // 拖进度条 = 明确要跳到那儿，把跟丢的视窗拉回来
  followPaused.value = false
  snapViewToHead()
}

function setMix(key) {
  mixMode.value = key
  mixValue.value = key === 'vocals' ? 0 : key === 'inst' ? 1 : 0.5
  player?.setMixValue(mixValue.value)
}

function onMix(e) {
  const v = Number(e.target.value)
  mixValue.value = v
  mixMode.value = '' // 手动拖过之后三个按钮都不高亮
  player?.setMixValue(v)
}

function setRate(r) {
  rate.value = r
  player?.setRate(r)
}

function setLoop(on) {
  loop.value = on
  player?.setLoop(on)
}

function setSwap(on) {
  swapped.value = on
  player?.setSwapTracks(on)
}

function reset() {
  disposePlayer()
  releaseStems()
  file.value = null
  duration.value = 0
  elapsedSec.value = 0
  errorMsg.value = ''
  stallHint.value = false
  phase.value = 'idle'
}

const onVisibility = () => {
  if (document.visibilityState === 'visible') player?.resumeContext()
}

onMounted(() => {
  webgpu.value = separation.hasWebGPU()
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  clearTimeout(stallTimer)
  document.removeEventListener('visibilitychange', onVisibility)
  disposePlayer()
  releaseStems()
  // 注意：不释放分离器里的 ONNX 会话，否则来回切路由就要重新下载模型
})
</script>

<style scoped>
.stem-splitter {
  max-width: 640px;
  margin: 0 auto;
  padding: 8px 0 40px;
  font-family: inherit;
}

.intro {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-color-light, #888);
  margin: 0 0 16px;
}

.intro strong {
  color: var(--text-color, #2c3e50);
}

/* ── 选文件 ── */
.drop-zone {
  border: 2px dashed var(--border-color, #ddd);
  border-radius: 12px;
  padding: 28px 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: var(--bg-color-secondary, #fafafa);
}

.drop-zone:hover,
.drop-zone.over {
  border-color: var(--theme-color, #3eaf7c);
  background: rgba(62, 175, 124, 0.06);
}

.drop-zone.has {
  border-style: solid;
}

.drop-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.drop-main {
  font-size: 14px;
  color: var(--text-color, #2c3e50);
}

.drop-sub {
  font-size: 12px;
  color: var(--text-color-light, #999);
  margin-top: 6px;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, #2c3e50);
  word-break: break-all;
}

.file-meta {
  font-size: 12px;
  color: var(--text-color-light, #999);
  margin-top: 6px;
  display: flex;
  gap: 6px;
  justify-content: center;
}

/* ── 表单 ── */
.field {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 6px;
}

.field-label {
  font-size: 13px;
  color: var(--text-color-light, #888);
  flex-shrink: 0;
}

.field select {
  flex: 1;
  min-width: 0;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1.5px solid var(--border-color, #ddd);
  background: var(--bg-color, #fff);
  color: var(--text-color, #2c3e50);
  font-size: 13px;
}

.model-desc {
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-color-light, #999);
  margin: 0 0 12px;
}

.warn {
  font-size: 12.5px;
  line-height: 1.6;
  color: #b8860b;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
  padding: 9px 12px;
  margin: 12px 0;
}

.hint {
  font-size: 12px;
  color: var(--text-color-light, #999);
  line-height: 1.6;
  margin: 10px 0 0;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  border: none;
  border-radius: 10px;
  background: var(--theme-color, #3eaf7c);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.88;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.99);
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ── 进度 ── */
.steps {
  list-style: none;
  padding: 0;
  margin: 8px 0 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.steps li {
  display: flex;
  align-items: baseline;
  gap: 9px;
  font-size: 13px;
  color: var(--text-color-light, #aaa);
  transition: color 0.2s;
}

.steps li.active {
  color: var(--theme-color, #3eaf7c);
  font-weight: 600;
}

.steps li.done {
  color: var(--text-color, #2c3e50);
}

.step-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
  opacity: 0.5;
}

.steps li.active .step-dot,
.steps li.done .step-dot {
  opacity: 1;
}

.step-hint {
  font-style: normal;
  font-size: 11.5px;
  font-weight: 400;
  color: var(--text-color-light, #aaa);
  margin-left: 6px;
}

.bar {
  height: 6px;
  border-radius: 3px;
  background: var(--border-color, #ddd);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--theme-color, #3eaf7c);
  border-radius: 3px;
  transition: width 0.25s ease;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--text-color-light, #aaa);
  margin-top: 6px;
}

/* ── 播放器 ── */
.done-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.done-badge {
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-color, #3eaf7c);
}

.done-meta {
  font-size: 12px;
  color: var(--text-color-light, #999);
}

.btn-ghost {
  margin-left: auto;
  padding: 5px 11px;
  font-size: 12px;
  border-radius: 8px;
  border: 1.5px solid var(--border-color, #ddd);
  background: transparent;
  color: var(--text-color-light, #888);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn-ghost:hover {
  border-color: var(--theme-color, #3eaf7c);
  color: var(--theme-color, #3eaf7c);
}

/* 播放键单独一行居中，进度条在下一行占满整宽：
   进度条因此和下方的卷帘左右对齐 */
.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.btn-play {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--theme-color, #3eaf7c);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-play:hover {
  opacity: 0.85;
  transform: scale(1.05);
}

.btn-play:active {
  transform: scale(0.96);
}

/* flex: 1 在列方向的父元素里会变成纵向拉伸，所以这里用 width 撑满 */
.progress-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.progress-track {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 6px;
  border-radius: 3px;
  background: var(--theme-color, #3eaf7c);
  pointer-events: none;
  z-index: 1;
}

.progress-track::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 6px;
  border-radius: 3px;
  background: var(--border-color, #ddd);
  z-index: 0;
}

.progress {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  margin: 0;
}

.progress::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--theme-color, #3eaf7c);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.progress::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--theme-color, #3eaf7c);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.time-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-color-light, #aaa);
}

/* ── 旋律卷帘 ──
   高度必须固定：canvas 出现时面板不能跳，而且首帧前就得能算出 CSS 尺寸。
   这两个数字和 pianoRoll.js 的 ROLL_H / ROLL_H_SMALL 是同一对，改一处要改两处。
   （类只按 canvas.clientWidth 选琴键宽度，高度完全由这里的 CSS 决定。） */
.roll-box {
  position: relative;
  height: 190px;
  margin-bottom: 6px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-color-secondary, #fafafa);
  cursor: pointer;
  touch-action: manipulation;
}

/* 缩放后才接管横向拖动。pan-y 而不是 none：竖直方向仍然让页面正常滚，
   否则在手机上手指落在卷帘上就滚不动页面了 */
.roll-box.roll-grab {
  cursor: grab;
  touch-action: pan-y;
}

.roll-box.roll-grab:active {
  cursor: grabbing;
}

.roll-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* 播放头：left 由 JS 给（见 rollKeyW）——宽度正好等于图区宽度，
   所以内层 translateX(进度%) 就是进度百分比 */
.roll-head {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  pointer-events: none;
  overflow: hidden;
}

.roll-head-line {
  width: 100%;
  height: 100%;
  border-left: 1.5px solid var(--theme-color, #3eaf7c);
  will-change: transform;
}

.roll-cover {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  text-align: center;
  background: var(--bg-color-secondary, #fafafa);
  pointer-events: none;
}

.roll-msg {
  font-size: 12.5px;
  color: var(--text-color-light, #999);
  font-variant-numeric: tabular-nums;
}

.roll-msg.roll-err {
  color: #e74c3c;
}

.roll-sub {
  font-size: 11.5px;
  color: var(--text-color-light, #bbb);
}

.roll-retry {
  margin-left: 0;
  pointer-events: auto;
}

.roll-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--text-color-light, #aaa);
  margin: 0 0 6px;
}

.roll-zoom {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.roll-hint {
  font-size: 11px;
  color: var(--text-color-light, #c0c0c0);
  margin: 0 0 14px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.pill-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pill {
  padding: 6px 13px;
  font-size: 12.5px;
  border-radius: 999px;
  border: 1.5px solid var(--border-color, #ddd);
  background: transparent;
  color: var(--text-color-light, #888);
  cursor: pointer;
  transition: all 0.18s;
}

.pill:hover {
  border-color: var(--theme-color, #3eaf7c);
  color: var(--theme-color, #3eaf7c);
}

/* 缩放档位：比主控件小一号，它是注释行里的次要控件，不该和播放控件抢视线 */
.pill-xs {
  padding: 3px 9px;
  font-size: 11px;
  border-width: 1px;
}

.pill.on {
  background: var(--theme-color, #3eaf7c);
  border-color: var(--theme-color, #3eaf7c);
  color: #fff;
  font-weight: 600;
}

.pill-note {
  font-size: 11.5px;
  color: var(--text-color-light, #aaa);
}

.fade-row {
  gap: 8px;
}

.fade-label {
  font-size: 11.5px;
  color: var(--text-color-light, #999);
  flex-shrink: 0;
}

.slider {
  flex: 1;
  min-width: 80px;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: var(--border-color, #ddd);
  cursor: pointer;
  margin: 0;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--theme-color, #3eaf7c);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--theme-color, #3eaf7c);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.tools {
  gap: 14px;
  margin-top: 4px;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: var(--text-color-light, #888);
  cursor: pointer;
}

.btn-dl {
  padding: 6px 13px;
  font-size: 12.5px;
  border-radius: 8px;
  border: 1.5px solid var(--border-color, #ddd);
  color: var(--text-color-light, #888);
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}

.btn-dl:hover {
  border-color: var(--theme-color, #3eaf7c);
  color: var(--theme-color, #3eaf7c);
}

.debug {
  margin-top: 18px;
  font-size: 12px;
  color: var(--text-color-light, #aaa);
}

.debug summary {
  cursor: pointer;
}

.debug-body {
  margin-top: 6px;
  font-variant-numeric: tabular-nums;
}

.debug-body.bad {
  color: #e74c3c;
}

/* ── 错误 ── */
.error-msg {
  width: 100%;
  color: #e74c3c;
  font-size: 13px;
  line-height: 1.6;
  padding: 10px 12px;
  background: rgba(231, 76, 60, 0.08);
  border-radius: 8px;
  margin-top: 14px;
}

@media (max-width: 480px) {
  .row {
    gap: 8px;
  }

  .pill {
    padding: 6px 10px;
    font-size: 12px;
  }

  /* 窄屏卷帘矮一点。琴键宽度和播放头偏移都由 JS 按 canvas 实宽决定，
     不写在这里 —— 媒体查询看视口，琴键看 canvas，两者不是一回事 */
  .roll-box {
    height: 150px;
  }
}
</style>
