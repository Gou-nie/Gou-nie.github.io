<template>
  <div>
    <canvas id="c" ref="threeCanvas"></canvas>
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
  import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
  import {
    MinMaxGUIHelper,
    ColorGUIHelper,
  } from "../public/html&js/three3D/ThreeGUIHelper";
  export default {
    mounted() {
      this.initThree2();
    },
    methods: {
      initThree() {
        this.scene = this.createScene();
        const canvas = this.$refs.threeCanvas;
        this.renderer = this.createRenderer(canvas);
        this.camera = this.createCamera();
        RectAreaLightUniformsLib.init();

        // 相机辅助线
        this.cameraHelper = new THREE.CameraHelper(this.camera);
        this.scene.add(this.cameraHelper);

        // 视角控制器
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.target.set(1, 5, 10);
        this.controls.update();

        // 光源
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
      initThree2() {
        this.scene = this.createScene();
        this.canvas = this.$refs.threeCanvas;
        this.view1Elem = document.querySelector("#view1");
        this.view2Elem = document.querySelector("#view2");
        this.renderer = this.createRenderer(this.canvas);

        this.camera = this.createOrthographicCamera();
        this.controls = new OrbitControls(this.camera, this.view1Elem);
        this.controls.update();

        // 相机辅助线
        this.cameraHelper = new THREE.CameraHelper(this.camera);
        this.scene.add(this.cameraHelper);

        this.camera2 = this.createCamera2();
        this.controls2 = new OrbitControls(this.camera2, this.view2Elem);
        this.controls2.target.set(0, 5, 0);
        this.controls2.update();

        // 光源
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

      updateCamera() {
        this.camera.updateProjectionMatrix();
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
      // gui 设置坐标
      makeXYZGUI(gui, vector3, name, onChangeFn) {
        const folder = gui.addFolder(name);
        folder.add(vector3, "x", -10, 10).onChange(onChangeFn);
        folder.add(vector3, "y", 0, 10).onChange(onChangeFn);
        folder.add(vector3, "z", -10, 10).onChange(onChangeFn);
        folder.open();
      },

      createCamera() {
        const fov = 45;
        const aspect = 2;
        const near = 0.1;
        const far = 100;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 10, 20);
        const gui = new GUI();
        gui.add(camera, "fov", 1, 180).onChange(this.updateCamera);
        const minMaxGUIHelper = new MinMaxGUIHelper(camera, "near", "far", 0.1);
        gui
          .add(minMaxGUIHelper, "min", 0.1, 50, 0.1)
          .name("near")
          .onChange(this.updateCamera);
        gui
          .add(minMaxGUIHelper, "max", 0.1, 50, 0.1)
          .name("far")
          .onChange(this.updateCamera);

        return camera;
      },
      createCamera2() {
        const camera2 = new THREE.PerspectiveCamera(
          60, // fov
          2, // aspect
          0.1, // near
          500 // far
        );
        camera2.position.set(40, 10, 30);
        camera2.lookAt(0, 5, 0);
        return camera2;
      },

      createOrthographicCamera() {
        const left = -1;
        const right = 1;
        const top = 1;
        const bottom = -1;
        const near = 5;
        const far = 50;

        const camera = new THREE.OrthographicCamera(
          left,
          right,
          top,
          bottom,
          near,
          far
        );
        camera.position.set(0, 10, 20);
        camera.zoom = 0.2;

        const gui = new GUI();
        gui.add(camera, "zoom", 0.01, 1, 0.01).listen();
        const minMaxGUIHelper = new MinMaxGUIHelper(camera, "near", "far", 0.1);
        gui
          .add(minMaxGUIHelper, "min", 0.1, 50, 0.1)
          .name("near")
          .onChange(this.updateCamera);
        gui
          .add(minMaxGUIHelper, "max", 0.1, 50, 0.1)
          .name("far")
          .onChange(this.updateCamera);
        return camera;
      },
      //  计算这个元素在canvas上的重叠面积，这将设置剪刀函数和视角长宽并返回 aspect
      setScissorForElement(elem) {
        const canvasRect = this.canvas.getBoundingClientRect();
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
        this.renderer.setScissor(left, positiveYUpBottom, width, height);
        this.renderer.setViewport(left, positiveYUpBottom, width, height);

        // 返回aspect
        return width / height;
      },
      // 半球光
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
        const light = new THREE.HemisphereLight(
          skyColor,
          groundColor,
          intensity
        );

        this.scene.add(light);
      },
      // 方向光
      createDicLight() {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);
        this.scene.add(light.target);

        // const gui = new GUI();
        // gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
        // gui.add(light, "intensity", 0, 5, 0.01);
        // // 光的辅助线
        // const helper = new THREE.DirectionalLightHelper(light);
        // this.scene.add(helper);

        // function updateLight() {
        //   light.target.updateMatrixWorld();
        //   helper.update();
        // }
        // updateLight();

        // this.makeXYZGUI(gui, light.position, "position", updateLight);
        // this.makeXYZGUI(gui, light.target.position, "target", updateLight);

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
      resizeRendererToDisplaySize(renderer) {
        const { clientWidth, clientHeight } = renderer.domElement;
        const needResize =
          renderer.domElement.width !== clientWidth ||
          renderer.domElement.height !== clientHeight;
        if (needResize) {
          renderer.setSize(clientWidth, clientHeight, false);
        }
        return needResize;
      },
      animate() {
        this.resizeRendererToDisplaySize(this.renderer);
        // 启用剪刀函数
        this.renderer.setScissorTest(true);

        // 渲染主视野
        {
          const aspect = this.setScissorForElement(this.view1Elem);

          // 用计算出的aspect修改摄像机参数
          // this.camera.aspect = aspect;
          // 正交相机 设置
          this.camera.left = -aspect;
          this.camera.right = aspect;
          this.camera.updateProjectionMatrix();
          this.cameraHelper.update();

          // 来原视野中不要绘制cameraHelper
          this.cameraHelper.visible = false;

          this.scene.background.set(0x000000);

          // 渲染
          this.renderer.render(this.scene, this.camera);
        }
        // 渲染第二台摄像机
        {
          const aspect = this.setScissorForElement(this.view2Elem);

          // 调整aspect
          this.camera2.aspect = aspect;
          this.camera2.updateProjectionMatrix();

          // 在第二台摄像机中绘制cameraHelper
          this.cameraHelper.visible = true;

          this.scene.background.set(0x000040);

          this.renderer.render(this.scene, this.camera2);
        }

        requestAnimationFrame(this.animate);
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
