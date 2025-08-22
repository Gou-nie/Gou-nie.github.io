<template>
    <div class="container">
        <div v-for="(card, index) in visibleCards" :key="index" class="panel" :class="{ active: activeIndex === index }"
            :style="{ backgroundImage: `url('${card.image}')` }" @click="setActive(card.globalIndex)"
            @dblclick="drawHeart(card.globalIndex, $event)">
            <h3 v-if="!isMobile" class="card-title">{{ card.title }}</h3>
        </div>

        <img v-for="p in pops" :key="p.id" src="../public/images/icon/heart.png" class="fade-image"
            :style="{ left: p.x + 'px', top: p.y + 'px', animationDuration: duration + 'ms' }"
            @animationend="remove(p.id)" draggable="false" />
    </div>
</template>

<script>
import drawImgCards from '../public/html&js/content/drawImgArr';
export default {
    name: "ExpandingCards",
    props: {
        imageSrc: { type: String, required: true },
        duration: { type: Number, default: 500 }
    },
    data() {
        return {
            activeIndex: 0,
            centerIndex: 0,
            cards: drawImgCards,
            visibleCards: [],
            show: false,
            pops: [],
            isMobile: false
        };
    },
    mounted() {
        this.checkMobile();
        window.addEventListener('resize', this.checkMobile);
        this.computeVisible();
    }, 
    beforeDestroy() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.checkMobile)
        }
    },
    methods: {
        setActive(index) {
            // this.activeIndex = index;
            if (index < 3) {
                this.activeIndex = index
            } else {
                this.activeIndex = 2
            }
            this.centerIndex = index;
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
        },
        drawHeart(index, e) {
            this.pops = []
            if (this.centerIndex == index) {
                console.log("红心");


                const rect = e.currentTarget.getBoundingClientRect()

                // 使用 pageX/pageY + 滚动偏移，确保坐标准确
                const pageX = e.pageX || (e.touches && e.touches[0].pageX)
                const pageY = e.pageY || (e.touches && e.touches[0].pageY)

                const x = pageX - rect.left - window.pageXOffset
                const y = pageY - rect.top - window.pageYOffset

                const id = ++this.uid
                this.pops.push({ id, x, y })

                setTimeout(() => {
                    this.remove(id)
                }, this.duration + 50)

            }

        },
        remove(id) {
            const i = this.pops.findIndex(p => p.id === id)
            if (i !== -1) this.pops.splice(i, 1)
        },
        checkMobile() {
            this.isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false
            // console.log("this.isMobile is ",this.isMobile)
        }
        // handleClick() {
        //     console.log("######")
        // }
    },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Muli&display=swap');
@import url('https://fonts.googleapis.com/css?family=Oswald');

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
    width: 60vw;
    position: relative;
    /* 新增，让 fade-image 定位到容器里 */
    overflow-x: hidden;
    /* 新增，防止横向溢出 */
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

@media (max-width: 768px) {
  :deep(.container) {
    flex-direction: column; /* 从横向变竖向 */
    height: auto;
  }

  :deep(.panel) {
    width: 100%;
    height: 40vh;
  }
}


.card-title {
    color: white;
    /* 初始值，必须有 */
    mix-blend-mode: difference;
    /* 核心：反色效果 */
    position: absolute;
    bottom: 10px;
    left: 10px;
    font-size: 24px;
}


/* 图片的通用样式 */
.fade-image {
    position: absolute;
    transform: translate(-50%, -50%) scale(1);
    pointer-events: none;
    width: 40px;
    height: auto;
    opacity: 0;
    animation-name: fadeInOut;
    animation-timing-function: ease;
    animation-fill-mode: forwards;
}

@keyframes fadeInOut {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8) translateY(0);
    }

    15% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1) translateY(0);
    }

    85% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1) translateY(-20px);
    }

    100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1.1) translateY(-50px);
    }
}
</style>