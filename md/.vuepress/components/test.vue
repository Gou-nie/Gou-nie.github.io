<template>
    <div ref="scene" class="scene"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Matter from 'matter-js'

const scene = ref(null)

onMounted(() => {
    console.log("进入onMounted")
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

    // 创建引擎
    const engine = Engine.create()
    const world = engine.world

    // 创建渲染器
    const render = Render.create({
        element: scene.value,
        engine,
        options: {
            width: 800,
            height: 800,
            wireframes: false
        }
    })

    Render.run(render)

    // 创建 runner
    const runner = Runner.create()
    Runner.run(runner, engine)


    // 创建边界
    const ground = Bodies.rectangle(400, 800, 800, 50, { isStatic: true })  // 底边
    const leftWall = Bodies.rectangle(0, 300, 50, 800, { isStatic: true })  // 左边
    const rightWall = Bodies.rectangle(800, 300, 50, 800, { isStatic: true }) // 右边
    const ceiling = Bodies.rectangle(400, 0, 800, 50, { isStatic: true })   // 顶部

    Composite.add(world, [ground, leftWall, rightWall, ceiling])

    
    function pathToVerticesModern(path, sampleLength = 15) {
        const length = path.getTotalLength()
        const vertices = []
        for (let i = 0; i < length; i += sampleLength) {
            const point = path.getPointAtLength(i)
            vertices.push({ x: point.x, y: point.y })
        }
        return vertices
    }


    // 载入 svg -> path -> bodies
    function loadSvg(url) {
        return fetch(url)
            .then(res => res.text())
            .then(raw => {
                const parser = new DOMParser()
                const doc = parser.parseFromString(raw, 'image/svg+xml')
                // 只取有 d 属性的路径
                const paths = Array.from(doc.querySelectorAll('path'))
                // .filter(p => p.getAttribute('d'))
                console.log('found paths:', paths.length, paths)
                return paths
            })
    }

    loadSvg('/images/svgs/bili.svg').then(paths => {

        const vertexSets = paths.map(path => pathToVerticesModern(path, 20))
        console.log(vertexSets, "vertexsets--------")
        const bodies = vertexSets.map(verts =>
            Bodies.fromVertices(
                Common.random(100, 700),
                Common.random(100, 500),
                verts,
                {   
                    render: {
                        fillStyle: '#aaaaaa',
                        strokeStyle: '#000',
                        lineWidth: 1
                    }
                }

            )
        )
        console.log(bodies, "bodies--------------------")

        Composite.add(world, bodies)
    })


    for (let i = 0; i < 20; i++) {

        const body = Bodies.rectangle(400 + i * 10, 200, 20, 20, {
            render: {
                sprite: {
                    texture: '/images/svgs/bili.svg',
                    xScale: 1,
                    yScale: 1
                }
            }
        })
        Composite.add(world, body)
    }

    // 添加鼠标交互
    const mouse = Mouse.create(render.canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    })
    Composite.add(world, mouseConstraint)

    render.mouse = mouse


    let t = 0
    Matter.Events.on(engine, 'beforeUpdate', () => {
        t += 0.05
        const offset = Math.sin(t) * 50  // 20px 振幅
        Matter.Body.setPosition(ground, { x: 400+offset, y: 600 + offset })
    })


})
</script>

<style>
.scene {
    width: 800px;
    height: 800px;
    border: 1px solid #ccc;
}
</style>
