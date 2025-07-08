<template>
  <div class="card">
    <div class="card-header">
      <slot name="header">
        <!-- 默认头部内容 -->
        <h3>{{ headerTitle }}</h3>
      </slot>
    </div>
    <div class="card-body">
      <slot>
        <!-- 默认内容 -->
        <p>{{ bodyContent }}</p>
      </slot>
    </div>
    <div class="card-footer">
      <slot name="footer">
        <!-- 默认底部内容 -->
        <small>{{ footerText }}</small>
      </slot>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Card',
  props: {
    headerTitle: {
      type: String,
      default: 'Card Title',
    },
    bodyContent: {
      type: String,
      default: 'This is the card body content.',
    },
    footerText: {
      type: String,
      default: 'Last updated 3 mins ago',
    },
  },
});
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden; /*  确保内容不会超出容器  */
}

.card-header {
  padding: 1rem;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
}

.card-header h3 {
  margin: 0;
}

.card-body {
  padding: 1rem;
}

.card-footer {
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border-top: 1px solid #ccc;
  text-align: right;
}

.card-footer small {
  color: #777;
}
</style>