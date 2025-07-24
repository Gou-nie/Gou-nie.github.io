<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center text-white">
    <div class="text-3xl font-bold mb-8">滑动解锁</div>
    <div class="flex space-x-6">
      <Wheel v-for="i in 4" :key="i" v-model:number="pin[i - 1]" />
    </div>
    <div class="mt-6 text-lg font-mono tracking-widest">
      当前密码：<span class="text-green-400 font-bold text-xl">{{ pin.join('') }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Wheel from './FancyWheel.vue'

const pin = ref([0, 0, 0, 0])
</script>
