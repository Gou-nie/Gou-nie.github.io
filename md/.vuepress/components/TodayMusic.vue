<template>
  <div class="today-music">

    <!-- 当期播放器 -->
    <div class="player-card" v-if="current">
      <!-- 唱片封面 -->
      <div class="disc-wrap">
        <div class="disc" :class="{ spinning: isPlaying }" :style="{ background: discGradient }">
          <div class="disc-inner">
            <span class="disc-icon">♪</span>
          </div>
        </div>
        <div class="sound-waves" v-if="isPlaying">
          <span v-for="i in 5" :key="i" :style="{ animationDelay: `${(i - 1) * 0.15}s` }"></span>
        </div>
        <div class="sound-waves-placeholder" v-else></div>
      </div>

      <!-- 信息区 -->
      <div class="ep-info">
        <div class="ep-date">{{ current.date }}</div>
        <div class="ep-title">{{ current.title }}</div>
        <div class="ep-desc" v-if="current.desc">{{ current.desc }}</div>
      </div>

      <!-- 媒体元素：mp4 用 video（隐藏画面只取音轨），其余用 audio -->
      <video
        v-if="isMp4"
        ref="audioRef"
        :src="current.url"
        @timeupdate="onTimeUpdate"
        @progress="onProgress"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        style="display:none"
      ></video>
      <audio
        v-else
        ref="audioRef"
        :src="current.url"
        @timeupdate="onTimeUpdate"
        @progress="onProgress"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      ></audio>

      <!-- 错误提示 -->
      <div class="error-msg" v-if="error">{{ error }}</div>

      <!-- 控制栏 -->
      <div class="controls">
        <button
          class="btn-play"
          :class="{ loading: isLoading }"
          @click="togglePlay"
          :aria-label="isPlaying ? '暂停' : '播放'"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner"></span>
          <span v-else-if="!isPlaying">▶</span>
          <span v-else>⏸</span>
        </button>

        <div class="progress-wrap">
          <div class="progress-track">
            <div class="progress-buffer" :style="{ width: bufferPercent + '%' }"></div>
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            <input
              class="progress"
              type="range"
              min="0"
              :max="duration || 0"
              step="0.5"
              :value="currentTime"
              @input="seek($event)"
            />
          </div>
          <div class="time-row">
            <span>{{ currentTimeStr }}</span>
            <span>{{ durationStr }}</span>
          </div>
        </div>

        <a class="btn-dl" :href="current.url" :download="current.title + (isMp4 ? '.mp4' : '.mp3')" target="_blank" title="下载">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>
      </div>
    </div>

    <div class="no-ep" v-else>
      暂无音频，敬请期待。
    </div>

    <!-- 评价区 -->
    <div class="review-card" v-if="current && (current.review || current.desc)">
      <div class="review-label">编辑推荐</div>
      <p class="review-text">{{ current.review || current.desc }}</p>
    </div>

    <!-- 历史列表（分页） -->
    <div class="ep-list" v-if="episodes.length > 0">
      <div class="ep-list-title">历史期数</div>
      <div
        v-for="ep in pagedEpisodes"
        :key="ep.date"
        class="ep-item"
        :class="{ active: current && current.date === ep.date }"
        @click="select(ep)"
      >
        <div class="ep-item-left">
          <span class="ep-item-play">{{ current && current.date === ep.date && isPlaying ? '⏸' : '▶' }}</span>
          <div>
            <div class="ep-item-title">{{ ep.title }}</div>
            <div class="ep-item-date">{{ ep.date }}</div>
          </div>
        </div>
        <a
          class="ep-item-dl"
          :href="ep.url"
          :download="ep.title + (/\.mp4$/i.test(ep.url) ? '.mp4' : '.mp3')"
          target="_blank"
          title="下载"
          @click.stop
        >↓</a>
      </div>
      <!-- 分页控制 -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="page === 1" @click="page--">‹</button>
        <button
          v-for="p in totalPages"
          :key="p"
          class="page-btn"
          :class="{ 'page-btn-active': p === page }"
          @click="page = p"
        >{{ p }}</button>
        <button class="page-btn" :disabled="page === totalPages" @click="page++">›</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import episodes from '../public/html&js/content/musicContentArr.js'

const audioRef = ref(null)
const isPlaying = ref(false)
const isLoading = ref(false)
const error = ref('')
const currentTime = ref(0)
const duration = ref(0)
const bufferedTime = ref(0)
const current = ref(episodes[0] || null)
const isMp4 = computed(() => /\.mp4$/i.test(current.value?.url || ''))

const currentTimeStr = computed(() => fmt(currentTime.value))
const durationStr = computed(() => fmt(duration.value))
const progressPercent = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)
const bufferPercent = computed(() => duration.value ? (bufferedTime.value / duration.value) * 100 : 0)

const PAGE_SIZE = 5
const page = ref(1)
const totalPages = computed(() => Math.ceil(episodes.length / PAGE_SIZE))
const pagedEpisodes = computed(() =>
  episodes.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

// 根据标题生成唱片的渐变色
const discGradient = computed(() => {
  const title = current.value?.title || ''
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash)
  const h1 = hash % 360
  const h2 = (h1 + 40) % 360
  return `conic-gradient(from ${hash % 360}deg, hsl(${h1}, 45%, 18%), hsl(${h2}, 40%, 25%), hsl(${h1}, 50%, 14%), hsl(${(h1 + 20) % 360}, 35%, 22%), hsl(${h1}, 45%, 18%))`
})

const select = (ep) => {
  error.value = ''
  if (current.value?.date === ep.date) {
    togglePlay()
    return
  }
  current.value = ep
}

const log = (...args) => console.log('[TodayMusic]', ...args)

watch(current, async () => {
  error.value = ''
  isLoading.value = true
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  bufferedTime.value = 0
  await nextTick()
  const el = audioRef.value
  if (!el) {
    isLoading.value = false
    return
  }
  el.load()
  el.play().then(() => {
    isLoading.value = false
  }).catch((err) => {
    isLoading.value = false
    error.value = '播放失败，请稍后重试'
    log('play() 失败:', err.name, err.message)
  })
})

const togglePlay = () => {
  const audio = audioRef.value
  if (!audio) return
  if (audio.paused) {
    isLoading.value = true
    error.value = ''
    audio.play().then(() => {
      isLoading.value = false
    }).catch((err) => {
      isLoading.value = false
      error.value = '播放失败，请稍后重试'
      log('play() 失败:', err.name, err.message)
    })
  } else {
    audio.pause()
  }
}

const onTimeUpdate = () => {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime
}

const onProgress = () => {
  const el = audioRef.value
  if (!el || !el.buffered.length) return
  bufferedTime.value = el.buffered.end(el.buffered.length - 1)
}

const onLoadedMetadata = () => {
  const el = audioRef.value
  if (!el) return
  duration.value = el.duration || 0
}

const onEnded = () => {
  isPlaying.value = false
  const idx = episodes.findIndex(e => e.date === current.value?.date)
  if (idx >= 0 && idx < episodes.length - 1) {
    select(episodes[idx + 1])
    setTimeout(() => audioRef.value?.play().catch(() => {}), 100)
  }
}

const seek = (e) => {
  const val = Number(e.target.value)
  if (audioRef.value) audioRef.value.currentTime = val
  currentTime.value = val
}

const fmt = (t) => {
  if (!t && t !== 0) return '--:--'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped>
.today-music {
  max-width: 640px;
  margin: 0 auto;
  padding: 16px 0 40px;
  font-family: inherit;
}

/* ── 播放器卡片 ── */
.player-card {
  background: var(--bg-color-secondary, #f5f5f5);
  border-radius: 20px;
  padding: 28px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

/* ── 唱片 ── */
.disc-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.disc {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(#2c2c2c 0%, #444 25%, #222 50%, #3a3a3a 75%, #2c2c2c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  transition: box-shadow 0.3s;
  position: relative;
}

.disc::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: repeating-radial-gradient(circle at center, transparent 0, transparent 13px, rgba(0,0,0,0.08) 13px, rgba(0,0,0,0.08) 14px);
  pointer-events: none;
}

.disc.spinning {
  animation: spin 4s linear infinite;
  box-shadow: 0 6px 28px rgba(0,0,0,0.35);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.disc-inner {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--bg-color, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.disc-icon {
  font-size: 16px;
  color: var(--text-color-light, #999);
}

/* ── 音波动画 ── */
.sound-waves,
.sound-waves-placeholder {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  height: 28px;
}

.sound-waves-placeholder {
  visibility: hidden;
}

.sound-waves span {
  display: block;
  width: 4px;
  border-radius: 2px;
  background: var(--theme-color, #3eaf7c);
  animation: wave 0.8s ease-in-out infinite alternate;
}

.sound-waves span:nth-child(1) { height: 10px; }
.sound-waves span:nth-child(2) { height: 20px; }
.sound-waves span:nth-child(3) { height: 28px; }
.sound-waves span:nth-child(4) { height: 18px; }
.sound-waves span:nth-child(5) { height: 10px; }

@keyframes wave {
  from { transform: scaleY(0.4); }
  to   { transform: scaleY(1); }
}

/* ── 信息 ── */
.ep-info {
  text-align: center;
}

.ep-date {
  font-size: 12px;
  color: var(--text-color-light, #999);
  margin-bottom: 6px;
}

.ep-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color, #2c3e50);
  line-height: 1.3;
}

.ep-desc {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-color-light, #888);
}

/* ── 控制栏 ── */
.controls {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
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
  position: relative;
}

.btn-play:hover:not(:disabled) { opacity: 0.85; transform: scale(1.05); }
.btn-play:active:not(:disabled) { transform: scale(0.96); }
.btn-play:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-play.loading {
  background: var(--text-color-light, #aaa);
}

/* spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ── 错误提示 ── */
.error-msg {
  width: 100%;
  text-align: center;
  color: #e74c3c;
  font-size: 13px;
  padding: 8px 12px;
  background: rgba(231, 76, 60, 0.08);
  border-radius: 8px;
  margin-top: 4px;
}

/* ── 进度条 ── */
.progress-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-track {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.progress-buffer,
.progress-fill {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 6px;
  border-radius: 3px;
  pointer-events: none;
}

.progress-buffer {
  background: var(--border-color, #ddd);
  z-index: 0;
}

.progress-fill {
  background: var(--theme-color, #3eaf7c);
  z-index: 1;
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
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: transform 0.12s;
}

.progress::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.progress::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--theme-color, #3eaf7c);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  cursor: pointer;
}

.time-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-color-light, #aaa);
}

/* ── 下载按钮 ── */
.btn-dl {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--border-color, #ddd);
  color: var(--text-color-light, #888);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.btn-dl:hover {
  border-color: var(--theme-color, #3eaf7c);
  color: var(--theme-color, #3eaf7c);
  background: rgba(62, 175, 124, 0.06);
}

/* ── 历史列表 ── */
.ep-list {
  margin-top: 32px;
}

.ep-list-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-light, #aaa);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 12px;
  padding-left: 4px;
}

.ep-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
  gap: 10px;
}

.ep-item:hover {
  background: var(--bg-color-secondary, #f0f0f0);
}

.ep-item.active {
  background: var(--bg-color-secondary, #eef7f2);
}

.ep-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.ep-item-play {
  font-size: 14px;
  color: var(--theme-color, #3eaf7c);
  flex-shrink: 0;
  width: 18px;
  text-align: center;
}

.ep-item-title {
  font-size: 14px;
  color: var(--text-color, #2c3e50);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ep-item-date {
  font-size: 11px;
  color: var(--text-color-light, #aaa);
  margin-top: 2px;
}

.ep-item-dl {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--text-color-light, #bbb);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: color 0.15s;
}

.ep-item-dl:hover {
  color: var(--theme-color, #3eaf7c);
}

.no-ep {
  text-align: center;
  padding: 60px 0;
  color: var(--text-color-light, #aaa);
  font-size: 15px;
}

/* ── 评价区 ── */
.review-card {
  margin-top: 24px;
  padding: 20px 22px;
  background: var(--bg-color-secondary, #f5f5f5);
  border-left: 3px solid var(--theme-color, #3eaf7c);
  border-radius: 0 12px 12px 0;
}

.review-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--theme-color, #3eaf7c);
  margin-bottom: 10px;
}

.review-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-color, #2c3e50);
  white-space: pre-wrap;
}

/* ── 分页 ── */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1.5px solid var(--border-color, #ddd);
  background: transparent;
  color: var(--text-color, #555);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--theme-color, #3eaf7c);
  color: var(--theme-color, #3eaf7c);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.page-btn-active {
  background: var(--theme-color, #3eaf7c);
  border-color: var(--theme-color, #3eaf7c);
  color: #fff !important;
}
</style>
