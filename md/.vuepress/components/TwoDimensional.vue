<template>
    <div>{{ count }}
        <div class="twoParent" v-if="positions.length === canvases.length">
            <div v-for="(i, idx) in canvases" :key="i.name" class="canvas-wrapper"
                :style="{   top: positions[idx].top + 'px', left: positions[idx].left + 'px', 
                            boxShadow: positions[idx].highlight & canvases[idx].type == 'tape' ? '0 0 10px 3px #eecd98' : '',
                            zIndex: canvases[idx].type == 'tape' ? 101 : 100 }"
                @mouseenter="highlightIndex = idx" @mouseleave="highlightIndex = null"
                @click="i.type == 'tape'?clickTape(i):null">
                <canvas :id="i.name" width="64" height="54"></canvas>
            </div>
            <canvas class="tapePlayer" id="tapePlayer"></canvas>
            <canvas class="playButton" id="playButton" @click="togglePlay"></canvas>
            <canvas class="vortex" id="vortex" @click="portal"></canvas>
        </div>
    </div>
</template>


<script>
import rough from 'roughjs';
import tapeArr from "../public/html&js/content/tapeContentArr";
import { ref, onMounted, onUnmounted } from 'vue';

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
            musicUrl: "",
            paths: [
                "M194.4132304 88.8896729H18.8166116V40.6438809h175.5966188v48.245792z m-172.585961-1.5053289h169.5753032V42.1492098H21.8272694v45.2351322z",
                "M47.8694598 81.7393605c-12.5694966 0-22.8057332-10.2362366-22.8057332-22.8057332 0-12.5694966 10.2362366-22.8057332 22.8057332-22.8057332s22.8057332 10.2362366 22.8057332 22.8057332c0 12.5694966-10.2362366 22.8057332-22.8057332 22.8057332z m0-21.3004042c-10.9136346 0-19.7950754 8.8814406-19.7950754 19.7950754s8.8814406 19.7950754 19.7950754 19.7950754 19.7950754-8.8814406 19.7950752-19.7950754-8.8814406-19.7950754-19.7950752-19.7950754zM165.2851158 81.7393605c-12.5694966 0-22.8057332-10.2362366-22.8057332-22.8057332 0-12.5694966 10.2362366-22.8057332 22.8057332-22.8057332 12.5694966 0 22.8057332 10.2362366 22.8057332 22.8057332 0 12.5694966-10.2362366 22.8057332-22.8057332 22.8057332z m0-21.3004042c-10.9136346 0-19.7950754 8.8814406-19.7950754 19.7950754s8.8814406 19.7950754 19.7950754 19.7950754 19.7950754-8.8814406 19.7950754-19.7950754-8.8814406-19.7950754-19.7950754-19.7950754zM134.802205 79.6319h-54.492907c-1.2795296 0-2.2579934-0.9784638-2.2579934-2.2579934v-13.3597941c0-1.2795296 0.9784638-2.2579934 2.2579934-2.2579934h54.492907c1.2795296 0 2.2579934 0.9784638 2.2579934 2.2579934v13.3597941c0 1.2042632-1.0537302 2.2579934-2.2579934 2.2579934z m-53.7402424-1.5053289h52.987578v-12.6071297h-52.987578v12.6071297z",
                "M86.2553472 68.3795663h42.676075v1.505329h-42.676075zM84.7500184 73.6482176h3.0106578v3.0859243h-3.0106578zM91.1476662 73.6482176h3.010658v3.0859243h-3.010658zM97.4700478 73.6482176h3.0106578v3.0859243h-3.0106578zM103.8676956 73.6482176h3.0106578v3.0859243h-3.0106578zM110.1900772 73.6482176h3.0106578v3.0859243h-3.0106578zM116.5124588 73.6482176h3.0106578v3.0859243h-3.0106578zM122.8348404 73.6482176h3.0106578v3.0859243h-3.0106578zM129.157222 73.6482176h3.0106578v3.0859243h-3.0106578zM179.3599412 54.0413083H33.568835c-1.2042632 0-2.2579934-1.0537302-2.2579934-2.2579932v-5.6449835c0-1.2042632 1.0537302-2.2579934 2.2579934-2.2579934h145.7911062c1.2795296 0 2.2579934 0.9784638 2.2579934 2.2579934v5.2688445c-0.2257994 1.2042632-1.2042632 1.9569276-2.3332598 1.9569276z m-145.0384418-1.5053289h144.3610438v-4.892319H34.1214994v4.892319z",
                "M184.402793 42.1492098H44.3319368c-1.2042632 0-2.2579934-1.0537302-2.2579934-2.2579932V25.2895259c0-1.2795296 0.9784638-2.2579934 2.2579934-2.2579934H184.402793c1.2795296 0 2.2579934 0.9784638 2.2579934 2.2579934v14.6542732c0 1.2795296-0.9784638 2.2579934-2.2579934 2.2579932z m-125.7702316-1.5053289h124.6829676V25.6658581H58.6325612V40.6438809zM187.940316 42.1492098h-7.0000002c-1.2795296 0-2.2579934-0.9784638-2.2579934-2.2579932v-2.9353914c0-1.2795296 0.9784638-2.2579934 2.2579934-2.2579934h7.0000002c1.2795296 0 2.2579934 0.9784638 2.2579934 2.2579934v2.9353914c0 1.2795296-0.9784638 2.2579934-2.2579934 2.2579932z m-6.247335-1.5053289h5.4946706v-2.1827269h-5.4946706v2.1827269z",
                "M184.402793 37.7084895c-0.827931 0-1.505329-0.338699-1.505329-0.752664v-27.4722529c0-0.827931 0.338699-1.505329 1.505329-1.505329s1.505329 0.338699 1.505329 1.505329v27.4722529c0 0.827931-0.338699 1.505329-1.505329 1.505329z"
            ],
            vortex: "M441.387 938.667h-16c-12.288 0-24.534 0-36.395-3.286-11.861-3.242-24.15-4.096-36.01-6.528a344.064 344.064 0 0 1-35.158-9.813 341.504 341.504 0 0 1-33.92-13.099 348.459 348.459 0 0 1-32.725-16.384c-10.667-6.144-20.864-12.288-31.062-19.2a382.507 382.507 0 0 1-29.013-21.76 176.939 176.939 0 0 1-25.813-26.581c-8.15-10.24-16.768-17.195-24.534-26.581-7.765-9.387-15.104-18.859-22.058-28.672a392.533 392.533 0 0 1-36.395-62.208 380.928 380.928 0 0 1-13.91-33.152 470.443 470.443 0 0 1-11.05-33.963c-3.285-11.477-5.717-20.053-7.765-33.579-1.92-12.757-4.864-19.626-5.334-31.232v-7.637c0-8.533-1.621-20.053-1.621-31.915v-35.2c0-11.477 2.048-23.338 4.096-35.2 2.048-11.861 4.096-22.912 6.528-34.389 2.475-11.435 5.717-22.485 9.387-33.536 3.712-11.093 8.618-22.912 13.098-32.768 4.523-9.813 7.766-20.864 14.72-31.104 6.955-10.24 11.094-20.48 16.768-30.293a439.893 439.893 0 0 1 62.976-80.214 438.4 438.4 0 0 1 50.816-43.733c8.96-6.528 17.963-13.483 26.155-19.2 8.192-5.76 18.816-11.52 28.63-16.81 9.813-5.334 20.48-10.24 30.677-14.337 10.24-4.096 20.053-8.576 30.25-12.288l30.678-10.24L398.464 96l31.104-5.717 31.061-4.907h62.976l30.294 2.859 30.208 4.522 29.44 6.528 28.629 8.192 27.819 9.814 27.008 11.477 25.77 12.672 24.534 14.336 23.68 15.53 22.528 16.385 20.821 17.621 19.627 18.39 18.432 19.242 17.152 19.627 15.53 20.48 14.336 20.48 13.099 21.29c4.053 7.339 8.15 14.294 11.861 21.675 3.67 7.381 7.339 14.336 10.624 21.675 3.243 7.381 6.528 14.336 9.387 21.717 2.859 7.339 5.717 14.72 8.192 21.675 2.432 6.954 4.907 14.72 7.339 21.674 4.394 14.507 8.064 28.16 11.093 40.96 2.816 14.294 5.29 28.246 6.912 40.918 1.621 12.672 2.859 27.008 3.285 40.96 0.427 13.866 0 25.728 0 37.632 0 11.861 0 23.722-2.048 35.2-2.048 11.434-2.474 22.485-4.522 33.536-2.048 11.093-3.67 21.717-6.102 31.914-2.474 10.24-4.906 20.48-7.765 29.867a1079.467 1079.467 0 0 1-8.619 27.05 271.19 271.19 0 0 1-9.813 25.345c-3.67 8.192-6.528 15.146-9.813 22.101-3.243 6.955-6.528 13.952-9.814 19.627-3.242 5.76-11.861 21.76-17.152 31.146a325.12 325.12 0 0 1-15.146 24.15 40.875 40.875 0 1 1-67.456-45.867l12.672-20.053c4.906-7.766 9.813-16.768 15.104-27.008l7.765-15.958 8.192-18.816c2.859-6.954 5.333-13.909 7.765-20.906 2.475-6.912 5.334-15.104 7.382-23.296s4.48-15.958 6.528-24.96c2.048-9.003 3.669-17.622 5.333-27.008a322.607 322.607 0 0 0 3.67-28.672c0.853-9.814 0-19.627 0-29.44v-31.531c0-11.05 0-22.101-2.86-33.536-2.858-11.52-3.285-22.955-6.143-35.2a583.808 583.808 0 0 0-9.387-36.053c-3.712-12.246-3.712-11.862-6.144-18.006-2.475-6.101-4.48-12.245-6.955-18.389l-5.333-15.573a246.272 246.272 0 0 0-8.96-18.006l-10.24-18.389-11.05-17.621-10.625-18.432-13.098-16.768-14.294-16.384-15.53-15.958-16.384-15.146-17.579-14.72-18.39-13.91-19.626-12.672-20.48-11.904-21.248-10.624-22.059-9.386-25.77-7.382-23.723-6.954-24.533-5.334-24.96-3.669-23.723-2.901h-51.499l-25.77 2.901-25.771 4.48-25.77 6.57-25.345 8.15-24.917 10.24-24.15 11.861-23.295 13.952-22.486 15.531a1764.744 1764.744 0 0 0-22.101 18.005c-7.893 6.571-14.592 12.8-20.053 18.816-6.528 6.571-12.672 13.526-18.774 20.48a227.67 227.67 0 0 0-17.194 22.102c-5.334 7.765-10.667 15.146-15.531 23.338a353.067 353.067 0 0 0-25.77 49.92 295.04 295.04 0 0 0-9.814 26.624c-2.859 8.96-5.333 18.006-7.765 27.392a222.293 222.293 0 0 0-5.334 27.819c-1.194 9.43-2.432 19.243-2.432 28.245v57.302c0 9.386 2.048 18.858 4.096 28.245s3.67 18.816 6.528 28.245c2.859 9.387 5.334 18.432 8.576 27.435 3.286 8.96 6.955 18.005 11.094 26.581a359.467 359.467 0 0 0 29.013 50.347 309.93 309.93 0 0 0 37.205 44.203c6.955 6.954 13.91 13.525 21.675 19.626a304.213 304.213 0 0 0 47.445 32.342c8.15 4.522 17.152 9.002 25.728 13.098 8.619 4.096 17.579 7.382 26.582 10.24 9.002 2.859 18.432 5.718 27.818 7.766 9.387 2.048 18.774 4.096 28.203 5.333 9.387 1.237 19.2 2.048 28.63 2.475 9.386 0.426 19.2 0 28.629 0 9.386 0 18.773 0 28.586-2.902 9.856-2.858 18.859-3.242 27.862-5.717 8.96-2.432 18.389-4.907 27.392-8.192 8.917-3.2 17.621-6.912 26.154-11.05a270.85 270.85 0 0 0 24.96-13.483 286.697 286.697 0 0 0 47.446-34.39 300.257 300.257 0 0 0 19.626-20.053c6.23-6.912 12.075-14.165 17.579-21.675a384.853 384.853 0 0 0 15.53-23.338 267.325 267.325 0 0 0 12.673-24.576 271.164 271.164 0 0 0 10.24-25.344 261.333 261.333 0 0 0 13.482-80.64c0.512-9.003 0.512-18.006 0-27.008a255.147 255.147 0 0 0-20.053-77.355 245.632 245.632 0 0 0-11.861-23.339 238.208 238.208 0 0 0-13.867-21.674 235.307 235.307 0 0 0-54.827-54.059 230.613 230.613 0 0 0-43.733-24.533 217.003 217.003 0 0 0-23.339-8.619 221.44 221.44 0 0 0-26.154-5.29 219.435 219.435 0 0 0-24.107-2.86 214.485 214.485 0 0 0-24.15 0 210.005 210.005 0 0 0-47.018 7.34 204.373 204.373 0 0 0-22.101 7.807 197.055 197.055 0 0 0-20.822 9.814 199.936 199.936 0 0 0-19.2 12.288 187.904 187.904 0 0 0-67.456 85.12A182.613 182.613 0 0 0 297.9 503.68a163.318 163.318 0 0 0 0 20.437 161.365 161.365 0 0 0 16.341 77.355c5.547 11.307 12.373 21.888 20.48 31.53a146.859 146.859 0 0 0 41.259 34.347l15.53 7.382 15.958 5.333 16.341 3.243h15.957a94.379 94.379 0 0 0 15.531 0l15.147-2.432c9.813-2.262 19.285-5.675 28.202-10.24a109.568 109.568 0 0 0 40.918-36.011A96.432 96.432 0 0 0 555.52 588.8a88.067 88.067 0 0 0 0-21.717 78.635 78.635 0 0 0-6.144-19.2 66.688 66.688 0 0 0-22.485-27.051 53.547 53.547 0 0 0-13.099-6.528 52.31 52.31 0 0 0-13.099-2.859 40.875 40.875 0 0 0-10.624 0 35.157 35.157 0 0 0-16.341 8.15 41.173 41.173 0 1 1-58.88-57.686 116.096 116.096 0 0 1 54.357-29.056c11.392-2.602 23.126-3.584 34.774-2.858a133.882 133.882 0 0 1 67.072 23.722 147.243 147.243 0 0 1 50.688 59.35 158.388 158.388 0 0 1 12.672 40.96c2.56 13.44 3.37 27.221 2.474 40.874a177.707 177.707 0 0 1-29.44 85.163 190.55 190.55 0 0 1-71.978 63.445 202.283 202.283 0 0 1-72.363 21.675c-8.619 0.427-17.195 0.427-25.77 0a214.101 214.101 0 0 1-26.582-1.237 218.624 218.624 0 0 1-98.56-40.534 231.979 231.979 0 0 1-57.643-61.397 232.107 232.107 0 0 1-14.336-24.96 245.717 245.717 0 0 1-23.722-84.31 254.379 254.379 0 0 1 0-29.866 261.29 261.29 0 0 1 66.688-169.813 264.94 264.94 0 0 1 21.632-22.144 282.155 282.155 0 0 1 81.792-50.774 286.665 286.665 0 0 1 65.024-17.962 295.424 295.424 0 0 1 99.797 0.853 308.267 308.267 0 0 1 123.435 52.693 318.73 318.73 0 0 1 51.541 45.824 322.743 322.743 0 0 1 21.675 27.008c20.053 28.587 35.328 60.246 45.397 93.739a330.539 330.539 0 0 1 13.099 140.373c0 11.862-3.286 23.296-6.144 35.2a365.962 365.962 0 0 1-9.814 34.774c-3.797 11.392-8.149 22.613-13.098 33.578a356.523 356.523 0 0 1-59.307 90.454 376.917 376.917 0 0 1-25.344 25.77 362.368 362.368 0 0 1-28.203 23.339 352.853 352.853 0 0 1-62.592 37.632c-11.05 5.333-22.058 9.813-33.536 13.91a340.693 340.693 0 0 1-70.741 17.62c-12.245 1.622-24.107 3.243-36.395 3.67h-20.053z",
        }
    },
    created() {

    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            // 生成随机位置
            // 生成随机位置，限制在屏幕上半部分
            const maxWidth = window.innerWidth / 2;
            const maxHeight = window.innerHeight / 2; // 只用上半部分
            const canvasW = 80, canvasH = 60;
            this.positions = this.canvases.map(() => ({
                top: Math.floor(Math.random() * (maxHeight - canvasH)),
                left: Math.floor(Math.random() * (maxWidth - canvasW)) + 200
            }));
            // 等 DOM 更新完再绘制 canvas
            this.$nextTick(() => {
                this.canvases.forEach(canvas => {
                    this.drawTapes(canvas);
                });
                this.drawPlayButton();
                // 创建音频对象
                this.drawTapePlayer("tapePlayer");
                this.drawVortex();
            });
        },
        drawTapes(canvas) {
            const rc = rough.canvas(document.getElementById(canvas.name));
            rc.path(canvas.path, {
                fill: 'rgba(122,252,200,0.8)',
                fillStyle: 'solid',
                stroke: 'black',
                strokeWidth: 2,
                roughness: 1.5
            });
        },
        clickTape(canvasId) {
            // console.log("clickTape:", canvasId);
            // console.log("this positions is :", this.positions);
            this.isPlay = false; // 点击时重置播放状态

            const idx = this.canvases.indexOf(canvasId);

            if (idx !== -1) {
                if (this.cachePosition.index !== -1) {
                    this.positions[this.cachePosition.index] = { top: this.cachePosition.top, left: this.cachePosition.left };
                    this.drawTapes(this.canvases[this.cachePosition.index]);
                }

                this.cachePosition = { ...this.positions[idx], index: idx };
                // 关键：直接赋值数字

                const tapePlayerCanvas = document.getElementById('tapePlayer');
                const parent = document.querySelector('.twoParent');
                const rect = tapePlayerCanvas.getBoundingClientRect();
                const parentRect = parent.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2 - parentRect.left - 30;
                const centerY = rect.top + rect.height / 2 - parentRect.top;
                this.positions[idx].top = centerY;
                this.positions[idx].left = centerX;

            }

            this.musicUrl = canvasId.url || '';


        },
        drawTapePlayer(canvasId, fillData) {
            const rc = rough.canvas(document.getElementById(canvasId));
            // 清空画布
            const ctx = document.getElementById(canvasId).getContext('2d');
            ctx.clearRect(0, 0, 400, 200);
            // 放大比例
            const scale = 1.5;
            ctx.save();
            ctx.translate(200 / 2 + 40, 100 / 2 + 20); // 画布中心
            ctx.scale(scale, scale);
            ctx.translate(-200 / 2, -100 / 2); // 回到原点 
            for (let i = 0; i < 5; i++) {
                if (i == 2) {
                    rc.path(this.paths[i], fillData || {
                        fill: 'rgba(255,255,255,1)',
                        fillStyle: 'solid',
                        stroke: 'black',
                        strokeWidth: 1,
                        roughness: 1.2
                    });
                    continue;
                } else {
                    rc.path(this.paths[i], {
                        fill: 'rgba(102,102,102,1)',
                        fillStyle: 'hachure',
                        stroke: 'black',
                        strokeWidth: 1,
                        roughness: 1.2
                    });
                }

            }

            ctx.restore();
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
        },
        drawVortex(fillData) {
            const canvas = document.getElementById('vortex');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 适配缩放，原始路径宽高约 900x900，canvas 200x400
            const scale = Math.min(canvas.width / 900, canvas.height / 900) * 0.9; // 适当缩小
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2); // 居中
            ctx.scale(scale, scale);
            ctx.translate(-450, -450); // 原始路径中心点大约在(450,450)

            const rc = rough.canvas(canvas);
            rc.path(this.vortex, fillData || {
                fill: 'black',
                fillStyle: 'cross-hatch',
                stroke: 'none',
                strokeWidth: 15,
                roughness: 9,
                bowing: 10
            });

            ctx.restore();

        },
        portal() {
            console.log("portal@@@@@");
            window.open("/", "_self");
        }
    },
    watch: {
        isPlay(newVal) {
            console.log("isPlay changed:", newVal);
            if (this.audio) {
                this.audio.pause();
                this.audio = null;
            }
            if (newVal && this.musicUrl) {
                this.audio = new Audio(this.musicUrl);
                this.audio.play();
            }
            this.drawPlayButton();
        },
        count(newVal) {
            if (this.isPlay) {
                console.log("draw once:", newVal);
                let fillData = {
                    fill: `rgba(${newVal}%255, ${newVal}%200, ${newVal}%100, 0.8)`,
                    fillStyle: this.fillStyles[newVal % this.fillStyles.length],
                    stroke: 'black',
                    strokeWidth: 1,
                    roughness: 1.2
                };
                this.drawTapePlayer("tapePlayer", fillData);
                // this.drawVortex(fillData);
            }

        },
        highlightIndex(newVal) {
            if (newVal !== null) {
                this.positions[newVal].highlight = true;
            } else {
                this.positions.forEach(pos => pos.highlight = false);
            }
        },

    },
    setup() {
        const count = ref(0);

        //创建定时器
        let intervalId = null;
        // 在组件挂载时开始计时
        onMounted(() => {
            intervalId = setInterval(() => {
                count.value++;
            }, 300);
        });

        onUnmounted(() => {
            // 在组件卸载时清除定时器
            clearInterval(intervalId);
        });
        return {
            count
        };
    }
}
</script>



<style>
.twoParent {
    background-color: antiquewhite;
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 99;
}

.canvas-wrapper {
    position: absolute;
    transition: top 1s cubic-bezier(0.4, 0, 0.2, 1), left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.highlight {
    box-shadow: 0 0 10px 3px #eecd98;
    z-index: 10;
    /* border: 2px solid #eecd98; */
    transition: box-shadow 0.2s, border 0.2s;
}

.playButton {
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

.tapePlayer {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 400px;
    /* 距离顶部100px，可根据需要调整 */
    width: 200px;
    height: 100px;
    z-index: 40;
}

.vortex {
    position: absolute;
    left: 50px;
    transform: translateX(-50%);
    top: 200px;
    /* 距离顶部100px，可根据需要调整 */
    width: 200px;
    height: 400px;
    z-index: 50;
}
</style>
