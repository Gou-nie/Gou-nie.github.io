<template>
  <div ref="rootRef" class="excerpt-floating-cards">
    <a :href="withBase('/')" class="home-button">返回主页</a>

    <button
      v-if="isReady && visibleCards.length"
      type="button"
      class="refresh-button"
      @click="refreshCards"
    >
      换一批
    </button>

    <article
      v-for="card in visibleCards"
      :key="card.id"
      class="floating-card"
      :style="card.style"
      @mouseenter="bringCardToFront(card)"
      @mousedown="bringCardToFront(card)"
    >
      <div class="card-content">{{ card.text }}</div>
    </article>
  </div>
</template>

<script setup>
import { withBase } from '@vuepress/client'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  visibleCount: {
    type: Number,
    default: 4,
  },
})

const rootRef = ref(null)
const allQuotes = ref([])
const visibleCards = ref([])
const isReady = ref(false)
const refreshSeed = ref(0)

let resizeTimer = null

const waitForFrame = () =>
  new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const randomBetween = (min, max) => min + Math.random() * (max - min)

const normalizeQuote = (text) =>
  text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

const getVisibleCount = () => {
  const count = Math.max(1, props.visibleCount)

  if (typeof window === 'undefined') {
    return count
  }

  if (window.innerWidth < 640) {
    return Math.min(count, 2)
  }

  if (window.innerWidth < 960) {
    return Math.min(count, 3)
  }

  return count
}

const shuffle = (items) => {
  const copied = [...items]

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[copied[index], copied[randomIndex]] = [copied[randomIndex], copied[index]]
  }

  return copied
}

const randomLightColor = () => {
  const hue = Math.floor(Math.random() * 360)
  const saturation = 100 + Math.random() * 10
  const lightness = 90 + Math.random() * 10

  return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.92)`
}

const estimateCardSize = (text) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const lines = text.split('\n')
  const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0)
  const charsPerRow = isMobile ? 18 : 24
  const wrappedLines = lines.reduce(
    (total, line) => total + Math.max(1, Math.ceil(line.length / charsPerRow)),
    0,
  )

  return {
    width: clamp(longestLine * (isMobile ? 8.2 : 7.8), isMobile ? 170 : 210, isMobile ? 230 : 300),
    height: clamp(wrappedLines * 24 + 34, 118, isMobile ? 210 : 280),
  }
}

const overlaps = (first, second, gap) => {
  if (first.left + first.width + gap <= second.left) return false
  if (second.left + second.width + gap <= first.left) return false
  if (first.top + first.height + gap <= second.top) return false
  if (second.top + second.height + gap <= first.top) return false

  return true
}

const bringCardToFront = (card) => {
  visibleCards.value = visibleCards.value.map((item, index) => ({
    ...item,
    style: {
      ...item.style,
      zIndex: item.id === card.id ? '180' : String(50 + index),
    },
  }))
}

const createVisibleCards = (quotes) => {
  const isMobile = window.innerWidth < 640
  const margin = isMobile ? 12 : 20
  const reservedBottom = isMobile ? 76 : 88
  const gap = isMobile ? 10 : 18
  const placedRects = []

  return quotes.map((quote, index) => {
    const size = estimateCardSize(quote.text)
    const width = Math.min(size.width, Math.max(160, window.innerWidth - margin * 2))
    const height = Math.min(
      size.height,
      Math.max(120, window.innerHeight - margin * 2 - reservedBottom),
    )
    const maxLeft = Math.max(margin, window.innerWidth - width - margin)
    const maxTop = Math.max(margin, window.innerHeight - height - reservedBottom)

    let left = margin
    let top = margin
    let nextRect = { left, top, width, height }

    for (let attempt = 0; attempt < 20; attempt += 1) {
      left = randomBetween(margin, maxLeft)
      top = randomBetween(margin, maxTop)
      nextRect = { left, top, width, height }

      if (!placedRects.some((rect) => overlaps(rect, nextRect, gap))) {
        break
      }
    }

    placedRects.push(nextRect)

    return {
      id: `${refreshSeed.value}-${quote.index}-${index}`,
      text: quote.text,
      style: {
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
        maxWidth: `${Math.round(width)}px`,
        maxHeight: `${Math.round(height)}px`,
        backgroundColor: randomLightColor(),
        zIndex: String(50 + index),
        '--card-rotate': `${randomBetween(-4, 4).toFixed(2)}deg`,
        '--card-delay': `${index * 70}ms`,
      },
    }
  })
}

const collectQuotes = () => {
  console.log("rootref is ",rootRef)
  const container = rootRef.value?.parentElement
  console.log("parentElement is ",container)
  if (!container) {
    isReady.value = true
    return
  }

  const sourceCodes = Array.from(container.querySelectorAll('pre code'))

  allQuotes.value = sourceCodes
    .map((code) => normalizeQuote(code.textContent || ''))
    .filter(Boolean)

  isReady.value = true

  if (allQuotes.value.length) {
    refreshCards()
  }
}

const refreshCards = () => {
  if (!allQuotes.value.length || typeof window === 'undefined') {
    visibleCards.value = []
    return
  }

  refreshSeed.value += 1

  const picked = shuffle(
    allQuotes.value.map((text, index) => ({ text, index })),
  ).slice(0, Math.min(getVisibleCount(), allQuotes.value.length))

  visibleCards.value = createVisibleCards(picked)
}

const handleResize = () => {
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    refreshCards()
  }, 120)
}

onMounted(async () => {
  await nextTick()
  await waitForFrame()
  collectQuotes()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  if (resizeTimer) {
    window.clearTimeout(resizeTimer)
  }
})
</script>

<style scoped>
.excerpt-floating-cards {
  position: fixed;
  inset: 0;
  z-index: 120;
  pointer-events: none;
  background-color: #293649;
  
}

.refresh-button,
.home-button {
  position: fixed;
  top: 20px;
  z-index: 140;
  pointer-events: auto;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 999px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.86);
  color: #1f2937;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(12px);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  text-decoration: none;
}

.refresh-button {
  right: 20px;
}

.home-button {
  left: 20px;
}

.refresh-button:hover,
.home-button:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.18);
}

.floating-card {
  position: fixed;
  pointer-events: auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 16px 18px;
  color: rgba(15, 23, 42, 0.88);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(14px);
  transform: rotate(var(--card-rotate));
  animation: excerpt-card-in 0.36s ease both;
  animation-delay: var(--card-delay);
}

.card-content {
  max-height: inherit;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.65;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
}

.card-content::-webkit-scrollbar {
  width: 6px;
}

.card-content::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.35);
}

@keyframes excerpt-card-in {
  from {
    opacity: 0;
    transform: translateY(12px) rotate(var(--card-rotate));
  }

  to {
    opacity: 1;
    transform: translateY(0) rotate(var(--card-rotate));
  }
}

@media (max-width: 959px) {
  .floating-card {
    padding: 14px 16px;
  }
}

@media (max-width: 639px) {
  .refresh-button {
    right: 12px;
    top: auto;
    bottom: 12px;
    padding: 10px 14px;
  }

  .home-button {
    left: 12px;
    top: 12px;
    padding: 10px 14px;
  }

  .floating-card {
    border-radius: 16px;
    padding: 12px 14px;
  }

  .card-content {
    font-size: 13px;
    line-height: 1.55;
  }
}
</style>
