<template>
  <div class="mizige-container" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="mizige-svg">
      <!-- 外框 -->
      <rect :width="size" :height="size" fill="none" stroke="#333" stroke-width="2"/>
      <!-- 米字格线 -->
      <line :x1="0" :y1="size/2" :x2="size" :y2="size/2" stroke="#aaa" stroke-width="1"/>
      <line :x1="size/2" :y1="0" :x2="size/2" :y2="size" stroke="#aaa" stroke-width="1"/>
      <line :x1="0" :y1="0" :x2="size" :y2="size" stroke="#aaa" stroke-width="1"/>
      <line :x1="size" :y1="0" :x2="0" :y2="size" stroke="#aaa" stroke-width="1"/>
    </svg>
    <input
      v-model="char"
      class="mizige-input"
      :maxlength="1"
      :style="{ fontSize: size * 0.7 + 'px', width: size + 'px', height: size + 'px' }"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  size: { type: Number, default: 120 },
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])
const char = ref(props.modelValue)
watch(char, val => emit('update:modelValue', val))
</script>

<style scoped>
.mizige-container {
  position: relative;
  display: inline-block;
}
.mizige-svg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}
.mizige-input {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  background: transparent;
  border: none;
  text-align: center;
  width: 100%;
  height: 100%;
  outline: none;
  color: #222;
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
}
</style>