<template>
  <div>
    <canvas class="threeCanvas" ref="threeCanvas"></canvas>
  </div>
</template>
<script>
  import * as THREE from "three";
  import { GUI } from "three/addons/libs/lil-gui.module.min.js";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
  import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
  import {
    ColorGUIHelper,
    DegRadHelper,
  } from "../public/html&js/three3D/ThreeGUIHelper";
    import {createSharpStarMesh} from "../public/html&js/three3D/starMesh.js"
    import {getLogBySvg} from "../public/html&js/three3D/somelogosMesh.js"
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
        RectAreaLightUniformsLib.init();
        // 视角控制器
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.target.set(1, 5, 10);
        this.controls.update();

        // 光源
        //this.createHemisphereLight();
        // this.createDicLight();
        this.createPointLight();
        // this.createSpotLight();
        // this.createRectAreaLight();
        const planeSize = 40;
        // 纹理
        this.texture = this.createTexture(planeSize);

        const plan = this.createPalnMesh(this.texture, planeSize);
        this.scene.add(plan);
        const box = this.createBoxMesh();
        this.scene.add(box);
        const sphere = this.createSphere();
        this.scene.add(sphere);


        const star = createSharpStarMesh();
        star.position.set(0,5,0);
        star.rotation.set(Math.PI,0,0);
        this.scene.add(star);

        getLogBySvg("https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/github.svg",1).then(meshes => {
          if (!meshes || meshes.length === 0) {
            console.error('未生成任何mesh，请检查SVG路径和内容');
            return;
          }
          meshes.forEach(mesh => {
            this.scene.add(mesh);  
          });
        });

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
      // gui 设置坐标
      makeXYZGUI(gui, vector3, name, onChangeFn) {
        const folder = gui.addFolder(name);
        folder.add(vector3, "x", -10, 10).onChange(onChangeFn);
        folder.add(vector3, "y", 0, 10).onChange(onChangeFn);
        folder.add(vector3, "z", -10, 10).onChange(onChangeFn);
        folder.open();
      },

      createCamera() {
        const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
        camera.position.set(0, 10, 20);
        // camera.up.set(0, 0, 1);
        // camera.lookAt(0, 0, 0);
        return camera;
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

        const gui = new GUI();
        gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
        gui.add(light, "intensity", 0, 5, 0.01);
        // 光的辅助线
        const helper = new THREE.DirectionalLightHelper(light);
        this.scene.add(helper);

        function updateLight() {
          light.target.updateMatrixWorld();
          helper.update();
        }
        updateLight();

        this.makeXYZGUI(gui, light.position, "position", updateLight);
        this.makeXYZGUI(gui, light.target.position, "target", updateLight);

        this.scene.add(light);
      },

      // 点光源
      createPointLight() {
        const color = 0xffffff;
        const intensity = 150;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(0, 10, 0);
        this.scene.add(light);
        // 点光源的辅助线
        const helper = new THREE.PointLightHelper(light);
        this.scene.add(helper);

        function updateLight() {
          helper.update();
        }
        updateLight();
        const gui = new GUI();
        gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
        gui.add(light, "intensity", 0, 250, 1);
        gui.add(light, "distance", 0, 40).onChange(updateLight);
        this.makeXYZGUI(gui, light.position, "position", updateLight);
      },
      // 聚光灯
      createSpotLight() {
        const color = 0xffffff;
        const intensity = 150;
        const light = new THREE.SpotLight(color, intensity);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);
        this.scene.add(light);

        const helper = new THREE.SpotLightHelper(light);
        this.scene.add(helper);

        function updateLight() {
          light.target.updateMatrixWorld();
          helper.update();
        }
        updateLight();
        const gui = new GUI();
        gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
        gui.add(light, "intensity", 0, 250, 1);
        gui.add(light, "distance", 0, 40).onChange(updateLight);
        this.makeXYZGUI(gui, light.position, "position", updateLight);
        gui
          .add(new DegRadHelper(light, "angle"), "value", 0, 90)
          .name("angle") // 控制角度
          .onChange(updateLight);
        gui.add(light, "penumbra", 0, 1, 0.01); // 控制半影
        this.makeXYZGUI(gui, light.target.position, "target", updateLight);
      },

      // 矩形区域光 只能作用于 MeshStandardMaterial   MeshPhysicalMaterial 材质
      createRectAreaLight() {
        const color = 0xffffff;
        const intensity = 5;
        const width = 12;
        const height = 4;
        const light = new THREE.RectAreaLight(color, intensity, width, height);
        light.position.set(0, 10, 0);
        light.rotation.x = THREE.MathUtils.degToRad(-90);
        this.scene.add(light);

        const helper = new RectAreaLightHelper(light);
        light.add(helper);

        const gui = new GUI();
        gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
        gui.add(light, "intensity", 0, 10, 0.01);
        gui.add(light, "width", 0, 20);
        gui.add(light, "height", 0, 20);
        gui
          .add(new DegRadHelper(light.rotation, "x"), "value", -180, 180)
          .name("x rotation");
        gui
          .add(new DegRadHelper(light.rotation, "y"), "value", -180, 180)
          .name("y rotation");
        gui
          .add(new DegRadHelper(light.rotation, "z"), "value", -180, 180)
          .name("z rotation");

        this.makeXYZGUI(gui, light.position, "position");
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
