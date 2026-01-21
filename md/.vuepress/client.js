// docs/.vuepress/client.js
import { defineClientConfig } from '@vuepress/client'
import { useRouter } from 'vue-router'

export default defineClientConfig({
  setup() {
    const router = useRouter()

    // 首次进入页面（必须手动补一次）
    track({
      page: window.location.pathname,
      event: 'page_view'
    })

    // SPA 页面切换
    router.afterEach((to) => {
      track({
        page: to.fullPath,
        event: 'page_view'
      })
    })
  }
})

function track(data) {
  var url 
  if (import.meta.env.DEV) {
    url = 'http://localhost:5011/kcart'
  }else{
    url = 'https://pywebtest.aleahquagef.top/kcart'
  }
  navigator.sendBeacon(
    url,
    JSON.stringify(data)
  )
}
