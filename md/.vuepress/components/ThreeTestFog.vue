<template>
  <div>
    <canvas ref="threeCanvas"></canvas>
  </div>
</template>

<script>
  import * as THREE from "three";
  import { GUI } from "three/addons/libs/lil-gui.module.min.js";
  import { FogGUIHelper } from "../public/html&js/three3D/ThreeGUIHelper.js";
  export default {
    mounted() {
      this.initThree();
    },
    methods: {
      initThree() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#aaa");
        const canvas = this.$refs.threeCanvas;
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        const camera = new THREE.PerspectiveCamera(
          25, // fov 视野范围(field of view)的缩写 垂直方向角度
          2, // 画布宽高比
          0.1, // near 近平面最小值
          6 // far 远平面最大值
        );
        camera.position.z = 4;
        camera.position.x = 1;
        // 雾
        {
          const gui = new GUI();
          const near = 3;
          const far = 5;
          const color = "lightblue";
          scene.fog = new THREE.Fog(color, near, far);
          scene.background = new THREE.Color(color);
          const fogGUIHelper = new FogGUIHelper(scene.fog, scene.background);
          gui.add(fogGUIHelper, "near", near, far).listen();
          gui.add(fogGUIHelper, "far", near, far).listen();
          gui.addColor(fogGUIHelper, "color");
        }
        //光照
        const color = 0xffffff;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);

        // 创建立方体
        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material1 = new THREE.MeshPhongMaterial({ color: 0xbbaaee });
        const cube1 = new THREE.Mesh(geometry, material1);
        scene.add(cube1);

        const material2 = new THREE.MeshPhongMaterial({ color: 0xbbffee });
        const cube2 = new THREE.Mesh(geometry, material2);
        cube2.position.x = 1.5; // 向右移动1.5u
        scene.add(cube2);
        renderer.render(scene, camera);

        function resizeRendererToDisplaySize(renderer) {
          const canvas = renderer.domElement;
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          const needResize = canvas.width !== width || canvas.height !== height;
          if (needResize) {
            renderer.setSize(width, height, false);
          }
          return needResize;
        }

        // 定时器更新动画
        function rerrr(time) {
          time *= 0.0001;

          cube1.rotation.x = time;
          cube1.rotation.y = time;
          cube2.rotation.x = 1.5 * time;
          cube2.rotation.y = 1.5 * time;

          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();

          if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
          }

          renderer.render(scene, camera);

          requestAnimationFrame(rerrr);
        }
        rerrr();
        // requestAnimationFrame(rerrr);
      },
      /**
       * const loader = new THREE.FontLoader();
  
  loader.load('../resources/threejs/fonts/helvetiker_regular.typeface.json', (font) => {
    const text = 'aleahpeal';  
  aleahpeal
  
    const geometry = new THREE.TextGeometry(text, {
      font: font,
      size:  2.3,  
  
      depth:  3.5,  
  
      curveSegments: 12,  
  
      bevelEnabled: true,  
      bevelThickness: 0.77,  
  
      bevelSize: 0.30,  
  
      bevelSegments: 8,  
  
    });  
       */
    },
  };
</script>

<style scoped>
  .threeCanvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    z-index: 999;
  }
</style>
