<template>
  <div class="news-list">
    {{ Date() }}
    <div class="news-item" v-for="(item, idx) in newsList" :key="idx">
      {{ item }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewsList',
  data() {
    return {
      newsList: []
    }
  },
  mounted(){
    fetch('https://news.ravelloh.top/latest.json')
      .then(response => response.json())
      .then(data => {
        this.newsList = data.content;
      })
      .catch(error => {
        console.error('获取新闻失败:', error);
      });
  }
}
</script>

<style scoped>
.news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}
.news-item {
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 16px;
}
</style>