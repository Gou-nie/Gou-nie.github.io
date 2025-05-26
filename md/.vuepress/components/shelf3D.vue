<template>
    <div>
      <canvas class="shelfCanvas" ref="shelfCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import * as THREE from 'three';
  
  export default {
    mounted() {
      this.initCanvas();
    },
    methods: {
      initCanvas() {
        const canvas = this.$refs.shelfCanvas;
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  
        // ✅ 阴影设置
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setPixelRatio(window.devicePixelRatio);
  
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('white');
  
        // ✅ 相机
        const camera = new THREE.PerspectiveCamera(
          25,
          canvas.clientWidth / canvas.clientHeight,
          0.1,
          120
        );
        camera.position.set(0, 10, 80);
        camera.lookAt(0, 0, 0);
  
        // ✅ 平行光（方向光）及其阴影设置
        const light = new THREE.DirectionalLight(0xffffff, 3);
        light.position.set(-3, 20, 100);
        light.castShadow = true;
  
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.bias = -0.001;
        light.shadow.radius = 100; // 阴影模糊半径，越大越模糊，默认为 1，设置为 0 时关闭模糊，设置为 1 时开启模糊
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500;
        light.shadow.camera.left = -50;
        light.shadow.camera.right = 50;
        light.shadow.camera.top = 50;
        light.shadow.camera.bottom = -50;
        scene.add(light);
  
        // ✅ 红色背景墙，使用能接受光照的材质
        const wallGeometry = new THREE.PlaneGeometry(50, 50);
        const wallMaterial = new THREE.MeshPhongMaterial({
          color: 0xefefef,
          side: THREE.DoubleSide,
        });
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallMesh.rotation.y = Math.PI; // 使其面朝摄像机
        wallMesh.position.z = -5;
        wallMesh.receiveShadow = true;
        scene.add(wallMesh);
  
        // ✅ 4 个板子，具有阴影
        const boxGeometry = new THREE.BoxGeometry(40, 0.5, 10);
        for (let i = 0; i < 2; i++) {
          const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
          const board = new THREE.Mesh(boxGeometry, material);
          board.position.y = i * 14 - 10;
          board.position.z = 2;
          board.castShadow = true;
          scene.add(board);
        }
  
        // ✅ 渲染循环
        const animate = () => {
          requestAnimationFrame(animate);
  
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          if (canvas.width !== width || canvas.height !== height) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
          }
  
          renderer.render(scene, camera);
        };
  
        animate();
      },
    },
  };
  </script>
  
  <style scoped>
  .shelfCanvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    z-index: 999;
    display: block;
  }
  </style>
  