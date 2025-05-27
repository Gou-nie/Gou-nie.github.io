<template>
  <div>
    <canvas id="c" class="threeCanvas" ref="threeCanvas"></canvas>
    <div class="split">
      <div id="view1" tabindex="1"></div>
      <div id="view2" tabindex="2"></div>
    </div>
  </div>
</template>
<script>
  import * as THREE from "three";
  import { GUI } from "three/addons/libs/lil-gui.module.min.js";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { ColorGUIHelper } from "../public/html&js/three3D/ColorGuiHelper";
  // import { MinMaxGUIHelper } from "../public/html&js/three3D/MinMaxGuiHelper";
  export default {
    mounted() {
      this.initThree();
    },
    methods: {
      initThree() {
        this.scene = this.createScene();
        this.gui = new GUI();
        const canvas = this.$refs.threeCanvas;
        this.renderer = this.createRenderer(canvas);
        this.camera = this.createCamera();
        this.camera2 = this.createCamera2();
        const view1Elem = document.querySelector("#view1");
        const view2Elem = document.querySelector("#view2");

        // 视角控制器
        this.controls = new OrbitControls(this.camera, view1Elem);
        this.controls.target.set(1, 5, 10);
        this.controls.update();

        this.controls2 = new OrbitControls(this.camera2, view2Elem);
        this.controls2.target.set(1, 5, 10);
        this.controls2.update();

        this.createDicLight();
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
      createCamera() {
        const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
        camera.position.set(0, 10, 20);
        // camera.up.set(0, 0, 1);
        // camera.lookAt(0, 0, 0);
        // function updateCamera() {
        //   camera.updateProjectionMatrix();
        // }
        // 相机辅助线
        const cameraHelper = new THREE.CameraHelper(camera);
        this.scene.add(cameraHelper);

        // this.gui.add(camera, "fov", 1, 180).onChange(updateCamera);
        // const minMaxGUIHelper = new MinMaxGUIHelper(camera, "near", "far", 0.1);
        // this.gui
        //   .add(minMaxGUIHelper, "min", 0.1, 50, 0.1)
        //   .name("near")
        //   .onChange(updateCamera);
        // this.gui
        //   .add(minMaxGUIHelper, "max", 0.1, 50, 0.1)
        //   .name("far")
        //   .onChange(updateCamera);
        return camera;
      },
      createCamera2() {
        const camera = new THREE.PerspectiveCamera(
          60, // fov
          2, // aspect
          0.1, // near
          500 // far
        );
        camera.position.set(40, 10, 30);
        camera.lookAt(0, 5, 0);
        return camera;
      },
      createDicLight() {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);
        this.scene.add(light.target);

        this.gui
          .addColor(new ColorGUIHelper(light, "color"), "value")
          .name("color");
        this.gui.add(light, "intensity", 0, 5, 0.01);
        // 光的辅助线
        const helper = new THREE.DirectionalLightHelper(light);
        this.scene.add(helper);

        function updateLight() {
          light.target.updateMatrixWorld();
          helper.update();
        }
        updateLight();

        this.makeXYZGUI(this.gui, light.position, "position", updateLight);
        this.makeXYZGUI(this.gui, light.target.position, "target", updateLight);

        this.scene.add(light);
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
      createPalnMesh(texture, planeSize) {
        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshStandardMaterial({
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
        const cubeMat = new THREE.MeshStandardMaterial({ color: "#8AC" });
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
        return mesh;
      },
      // gui 设置坐标
      makeXYZGUI(gui, vector3, name, onChangeFn) {
        const folder = gui.addFolder(name);
        folder.add(vector3, "x", -10, 10).onChange(onChangeFn);
        folder.add(vector3, "y", 0, 10).onChange(onChangeFn);
        folder.add(vector3, "z", -10, 10).onChange(onChangeFn);
        folder.open();
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
        const sphereMat = new THREE.MeshStandardMaterial({ color: "#CA8" });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
        return mesh;
      },

      setScissorForElement(elem) {
        const canvasRect = canvas.getBoundingClientRect();
        const elemRect = elem.getBoundingClientRect();

        // 计算canvas的尺寸
        const right =
          Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
        const left = Math.max(0, elemRect.left - canvasRect.left);
        const bottom =
          Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
        const top = Math.max(0, elemRect.top - canvasRect.top);

        const width = Math.min(canvasRect.width, right - left);
        const height = Math.min(canvasRect.height, bottom - top);

        // 设置剪函数以仅渲染一部分场景
        const positiveYUpBottom = canvasRect.height - bottom;
        renderer.setScissor(left, positiveYUpBottom, width, height);
        renderer.setViewport(left, positiveYUpBottom, width, height);

        // 返回aspect
        return width / height;
      },
      animate() {
        requestAnimationFrame(this.animate);

        resizeRendererToDisplaySize(this.animate);

        // 启用剪刀函数
        renderer.setScissorTest(true);

        // 渲染主视野
        {
          const aspect = setScissorForElement(view1Elem);

          // 用计算出的aspect修改摄像机参数
          camera.aspect = aspect;
          camera.updateProjectionMatrix();
          cameraHelper.update();

          // 来原视野中不要绘制cameraHelper
          cameraHelper.visible = false;

          scene.background.set(0x000000);

          // 渲染
          renderer.render(scene, camera);
        }

        // 渲染第二台摄像机
        {
          const aspect = setScissorForElement(view2Elem);

          // 调整aspect
          camera2.aspect = aspect;
          camera2.updateProjectionMatrix();

          // 在第二台摄像机中绘制cameraHelper
          cameraHelper.visible = true;

          scene.background.set(0x000040);

          renderer.render(scene, camera2);
        }
        this.renderer.render(this.scene, this.camera);
      },
    },
  };
</script>

<style scoped>
  .threeCanvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    /* z-index: 999; */
  }
  .split {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
  }
  .split > div {
    width: 100%;
    height: 100%;
  }
</style>
