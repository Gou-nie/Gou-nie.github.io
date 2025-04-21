<template>
    <div ref="container" class="canvas-container">
        <canvas ref="canvas" class="flex-canvas"></canvas>
        <div class="toolbar">
            <button @click="clear">清除</button>
            <button @click="saveCanvas">导出</button>
            <!-- <button @click="uploadCanvasToOss">上传</button> -->
            
        </div>
        <div class="pen-size">
            
            <div class="circle" :style="{ width: circleSize + 'px', height: circleSize + 'px' }"></div>
            <span>大小</span>
            <input 
                type="range" 
                min="0" 
                max="100" 
                v-model="progress" 
                @input="handleProgressChange"
                class="progress-bar"
            /> 

        <span>角度</span>
        <input type="range" v-model="angle" min="0" max='1000' @input="handleAngleChange" />
        </div>
        <div class="pen-shape">
            
        </div>
    </div>
</template>

<script>
// import OSS from 'ali-oss';∂
export default {
    data() {
        return {
            rainbowColors: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'],
            canvas: null,
            ctx: null,
            colorIndex: null,
            drawing: false,
            progress: 5,
            circleSize: 5,
            angle: 1000,
        };
    },
    mounted() {
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas);

        this.drawing = false;

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.drawing = true;

        });
        this.canvas.addEventListener('touchend', (e)=>{
            e.preventDefault();
            this.drawing = false;
        });
        this.canvas.addEventListener('touchmove',(e)=> {
            e.preventDefault();
            this.draw(e)
        });

        this.canvas.addEventListener('mousedown', () => this.drawing = true);
        this.canvas.addEventListener('mouseup', () => this.drawing = false);
        this.canvas.addEventListener('mouseleave', () => this.drawing = false);
        this.canvas.addEventListener('mousemove', this.draw);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeCanvas);
    },
    methods: {
        resizeCanvas() {
            const container = this.$refs.container;
            const rect = container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        },
        draw(e) { 
            if (!this.drawing) return;
            const rect = this.canvas.getBoundingClientRect();
            let x, y;
            if (e.touches) {  
                x = e.touches[0].clientX - rect.left;
                y = e.touches[0].clientY - rect.top;
            } else {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }

            if (!this.colorIndex) {
                this.colorIndex = 0;
            }
            this.ctx.fillStyle = this.rainbowColors[this.colorIndex];
            this.colorIndex = (this.colorIndex + 1) % this.rainbowColors.length;
            this.ctx.beginPath(); 
            this.ctx.arc(x, y, this.circleSize/2, 0 , 2*Math.PI*this.angle/1000);
            this.ctx.fill();
        },
        clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },
        saveCanvas() {
            const { canvas } = this.$refs;
            canvas.toBlob((blob) => {
                // blob将base64编码的src 以二进制的形式存进了 Blob对象
                const a = document.createElement("a");
                a.download = `canvas_${Date.now()}.png`;
                a.href = window.URL.createObjectURL(blob);
                a.click();
                console.log(blob);
            }, "image/png");
        },
        uploadCanvasToOss() {
 
        },
        handleProgressChange() {
            // console.log('当前进度: ', this.progress); 
            this.circleSize = 10 + (this.progress / 100) * 90;
        },
        handleAngleChange() {
            // console.log('当前角度: ', this.angle);
            this.angle = this.angle;
        }
    }
}
</script>

<style scoped>
.canvas-container {
    width: 100%;
    height: 400px;
    /* 或设置为 100vh、50vh 等 */
    position: relative;
    border: 1px solid #85b3a7;
    box-sizing: border-box;
}

.flex-canvas {
    width: 100%;
    height: 100%;
    display: block;
}

.toolbar {
    position: absolute;
    top: 10px;
    right: 10px;
}
.pen-size{ 
    position: absolute;
    top: 10px;
    left: 10px;
    width: 200px;
}
.circle {
    border-radius: 50%; 
    margin-bottom: 10px; 
    background-color: black;
}
.pen-shape{
    position: absolute;
    top: 10px;
    left: 10px;
    width: 100px;
}

</style>