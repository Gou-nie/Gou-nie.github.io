<template>
    <div>{{ count }}
        <div class="twoParent" v-if="positions.length === canvases.length">
            <div v-if=!isOver v-for="(i, idx) in canvases" :key="i.name" class="canvas-wrapper" :style="{
                top: positions[idx].top + 'px', left: positions[idx].left + 'px',
                boxShadow: positions[idx].highlight & canvases[idx].type == 'tape' ? '0 0 10px 3px #eecd98' : '',
                zIndex: canvases[idx].type == 'tape' ? 101 : 100
            }" @mouseenter="highlightIndex = idx" @mouseleave="highlightIndex = null"
                @click="i.type == 'tape' ? clickTape(i) : null">
                <canvas :id="i.name" width="64" height="54"></canvas>
            </div>
            <canvas class="tapePlayer" id="tapePlayer"></canvas>
            <canvas :disabled="true" class="playButton" id="playButton" @click="togglePlay"></canvas>
            <img id="vortexImage" class="vortex" src="/images/R-C-gray.png" :style="{
                left: vortexImgLeft + 'px',
                top: vortexImgTop + 'px',
                transform: `scale(${vortexImgScale}) rotate(${count % 360}deg)`,
                transition: isOver ? 'none' : 'left 0.2s, top 0.2s'
            }" />
            <canvas class="vortex-line" id="vortex" @click="portal"></canvas>
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
            isAbsorbing: false, // 新增：吸入动画状态
            vortexScale: 1,     // 新增：vortex缩放
            vortexImgLeft: 0,
            vortexImgTop: 300,
            vortexImgScale: 1,
            isOver: false,
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
                } else {
                    this.drawPlayButton();
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
        drawVortex(angleOfset) {
            const canvas = document.getElementById('vortex');
            const ctx = canvas.getContext('2d');

            // const img = new Image();
            // img.src = '/images/R-C-gray.png';
            // img.onload = () => {
            //     let x = canvas.width / 2;
            //     let y = canvas.height / 2;
            //     let angle = angleOfset * Math.PI / 180;

            //     // 计算缩放因子
            //     const scaleX = canvas.width / img.width;
            //     const scaleY = canvas.height / img.height;
            //     let scale;
            //     if (this.isOver) {
            //         scale = Math.min(scaleX, scaleY) * (this.vortexScale || 1); // 关键：乘以vortexScale
            //     } else {
            //         scale = Math.min(scaleX, scaleY); // 保持比例
            //     }

            //     const drawWidth = img.width * scale;
            //     const drawHeight = img.height * scale;

            //     ctx.save();
            //     ctx.translate(x, y);         // 移动到中心
            //     ctx.rotate(angle);           // 旋转
            //     ctx.drawImage(
            //         img,
            //         -drawWidth / 2,          // 居中绘制
            //         -drawHeight / 2,
            //         drawWidth,
            //         drawHeight
            //     );
            //     ctx.restore();
            // };
            this.vortexImgRotation(angleOfset);
            let framee;
            // 吹风线
            const rc = rough.canvas(canvas);
            if (angleOfset % 20 === 0) {
                ctx.clearRect(220, 0, canvas.width, canvas.height);
                framee = angleOfset / 20 % 3;
                this.drawVortexAuxiliaryLine(rc, framee);
            }


        },

        vortexImgRotation(angleOfset) {
            const image = document.getElementById("vortexImage");
            image.style.transform = `rotate(${angleOfset}deg)`;
        },
        // 吹风线
        drawVortexAuxiliaryLine(rc, framee) {

            let angleBegin = framee * Math.PI / 8;
            let angleEnd = (framee + 1) * Math.PI / 8;

            rc.arc(240, 20, 40, 30, angleBegin, angleEnd, false, {
                stroke: 'black',
                strokeWidth: 0.4,
                roughness: 1.5
            });
            rc.arc(220, 20, 40, 30, angleBegin, angleEnd, false, {
                stroke: 'black',
                strokeWidth: 0.4,
                roughness: 1.5
            });
            rc.arc(220, 50, 40, 30, angleBegin, angleEnd, false, {
                stroke: 'black',
                strokeWidth: 0.4,
                roughness: 1.5
            });

            // 下方的角度镜像
            angleBegin = - (framee + 1) * Math.PI / 8;
            angleEnd = - (framee) * Math.PI / 8;

            rc.arc(240, 120, 40, 30, angleBegin, angleEnd, false, {
                stroke: 'black',
                strokeWidth: 0.4,
                roughness: 1.5
            });
            rc.arc(220, 120, 40, 30, angleBegin, angleEnd, false, {
                stroke: 'black',
                strokeWidth: 0.4,
                roughness: 1.5
            });
            rc.arc(220, 90, 40, 30, angleBegin, angleEnd, false, {
                stroke: 'black',
                strokeWidth: 0.4,
                roughness: 1.5
            });


        },
        portal() {

            if (this.isAbsorbing) return;
            this.isAbsorbing = true;

            // 获取vortex位置
            const vortexCanvas = document.getElementById('vortex');
            const vortexRect = vortexCanvas.getBoundingClientRect();
            const parentRect = document.querySelector('.twoParent').getBoundingClientRect();
            const centerX = vortexRect.left + vortexRect.width / 2 - parentRect.left;
            const centerY = vortexRect.top + vortexRect.height / 2 - parentRect.top;

            // 获取vortexImage位置
            const vortexImg = document.getElementById('vortexImage');
            const imgRect = vortexImg.getBoundingClientRect();

            // 当前left/top（相对父容器）
            this.vortexImgLeft = vortexImg.offsetLeft;
            this.vortexImgTop = vortexImg.offsetTop;

            // 目标中心点
            const targetLeft = parentRect.width / 2 - imgRect.width / 2;
            const targetTop = parentRect.height / 2 - imgRect.height / 2;


            // 磁带吸入
            this.canvases.forEach((c, idx) => {
                setTimeout(() => {
                    this.positions[idx].highlight = false;
                    this.positions[idx].top = centerY - 27;
                    this.positions[idx].left = centerX - 32;
                }, idx * 60);
            });
            // vortexImage 放大+平移动画
            setTimeout(() => {
                this.isOver = true;
                this.vortexImgScale = 1;
                let progress = 0;
                document.getElementById('vortexImage').classList.add('shake');
                setTimeout(() => {
                    document.getElementById('vortexImage').classList.remove('shake');
                    grow();
                }, 800);

                const grow = () => {
                    if (this.vortexImgScale < 10) {
                        this.vortexImgScale += 0.2;
                        progress = Math.min((this.vortexImgScale - 1) / (3 - 1), 1);
                        this.vortexImgLeft = this.vortexImgLeft * (1 - progress) + targetLeft * progress;
                        this.vortexImgTop = this.vortexImgTop * (1 - progress) + targetTop * progress;
                        requestAnimationFrame(grow);
                        if (this.vortexImgScale >= 9.6) {
                            window.open("/", "_self");
                        }
                    } else {
                        console.log("吸入完成, 跳转失败");
                    }
                };
            }, this.canvases.length * 60);
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
            if (this.isPlay && this.count % 30 === 0) {
                let fillData = {
                    fill: `rgba(${newVal}%255, ${newVal}%200, ${newVal}%100, 0.8)`,
                    fillStyle: this.fillStyles[newVal % this.fillStyles.length],
                    stroke: 'black',
                    strokeWidth: 1,
                    roughness: 1.2
                };
                this.drawTapePlayer("tapePlayer", fillData);
            }
            this.drawVortex(newVal % 360);

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
            }, 10);
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
    background-color: rgb(253, 243, 219);
    background-image: url('/images/45-degree-fabric-dark.png');
    /* 示例纹理 */
    background-repeat: repeat;
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
    left: 0px;
    transform-origin: center center;
    top: 300px;
    /* 距离顶部100px，可根据需要调整 */
    width: 200px;
    height: 200px;
    z-index: 50;
}

.vortex-line {
    position: absolute;
    left: 100px;
    transform: translateX(-50%);
    top: 200px;
    /* 距离顶部100px，可根据需要调整 */
    width: 300px;
    height: 400px;
    z-index: 50;
}



@keyframes shake {
    0% {
        transform: translate(0, 0) rotate(0deg);
    }

    20% {
        transform: translate(-2px, 2px) rotate(-2deg);
    }

    40% {
        transform: translate(-2px, -2px) rotate(2deg);
    }

    60% {
        transform: translate(2px, 2px) rotate(0deg);
    }

    80% {
        transform: translate(2px, -2px) rotate(2deg);
    }

    100% {
        transform: translate(0, 0) rotate(-2deg);
    }
}

#vortexImage.shake {
    animation: shake 0.3s infinite;
}
</style>
