<template>
  <div class="container" style="background-image: url('/images/45-degree-fabric-dark.png');">
    <!-- 缩略图 -->
    <div
      class="preview"
      @click="clickOne(value)"
      v-for="(value, idx) in siteCollections"
      :key="idx"
    >
      <div class="preview-content">
        <h3>{{ value.tab || "我的收藏夹" }}</h3>

        <!-- 取前两条数据做缩略展示 -->
        <ul v-if="value.links && value.links.length > 0">
          <li v-for="(link, i) in value.links.slice(0, 2)" :key="i">
            {{ link.name }}
          </li>
        </ul>

        <!-- 没有数据时提示 -->
        <p v-else>暂无数据</p>
      </div>
    </div>

    <!-- 全屏显示 -->
    <BookmarkPage v-if="showFull" :contentArr="myLinks" />

    <!-- 遮罩关闭按钮 -->
    <button v-if="showFull" class="close-btn" @click="showFull = false">
      关闭
    </button>
  </div>
</template>

<script>
import BookmarkPage from "./subComponents/WebSourceCardWindow.vue";
import siteCollections from "../public/html&js/content/webContentArr.js";

export default {
  components: { BookmarkPage },
  data() {
    return {
      siteCollections,
      showFull: false,
      myLinks: []
    };
  },
  methods: {
    clickOne(item) {
      this.showFull = true;
      this.myLinks = item.links || []; 
    }
  }
};
</script>

<style scoped>




.preview {
  margin-left: 20px;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 200px;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;

  
  /* 毛玻璃核心 */
  background: rgba(255, 255, 255, 0.2); /* 半透明背景 */
  backdrop-filter: blur(10px);          /* 毛玻璃模糊 */
  -webkit-backdrop-filter: blur(10px);  /* 兼容 Safari */

  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.container {
  display: flex;
  flex-wrap: wrap;
}

/* 移动端响应式 - 竖向排列 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: center;
  }
  
  .preview {
    width: 90%;
    max-width: 300px;
    height: 80px;
    margin: 8px 0;
  }
  
  .preview-content {
    font-size: 14px;
  }
  
  .preview-content ul {
    font-size: 12px;
  }
}

/* 超小屏幕 */
@media (max-width: 480px) {
  .preview {
    width: 95%;
    height: 70px;
    margin: 6px 0;
  }
  
  .preview-content {
    font-size: 13px;
  }
  
  .preview-content ul {
    font-size: 11px;
  }
}

.preview:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.3); /* hover 时稍微亮一些 */
}

.preview-content {
  text-align: center;
  font-size: 14px;
  color: #555;
}

.preview-content ul {
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
  font-size: 12px;
  color: #333;
}

.preview-content li {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.close-btn {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 1000;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: #ef4444;
  color: #fff;
  cursor: pointer;
}
</style>
