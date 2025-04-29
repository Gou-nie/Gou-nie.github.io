<template>
  <div>
<img v-if="isMobile" src="https://aleah.oss-cn-heyuan.aliyuncs.com/images/photo/%E6%B1%9F%E5%8D%97%E6%94%B9.jpg" alt="首页图" width="1200" height="auto" />
</div>
</template>


<script>
export default {
  data() {
    return {
      isMobile: false
    }
  },
  created() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
       if (typeof window !== 'undefined') {
        this.isMobile = window.innerWidth < 768
      }
      
    }
  }
}
</script>