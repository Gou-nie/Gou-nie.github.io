<template>
  <div class="sourceS">
    <hr class="full-line" />
    前端相关：
    <hr class="full-line" />
    <Ccard   v-for="i in frontS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now"
      @click="clickSource(i.url)" />
    <hr class="full-line" />
    后端相关：
    <hr class="full-line" />
    <Ccard v-for="i in backS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now"
      @click="clickSource(i.url)" />
    <hr class="full-line" />
    帖子：
    <hr class="full-line" />
    <Ccard v-for="i in txtS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now"
      @click="clickSource(i.url)" />
    <hr class="full-line" />
    站点：
    <hr class="full-line" />
    <Ccard v-for="i in webS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now"
      @click="clickSource(i.url)" />
    <hr class="full-line" />
    工具：
    <hr class="full-line" />
    <Ccard v-for="i in toolS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now"
      @click="clickSource(i.url)" />
    <hr class="full-line" />
    玩具：
    <hr class="full-line" />
    <Ccard v-for="i in toyS" :headerTitle='i.name' :bodyContent="i.content" footerText="Updated just now"
      @click="clickSource(i.url)" />
    <hr class="full-line" /> 
  </div>
</template>

<script>
import Ccard from './subComponents/Ccard.vue';
import siteCollections from '../public/html&js/content/webContentArr.js';
export default {
  components: {
    Ccard,

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
    clickSource(url) {
      console.log("url is :", url);
      window.open(url, "_blank")
    }
  }



};
</script>


<style>
.sourceS {
  position: fixed;
  left: 0;
  width: 100vw;
  height: calc(100vh - 200px);
  /* 如果有header可减去header高度 */
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 16px;
  padding: 12px;
  box-sizing: border-box;
  overflow: auto;
  z-index: 100;
  background-color: rgb(254, 239, 194);
}

.full-line {
  flex-basis: 100%;
  height: 1px;
  border: none;
  border-top: 4px solid #346400;
  /* tailwind 的 border-blue-500 */
  margin: 8px 0;
}
</style>