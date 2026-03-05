<template>
  <div class="container">
    <!-- 缩略图 -->
    <div class="preview" :class="'preview-color-' + (idx % 6)" @click="clickOne(value)" v-for="(value, idx) in siteCollections" :key="idx">
      <div class="preview-content">
        <div class="preview-header">
          <span class="preview-icon">📁</span>
          <h3>{{ value.tab || "我的收藏夹" }}</h3>
        </div>

        <!-- 取前两条数据做缩略展示 -->
        <ul v-if="value.links && value.links.length > 0" class="preview-links">
          <li v-for="(link, i) in value.links.slice(0, 2)" :key="i">
            <span class="link-dot"></span>
            {{ link.name }}
          </li>
        </ul>

        <!-- 没有数据时提示 -->
        <p v-else class="empty-tip">暂无数据</p>

        <div class="preview-footer">
          <span class="link-count">{{ value.links?.length || 0 }} 个链接</span>
        </div>
      </div>
    </div>

    <!-- 全屏显示 -->
    <BookmarkPage v-if="showFull" :contentArr="myLinks" />

    <!-- 遮罩关闭按钮 -->
    <button v-if="showFull" class="close-btn" @click="showFull = false">
      <span class="close-icon">×</span>
      <span class="close-text">关闭</span>
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
      this.myLinks = (item.links || []).filter(link => link.url !== "");
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 24px;
  align-content: flex-start;
}

.preview {
  width: 220px;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;

  /* 白色卡片 */
  background: #ffffff;

  /* 柔和阴影 */
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.05);

  border: 1px solid #e5e7eb;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.preview:hover {
  transform: translateY(-4px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

/* 内容区域 */
.preview-content {
  text-align: center;
  width: 100%;
  padding: 16px;
  position: relative;
  z-index: 1;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
}

.preview-icon {
  font-size: 18px;
}

.preview-content h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  letter-spacing: 0.3px;
}

.preview-links {
  margin: 8px 0;
  padding: 0;
  list-style: none;
  text-align: left;
}

.preview-links li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.link-dot {
  width: 4px;
  height: 4px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 50%;
  flex-shrink: 0;
}

.empty-tip {
  font-size: 12px;
  color: #9ca3af;
  margin: 8px 0;
  font-style: italic;
}

.preview-footer {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.link-count {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
}

/* 关闭按钮 */
.close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow:
    0 4px 16px rgba(239, 68, 68, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.close-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(239, 68, 68, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.15);
}

.close-icon {
  font-size: 20px;
  line-height: 1;
  font-weight: 300;
}

/* 移动端响应式 - 竖向排列 */
@media (max-width: 768px) {
  .container {
    gap: 16px;
    padding: 16px;
  }

  .preview {
    width: 100%;
    max-width: 320px;
    height: 120px;
  }

  .preview-content h3 {
    font-size: 14px;
  }

  .preview-links li {
    font-size: 11px;
  }

  .close-btn {
    top: 12px;
    right: 12px;
    padding: 8px 16px;
    font-size: 13px;
  }
}

/* 超小屏幕 */
@media (max-width: 480px) {
  .container {
    gap: 12px;
    padding: 12px;
  }

  .preview {
    width: 100%;
    height: 100px;
  }

  .preview-content {
    padding: 12px;
  }

  .preview-content h3 {
    font-size: 13px;
  }

  .preview-links li {
    font-size: 10px;
  }

  .link-count {
    font-size: 10px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview {
  animation: fadeIn 0.5s ease backwards;
}

.preview:nth-child(1) { animation-delay: 0.1s; }
.preview:nth-child(2) { animation-delay: 0.2s; }
.preview:nth-child(3) { animation-delay: 0.3s; }
.preview:nth-child(4) { animation-delay: 0.4s; }
.preview:nth-child(5) { animation-delay: 0.5s; }
.preview:nth-child(6) { animation-delay: 0.6s; }

/* 卡片颜色主题 - 淡色系 */
.preview-color-0 {
  border-left: 4px solid #93c5fd;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.preview-color-1 {
  border-left: 4px solid #c4b5fd;
  background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%);
}

.preview-color-2 {
  border-left: 4px solid #fca5a5;
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
}

.preview-color-3 {
  border-left: 4px solid #86efac;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.preview-color-4 {
  border-left: 4px solid #fcd34d;
  background: linear-gradient(135deg, #fefce8 0%, #ffffff 100%);
}

.preview-color-5 {
  border-left: 4px solid #a5f3fc;
  background: linear-gradient(135deg, #ecfeff 0%, #ffffff 100%);
}
</style>
