<template>
  <div class="home-view">
    <FloatingBall />
  </div>
</template>

<script lang="ts" setup>
//拖拽组件
import FloatingBall from "./FloatingBall.vue";
</script>
<style scoped lang="scss">
.home-view {
  height: 200px;
  width: 200px;
  background-color: #000000;

  h2 {
    text-align: center;
  }
}
</style>