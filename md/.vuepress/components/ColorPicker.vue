<template>
    <div class="color-picker">
      <input type="color" v-model="color" @input="emitColor" />
      <div class="color-preview" :style="{ backgroundColor: color }"></div>
      <p>当前颜色值: {{ color }}</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ColorPicker',
    props: {
      modelValue: {
        type: String,
        default: '#aaaaaa'
      }
    },
    emits: ['update:color'],
    data() {
      return {
        color: this.modelValue
      };
    },
    watch: {
      color(newVal) {
        this.emitColor();
      },
      modelValue(newVal) {
        this.color = newVal;
      }
    },
    methods: {
      emitColor() {
        this.$emit('update:color', this.color);
      }
    }
  };
  </script>
  
  <style scoped>
  .color-picker {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .color-preview {
    width: 30px;
    height: 30px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  </style>
  