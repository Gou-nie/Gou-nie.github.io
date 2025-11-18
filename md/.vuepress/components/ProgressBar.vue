<template>
  <div class="progress-bar-container" :style="{ borderColor: progressColors.accent }">
    <div class="time-display">
      <span class="start-time">开始时间：{{ formattedStartTime }}</span>
      <span class="actual-time" v-if="formattedActualTime">完成时间：{{ formattedActualTime }}</span>
      <span class="end-time">结束时间：{{ formattedEndTime }}</span>
    </div>
    <div class="progress-bar" :style="{ borderColor: progressColors.secondary }">
      <div 
        class="progress-fill" 
        :style="{ 
          width: `${progress}%`,
          background: `linear-gradient(135deg, ${progressColors.primary} 0%, ${progressColors.secondary} 50%, ${progressColors.accent} 100%)`
        }"
      >
        <div class="bouncing-dot" v-if="progress > 0 && progress < 100"></div>
        <div class="sparkle" v-for="sparkle in sparkles" :key="sparkle.id" :style="sparkle.style"></div>
      </div>
    </div>
    <div class="progress-info">
      <span class="progress-text" :style="{ color: progressColors.text }">{{ progressText }}</span>
      <span class="progress-percentage" :style="{ color: progressColors.text }">{{ progress }}%</span>
      <div class="emoji-status" v-if="showEmoji">
        {{ getEmojiStatus }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  showText: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#64b5f6'
  },
  height: {
    type: String,
    default: '12px'
  },
  animated: {
    type: Boolean,
    default: true
  },
  showEmoji: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    default: 'cute',
    validator: (value) => ['cute', 'rainbow', 'pastel'].includes(value)
  },
  startTime:{
    type: Date,
    default: new Date
  },
  endTime:{
    type: Date,
    default: new Date
  },
  actualTime:{
    type: Date,
    default: null
  }
})

const sparkles = ref([])

const progressText = computed(() => {
  return props.text || `进度: ${props.progress}%`
})

const formattedStartTime = computed(() => {
  if (!props.startTime) return ''
  const date = new Date(props.startTime)
  return date.toLocaleDateString('zh-CN', { 
    year: '2-digit',
    month: '2-digit', 
    day: '2-digit' 
  })
})

const formattedEndTime = computed(() => {
  if (!props.endTime) return ''
  const date = new Date(props.endTime)
  return date.toLocaleDateString('zh-CN', { 
    year: '2-digit',
    month: '2-digit', 
    day: '2-digit' 
  })
})

const formattedActualTime = computed(() => {
  if (!props.actualTime) return ''
  const date = new Date(props.actualTime)
  return date.toLocaleDateString('zh-CN', { 
    year: '2-digit',
    month: '2-digit', 
    day: '2-digit' 
  })
})

const getEmojiStatus = computed(() => {
  if (props.progress === 0) return '😴'
  if (props.progress < 25) return '😊'
  if (props.progress < 50) return '😄'
  if (props.progress < 75) return '🥳'
  if (props.progress < 100) return '🎉'
  return '🎊'
})

const progressColors = computed(() => {
  if (props.progress === 0) {
    return {
      primary: '#b0b0b0',
      secondary: '#d0d0d0',
      accent: '#e0e0e0',
      text: '#666666'
    }
  } else if (props.progress < 25) {
    return {
      primary: '#64b5f6',
      secondary: '#90caf9',
      accent: '#bbdefb',
      text: '#1976d2'
    }
  } else if (props.progress < 50) {
    return {
      primary: '#4db6ac',
      secondary: '#80cbc4',
      accent: '#b2dfdb',
      text: '#00796b'
    }
  } else if (props.progress < 75) {
    return {
      primary: '#81c784',
      secondary: '#a5d6a7',
      accent: '#c8e6c9',
      text: '#388e3c'
    }
  } else if (props.progress < 100) {
    return {
      primary: '#ffb74d',
      secondary: '#ffcc80',
      accent: '#ffe0b2',
      text: '#f57c00'
    }
  } else {
    return {
      primary: '#ff8a65',
      secondary: '#ffab91',
      accent: '#ffccbc',
      text: '#d84315'
    }
  }
})

const themeColors = computed(() => {
  switch (props.theme) {
    case 'rainbow':
      return {
        primary: '#ff6b9d',
        secondary: '#6bc5ff',
        accent: '#ffd166'
      }
    case 'pastel':
      return {
        primary: '#a8e6cf',
        secondary: '#ffd3b6',
        accent: '#ffaaa5'
      }
    default:
      return {
        primary: '#ff6b9d',
        secondary: '#ffb6c1',
        accent: '#ffd700'
      }
  }
})

watch(() => props.progress, (newVal, oldVal) => {
  if (newVal > oldVal && props.animated) {
    createSparkles()
  }
})

const createSparkles = () => {
  const newSparkles = []
  for (let i = 0; i < 3; i++) {
    newSparkles.push({
      id: Date.now() + i,
      style: {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`
      }
    })
  }
  sparkles.value = newSparkles
  
  setTimeout(() => {
    sparkles.value = []
  }, 1000)
}
</script>

<style scoped>
.progress-bar-container {
  width: 100%;
  margin: 20px 0;
  padding: 16px;
  background: linear-gradient(135deg, #f8fdff 0%, #f0f9ff 100%);
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(100, 181, 246, 0.1);
  border: 2px solid;
  transition: border-color 0.3s ease;
  position: relative;
}

.time-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.start-time {
  align-self: flex-start;
}

.actual-time {
  font-weight: 600;
  color: #1976d2;
  background: rgba(25, 118, 210, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.end-time {
  align-self: flex-end;
}

.progress-bar {
  width: 100%;
  background: linear-gradient(135deg, #f0f9ff 0%, #e3f2fd 100%);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(100, 181, 246, 0.2);
  border: 2px solid;
  position: relative;
  transition: border-color 0.3s ease;
}

.progress-fill {
  height: 12px;
  border-radius: 12px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-image: linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.3) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0.3) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 20px;
  animation: progress-stripes 1.5s linear infinite;
}

.bouncing-dot {
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  animation: bounce 0.8s ease-in-out infinite;
}

.sparkle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
  animation: sparkle 1s ease-out forwards;
  box-shadow: 0 0 6px #ffd700;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 14px;
  font-weight: 600;
}

.progress-text {
  font-weight: 600;
}

.progress-percentage {
  font-weight: 700;
  font-size: 16px;
}

.emoji-status {
  font-size: 18px;
  animation: emoji-bounce 0.6s ease-in-out infinite alternate;
}

@keyframes progress-stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 20px 0;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-50%) scale(1);
  }
  50% {
    transform: translateY(-50%) scale(1.2);
  }
}

@keyframes sparkle {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(0) rotate(360deg);
    opacity: 0;
  }
}

@keyframes emoji-bounce {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.2);
  }
}

@media (max-width: 768px) {
  .progress-bar-container {
    padding: 12px;
    border-radius: 16px;
  }
  
  .progress-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .progress-percentage {
    align-self: flex-end;
  }
  
  .emoji-status {
    align-self: center;
  }
}
</style>