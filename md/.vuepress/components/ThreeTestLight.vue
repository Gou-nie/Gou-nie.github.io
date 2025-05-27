<template>
  <div>
    <canvas class="threeCanvas" ref="threeCanvas"></canvas>
  </div>
</template>
<script>
  import * as THREE from "three";
  import { GUI } from "three/addons/libs/lil-gui.module.min.js";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { ColorGUIHelper } from "../public/html&js/three3D/ColorGuiHelper";
  export default {
    mounted() {
      this.initThree();
    },
    methods: {
      initThree() {
        this.scene = this.createScene();
        const canvas = this.$refs.threeCanvas;
        this.renderer = this.createRenderer(canvas);
        this.camera = this.createCamera();

        // 视角控制器
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.target.set(1, 5, 10);
        this.controls.update();

        // const light = this.createHemisphereLight();
        const light = this.createDicLight();
        this.scene.add(light);

        const planeSize = 40;
        // 纹理
        this.texture = this.createTexture(planeSize);

        const plan = this.createPalnMesh(this.texture, planeSize);
        this.scene.add(plan);
        const box = this.createBoxMesh();
        this.scene.add(box);
        const sphere = this.createSphere();
        this.scene.add(sphere);

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
      },

      createScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#aaa");
        return scene;
      },

      createRenderer(canvas) {
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        // 设置像素比和尺寸
        const pixelRatio = window.devicePixelRatio;
        renderer.setPixelRatio(pixelRatio); // 关键
        renderer.setSize(window.innerWidth, window.innerHeight, false); // 设定canvas画布尺寸
        return renderer;
      },

      createCamera() {
        const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
        camera.position.set(0, 10, 20);
        // camera.up.set(0, 0, 1);
        // camera.lookAt(0, 0, 0);
        return camera;
      },

      createHemisphereLight() {
        const skyColor = 0xb1e1ff;
        const groundColor = 0xb97a20;
        const intensity = 1;
        // return new THREE.AmbientLight(0xffffff, 1);
        //gui
        const gui = new GUI();
        gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
        gui
          .addColor(new ColorGUIHelper(light, "groundColor"), "value")
          .name("groundColor");
        return new THREE.HemisphereLight(skyColor, groundColor, intensity);
      },
      createDicLight() {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);
        this.scene.add(light.target);

        const gui = new GUI();
        gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
        gui.add(light, "intensity", 0, 5, 0.01);
        gui.add(light.target.position, "x", -10, 10);
        gui.add(light.target.position, "z", -10, 10);
        gui.add(light.target.position, "y", 0, 10);

        const helper = new THREE.DirectionalLightHelper(light);
        this.scene.add(helper);

        return light;
      },

      createTexture(planeSize) {
        const loader = new THREE.TextureLoader();
        const texture = loader.load("/images/checker.png");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;

        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);
        return texture;
      },
      createPalnMesh(texture, planeSize) {
        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -0.5;
        return mesh;
      },
      createBoxMesh() {
        const cubeSize = 4;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
        return mesh;
      },
      createSphere() {
        const sphereRadius = 3;
        const sphereWidthDivisions = 32;
        const sphereHeightDivisions = 16;
        const sphereGeo = new THREE.SphereGeometry(
          sphereRadius,
          sphereWidthDivisions,
          sphereHeightDivisions
        );
        const sphereMat = new THREE.MeshPhongMaterial({ color: "#CA8" });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
        return mesh;
      },
      animate() {
        requestAnimationFrame(this.animate);

        this.controls.update();

        this.renderer.render(this.scene, this.camera);
      },
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
