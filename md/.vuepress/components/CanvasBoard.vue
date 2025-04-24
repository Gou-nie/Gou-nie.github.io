<template>
    <div ref="container" class="canvas-container">
        <ColorPicker v-model="colorValue" @update:color="getChildData" />
        <span>颜色:</span>
        <select v-model="colorType">
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>
        <span>画笔:</span>
        <select v-model="shape" >
            <option v-for="s in shapeOptions" :key="s.value" :value="s.value">
                {{ s.label }}
            </option>
        </select>
        <div v-if="checkShape('circle')" class="circle"
            :style="{ width: circleSize + 'px', height: circleSize + 'px', backgroundColor: colorValue }"></div>
        <div v-if="checkShape('rectangle')" class="rectangle"
            :style="{ width: circleSize + 'px', height: circleSize + 'px', backgroundColor: colorValue }"></div>
        <div v-if="checkShape('triangle')" class="triangle"
            :style="{'border-left-width': circleSize/2 + 'px',
                'border-right-width': circleSize/2 + 'px',
                'border-bottom-width': circleSize + 'px',
                'border-bottom-color': colorValue
            }"></div>
        <star v-if="checkShape('star')" :color="colorValue" :size="circleSize"></star>
        <div class="pen-size">
            <span>大小</span>
            <input type="range" min="0" max="100" v-model="progress" @input="handleProgressChange"
                class="progress-bar" />

            <span v-if="checkShape('circle')">角度</span>
            <input v-if="checkShape('circle')" type="range" v-model="angle" min="0" max='1000'
                @input="handleAngleChange" />
        </div>





        <div style="display: flex;">
            <button @click="clear">清除</button>
            <button @click="saveCanvas">导出</button>
            <!-- <button @click="uploadCanvasToOss">上传</button> -->

        </div>
        <canvas ref="canvas" class="flex-canvas"></canvas>
    </div>
</template>

<script>
import Star from './star.vue';

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
            colorType: 'setting',
            selectedColor: '#aaaaaa',
            colorValue: '#aaaaaa',
            options: [
                { label: '彩虹色', value: 'rainbow' },
                { label: '自设', value: 'setting' }
            ],
            shape: 'circle',
            shapeOptions: [
                { label: '圆形', value: 'circle' },
                { label: '矩形', value: 'rectangle' },
                { label: '三角形', value: 'triangle' },
                { label: '星形', value: 'star' }
            ]
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
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.drawing = false;
        });
        this.canvas.addEventListener('touchmove', (e) => {
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
            if (this.colorType == 'rainbow') {
                this.ctx.fillStyle = this.rainbowColors[this.colorIndex];
                this.colorIndex = (this.colorIndex + 1) % this.rainbowColors.length;
            } else {
                this.ctx.fillStyle = this.colorValue;
            }
            this.ctx.beginPath();
            let d = this.circleSize/2;
            if (this.shape == 'circle') {
                console.log('circle');
                this.ctx.arc(x, y, this.circleSize / 2, 0, 2 * Math.PI * this.angle / 1000);
                this.ctx.fill();
            } else if (this.shape == 'rectangle') { 
                console.log('rectangle');
                this.ctx.fillRect( x - d, y - d, this.circleSize, this.circleSize );
            } else if (this.shape == 'triangle') {
                console.log('triangle');
                this.ctx.beginPath();
                this.ctx.moveTo(x-0.577*this.circleSize, y+d);
                this.ctx.lineTo(x, y-2*this.circleSize/3);
                this.ctx.lineTo(x+0.577*this.circleSize, y+d);
                this.ctx.closePath();
            } else if (this.shape == 'star') {
                console.log('star');
                this.ctx.beginPath();
                this.ctx.moveTo(x, y+2*d/2);
                this.ctx.lineTo(x + 0.577*d/2, y + d/2);
                this.ctx.lineTo(x + 1.732*d/2, y + d/2);
                this.ctx.lineTo(x + 1.154*d/2, y);
                this.ctx.lineTo(x + 1.732*d/2, y - d/2);
                this.ctx.lineTo(x + 0.577*d/2, y - d/2);
                this.ctx.lineTo(x , y - 2*d/2);

                this.ctx.lineTo(x - 0.577*d/2, y - d/2);
                this.ctx.lineTo(x - 1.732*d/2, y - d/2);
                this.ctx.lineTo(x - 1.154*d/2, y);
                this.ctx.lineTo(x - 1.732*d/2, y + d/2);
                this.ctx.lineTo(x - 0.577*d/2, y + d/2);

                this.ctx.closePath();
            }
            
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
        },
        getChildData(v) {
            this.colorValue = v
        },
        checkShape(e) {
            return e == this.shape;
        }
    }
}
</script>

<style scoped>
.canvas-container {
    width: 100%;
    height: auto;
    /* 或设置为 100vh、50vh 等 */
    position: relative;

    box-sizing: border-box;
}

.flex-canvas {
    width: 100%;
    height: 100%;
    display: block;
    border: 1px solid #85b3a7;
}

.toolbar {
    position: absolute;
    top: 10px;
    right: 10px;
}

.pen-size {
 
    top: 10px;
    left: 10px;
    width: 200px;
    display: flex;
}

.circle {
    border-radius: 50%;
    margin-bottom: 10px;
    background-color: black;
}

.pen-shape {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 100px;
}

.color-picker {
    margin-bottom: 10px;
}


.rectangle {
    width: 0;
    height: 0;
}

.triangle {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 10px solid #e74c3c;
}

 



</style>