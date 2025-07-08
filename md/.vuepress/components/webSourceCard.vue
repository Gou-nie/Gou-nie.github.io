<template>
  <div class="sourceS">
    
    <Card v-for="i in frontS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now" @click="clickSource(i.url)" />
    <Card v-for="i in backS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now" @click="clickSource(i.url)" />
    <Card v-for="i in txtS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now" @click="clickSource(i.url)" />
  </div>
</template>

<script>
import Card from './subComponents/Card.vue';
import siteCollections from '../public/html&js/content/webContentArr.js';
export default {
  components: {
    Card,

  },
  data() {
    return {
      frontS: siteCollections[0].links,
      backS: siteCollections[1].links,
      txtS: siteCollections[2].links,
      webS: siteCollections[3].links,
      toolS: siteCollections[4].links,
      toyS: siteCollections[5].links
    }
  },

  mounted() {
    console.log("frontS", this.frontS)
    console.log("backS", this.backS)
    console.log("txtS", this.txtS)
    
  },

  methods: {
    clickSource(url){
      console.log("url is :",url);
      window.open(url,"_blank")
    }
  }



};
</script>


<style>
.sourceS {
  position: fixed;
  /* 修正 display: fixed 为 position: fixed */
  left: 0;
  top:0;
  width: 100vw;
  height: 100vh;
  display: flex;
  /* 横向排列子元素 */
  flex-wrap: wrap;
  /* 超出自动换行 */
  align-items: flex-start;
  gap: 16px;
  /* 卡片间距，可根据需要调整 */
  padding: 16px;
  /* 可选：给容器加点内边距 */
  box-sizing: border-box;
  overflow: auto;
  z-index: 100;
  /* 新增：内容溢出时可滚动 */
}
</style>