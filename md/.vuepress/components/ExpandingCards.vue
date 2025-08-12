<template>
    <div class="container">
        <div v-for="(card, index) in visibleCards" :key="index" class="panel" :class="{ active: activeIndex === index }"
            :style="{ backgroundImage: `url('${card.image}')` }" @click="setActive(card.globalIndex)">
            <h3 class="card-title">{{ card.title }}</h3>
        </div>
    </div>
</template>

<script>
import drawImgCards from '../public/html&js/content/drawImgArr';
export default {
    name: "ExpandingCards",
    data() {
        return {
            activeIndex: 0,
            cards: drawImgCards,
            visibleCards: []
        };
    },
    mounted() {
        this.computeVisible();
    },
    methods: {
        setActive(index) { 
            // this.activeIndex = index;
            console.log(this.visibleCards)
            if (index < 3) {
                this.activeIndex = index
            } else {
                this.activeIndex = 2
            }



            this.computeVisible(index);
        },
        computeVisible(index) {
            if (!index) {
                index = 0
            }
            // 显示前后两张
            const start = Math.max(index - 2, 0);
            const end = Math.min(index + 2, this.cards.length - 1);
            this.visibleCards = this.cards
                .slice(start, end + 1)
                .map((card, i) => ({
                    ...card,
                    globalIndex: start + i,// 保留原始索引，方便setActive判断
                }));
            console.log("visibleCards is ", this.visibleCards);
        }
    },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Muli&display=swap');

* {
    box-sizing: border-box;
}

body {
    font-family: 'Muli', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    overflow: hidden;
    margin: 0;
}

.container {
    display: flex;
    width: 90vw;
}

.panel {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    height: 80vh;
    border-radius: 50px;
    color: #fff;
    cursor: pointer;
    flex: 0.5;
    margin: 10px;
    position: relative;
    -webkit-transition: all 700ms ease-in;
    transition: all 700ms ease-in;
}

.panel h3 {
    font-size: 24px;
    position: absolute;
    bottom: 20px;
    left: 20px;
    margin: 0;
    opacity: 0;
}

.panel.active {
    flex: 5;
}

.panel.active h3 {
    opacity: 1;
    transition: opacity 0.3s ease-in 0.4s;
}

@media (max-width: 480px) {
    .container {
        width: 100vw;
    }

    .panel:nth-of-type(4),
    .panel:nth-of-type(5) {
        display: none;
    }
}
.card-title {
  color: white; /* 初始值，必须有 */
  mix-blend-mode: difference; /* 核心：反色效果 */
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 24px;
}
</style>
