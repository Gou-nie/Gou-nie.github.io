<template>
  <div
    ref="ballRef"
    class="floating-ball"
    :style="ballStyle"
    @mousedown="onMouseDown"
    @touchstart="onTouchStart"
    @click="onClick"
  >
    <!-- 默认图标，你可以替换成 slot 或 props 传入 -->
    <slot>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4V20M4 12H20" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </slot>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 初始位置：'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  position: {
    type: String,
    default: 'bottom-right'
  },
  // 自定义偏移量
  offset: {
    type: Object,
    default: () => ({ x: 20, y: 20 })
  }
})

const emit = defineEmits(['click'])

const ballRef = ref(null)
const state = reactive({
  isDragging: false,
  startX: 0,
  startY: 0,
  initialX: 0,
  initialY: 0,
  ballWidth: 0,
  ballHeight: 0
})

// 计算样式
const ballStyle = ref({})

// 初始化位置
const setPosition = () => {
  if (!ballRef.value) return

  const rect = ballRef.value.getBoundingClientRect()
  state.ballWidth = rect.width
  state.ballHeight = rect.height

  let left, top

  switch (props.position) {
    case 'top-left':
      left = props.offset.x
      top = props.offset.y
      break
    case 'top-right':
      left = window.innerWidth - state.ballWidth - props.offset.x
      top = props.offset.y
      break
    case 'bottom-left':
      left = props.offset.x
      top = window.innerHeight - state.ballHeight - props.offset.y
      break
    case 'bottom-right':
    default:
      left = window.innerWidth - state.ballWidth - props.offset.x
      top = window.innerHeight - state.ballHeight - props.offset.y
  }

  ballStyle.value = {
    left: `${left}px`,
    top: `${top}px`
  }
}

// 鼠标按下
const onMouseDown = (e) => {
  e.preventDefault()
  state.isDragging = true
  state.startX = e.clientX
  state.startY = e.clientY

  const style = ballRef.value.style
  state.initialX = parseFloat(style.left) || 0
  state.initialY = parseFloat(style.top) || 0

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// 触摸开始（移动端）
const onTouchStart = (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  state.isDragging = true
  state.startX = touch.clientX
  state.startY = touch.clientY

  const style = ballRef.value.style
  state.initialX = parseFloat(style.left) || 0
  state.initialY = parseFloat(style.top) || 0

  document.addEventListener('touchmove', onTouchMove)
  document.addEventListener('touchend', onTouchEnd)
}

// 鼠标移动
const onMouseMove = (e) => {
  if (!state.isDragging) return

  const dx = e.clientX - state.startX
  const dy = e.clientY - state.startY

  let newLeft = state.initialX + dx
  let newTop = state.initialY + dy

  // 边界限制
  newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - state.ballWidth))
  newTop = Math.max(0, Math.min(newTop, window.innerHeight - state.ballHeight))

  ballStyle.value.left = `${newLeft}px`
  ballStyle.value.top = `${newTop}px`
}

// 触摸移动
const onTouchMove = (e) => {
  if (!state.isDragging) return

  const touch = e.touches[0]
  const dx = touch.clientX - state.startX
  const dy = touch.clientY - state.startY

  let newLeft = state.initialX + dx
  let newTop = state.initialY + dy

  newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - state.ballWidth))
  newTop = Math.max(0, Math.min(newTop, window.innerHeight - state.ballHeight))

  ballStyle.value.left = `${newLeft}px`
  ballStyle.value.top = `${newTop}px`
}

// 鼠标松开
const onMouseUp = () => {
  state.isDragging = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

// 触摸结束
const onTouchEnd = () => {
  state.isDragging = false
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
}

// 点击事件（非拖拽时才触发）
const onClick = (e) => {
  if (state.isDragging) return
  emit('click', e)
}

// 生命周期
onMounted(() => {
  setPosition()
  window.addEventListener('resize', setPosition)
})

onUnmounted(() => {
  window.removeEventListener('resize', setPosition)
})
</script>

<style scoped>
.floating-ball {
  position: fixed;
  z-index: 9999;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #007aff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.floating-ball:active {
  transform: scale(0.95);
}

.floating-ball svg {
  pointer-events: none;
}
</style>