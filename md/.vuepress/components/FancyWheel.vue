<template>
  <div
    class="w-24 h-80 overflow-hidden rounded-2xl bg-gray-800 shadow-2xl relative select-none border border-gray-600"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <div
      class="absolute w-full transition-transform duration-200 ease-out"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="i in itemCount"
        :key="i"
        class="h-20 flex items-center justify-center text-3xl font-bold text-white transition-all duration-150"
        :class="{
          'text-green-400 scale-125 font-extrabold': getDisplay(i - 1) === modelValue,
          'opacity-50': getDisplay(i - 1) !== modelValue
        }"
      >
        {{ getDisplay(i - 1) }}
      </div>
    </div>

    <!-- 中间高亮框 -->
    <div class="absolute top-1/2 left-0 right-0 h-20 pointer-events-none border-y-2 border-green-400 z-10"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Number,
})
const emit = defineEmits(['update:modelValue'])

const itemCount = 50
const cellHeight = 80
const offsetY = ref(0)

const dragging = ref(false)
let startY = 0

function getDisplay(index) {
  return index % 10
}

function startDrag(e) {
  dragging.value = true
  startY = e.touches ? e.touches[0].clientY : e.clientY
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', endDrag)
}

function onDrag(e) {
  if (!dragging.value) return
  const y = e.touches ? e.touches[0].clientY : e.clientY
  const delta = y - startY
  startY = y
  offsetY.value += delta
}

function endDrag() {
  dragging.value = false
  const snappedIndex = Math.round(offsetY.value / cellHeight)
  offsetY.value = snappedIndex * cellHeight

  const value = ((-snappedIndex % 10) + 10) % 10
  emit('update:modelValue', value)

  cleanup()
}

function cleanup() {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
}

watch(
  () => props.modelValue,
  (val) => {
    offsetY.value = -val * cellHeight
  },
  { immediate: true }
)
</script>
