<template>
    <div>
      <canvas ref="threeCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import * as THREE from 'three'
  export default {
    mounted() {
      this.initThree()
    },
    methods: {
      initThree() {
        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#eee')
        const canvas = this.$refs.threeCanvas
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        const camera = new THREE.PerspectiveCamera(
          50,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        )
        camera.position.z = 10
  
        function animate() {
          renderer.render(scene, camera)
          requestAnimationFrame(animate)
        }
        animate()
      },
    },
  }
  </script>
  
  <style scoped>
  #threeCanvas {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
  }
  </style>