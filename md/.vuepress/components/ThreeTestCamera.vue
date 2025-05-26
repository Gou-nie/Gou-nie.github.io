<template>
    <div>
      <canvas class="threeCanvas" ref="threeCanvas"></canvas>
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
        scene.background = new THREE.Color('#aaa')
        const canvas = this.$refs.threeCanvas
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        // 要更新旋转角度的对象数组
        const objects = [];
        
        // 一球多用
        const radius = 1;
        const widthSegments = 6;
        const heightSegments = 6;
        const sphereGeometry = new THREE.SphereGeometry(
        radius,
        widthSegments,
        heightSegments
        );



        const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
        const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
        sunMesh.scale.set(5, 5, 5); // 扩大太阳的大小
        scene.add(sunMesh);
        objects.push(sunMesh);

        {

            const color = 0xFFFFFF;
            const intensity = 500;
            const light = new THREE.PointLight( color, intensity );
            scene.add( light );

        }
        const fov = 40;
        const aspect = 2; // the canvas default
        const near = 0.1;
        const far = 1000;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 50, 0);
        camera.up.set(0, 0, 1);
        camera.lookAt(0, 0, 0);
        const earthMaterial = new THREE.MeshPhongMaterial({
  color: 0x2233ff,
  emissive: 0x112244,
});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
earthMesh.position.x = 10;
scene.add(earthMesh);
objects.push(earthMesh);

        function resizeRendererToDisplaySize( renderer ) {

            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if ( needResize ) {

                renderer.setSize( width, height, false );

            }

            return needResize;

        }
        function render( time ) {

            time *= 0.001;

            if ( resizeRendererToDisplaySize( renderer ) ) {

                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();

            }

            objects.forEach( ( obj ) => {

                obj.rotation.y = time;

            } );

            renderer.render( scene, camera );

            requestAnimationFrame( render );

        }

        render();

      
        
      }
    }
  }
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