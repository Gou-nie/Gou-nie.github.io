<template>
  <div class="sourceS">
    
    <Card v-for="i in frontS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now" @click="clickSource(i.url)" />
    <Card v-for="i in backS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now" @click="clickSource(i.url)" />
    <Card v-for="i in txtS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now" @click="clickSource(i.url)" />
  </div>
</template>

<script>
import Card from './subComponents/ccard.vue';
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
  left: 0;
  width: 100vw;
  height: calc(100vh - 200px); /* 如果有header可减去header高度 */
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 16px;
  padding: 12px;
  box-sizing: border-box;
  overflow: auto;
  z-index: 100;
}
</style>