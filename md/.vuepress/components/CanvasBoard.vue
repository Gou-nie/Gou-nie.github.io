<template>
    <div ref="container" class="canvas-container">
        <canvas ref="canvas" class="flex-canvas"></canvas>
        <div class="toolbar">
            <button @click="clear">清除</button>
            <button @click="saveCanvas">导出</button>
            <button @click="uploadCanvasToOss">上传</button>
        </div>
    </div>
</template>

<script>
// import OSS from 'ali-oss';
export default {
    mounted() {
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas);
 
        this.drawing = false;

        this.canvas.addEventListener('touchstart', () => this.drawing = true);
        this.canvas.addEventListener('touchend', () => this.drawing = false); 
        this.canvas.addEventListener('touchmove', this.draw);
        
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
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
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
                a.download = "canvas.png";
                a.href = window.URL.createObjectURL(blob);
                a.click();
                // eslint-disable-next-line no-console
                console.log(blob);
            }, "image/png");
        },
        uploadCanvasToOss() {
            // const { canvas } = this.$refs;
            // canvas.toBlob((blob) => {
            //     // 创建 OSS 客户端
            //     const client = new OSS({
            //         region: 'oss-cn-heyuan',
            //         accessKeyId: '',
            //         accessKeySecret: '',
            //         bucket: 'aleah',
            //         secure: true,
            //         endpoint: 'https://oss-cn-heyuan.aliyuncs.com'
            //     });
            //     const filename = `canvas_${Date.now()}.png`;
            //     client.put(filename, blob).then(result => {
            //         console.log('上传成功', result.url);
            //     }).catch(err => {
            //         console.log('完整错误信息:', err);
            //         if (err.response) {
            //             console.log('状态码:', err.response.status);
            //             console.log('响应头:', err.response.headers);
            //             console.log('响应数据:', err.response.data);
            //         }
            //     });

            // }, "image/png");
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
</style>