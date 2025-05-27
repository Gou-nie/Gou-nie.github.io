<template>
  <div>
    <canvas class="threeCanvas" ref="threeCanvas"></canvas>
  </div>
</template>

<script>
  import * as THREE from "three";
  import { GUI } from "three/addons/libs/lil-gui.module.min.js";
  import { AxisGridHelper } from "../public/html&js/three3D/AxisGridHelper.js";
  export default {
    data() {
      return {};
    },
    mounted() {
      this.initThree();
    },
    methods: {
      initThree() {
        this.scene = this.createScene();

        const canvas = this.$refs.threeCanvas;
        this.renderer = this.createRenderer(canvas);

        this.camera = this.createCamera();

        this.objects = [];
        const gui = new GUI();
        // 太阳轨道
        const solarSystem = new THREE.Object3D();
        this.scene.add(solarSystem);
        this.objects.push(solarSystem);

        const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
        const sunMesh = this.createSphere(sunMaterial, [0, 0, 0], [5, 5, 5]);
        solarSystem.add(sunMesh);
        this.objects.push(sunMesh);

        const light = this.createLight();
        this.scene.add(light);

        //地球轨道
        const earthOrbit = new THREE.Object3D();
        earthOrbit.position.x = 10;
        solarSystem.add(earthOrbit);
        this.objects.push(earthOrbit);

        const earthMaterial = new THREE.MeshPhongMaterial({
          color: 0x2233ff,
          emissive: 0x112244,
        });
        const earthMesh = this.createSphere(earthMaterial, [0, 0, 0]);
        earthOrbit.add(earthMesh);
        this.objects.push(earthMesh);

        const moonOrbit = new THREE.Object3D();
        moonOrbit.position.x = 2;
        earthOrbit.add(moonOrbit);
        // 月亮
        const moonMaterial = new THREE.MeshPhongMaterial({
          color: 0x888888,
          emissive: 0x222222,
        });
        const moonMesh = this.createSphere(
          moonMaterial,
          [0, 0, 0],
          [0.5, 0.5, 0.5]
        );
        moonOrbit.add(moonMesh);
        this.objects.push(moonMesh);

        // this.objects.forEach((node) => {
        //   const axes = new THREE.AxesHelper();
        //   axes.material.depthTest = false;
        //   axes.renderOrder = 1;
        //   node.add(axes);
        // });

        function makeAxisGrid(node, label, units) {
          const helper = new AxisGridHelper(node, units);
          gui.add(helper, "visible").name(label);
        }

        makeAxisGrid(solarSystem, "solarSystem", 25);
        makeAxisGrid(sunMesh, "sunMesh");
        makeAxisGrid(earthOrbit, "earthOrbit");
        makeAxisGrid(earthMesh, "earthMesh");
        makeAxisGrid(moonOrbit, "moonOrbit");
        makeAxisGrid(moonMesh, "moonMesh");

        requestAnimationFrame(this.renderLoop);
      },

      createScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#aaa");
        return scene;
      },

      createRenderer(canvas) {
        return new THREE.WebGLRenderer({ canvas, antialias: true });
      },

      createCamera() {
        const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 1000);
        camera.position.set(0, 50, 0);
        camera.up.set(0, 0, 1);
        camera.lookAt(0, 0, 0);
        return camera;
      },

      createLight() {
        return new THREE.PointLight(0xffffff, 500);
      },

      createSphere(material, position = [0, 0, 0], scale = [1, 1, 1]) {
        const geometry = new THREE.SphereGeometry(1, 6, 6);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position);
        mesh.scale.set(...scale);
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

      renderLoop(time) {
        time *= 0.001;

        if (this.resizeRendererToDisplaySize(this.renderer)) {
          const { clientWidth, clientHeight } = this.renderer.domElement;
          this.camera.aspect = clientWidth / clientHeight;
          this.camera.updateProjectionMatrix();
        }

        this.objects.forEach((obj) => {
          obj.rotation.y = time;
        });

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.renderLoop);
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
