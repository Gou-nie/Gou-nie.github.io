<template>
  <div class="video-player">
    <div class="video-area">
      <!-- 如果是 B 站嵌入，使用 iframe -->
      <iframe
        v-if="isCurrentBili"
        :key="iframeKey"
        class="iframe-player"
        :src="biliIframeSrc"
        scrolling="no"
        frameborder="0"
        allowfullscreen="true"
        :width="width"
        :height="height"
      ></iframe>

      <!-- 普通视频文件 -->
      <video
        v-else
        ref="videoRef"
        class="video"
        :src="currentVideo.src"
        :poster="currentVideo.poster"
        controlslist="nodownload"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
      ></video>
    </div>

    <!-- 控制栏：仅在非 B 站 iframe 时显示自定义控制 -->
    <div class="controls" v-if="!isCurrentBili">
      <button @click="togglePlay">
        {{ isPlaying ? '暂停' : '播放' }}
      </button>

      <input
        type="range"
        min="0"
        :max="duration || 0"
        step="0.1"
        v-model.number="currentTime"
        @input="seekVideo"
      />

      <span class="time">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>

      <button @click="toggleFullscreen">
        全屏
      </button>
    </div>

    <!-- 播放列表 -->
    <div class="playlist" v-if="videos && videos.length > 1">
      <h4>播放列表</h4>
      <ul>
        <li
          v-for="(video, index) in videos"
          :key="index"
          :class="{ active: index === currentIndex }"
          @click="switchVideo(index)"
        >
        <img :src="video.pic"/>
          {{ video.title || (video.type === 'bilibili' ? 'Bilibili 视频' : '视频') }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  videos: {
    type: Array,
    required: true
  },
  // 可选默认宽高（iframe 与 video 都会使用）
  width: {
    type: [Number, String],
    default: 640
  },
  height: {
    type: [Number, String],
    default: 360
  },
  // 是否每次切换自动播放（仅对 file 类型有效；iframe 的 autoplay 由参数控制）
  autoplayOnSwitch: {
    type: Boolean,
    default: false
  }
})

const videoRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const currentIndex = ref(0)

// 用于强制 iframe 重新渲染（切换同一个 bvid 时可能需要）
const iframeKey = ref(Date.now())

const currentVideo = computed(() => props.videos[currentIndex.value] || {})

const isCurrentBili = computed(() => {
  const t = (currentVideo.value.type || '').toLowerCase()
  return t === 'bilibili' || t === 'bili' || t === 'b'
})

// 生成 B 站 iframe 地址：支持传完整 iframe src 或只传 bvid（如 BV...）
const biliIframeSrc = computed(() => {
  const v = currentVideo.value
  if (!v) return ''
  // 如果 src 已经看起来像 player.bilibili.com 的地址，就直接用
  if (v.src && v.src.includes('player.bilibili.com')) {
    // 如果用户传了 autoplay 参数优先使用条目中的设置
    const autoplayParam = v.autoplay ? '1' : '0'
    // 如果传入的 src 已有 autoplay，就不重复添加
    if (v.src.includes('autoplay=')) return v.src
    return `${v.src}${v.src.includes('?') ? '&' : '?'}autoplay=${autoplayParam}`
  }

  // 支持只传 bvid（BV...）或 av 号
  const bvid = v.src || v.bvid || v.bv || ''
  const autoplay = v.autoplay ? '1' : '0'
  return `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&autoplay=${autoplay}`
})

// 切换视频：更新索引、复位时间、若是 iframe 生成新的 key 强制 reload
const switchVideo = (index) => {
  if (index === currentIndex.value) {
    // 如果点击同一个 B 站视频，强制刷新 iframe（有时需要）
    if (isCurrentBili.value) {
      iframeKey.value = Date.now()
    }
    return
  }
  currentIndex.value = index
  currentTime.value = 0
  duration.value = 0
  isPlaying.value = false

  if (isBiliIndex(index)) {
    // 强制 iframe 重新渲染
    iframeKey.value = Date.now()
  } else {
    // 对于普通视频，如果 autoplayOnSwitch 或 video.autoplay 为真则播放
    // 等待下一个 tick 或 loadedmetadata 后 play
    setTimeout(() => {
      const video = videoRef.value
      if (!video) return
      const shouldAutoplay = props.autoplayOnSwitch || !!(props.videos[index] && props.videos[index].autoplay)
      if (shouldAutoplay) {
        // play 返回 Promise，捕获可能的异常（浏览器阻止自动播放）
        video.play().then(() => {
          isPlaying.value = true
        }).catch(() => {
          isPlaying.value = false
        })
      }
    }, 50)
  }
}

const isBiliIndex = (index) => {
  const v = props.videos[index] || {}
  const t = (v.type || '').toLowerCase()
  return t === 'bilibili' || t === 'bili' || t === 'b'
}

const togglePlay = () => {
  const video = videoRef.value
  if (!video) return
  if (video.paused) {
    video.play().then(() => {
      isPlaying.value = true
    }).catch(() => {
      isPlaying.value = false
    })
  } else {
    video.pause()
    isPlaying.value = false
  }
}

const onTimeUpdate = () => {
  const video = videoRef.value
  if (!video) return
  currentTime.value = video.currentTime
}

const onLoadedMetadata = () => {
  const video = videoRef.value
  if (!video) return
  duration.value = video.duration || 0
}

const seekVideo = () => {
  const video = videoRef.value
  if (!video) return
  video.currentTime = currentTime.value
}

const onEnded = () => {
  if (currentIndex.value < props.videos.length - 1) {
    switchVideo(currentIndex.value + 1)
  } else {
    isPlaying.value = false
  }
}

const toggleFullscreen = () => {
  const el = isCurrentBili.value ? document.querySelector('.iframe-player') : videoRef.value
  if (!el) return
  if (!document.fullscreenElement) {
    el.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

const formatTime = (time) => {
  if (!time && time !== 0) return '--:--'
  const m = Math.floor(time / 60)
  const s = Math.floor(time % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// 如果 props.videos 改变并且当前索引超出范围，重置为 0
watch(() => props.videos, (nv) => {
  if (!nv || nv.length === 0) return
  if (currentIndex.value >= nv.length) {
    currentIndex.value = 0
  }
})

// mounted 时如果第一个是 file 并且需要自动播放则尝试播放
onMounted(() => {
  const v = currentVideo.value
  if (v && !isCurrentBili.value) {
    const shouldAutoplay = props.autoplayOnSwitch || !!v.autoplay
    if (shouldAutoplay) {
      setTimeout(() => {
        const video = videoRef.value
        if (!video) return
        video.play().then(() => {
          isPlaying.value = true
        }).catch(() => {
          isPlaying.value = false
        })
      }, 50)
    }
  }
})
</script>

<style scoped>
.video-player {
  width: 100%;
  max-width: 900px;
  background: #000;
  color: #fff;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.video-area {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
}

/* video 元素 */
.video {
  width: 100%;
  height: auto;
  max-height: 540px;
  background: #000;
}

/* iframe */
.iframe-player {
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
  max-height: 540px;
  border: 0;
}

/* 控制栏 */
.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: rgba(0, 0, 0, 0.6);
}

.controls input[type="range"] {
  flex: 1;
  margin: 0 10px;
}

/* 播放列表 */
.playlist {
  background: #111;
  padding: 8px;
}

.playlist ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.playlist li {
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  background: transparent;
}

.playlist li.active {
  background: #333;
}
</style>
