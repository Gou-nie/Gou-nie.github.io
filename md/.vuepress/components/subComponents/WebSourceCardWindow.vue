<template>
  <div class="app">
    <!-- 顶部栏 -->
    <header class="topbar">
      <div class="brand">
        <span class="logo" aria-hidden="true">🔖</span>
        <h1 class="title">我的收藏夹</h1>
      </div>
    </header>

    <div class="layout">
      <!-- 主内容区域 -->
      <main class="content" role="main">
        <section class="section">
          <header class="section-header">
            <h3 class="section-title">常用</h3>
          </header>

          <div class="bookmark-grid">
            <article
              class="bookmark-card"
              v-for="(i, idx) in contentArr"
              :key="idx"
              @click="clickSource(i.url)"
            >
              <a class="card-link" :href="i.url" target="_blank">
                <div class="card-meta">
                  <img
                    class="favicon"
                    :src="`https://www.google.com/s2/favicons?domain=${getDomain(i.url)}`"
                    alt="favicon"
                  />
                  <h4 class="card-title">{{ i.name }}</h4>
                </div>
                <p class="card-desc">{{ i.content }}</p>
                <div class="card-tags">
                  <span class="tag">工具</span>
                  <span class="tag">常用</span>
                </div>
              </a>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "BookmarkPage",
  props: {
    contentArr: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  methods: {
    clickSource(url) {
      console.log("url is:", url);
      window.open(url, "_blank");
    },
    getDomain(url) {
      try {
        return new URL(url).hostname;
      } catch {
        return "example.com";
      }
    }
  }
};
</script>

<style scoped>
:root {
    --bg: #f5f6fa;
    --panel: rgba(255, 255, 255, 0.85);
    --panel-2: rgba(250, 250, 255, 0.85);
    --text: #1f2937;
    --muted: #6b7280;
    --brand: #3b82f6;
    --border: rgba(0, 0, 0, 0.1);
    --accent: #22c55e;
}

* {
    box-sizing: border-box;
}

html,
body,
.app {
    height: 100%;
}

body {
    margin: 0;
}

.app {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    z-index: 999;
    min-height: 100vh;
    background: linear-gradient(180deg, #f0f4f8, #f5f6fa 60%);
    color: var(--text);
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji;
}

/* 顶部栏 */
.topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo {
    font-size: 18px;
}

.title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: .2px;
}


/* 布局 */
.layout {
    display: grid; 
    gap: 0;
    min-height: calc(100vh - 56px);
}



.btn {
    appearance: none;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.7);
    color: var(--text);
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
}

.btn:hover {
    border-color: #d1d5db;
    background: rgba(255, 255, 255, 0.9);
}



/* 主内容 */
.content {
    padding: 24px;
}


.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
}

.page-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
}

.page-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.section {
    margin-bottom: 24px;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.section-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--muted);
}

.bookmark-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
}

.bookmark-card {
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    overflow: hidden;
    transition: transform .12s ease, border-color .12s ease, box-shadow .12s ease;
}

.bookmark-card:hover {
    transform: translateY(-2px);
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 6px 18px rgba(0, 0, 0, .1);
}

.card-link {
    display: block;
    padding: 14px;
    color: inherit;
    text-decoration: none;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.favicon {
    width: 18px;
    height: 18px;
    border-radius: 4px;
}

.card-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
}

.card-desc {
    margin: 6px 0 10px;
    font-size: 12px;
    color: var(--muted);
    display: -webkit-box;
    /* -webkit-line-clamp: 2; */
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.tag {
    padding: 4px 6px;
    font-size: 11px;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    color: #374151;
    background: rgba(243, 244, 246, 0.7);
}

.bookmark-card.is-empty {
    display: grid;
    place-items: center;
    min-height: 120px;
    color: var(--muted);
    background: rgba(255, 255, 255, 0.6);
}

/* 浮动按钮 */
.fab {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 20;
    width: 44px;
    height: 44px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: var(--brand);
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 20px;
    box-shadow: 0 10px 24px rgba(59, 130, 246, .3);
}

.fab:hover {
    transform: translateY(-1px);
}

/* 响应式 */
@media (max-width: 960px) {
    .layout {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .bookmark-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
}

@media (max-width: 480px) {
    .bookmark-grid {
        grid-template-columns: 1fr;
    }
    
    .content {
        padding: 16px;
    }
}
</style>
