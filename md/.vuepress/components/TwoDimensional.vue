<template>
    <div>
        <div class="twoParent" v-if="positions.length === canvases.length">
            <div v-for="(i, idx) in canvases" :key="i.name" class="canvas-wrapper"
                :style="{ top: positions[idx].top + 'px', left: positions[idx].left + 'px' }"
                :class="{ highlight: highlightIndex === idx }" @mouseenter="highlightIndex = idx"
                @mouseleave="highlightIndex = null" @click="clickTape(i)">
                <canvas :id="i.name" width="64" height="54"></canvas>
            </div>
            <canvas id="playButton" @click="togglePlay"></canvas>
        </div>
    </div>
</template>


<script>
import rough from 'roughjs';
import tapeArr from "../public/html&js/content/tapeContentArr";
export default {
    name: 'TwoDimensional',
    data() {
        return {
            canvases: tapeArr,
            fillStyles: ['solid', 'hachure', 'zigzag', 'cross-hatch', 'dots', 'zigzag-line', 'zigzag-line-2'],
            positions: [],//随机坐标存储
            highlightIndex: null, // 用于高亮显示
            cachePosition: {
                index: -1,
                top: 0,
                left: 0
            },
            isPlay: false,
            musicUrl: ""
        }
    },
    created() {
        // 创建音频对象

    },
    mounted() {
        // 生成随机位置
        const maxWidth = 800, maxHeight = 500, canvasW = 80, canvasH = 60;
        this.positions = this.canvases.map(() => ({
            top: Math.floor(Math.random() * (maxHeight - canvasH)),
            left: Math.floor(Math.random() * (maxWidth - canvasW))
        }));
        // 等 DOM 更新完再绘制 canvas
        this.$nextTick(() => {
            this.canvases.forEach(canvas => {
                this.drawTapes(canvas);
            });
            this.drawPlayButton();
        });
    },
    methods: {
        drawTapes(canvas) {
            const rc = rough.canvas(document.getElementById(canvas.name));
            rc.path("M5,50 C5.552,50 6,49.552 6,49 C6,48.448 5.552,48 5,48 C4.448,48 4,48.448 4,49 C4,49.552 4.448,50 5,50 L5,50 Z M5,14 C4.448,14 4,14.448 4,15 C4,15.552 4.448,16 5,16 C5.552,16 6,15.552 6,15 C6,14.448 5.552,14 5,14 L5,14 Z M59,50 C59.552,50 60,49.552 60,49 C60,48.448 59.552,48 59,48 C58.448,48 58,48.448 58,49 C58,49.552 58.448,50 59,50 L59,50 Z M59,14 C58.448,14 58,14.448 58,15 C58,15.552 58.448,16 59,16 C59.552,16 60,15.552 60,15 C60,14.448 59.552,14 59,14 L59,14 Z M46,32 C44.346,32 43,30.654 43,29 C43,27.346 44.346,26 46,26 C47.654,26 49,27.346 49,29 C49,30.654 47.654,32 46,32 L46,32 Z M20.62,32 C21.459,31.267 22,30.202 22,29 C22,27.798 21.459,26.733 20.62,26 L43.38,26 C42.541,26.733 42,27.798 42,29 C42,30.202 42.541,31.267 43.38,32 L20.62,32 Z M18,32 C16.346,32 15,30.654 15,29 C15,27.346 16.346,26 18,26 C19.654,26 21,27.346 21,29 C21,30.654 19.654,32 18,32 L18,32 Z M46,24 L18,24 C15.25,24 13,26.25 13,29 C13,31.75 15.25,34 18,34 L46,34 C48.75,34 51,31.75 51,29 C51,26.25 48.75,24 46,24 L46,24 Z M62,40 L2,40 L2,15 C2,13.346 3.346,12 5,12 L59,12 C60.654,12 62,13.346 62,15 L62,40 Z M62,49 C62,50.654 60.654,52 59,52 L53.7,52 L51,43 L13,43 L10.3,52 L5,52 C3.346,52 2,50.654 2,49 L2,41 L62,41 L62,49 Z M11.344,52 L13.744,44 L50.256,44 L52.656,52 L11.344,52 Z M59,10 L5,10 C2.25,10 0,12.25 0,15 L0,40 L0,41 L0,49 C0,51.75 2.25,54 5,54 L59,54 C61.75,54 64,51.75 64,49 L64,15 C64,12.25 61.75,10 59,10 L59,10 Z", {
                fill: 'rgba(122,122,200,0.8)',
                fillStyle: 'solid',
                stroke: 'black',
                strokeWidth: 2,
                roughness: 1.5
            });
        },
        clickTape(canvas) {

            this.isPlay = false; // 点击时重置播放状态

            const idx = this.canvases.indexOf(canvas);
            if (idx !== -1 && this.cachePosition.index !== idx) {
                // 恢复之前的canvas位置
                if (this.cachePosition.index !== -1) {
                    this.positions[this.cachePosition.index] = { top: this.cachePosition.top, left: this.cachePosition.left };
                }
            }

            if (idx !== -1) {
                const parent = this.$el.querySelector('.twoParent');
                const rect = parent.getBoundingClientRect();
                const parentW = rect.width;
                const parentH = rect.height;
                const canvasW = 64, canvasH = 54;
                const centerTop = Math.floor((parentH - canvasH) / 2);
                const centerLeft = Math.floor((parentW - canvasW) / 2);
                this.cachePosition = this.positions[idx];
                this.cachePosition.index = idx;
                this.positions[idx] = { top: centerTop, left: centerLeft };
            }
            
            this.musicUrl = canvas.url || '';


        },
        drawPlayButton() {
            const canvas = document.getElementById('playButton');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布

            const rc = rough.canvas(canvas);
            const w = canvas.width;
            const h = canvas.height;
            if (!this.isPlay) {
                // 三角形宽40高40，居中
                const triWidth = 110, triHeight = 110;
                const offsetX = (w - triWidth) / 2;
                const offsetY = (h - triHeight) / 2;
                // 三角形顶点坐标
                const path = `M ${offsetX} ${offsetY} L ${offsetX} ${offsetY + triHeight} L ${offsetX + triWidth} ${offsetY + triHeight / 2} Z`;
                rc.path(path, {
                    fill: 'blue',
                    fillStyle: 'cross-hatch',
                    stroke: 'black',
                    strokeWidth: 2,
                    roughness: 1.5
                });
            } else {
                // 两个矩形宽10高30，间隔10，居中
                const rectW = 60, rectH = 100, gap = 30;
                const totalWidth = rectW * 2 + gap;
                const offsetX = (w - totalWidth) / 2;
                const offsetY = (h - rectH) / 2;
                rc.rectangle(offsetX, offsetY, rectW, rectH, {
                    fill: 'red',
                    hachureAngle: 6,
                    hachureGap: 8
                });
                rc.rectangle(offsetX + rectW + gap, offsetY, rectW, rectH, {
                    fill: 'red',
                    hachureAngle: 6,
                    hachureGap: 8
                });
            }

        },
        togglePlay() {
            this.isPlay = !this.isPlay;
            if (this.isPlay) {
                this.audio = new Audio(this.musicUrl);
                this.audio.play();
            } else {
                this.audio.pause();
            }
            this.drawPlayButton(); // 切换按钮图标
        }
    },
    watch: {
        isPlay(newVal) {
            if (this.audio) {
                this.audio.pause();
                this.audio = null;
            }
            if (newVal && this.musicUrl) {
                this.audio = new Audio(this.musicUrl);
                this.audio.play();
            }
            this.drawPlayButton();
        }
    }
}
</script>



<style>
.twoParent {
    background-color: antiquewhite;
    position: relative;
    width: 100vw;
    height: 100vh;
}

.canvas-wrapper {
    position: absolute;
}

.highlight {
    box-shadow: 0 0 10px 3px #eecd98;
    z-index: 10;
    /* border: 2px solid #eecd98; */
    transition: box-shadow 0.2s, border 0.2s;
}

#playButton {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 500px;
    /* 距离底部40px，可根据需要调整 */
    width: 50px;
    /* 建议设置宽高与canvas一致 */
    height: 50px;
    z-index: 20;
    display: block;
}
</style>
