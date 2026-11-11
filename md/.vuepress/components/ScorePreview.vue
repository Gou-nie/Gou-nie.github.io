<!--
  @Autor: LXS
  @Date: 2026-11-11
  @Description: 乐谱预览 —— 五线谱 / 简谱 SVG 的查看与下载

  作为弹窗内容嵌在音轨分离页里，旋律和参数由父组件通过 initial 传进来；
  不传时回退到示例旋律，单独挂这个组件也能调谱面样式。

  注意：buildStaffSvg 内部才动态 import VexFlow，顶层 import 不会把 553KB 的
  Bravura 字体包拖进首屏，SSR 阶段也不会碰到 document。
-->
<template>
  <div class="score-preview" :class="{ embedded }">
    <div class="toolbar">
      <div class="controls">
        <div class="seg" role="group" aria-label="谱面格式">
          <button
            type="button"
            :class="{ on: format === 'staff' }"
            :aria-pressed="format === 'staff'"
            @click="setFormat('staff')"
          >
            五线谱
          </button>
          <button
            type="button"
            :class="{ on: format === 'jianpu' }"
            :aria-pressed="format === 'jianpu'"
            @click="setFormat('jianpu')"
          >
            简谱
          </button>
        </div>

        <label class="field">
          节拍
          <input
            v-model.number="bpm"
            class="bpm-input"
            type="number"
            min="20"
            max="400"
            step="1"
            @change="render"
          />
          BPM
        </label>

        <label class="check">
          <input v-model="quantize" type="checkbox" @change="render" />
          量化到 1/16
        </label>

        <label class="check">
          <input v-model="fit" type="checkbox" />
          适应宽度
        </label>
      </div>

      <div class="actions">
        <span v-if="rendering" class="status">生成中…</span>
        <button class="btn" :disabled="!currentBlob || rendering" @click="downloadSvg">
          下载 SVG
        </button>
        <button class="btn" :disabled="!svgUrl" @click="openSvgInTab">新标签页打开</button>
        <button class="btn" @click="useDemo">换成示例旋律</button>
      </div>
    </div>

    <p class="meta">
      <template v-if="source === 'demo'">示例旋律（合成素材）</template>
      <template v-else>音轨分离得到的人声旋律</template>
      · {{ notes.length }} 个音符
      <template v-if="fallback">· 没找到待预览的乐谱，已经换成示例</template>
    </p>

    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

    <div class="stage" :class="{ fit }">
      <div v-if="rendering && !svgText" class="loading">谱面生成中…</div>
      <div v-else-if="svgText" class="sheet" v-html="svgText"></div>
    </div>

    <p class="hint">
      五线谱按 4/4 拍、C 大调记谱，和卷帘上的旋律是同一份音符。节拍和量化只影响谱面，
      不动原始音频。「下载 SVG」保存当前格式；也可以直接在新标签页打开图片，用浏览器打印。
    </p>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { buildStaffSvg, buildJianpuSvg } from './StemSplitter/score.js'
import { buildDemoScore } from './StemSplitter/demo.js'

const props = defineProps({
  /** 要预览的旋律。由音轨分离页的弹窗传入，不传就回退到示例旋律 */
  initial: { type: Object, default: null },
  /** 嵌在弹窗里时去掉页面级别的底部留白 */
  embedded: { type: Boolean, default: false },
})

const DEMO_TITLE = '示例旋律'

// 音符只整体替换、不逐项改，用 shallowRef 避免把几千个音全包成响应式代理
const notes = shallowRef([])
const scoreTitle = ref(DEMO_TITLE)
const scoreName = ref(DEMO_TITLE)
const source = ref('demo')
const fallback = ref(false)

const format = ref('staff')
const bpm = ref(120)
const quantize = ref(true)
const fit = ref(true)
const rendering = ref(false)
const errorMsg = ref('')

const svgText = ref('')
const svgUrl = ref('')
const currentBlob = shallowRef(null)

/** 渲染序号：改节拍、切格式时旧的一次生成可能晚回来，靠它丢弃过期结果 */
let renderToken = 0

function formatLabel(f) {
  return f === 'jianpu' ? '简谱' : '五线谱'
}

function releaseUrl() {
  if (svgUrl.value) {
    URL.revokeObjectURL(svgUrl.value)
    svgUrl.value = ''
  }
}

function applyPreview(data) {
  notes.value = data.notes
  scoreTitle.value = data.title || DEMO_TITLE
  scoreName.value = data.name || DEMO_TITLE
  bpm.value = data.bpm
  quantize.value = data.quantize !== false
  format.value = data.format === 'jianpu' ? 'jianpu' : 'staff'
  source.value = data.source === 'demo' ? 'demo' : 'audio'
}

async function render() {
  if (!notes.value.length) return

  const token = ++renderToken
  // 手输可能空、越界或带小数，生成前夹回合理范围，同时同步输入框
  const tempo = Math.min(400, Math.max(20, Math.round(Number(bpm.value)) || 120))
  bpm.value = tempo

  rendering.value = true
  errorMsg.value = ''

  const opt = { bpm: tempo, quantize: quantize.value, title: scoreTitle.value }

  try {
    const blob =
      format.value === 'jianpu'
        ? buildJianpuSvg(notes.value, opt)
        : await buildStaffSvg(notes.value, opt)
    if (token !== renderToken) return

    const text = await blob.text()
    if (token !== renderToken) return

    // 内联显示要去掉 XML 声明；URL 留给「新标签页查看」，两份都用同一个 blob
    svgText.value = text.replace(/^<\?xml[^>]*>\s*/, '')
    releaseUrl()
    svgUrl.value = URL.createObjectURL(blob)
    currentBlob.value = blob
  } catch (err) {
    if (token !== renderToken) return
    console.error('[乐谱预览] 生成失败：', err)
    errorMsg.value = '谱面生成失败：' + (err?.message || err)
    svgText.value = ''
    currentBlob.value = null
    releaseUrl()
  } finally {
    if (token === renderToken) rendering.value = false
  }
}

function setFormat(f) {
  if (format.value === f) return
  format.value = f
  render()
}

function downloadSvg() {
  if (!currentBlob.value) return
  // 单独开一个 URL：页面里那个还在用于「新标签页查看」，撤销会把它也弄坏
  const url = URL.createObjectURL(currentBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `${scoreName.value}-${formatLabel(format.value)}.svg`
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // 立刻撤销在部分浏览器上会让下载线程读到一半就 404
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function openSvgInTab() {
  if (!svgUrl.value) return
  window.open(svgUrl.value, '_blank')
}

function useDemo() {
  const demo = buildDemoScore()
  notes.value = demo.notes
  scoreTitle.value = DEMO_TITLE
  scoreName.value = DEMO_TITLE
  bpm.value = 120
  quantize.value = true
  source.value = 'demo'
  fallback.value = false
  render()
}

onMounted(() => {
  if (props.initial) {
    applyPreview(props.initial)
  } else {
    // 没带旋律进来（比如单独挂这个组件）就退回示例；调谱面样式不用先跑分离
    const demo = buildDemoScore()
    notes.value = demo.notes
    fallback.value = true
  }
  render()
})

onBeforeUnmount(() => {
  renderToken++
  releaseUrl()
})
</script>

<style scoped>
.score-preview {
  padding: 4px 0 40px;
}

.score-preview.embedded {
  padding: 0;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 14px;
  padding: 12px 14px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-color-secondary, #fafafa);
}

.controls,
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
}

.actions {
  gap: 8px;
  margin-left: auto;
  justify-content: flex-end;
}

/* ── 格式切换 ── */
.seg {
  display: inline-flex;
  padding: 2px;
  border-radius: 8px;
  border: 1.5px solid var(--border-color, #ddd);
  background: var(--bg-color, #fff);
}

.seg button {
  padding: 5px 14px;
  font-size: 12.5px;
  font-family: inherit;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-color-light, #888);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.seg button.on {
  background: var(--theme-color, #3eaf7c);
  color: #fff;
}

.seg button:hover:not(.on) {
  color: var(--theme-color, #3eaf7c);
}

.field,
.check {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: var(--text-color-light, #888);
}

.check {
  cursor: pointer;
}

.bpm-input {
  width: 58px;
  padding: 4px 6px;
  border-radius: 6px;
  border: 1.5px solid var(--border-color, #ddd);
  background: var(--bg-color, #fff);
  color: var(--text-color, #2c3e50);
  font-family: inherit;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}

.btn {
  padding: 6px 13px;
  font-size: 12.5px;
  font-family: inherit;
  border-radius: 8px;
  border: 1.5px solid var(--border-color, #ddd);
  background: transparent;
  color: var(--text-color-light, #888);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn:hover:not(:disabled) {
  border-color: var(--theme-color, #3eaf7c);
  color: var(--theme-color, #3eaf7c);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.status {
  font-size: 12px;
  color: var(--theme-color, #3eaf7c);
}

.meta {
  margin: 12px 0 10px;
  font-size: 12.5px;
  color: var(--text-color-light, #999);
}

/* ── 谱面 ── */
.stage {
  overflow-x: auto;
  padding: 8px;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
}

.sheet :deep(svg) {
  display: block;
  max-width: none;
  height: auto;
}

/* 适应宽度时让 SVG 跟着容器缩放；关掉就按 1600px 原尺寸，横向滚动看细节。
   VexFlow 会把 width/height 写成 SVG 的行内 style，必须 !important 才盖得住 */
.stage.fit .sheet :deep(svg) {
  width: 100% !important;
  height: auto !important;
}

.loading {
  padding: 60px 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-color-light, #999);
}

.error-msg {
  color: #e74c3c;
  font-size: 13px;
  line-height: 1.6;
  padding: 10px 12px;
  background: rgba(231, 76, 60, 0.08);
  border-radius: 8px;
  margin: 10px 0;
}

.hint {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-color-light, #999);
}

@media (max-width: 719px) {
  .toolbar {
    gap: 8px 10px;
    padding: 10px;
  }

  .actions {
    margin-left: 0;
  }
}
</style>
