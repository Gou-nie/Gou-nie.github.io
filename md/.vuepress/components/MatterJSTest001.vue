<template>
    <div class="matterfallback">
        <div ref="scene" class="scene"></div>
    </div>

</template>

<script>
import Matter from 'matter-js'
import tapeArr from "../public/html&js/content/tapeContentArr";
const {
    Engine,
    Render,
    Runner,
    Common,
    MouseConstraint,
    Mouse,
    Composite,
    Svg,
    Bodies
} = Matter

export default {
    data() {
        return {
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
            playingTapeUrl: ''
        }
    },
    mounted() {

        const scene = this.$refs.scene;
        if (scene) {
            this.boxWidth = scene.clientWidth;
            this.boxHeight = scene.clientHeight;
            console.log('宽度:', this.boxWidth, '高度:', this.boxHeight);
        }


        this.canvases = tapeArr.filter(i => i.type == 'tape')
        this.init()
        this.bindSoftLockHandler()
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
                    background: '#aaaaaa' // '#ebc775'
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

            this.loadSvg('/images/svgs/tape.svg').then(paths => {
                const vertexSets = paths.map(path => this.pathToVerticesModern(path, 1))
                // console.log(vertexSets, "vertexsets--------")

                for (const i in this.canvases) {
                    if (Object.prototype.hasOwnProperty.call(this.canvases, i)) {
                        const element = this.canvases[i];
                        // console.log(element, 'element is ------------')
                        const bodies = this.addByVertexSets(vertexSets)
                        bodies[0].plugin.userData = element
                        Composite.add(this.world, bodies)
                    }
                }

            })

            this.addPlayer()



            // 监听鼠标按下事件
            Matter.Events.on(mouseConstraint, "mousedown", event => {
                const mousePosition = event.mouse.position;
                // console.log("点击位置:", mousePosition);

                const bodies = Matter.Composite.allBodies(engine.world);
                const clickedBodies = Matter.Query.point(bodies, mousePosition);

                if (clickedBodies.length > 0) {
                    if (clickedBodies[0].plugin.userData != null) {
                        // 这里拿到磁带的userData  放到一个变量里，等到磁针动画完成了就触发播放
                        this.playingTapeUrl = clickedBodies[0].plugin.userData.url;
                        this.tapeStartPlay(clickedBodies[0]);
                    }
                }
            });



        },
        addByVertexSets(vertexSets) {
            return vertexSets.map(verts =>
                Bodies.fromVertices(
                    Common.random(100, this.boxWidth - 100),
                    Common.random(100, this.boxHeight - 100),
                    verts,
                    {
                        render: {
                            sprite: {
                                texture: '/images/svgs/tape.svg',
                                xScale: 1,
                                yScale: 1
                            }
                        }
                    },
                    true
                ));
        },
        // 添加播放器｜探头｜磁针 
        addPlayer() {
            const probeWidth = 10, probeHeight = 50;
            const probeStatic = Bodies.rectangle(
                this.boxWidth / 2,
                probeHeight / 2 + 25,
                probeWidth,
                probeHeight,
                {
                    isStatic: true,
                    render: {
                        fillStyle: '#9bc0eb'
                    }
                }
            );
            Composite.add(this.engine.world, probeStatic);

            // 探针 tip
            this.tip = Bodies.circle(this.boxWidth / 2, probeHeight + 20, 6, {
                isStatic: true,
                restitution: 0.4,
                render: { fillStyle: '#a72126' }
            });
            Composite.add(this.engine.world, this.tip);

            // 在渲染完成后绘制闪电
            this.drawShine()
        },
        drawShine() {
            Matter.Events.on(this.render, "afterRender", () => {
                const ctx = this.render.context;
                const { x, y } = this.tip.position; // 用 tip 的位置作为起点
                if (this.playingTape == null) {
                    return;
                }
                if (Math.random() < 0.23) { // 概率
                    ctx.beginPath();
                    ctx.strokeStyle = "rgba(0, 200, 255, 1)";
                    ctx.lineWidth = 2;

                    let lx = x, ly = y;
                    ctx.moveTo(lx, ly);
                    for (let i = 0; i < 5; i++) {
                        lx += (Math.random() - 0.5) * 40;
                        ly += Math.random() * 40;
                        ctx.lineTo(lx, ly);
                    }
                    ctx.stroke();
                }
            });
        },
        // 注册一次全局 handler
        bindSoftLockHandler() {
            this._softLockHandler = () => {
                const body = this.playingTape;
                if (!body) return; // 没有要锁的刚体就直接返回

                let { x, y } = body.position;
                const minX = this.boxWidth / 2 - 50, maxX = this.boxWidth / 2, minY = 70, maxY = 150;

                // 限制位置
                if (x < minX) x = minX;
                if (x > maxX) x = maxX;
                if (y < minY) y = minY;
                if (y > maxY) y = maxY;

                Matter.Body.setPosition(body, { x, y });

                // 清掉速度，防止飞出去
                Matter.Body.setVelocity(body, { x: 0.4, y: 0.2 });
                Matter.Body.setAngularVelocity(body, 0.1);
            };

            Matter.Events.on(this.engine, "beforeUpdate", this._softLockHandler);
        },

        // 切换播放刚体 
        // 开始播放 ???这里要不要跳转新的动画搞一个大的磁带真的在转能看到进度条左右磁条有厚度根据进度变化然后能快进能后退
        tapeStartPlay(body) {
            // console.log('点击的刚体是：', body);
            // console.log('上一个播放的刚体是：', this.playingTape);

            // 如果之前有正在锁的刚体，先清掉速度
            if (this.playingTape && this.playingTape.id !== body.id) {
                Matter.Body.setVelocity(this.playingTape, { x: 0, y: 0 });
                Matter.Body.setAngularVelocity(this.playingTape, 0);
                this.audio.pause();
            }
            if (this.playingTape && this.playingTape.id == body.id) {

                console.log('点击了现在正在播放的tape ')
                Matter.Body.setVelocity(this.playingTape, { x: 0, y: 0 });
                Matter.Body.setAngularVelocity(this.playingTape, 0);
                this.audio.pause();
                this.playingTape = null
            } else {
                // 更新当前播放刚体
                this.playingTape = body;
                this.isPlaying = true;
                this.audio = new Audio(this.playingTape.plugin.userData.url);
                // this.audio.play();
            }


        },

        loadSvg(url) {
            return fetch(url)
                .then(res => res.text())
                .then(raw => {
                    const parser = new DOMParser()
                    const doc = parser.parseFromString(raw, 'image/svg+xml')
                    // 只取有 d 属性的路径
                    const paths = Array.from(doc.querySelectorAll('path'))
                    // .filter(p => p.getAttribute('d'))
                    // console.log('found paths:', paths.length, paths)
                    return paths
                })
        },
        loadPostings(url, num, x, y, w, h) {
            for (let i = 0; i < num; i++) {

                const body = Bodies.rectangle(x + i * 200, y, w, h, {
                    render: {
                        sprite: {
                            texture: url,
                            xScale: 1,
                            yScale: 1
                        }
                    }
                })
                Composite.add(this.world, body)
            }
        },
        loadEvent(border, action) {
            let t = 0
            Matter.Events.on(this.engine, action, () => {
                t += 0.05
                const offset = Math.sin(t) * 50  //  振幅
                Matter.Body.setPosition(border, { x: 400 + 2 * offset, y: 500 + offset })
            })
        },
        pathToVerticesModern(path, sampleLength = 5) {
            const length = path.getTotalLength();
            const allVertices = [];
            let vertices = [];
            let prevPoint = path.getPointAtLength(0);
            const startPoint = { x: prevPoint.x, y: prevPoint.y };

            for (let i = 0; i <= length; i += sampleLength) {
                const point = path.getPointAtLength(i);
                point.x = point.x * 1.2
                point.y = point.y * 1.2
                vertices.push({ x: point.x, y: point.y });

                // 检测子路径闭合（回到起点附近）
                const dx = point.x - startPoint.x;
                const dy = point.y - startPoint.y;
                if (i > 0 && Math.sqrt(dx * dx + dy * dy) < sampleLength / 2) {
                    allVertices.push(vertices);
                    // 重置 vertices，寻找下一个子路径s
                    vertices = [];
                }
                prevPoint = point;
            }

            // 剩余顶点也加入
            if (vertices.length > 0) allVertices.push(vertices);

            return allVertices; // 返回二维数组，每个子路径一个数组
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
