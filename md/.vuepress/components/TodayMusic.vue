<template>
  <div class="today-music">

    <!-- 当期播放器 -->
    <div class="player-card" v-if="current">
      <!-- 唱片封面 -->
      <div class="disc-wrap">
        <div class="disc" :class="{ spinning: isPlaying }">
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
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      ></audio>

      <!-- 控制栏 -->
      <div class="controls">
        <button class="btn-play" @click="togglePlay" :aria-label="isPlaying ? '暂停' : '播放'">
          <span v-if="!isPlaying">▶</span>
          <span v-else>⏸</span>
        </button>

        <div class="progress-wrap">
          <input
            class="progress"
            type="range"
            min="0"
            :max="duration || 0"
            step="0.5"
            :value="currentTime"
            @input="seek($event)"
          />
          <div class="time-row">
            <span>{{ fmt(currentTime) }}</span>
            <span>{{ fmt(duration) }}</span>
          </div>
        </div>

        <a class="btn-dl" :href="current.url" :download="current.title + (isMp4 ? '.mp4' : '.mp3')" target="_blank" title="下载">
          ↓
        </a>
      </div>
    </div>

    <div class="no-ep" v-else>
      暂无音频，敬请期待。
    </div>

    <!-- 历史列表 -->
    <div class="ep-list" v-if="episodes.length > 0">
      <div class="ep-list-title">历史期数</div>
      <div
        v-for="ep in episodes"
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
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import episodes from '../public/html&js/content/musicContentArr.js'

const audioRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const current = ref(episodes[0] || null)
const isMp4 = computed(() => /\.mp4$/i.test(current.value?.url || ''))

const select = (ep) => {
  if (current.value?.date === ep.date) {
    togglePlay()
    return
  }
  current.value = ep
}

const log = (...args) => console.log('[TodayMusic]', ...args)

watch(current, async () => {
  log('切换至', current.value?.title, '|', current.value?.url, '| isMp4:', isMp4.value)
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  await nextTick()
  const el = audioRef.value
  log('nextTick 后 audioRef:', el?.tagName ?? 'null')
  if (!el) return
  el.load()
  log('load() 已调用，readyState:', el.readyState, 'networkState:', el.networkState)
  el.play().then(() => {
    log('play() 成功')
  }).catch((err) => {
    log('play() 失败:', err.name, err.message)
  })
})

const togglePlay = () => {
  const audio = audioRef.value
  if (!audio) return
  log('togglePlay, paused:', audio.paused, 'readyState:', audio.readyState)
  if (audio.paused) {
    audio.play().then(() => log('play() 成功')).catch((err) => log('play() 失败:', err.name, err.message))
  } else {
    audio.pause()
  }
}

const onTimeUpdate = () => {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime
}

const onLoadedMetadata = () => {
  const el = audioRef.value
  if (!el) return
  duration.value = el.duration || 0
  log('loadedmetadata — duration:', el.duration, 'videoTracks:', el.videoTracks?.length ?? 'N/A', 'audioTracks:', el.audioTracks?.length ?? 'N/A')
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
}

.btn-play:hover { opacity: 0.85; transform: scale(1.05); }
.btn-play:active { transform: scale(0.96); }

.progress-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress {
  width: 100%;
  height: 4px;
  accent-color: var(--theme-color, #3eaf7c);
  cursor: pointer;
}

.time-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-color-light, #aaa);
}

.btn-dl {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--border-color, #ddd);
  color: var(--text-color-light, #888);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}

.btn-dl:hover {
  border-color: var(--theme-color, #3eaf7c);
  color: var(--theme-color, #3eaf7c);
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
</style>
