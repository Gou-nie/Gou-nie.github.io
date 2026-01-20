<template>
    <div class="matterfallback">
        <div ref="scene" class="scene"></div>
    </div>

</template>

<script>
import Matter from 'matter-js'
import keyWordsArr from "../public/html&js/content/wordsContentArr";
const {
    Engine,
    Render,
    Runner,
    Common,
    MouseConstraint,
    Mouse,
    Composite,
    Bodies,
} = Matter

export default {
    data() {
        return {
             //'#0' // 透明
            baclgroundColor: '#1a1a1a',
            world: null,
            engine: null,
            canvases: null,
            isPlaying: false,
            playingTape: null,
            render: null,
            boxWidth: 0,
            boxHeight: 0,
            //探针
            tip: null,
            playingTapeUrl: '',
        }
    },
    mounted() {

        const scene = this.$refs.scene;
        if (scene) {
            this.boxWidth = scene.clientWidth;
            this.boxHeight = scene.clientHeight;
            console.log('宽度:', this.boxWidth, '高度:', this.boxHeight);
        }


        this.canvases = keyWordsArr
        this.init()
    },
    methods: {
        init() {
            const scene = this.$refs.scene;
            // console.log(scene, "scene is ------")
            // 创建引擎
            const engine = Engine.create();
            this.engine = engine;
            this.world = engine.world;
            let width = this.boxWidth
            let height = this.boxHeight
            // 创建渲染器
            const render = Render.create({
                element: scene,
                engine,
                options: {
                    width, height,
                    wireframes: false, 
                    background: this.baclgroundColor
                }
            })
            this.render = render
            Render.run(render)
            // 创建runner
            const runner = Runner.create()
            Runner.run(runner, engine)

            // 创建边界
            const ground = Bodies.rectangle(this.boxWidth / 2, this.boxHeight, this.boxWidth, 50, { isStatic: true })  // 底边
            const leftWall = Bodies.rectangle(0, this.boxHeight / 2, 50, this.boxHeight, { isStatic: true })  // 左边
            const rightWall = Bodies.rectangle(this.boxWidth, this.boxHeight / 2, 50, this.boxHeight, { isStatic: true }) // 右边
            const ceiling = Bodies.rectangle(this.boxWidth / 2, 0, this.boxWidth, 50, { isStatic: true })   // 顶部

            Composite.add(this.world, [ground, leftWall, rightWall, ceiling])

            // 添加鼠标交互
            const mouse = Mouse.create(render.canvas)
            const mouseConstraint = MouseConstraint.create(engine, {
                mouse,
                constraint: {
                    stiffness: 0.2,
                    render: { visible: false }
                }
            });
            Composite.add(this.world, mouseConstraint)
            render.mouse = mouse
            console.log(this.canvases,"----- canvases ")
            for (const i in this.canvases) {
                if (Object.prototype.hasOwnProperty.call(this.canvases, i)) {
                    const element = this.canvases[i];
                    const text = element.name || 'Tape';
                    console.log("text is :",text);
                    // Create temporary canvas to measure text
                    const measureCanvas = document.createElement('canvas');
                    const measureCtx = measureCanvas.getContext('2d');
                    measureCtx.font = 'bold 24px Arial';
                    const textMetrics = measureCtx.measureText(text);
                    
                    // Calculate dimensions with padding
                    const padding = 20;
                    const width = textMetrics.width + padding * 2;
                    const height = 40; // Fixed height for text
                    
                    const textureUrl = this.createTexture(text, width, height);

                    // Random scale between 0.8 and 1.2 (slightly reduced range for better readability)
                    // const scale = Common.random(0.8, 1.2);
                    // console.log("i.preValue is ", i.preValue);
                    const scale = element.preValue/5;
                    
                    const body = Bodies.rectangle(
                        Common.random(100, this.boxWidth - 100),
                        Common.random(100, this.boxHeight - 100),
                        width * scale,
                        height * scale,
                        {
                            render: {
                                sprite: {
                                    texture: textureUrl,
                                    xScale: scale,
                                    yScale: scale
                                }
                            }
                        }
                    );
                    
                    body.plugin.userData = element;
                    Composite.add(this.world, body);
                }
            }

        },
        createTexture(text, width, height) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // Draw background (Black)
            ctx.fillStyle = this.baclgroundColor;
            ctx.fillRect(0, 0, width, height);

            // Draw text (White)
            ctx.fillStyle = '#FFFFFF'; 
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, width / 2, height / 2);

            return canvas.toDataURL('image/png');
        },
 
 

    },
    watch: {
        isPlaying(newVal) {
            console.log("isPlay changed:", newVal);
            if (newVal) {
            } else {
            }

        }
    }
}
</script>

<style>
.scene {
    width: 100%;
    /* 宽度随屏幕缩放 */
    max-width: 100%;
    max-height: 100%;
    /* 桌面端最大宽度 */
    aspect-ratio: 4 / 3;
    /* 保持宽高比 */
    border: 1px solid #ccc;
    /* background-color: #dcad6d; */
    /* 可选背景 */
    margin: 0 auto;
    /* 居中 */
}
.matterfallback{
    width: 100%;
	height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 99;
}
</style>
