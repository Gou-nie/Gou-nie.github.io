<template>
  <div class="news-list">
    {{ Date() }}
    <div class="globe-wrap">
      <canvas class="globe-canvas" ref="globeCanvas"></canvas>
      <div class="globe-hit" ref="globeHit"></div>
    </div>
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
      newsList: [],
      globe: null,
      globeFrameId: 0,
      phi: 0,
      theta: 0,
      capitals: [],
      highlightedCountryCodes: [],
      isDraggingGlobe: false,
      lastPointerX: 0,
      lastPointerY: 0,
      phiVelocity: 0,
      thetaVelocity: 0,
      handlePointerDown: null,
      handlePointerMove: null,
      handlePointerUp: null,
      handleResize: null,
    }
  },
  mounted() {
    this.initGlobe()
    fetch('https://news.ravelloh.top/latest.json')
      .then(response => response.json())
      .then(data => {
        this.newsList = data.content;
        this.updateHighlightedFromNews()
        this.refreshMarkers()
      })
      .catch(error => {
        console.error('获取新闻失败:', error);
      });
  },
  beforeUnmount() {
    this.destroyGlobe()
  },
  methods: {
    async initGlobe() {
      if (this.globe) return
      if (typeof window === 'undefined') return

      const canvas = this.$refs.globeCanvas
      if (!canvas) return

      const OriginalImage = window.Image
      try {
        this.capitals = this.getCapitals()
        this.updateHighlightedFromNews()

        window.Image = function (...args) {
          const img = new OriginalImage(...args)
          let objectUrl = null
          const cleanup = () => {
            if (objectUrl) {
              URL.revokeObjectURL(objectUrl)
              objectUrl = null
            }
          }

          img.addEventListener('load', cleanup, { once: true })
          img.addEventListener('error', cleanup, { once: true })

          const descriptor = Object.getOwnPropertyDescriptor(OriginalImage.prototype, 'src')
          if (!descriptor || !descriptor.set || !descriptor.get) return img

          Object.defineProperty(img, 'src', {
            configurable: true,
            enumerable: true,
            get: () => descriptor.get.call(img),
            set: (value) => {
              if (typeof value === 'string' && value.startsWith('data:image/png;base64,')) {
                const base64 = value.slice('data:image/png;base64,'.length)
                const binary = atob(base64)
                const bytes = new Uint8Array(binary.length)
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
                const blob = new Blob([bytes], { type: 'image/png' })
                objectUrl = URL.createObjectURL(blob)
                descriptor.set.call(img, objectUrl)
                return
              }
              descriptor.set.call(img, value)
            },
          })

          return img
        }

        const { default: createGlobe } = await import('cobe')

        const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2)
        const width = 1000
        const height = 1000

        this.globe = createGlobe(canvas, {
          devicePixelRatio,
          width,
          height,
          phi: 0,
          theta: 0,
          dark: 0,
          diffuse: 2,
          scale: 1.2,
          mapSamples: 16000,
          mapBrightness: 18,
          mapBaseBrightness: 0.05,
          baseColor: [0.61, 0.78, 0.86],
          markerColor: [0.9, 0.5, 0],
          glowColor: [0.8, 0.9, 1],
          offset: [0, 0],
          markers: this.buildMarkers(),
        })

        this.bindGlobeControls(canvas)
        this.startGlobeLoop()
      } finally {
        window.Image = OriginalImage
      }
    },
    buildMarkers() {
      const highlighted = new Set(this.highlightedCountryCodes || [])
      return this.capitals.map((c) => {
        const isHot = highlighted.has(c.countryCode)
        return {
          id: c.id,
          location: c.location,
          size: isHot ? 0.03 : 0.01,
          color: isHot ? [1, 0.2, 0.2] : undefined,
        }
      })
    },
    refreshMarkers() {
      if (!this.globe) return
      this.globe.update({
        markers: this.buildMarkers(),
      })
    },
    updateHighlightedFromNews() {
      const countryCodes = this.extractCountryCodesFromNews(this.newsList)
      this.highlightedCountryCodes = Array.from(countryCodes)
    },
    extractCountryCodesFromNews(newsList) {
      const result = new Set()
      const list = Array.isArray(newsList) ? newsList : []

      const keywordMap = [
        { code: 'CN', keywords: ['中国', '中方', '北京'] },
        { code: 'US', keywords: ['美国', '美方', '华盛顿', 'washington', 'u.s.', 'us ', 'usa', 'united states'] },
        { code: 'GB', keywords: ['英国', '英方', '伦敦', 'uk ', 'u.k.', 'britain', 'united kingdom', 'london'] },
        { code: 'FR', keywords: ['法国', '法方', '巴黎', 'france', 'paris'] },
        { code: 'DE', keywords: ['德国', '德方', '柏林', 'germany', 'berlin'] },
        { code: 'IT', keywords: ['意大利', '罗马', 'italy', 'rome'] },
        { code: 'ES', keywords: ['西班牙', '马德里', 'spain', 'madrid'] },
        { code: 'PT', keywords: ['葡萄牙', '里斯本', 'portugal', 'lisbon'] },
        { code: 'NL', keywords: ['荷兰', '阿姆斯特丹', 'netherlands', 'amsterdam'] },
        { code: 'BE', keywords: ['比利时', '布鲁塞尔', 'belgium', 'brussels'] },
        { code: 'CH', keywords: ['瑞士', '伯尔尼', 'switzerland', 'bern'] },
        { code: 'AT', keywords: ['奥地利', '维也纳', 'austria', 'vienna'] },
        { code: 'PL', keywords: ['波兰', '华沙', 'poland', 'warsaw'] },
        { code: 'CZ', keywords: ['捷克', '布拉格', 'czech', 'prague'] },
        { code: 'SE', keywords: ['瑞典', '斯德哥尔摩', 'sweden', 'stockholm'] },
        { code: 'NO', keywords: ['挪威', '奥斯陆', 'norway', 'oslo'] },
        { code: 'FI', keywords: ['芬兰', '赫尔辛基', 'finland', 'helsinki'] },
        { code: 'RU', keywords: ['俄罗斯', '俄方', '莫斯科', 'russia', 'moscow'] },
        { code: 'TR', keywords: ['土耳其', '安卡拉', 'turkey', 'ankara'] },
        { code: 'GR', keywords: ['希腊', '雅典', 'greece', 'athens'] },
        { code: 'EG', keywords: ['埃及', '开罗', 'egypt', 'cairo'] },
        { code: 'SA', keywords: ['沙特', '沙特阿拉伯', '利雅得', 'saudi', 'riyadh'] },
        { code: 'AE', keywords: ['阿联酋', '阿布扎比', 'uae', 'u.a.e.', 'abudhabi', 'abu dhabi'] },
        { code: 'IR', keywords: ['伊朗', '德黑兰', 'iran', 'tehran'] },
        { code: 'IN', keywords: ['印度', '新德里', 'india', 'new delhi', 'delhi'] },
        { code: 'PK', keywords: ['巴基斯坦', '伊斯兰堡', 'pakistan', 'islamabad'] },
        { code: 'TH', keywords: ['泰国', '曼谷', 'thailand', 'bangkok'] },
        { code: 'VN', keywords: ['越南', '河内', 'vietnam', 'hanoi'] },
        { code: 'ID', keywords: ['印尼', '印度尼西亚', '雅加达', 'indonesia', 'jakarta'] },
        { code: 'SG', keywords: ['新加坡', 'singapore'] },
        { code: 'PH', keywords: ['菲律宾', '马尼拉', 'philippines', 'manila'] },
        { code: 'JP', keywords: ['日本', '东京', 'japan', 'tokyo'] },
        { code: 'KR', keywords: ['韩国', '首尔', 'korea', 'seoul'] },
        { code: 'AU', keywords: ['澳大利亚', '堪培拉', 'australia', 'canberra'] },
        { code: 'NZ', keywords: ['新西兰', '惠灵顿', 'new zealand', 'wellington'] },
        { code: 'CA', keywords: ['加拿大', '渥太华', 'canada', 'ottawa'] },
        { code: 'MX', keywords: ['墨西哥', '墨西哥城', 'mexico', 'mexico city'] },
        { code: 'BR', keywords: ['巴西', '巴西利亚', 'brazil', 'brasilia'] },
        { code: 'AR', keywords: ['阿根廷', '布宜诺斯艾利斯', 'argentina', 'buenos aires'] },
        { code: 'CL', keywords: ['智利', '圣地亚哥', 'chile', 'santiago'] },
        { code: 'CO', keywords: ['哥伦比亚', '波哥大', 'colombia', 'bogota'] },
        { code: 'PE', keywords: ['秘鲁', '利马', 'peru', 'lima'] },
        { code: 'ZA', keywords: ['南非', '比勒陀利亚', 'south africa', 'pretoria'] },
        { code: 'NG', keywords: ['尼日利亚', '阿布贾', 'nigeria', 'abuja'] },
        { code: 'KE', keywords: ['肯尼亚', '内罗毕', 'kenya', 'nairobi'] },
      ]

      const lower = (v) => String(v || '').toLowerCase()
      for (const item of list) {
        const text = lower(item)
        if (!text) continue
        for (const entry of keywordMap) {
          for (const kw of entry.keywords) {
            if (text.includes(lower(kw))) {
              result.add(entry.code)
              break
            }
          }
        }
      }

      return result
    },
    toFlagEmoji(countryCode) {
      if (!countryCode || countryCode.length !== 2) return ''
      const code = countryCode.toUpperCase()
      const A = 0x1f1e6
      const base = 'A'.charCodeAt(0)
      const first = A + (code.charCodeAt(0) - base)
      const second = A + (code.charCodeAt(1) - base)
      return String.fromCodePoint(first, second)
    },
    getCapitals() {
      const raw = [
        { countryCode: 'CN', capital: '北京', location: [39.9042, 116.4074] },
        { countryCode: 'US', capital: '华盛顿', location: [38.9072, -77.0369] },
        { countryCode: 'GB', capital: '伦敦', location: [51.5074, -0.1278] },
        { countryCode: 'FR', capital: '巴黎', location: [48.8566, 2.3522] },
        { countryCode: 'DE', capital: '柏林', location: [52.52, 13.405] },
        { countryCode: 'IT', capital: '罗马', location: [41.9028, 12.4964] },
        { countryCode: 'ES', capital: '马德里', location: [40.4168, -3.7038] },
        { countryCode: 'PT', capital: '里斯本', location: [38.7223, -9.1393] },
        { countryCode: 'NL', capital: '阿姆斯特丹', location: [52.3676, 4.9041] },
        { countryCode: 'BE', capital: '布鲁塞尔', location: [50.8503, 4.3517] },
        { countryCode: 'CH', capital: '伯尔尼', location: [46.948, 7.4474] },
        { countryCode: 'AT', capital: '维也纳', location: [48.2082, 16.3738] },
        { countryCode: 'PL', capital: '华沙', location: [52.2297, 21.0122] },
        { countryCode: 'CZ', capital: '布拉格', location: [50.0755, 14.4378] },
        { countryCode: 'SE', capital: '斯德哥尔摩', location: [59.3293, 18.0686] },
        { countryCode: 'NO', capital: '奥斯陆', location: [59.9139, 10.7522] },
        { countryCode: 'FI', capital: '赫尔辛基', location: [60.1699, 24.9384] },
        { countryCode: 'RU', capital: '莫斯科', location: [55.7558, 37.6173] },
        { countryCode: 'TR', capital: '安卡拉', location: [39.9334, 32.8597] },
        { countryCode: 'GR', capital: '雅典', location: [37.9838, 23.7275] },
        { countryCode: 'EG', capital: '开罗', location: [30.0444, 31.2357] },
        { countryCode: 'SA', capital: '利雅得', location: [24.7136, 46.6753] },
        { countryCode: 'AE', capital: '阿布扎比', location: [24.4539, 54.3773] },
        { countryCode: 'IR', capital: '德黑兰', location: [35.6892, 51.389] },
        { countryCode: 'IN', capital: '新德里', location: [28.6139, 77.209] },
        { countryCode: 'PK', capital: '伊斯兰堡', location: [33.6844, 73.0479] },
        { countryCode: 'TH', capital: '曼谷', location: [13.7563, 100.5018] },
        { countryCode: 'VN', capital: '河内', location: [21.0278, 105.8342] },
        { countryCode: 'ID', capital: '雅加达', location: [-6.2088, 106.8456] },
        { countryCode: 'SG', capital: '新加坡', location: [1.3521, 103.8198] },
        { countryCode: 'PH', capital: '马尼拉', location: [14.5995, 120.9842] },
        { countryCode: 'JP', capital: '东京', location: [35.6762, 139.6503] },
        { countryCode: 'KR', capital: '首尔', location: [37.5665, 126.978] },
        { countryCode: 'AU', capital: '堪培拉', location: [-35.2809, 149.13] },
        { countryCode: 'NZ', capital: '惠灵顿', location: [-41.2866, 174.7756] },
        { countryCode: 'CA', capital: '渥太华', location: [45.4215, -75.6972] },
        { countryCode: 'MX', capital: '墨西哥城', location: [19.4326, -99.1332] },
        { countryCode: 'BR', capital: '巴西利亚', location: [-15.7939, -47.8828] },
        { countryCode: 'AR', capital: '布宜诺斯艾利斯', location: [-34.6037, -58.3816] },
        { countryCode: 'CL', capital: '圣地亚哥', location: [-33.4489, -70.6693] },
        { countryCode: 'CO', capital: '波哥大', location: [4.711, -74.0721] },
        { countryCode: 'PE', capital: '利马', location: [-12.0464, -77.0428] },
        { countryCode: 'ZA', capital: '比勒陀利亚', location: [-25.7479, 28.2293] },
        { countryCode: 'NG', capital: '阿布贾', location: [9.0765, 7.3986] },
        { countryCode: 'KE', capital: '内罗毕', location: [-1.2921, 36.8219] },
      ]

      return raw.map((c) => {
        const id = `cap-${c.countryCode.toLowerCase()}`
        return {
          id,
          countryCode: c.countryCode,
          capital: c.capital,
          location: c.location,
        }
      })
    },
    startGlobeLoop() {
      if (typeof window === 'undefined') return
      if (!this.globe) return

      if (this.globeFrameId) {
        cancelAnimationFrame(this.globeFrameId)
        this.globeFrameId = 0
      }

      const tick = () => {
        if (!this.globe) return

        if (!this.isDraggingGlobe) {
          this.phi += this.phiVelocity
          this.theta += this.thetaVelocity

          this.phiVelocity *= 0.92
          this.thetaVelocity *= 0.9

          if (Math.abs(this.phiVelocity) < 0.00001) this.phiVelocity = 0
          if (Math.abs(this.thetaVelocity) < 0.00001) this.thetaVelocity = 0

          if (this.phiVelocity === 0) this.phi += 0.003
          const maxTheta = 1.2
          if (this.theta > maxTheta) this.theta = maxTheta
          if (this.theta < -maxTheta) this.theta = -maxTheta
        }

        this.globe.update({
          phi: this.phi,
          theta: this.theta,
        })

        this.globeFrameId = requestAnimationFrame(tick)
      }

      this.globeFrameId = requestAnimationFrame(tick)
    },
    bindGlobeControls(canvas) {
      if (this.handlePointerDown) return

      const hit = this.$refs.globeHit || canvas
      hit.style.cursor = 'grab'
      hit.style.touchAction = 'none'

      this.handlePointerDown = (e) => {
        if (e.cancelable) e.preventDefault()
        this.isDraggingGlobe = true
        hit.style.cursor = 'grabbing'
        this.lastPointerX = e.clientX
        this.lastPointerY = e.clientY
        this.phiVelocity = 0
        this.thetaVelocity = 0
        if (hit.setPointerCapture) hit.setPointerCapture(e.pointerId)
      }

      this.handlePointerMove = (e) => {
        if (!this.isDraggingGlobe) return
        if (e.cancelable) e.preventDefault()

        const dx = e.clientX - this.lastPointerX
        const dy = e.clientY - this.lastPointerY
        this.lastPointerX = e.clientX
        this.lastPointerY = e.clientY

        const speed = 0.005
        this.phi += dx * speed
        this.theta += dy * speed

        const maxTheta = 1.2
        if (this.theta > maxTheta) this.theta = maxTheta
        if (this.theta < -maxTheta) this.theta = -maxTheta

        this.phiVelocity = dx * speed * 0.2
        this.thetaVelocity = dy * speed * 0.2
      }

      this.handlePointerUp = (e) => {
        if (!this.isDraggingGlobe) return
        if (e.cancelable) e.preventDefault()
        this.isDraggingGlobe = false
        hit.style.cursor = 'grab'
        if (hit.releasePointerCapture) hit.releasePointerCapture(e.pointerId)
      }

      hit.addEventListener('pointerdown', this.handlePointerDown, { passive: false })
      hit.addEventListener('pointermove', this.handlePointerMove, { passive: false })
      hit.addEventListener('pointerup', this.handlePointerUp, { passive: false })
      hit.addEventListener('pointercancel', this.handlePointerUp, { passive: false })
      window.addEventListener('pointerup', this.handlePointerUp, { passive: false })
    },
    unbindGlobeControls(canvas) {
      if (!this.handlePointerDown || !canvas) return

      const hit = this.$refs.globeHit || canvas
      hit.removeEventListener('pointerdown', this.handlePointerDown)
      hit.removeEventListener('pointermove', this.handlePointerMove)
      hit.removeEventListener('pointerup', this.handlePointerUp)
      hit.removeEventListener('pointercancel', this.handlePointerUp)
      window.removeEventListener('pointerup', this.handlePointerUp)

      this.handlePointerDown = null
      this.handlePointerMove = null
      this.handlePointerUp = null
      this.isDraggingGlobe = false
    },
    destroyGlobe() {
      if (typeof window !== 'undefined' && this.globeFrameId) {
        cancelAnimationFrame(this.globeFrameId)
        this.globeFrameId = 0
      }

      if (this.globe) {
        this.globe.destroy()
        this.globe = null
      }

      this.unbindGlobeControls(this.$refs.globeCanvas)

      if (typeof window !== 'undefined' && this.handleResize) {
        window.removeEventListener('resize', this.handleResize)
        this.handleResize = null
      }
    },
  },
}
</script>

<style scoped>
.news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}
.globe-wrap {
  position: relative;
  width: min(520px, 80vw);
  height: min(520px, 80vw);
  margin: 0 auto;
}
.globe-canvas {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.globe-hit {
  position: absolute;
  inset: 0;
}
.news-item {
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 16px;
}
</style>
