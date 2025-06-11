<template>
  <div class="book-shelf-container">
    <starrySky :stars-count="1000" :distance="1000"/>
    <canvas ref="canvas" class="book-shelf-canvas"></canvas>
    <div class="overlay-text">
      {{ dynamicText }}
    </div>
  </div>
</template>

<script>
  import starrySky from "./starry-sky.vue";
  import * as THREE from "three";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import gsap from "gsap";
  import {createVerticalTextPlane } from "../public/html&js/three3D/ThreeStrFunc.js";
  import bookArr from "../public/html&js/content/BookContentArr.js";
  import {createMaterial,resizeRendererToDisplaySize  } from "../public/html&js/three3D/ThreeCommon.js";
import StarrySky from "./starry-sky.vue";
  export default {
    name: "BookShelf",
    components: {
      starrySky,
    },
    data() {
      return {
        dynamicText: "",
      };
    },
    mounted() {
      this.init();

      this.threeJsAnimate();
    },
    beforeUnmount() {
      // 取消动画循环
      cancelAnimationFrame(this.animationFrameId);

      // 释放控制器资源
      this.controls.dispose();

      // 释放场景中的几何体和材质
      this.scene.traverse((object) => {
        if (!object.isMesh) return; // 只处理网格对象

        object.geometry.dispose(); // 释放几何体

        if (object.material.isMaterial) {
          object.material.dispose(); // 释放材质
        } else {
          // 如果材质是材质数组 (例如，MultiMaterial)
          for (const material of object.material) {
            material.dispose();
          }
        }
      });

      // 清空场景
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }

      // 释放渲染器资源
      this.renderer.dispose();
      this.renderer.forceContextLoss(); // 强制释放 WebGL 上下文 (谨慎使用)

      this.canvas.removeEventListener("mousemove", this.onMouseMove);
      this.canvas.removeEventListener("click", this.onMouseClick);
      window.removeEventListener("resize", this.onWindowResize);
      // 设置为 null，防止后续访问
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.controls = null;
      this.books = [];
      this.selectedBook = null;
      this.animationFrameId = null;
    },
    methods: {
      init() {
        this.isExtract = false;
        this.text3D = null;
        this.books = [];
        this.canvas = this.$refs.canvas;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        // 1. 创建场景
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color(0xf0f0f0);

        // 2. 创建相机
        this.camera = new THREE.PerspectiveCamera(
          100,
          width / height,
          0.1,
          1000
        );
        this.camera.position.set(5, 8, 15);
        // 鼠标 和射线
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        // 3. 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          alpha: true,
        });
        this.renderer.setSize(width, height);
        // this.renderer.shadowMap.enabled = true; // 启用阴影
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 尝试不同的阴影类型
        this.renderer.setPixelRatio(window.devicePixelRatio); // 解决模糊问题

        // 4. 添加灯光
        this.addLights();
        
        let shelfBoardDepth = 3;
        // 4.5 添加墙
        const planeSize = 10;
        let texture  = this.createTexture("/images/brickWall.jpg",planeSize);
        const plan = this.createWallMesh(texture, planeSize,shelfBoardDepth);
        this.scene.add(plan);

        let textures = [
            texture,
            texture,
            texture,
            texture,
            texture,
            texture,
        ];
        // // 5. 创建书架
        this.createBookShelf(10,0.2,shelfBoardDepth,textures);

        // // 6. 加载书籍
        this.loadBooks();

        // 7. 添加事件监听器
        this.addEventListeners();

        /**参数是坐标轴的长度，单位是 Three.js 的单位 (默认为 1)
         * 坐标轴颜色
          红色 (Red): X 轴
          绿色 (Green): Y 轴
          蓝色 (Blue): Z 轴
         */
        // const axesHelper = new THREE.AxesHelper(9);
        // this.scene.add(axesHelper);
        //环形节
        this.torus = this.createTorusKnotGeometry();
        this.torus .position.set(0, 8, 0);
        this.scene.add(this.torus);
        
        // 8. 添加控制器
        this.controls = new OrbitControls(
          this.camera,
          this.renderer.domElement
        );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
      },
      threeJsAnimate(time) {
        
        time*=0.0008;
        
        // this.torus.rotation.x = time;
        // this.torus.rotation.y = time;
        this.torus.rotation.z = time;
        if(time%10==0){
          console.log(time,"--------------- time is ");
          this.torus.color = createMaterial();
        }
        
        const canvas = this.renderer.domElement;
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();

        if (resizeRendererToDisplaySize(this.renderer)) {
          console.log("resizeRendererToDisplaySize")
          const canvas = this.renderer.domElement;
          this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
          this.camera.updateProjectionMatrix();
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = requestAnimationFrame(this.threeJsAnimate);
      },
      addLights() {
        const ambientLight = new THREE.AmbientLight(0x404040); // 柔和的环境光
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // 平行光
        directionalLight.position.set(1, 1, 1).normalize();
        this.scene.add(directionalLight);

        const shadowLight = new THREE.DirectionalLight(0xffffff, 0.5);
        shadowLight.position.set(5, 5, 5);
        this.scene.add(shadowLight);
      },


      createTexture(url,planeSize) {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(url);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        // 计算需要重复多少次才能让纹理保持原始大小
        // 假设你的砖墙纹理是1m×1m的实际尺寸
        const textureSize = 5; // 根据你的纹理实际尺寸调整这个值
        const repeats = planeSize / textureSize;
        texture.repeat.set(repeats, repeats);
        return texture;
      },
      createWallMesh(texture, planeSize,shelfBoardDepth) {
        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshStandardMaterial({
          roughness: 0.9, 
          metalness:0.2,
          // clearCoatRoughness:0.3,
          map: texture,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI;
        mesh.position.z = -shelfBoardDepth/2;
        mesh.position.y = planeSize/2;
        return mesh;
      },
      createFloorMesh(texture, planeSize) {
        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -0.5;
        mesh.userData.isPlane = true; // 添加标识
        return mesh;
      },

      createBookShelf(shelfWidth = 10, shelfHeight = 0.2, shelfDepth = 3,textures) {
        const shelfSpacing = 2; // 书架层之间的间距
        const numShelves = 4;

        for (let i = 0; i < numShelves; i++) {
          const shelfGeometry = new THREE.BoxGeometry(
            shelfWidth,
            shelfHeight,
            shelfDepth
          );
          let shelfMaterial;
          if(textures){
            shelfMaterial = textures.map(texture => new THREE.MeshStandardMaterial({ 
              map: texture,
              side: THREE.FrontSide, // 只渲染正面（可选）
            }));
          }else{
            shelfMaterial = new THREE.MeshLambertMaterial({
            color: 0xd4c17f
            }); // 棕色
          }


          const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
          shelf.position.set(0, i * (shelfHeight + shelfSpacing), 0);
          // shelf.receiveShadow = true;
          this.scene.add(shelf);
        }
      },
      async loadBooks() {
        const loader = new GLTFLoader();
        const bookContentArr =  bookArr;

        const shelfWidth = 10;
        // const bookWidth = 1;
        const bookWidth = 0.2;
        const black = new THREE.Color(0x000000); // 黑色
        let bookState = {
          currentX: -shelfWidth / 2 + bookWidth,
          shelfLevel: 0,
          bookIndex: 0,
        };
        let gltfCache = {};

        await this.loadBooksSequentially(
          bookContentArr,
          gltfCache,
          loader,
          bookState,
          bookWidth,
          shelfWidth,
          black
        );
      },
      // 使用 async 函数同步执行加载
      async loadBooksSequentially(
        bookContentArr,
        gltfCache,
        loader,
        bookState,
        bookWidth,
        shelfWidth,
        black
      ) {
        for (let index = 0; index < bookContentArr.length; index++) {
          const bookConfig = bookContentArr[index];

          if (gltfCache[bookConfig.fileUrl]) {
            const originalScene = gltfCache[bookConfig.fileUrl].scene;

            // 清空所有 userData 再 clone，避免循环引用
            originalScene.traverse((child) => {
              if (child.userData) {
                delete child.userData.book;
              }
            });

            const book = originalScene.clone();
            this.setUpBook(
              book,
              bookConfig,
              bookState,
              bookWidth,
              shelfWidth,
              black
            );
          } else {
            try {
              const gltf = await this.loadGLTFAsync(loader, bookConfig.fileUrl);
              gltfCache[bookConfig.fileUrl] = gltf;
              this.setUpBook(
                gltf.scene,
                bookConfig,
                bookState,
                bookWidth,
                shelfWidth,
                black
              );
            } catch (error) {
              console.error("加载失败", error);
            }
          }
        }
      },
      // 用 Promise 封装 loader.load 方法
      loadGLTFAsync(loader, url) {
        return new Promise((resolve, reject) => {
          loader.load(
            url,
            (gltf) => resolve(gltf),
            (xhr) => {
              console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            (error) => reject(error)
          );
        });
      },

      setUpBook(book, bookConfig, state, bookWidth, shelfWidth, black) {
        book.userData = {
          name: bookConfig.name,
          url: bookConfig.url,
          title: bookConfig.title
        };
        // book.scale.set(1, 1, 0.8); // 调整书籍大小
        // book.scale.set(2, 2, 1.6); // 调整书籍大小
        book.scale.set(0.01, 0.01,0.01); // 调整书籍大小
        // book.position.set(state.currentX, state.shelfLevel * 2.2 + 1.2, 0);
        // book.position.set(state.currentX, state.shelfLevel * 2.2 + 0.8, 0);

        book.rotation.x = Math.PI / 2; // 旋转书籍使其面对相机
        book.rotation.z = -Math.PI / 2;
        // book.castShadow = true;
        // book.receiveShadow = true;
        let text = createVerticalTextPlane(book.userData.title,0.2,1);
        
        // 设置 text 和 book 的相对位置（保持你原来的位移）
        text.position.set(0, 0.8, 0.66);  // 相对位置
        book.position.set(0, 0.8, 0);       // 相对位置

        // 创建组合容器
        const bookGroup = new THREE.Group();
        
        // 添加到 group 中
        bookGroup.add(book);
        bookGroup.add(text);
        bookGroup.userData = {
          name: bookConfig.name,
          url: bookConfig.url,
          title: bookConfig.title
        };
        bookGroup.position.set(state.currentX, state.shelfLevel * 2.2, 0);

        book.traverse((child) => {
          if (child.isObject3D) {
            child.userData.book = bookGroup;
          }
          if (child instanceof THREE.Mesh) {
            child.material.emissive = black; // 黑色
            child.material.emissiveIntensity = 0;
          }
        });

        // this.applyTextTexture(bookConfig.name);
        // text.position.set(state.currentX, state.shelfLevel * 2.2 + 0.8, 0.66);
        // this.scene.add(text);

        // this.scene.add(book);




        this.scene.add(bookGroup);
        this.books.push(bookGroup); // 将书籍添加到数组中

        // 更新位置
        // state.currentX += bookWidth * 1.2; // 调整书籍之间的间距
        state.currentX += bookWidth * 2; // 调整书籍之间的间距
        state.bookIndex++;

        if (state.currentX > shelfWidth / 2 - bookWidth) {
          // 换到下一层书架
          state.shelfLevel++;
          state.currentX = -shelfWidth / 2 + bookWidth;
        }
      },
      applyTextTexture(name,x,y,z) {

 
        
 
      },

      addEventListeners() {
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("click", this.onMouseClick);
        window.addEventListener("resize", this.onWindowResize);
      },
      onMouseMove(event) {
        // 计算鼠标位置
        this.mouse.x = (event.offsetX / this.canvas.clientWidth) * 2 - 1;
        this.mouse.y = -(event.offsetY / this.canvas.clientHeight) * 2 + 1;

        // 更新射线
        this.raycaster.setFromCamera(this.mouse, this.camera, 0.1, 100);
        // 检测射线与书籍的相交
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object.parent; // 获取书籍对象 (假设模型根节点是 parent)
          const intersectedBook = intersectedObject.userData.book; // 获取书籍对象
          if (intersectedBook && intersectedBook !== this.selectedBook) {
            // 如果选中了新的书籍
            this.highlightBook(intersectedBook);
          }
        } else {
          // 没有选中书籍，取消高亮
          this.unhighlightBook();
        }
      },
      onMouseClick() {
        if (this.selectedBook) {
          if(this.isExtract){
            this.isExtract = false;
            this.openBook(this.selectedBook);
          }else{
            this.isExtract = true;
            this.extractBook(this.selectedBook);
          }

        }
      },
      onWindowResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.render(this.scene, this.camera);
      },
      highlightBook(book) {
        // 取消之前选中书籍的高亮
        this.unhighlightBook();
        this.selectedBook = book;

        // 对选中的书籍进行高亮显示 (例如，改变颜色)
        this.selectedBook.children[0].traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material) {
              // 克隆材质，避免修改原始材质
              child.material = child.material.clone();
              child.material.emissive = new THREE.Color(0xffff00);
              child.material.emissiveIntensity = 0.5;
              child.material.needsUpdate = true; // 重要：通知 Three.js 更新
            }
          }
        });
        // const controller = new AbortController();
        // createTextMesh(book.userData.title, 0.2, 1, 3,  controller.signal)
        //   .then(mesh =>{
        //     console.log("回掉成功");
        //     this.text3D = mesh;
        //     this.scene.add(this.text3D);
        //   } )
        //   .catch(err => console.warn(err.message));


      },
      unhighlightBook() {
        if (this.selectedBook) {
          // 恢复之前选中书籍的颜色
          this.selectedBook.children[0].traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material.emissive = new THREE.Color(0x000000); // 黑色
              child.material.emissiveIntensity = 0;
            }
          });
          if(this.isExtract){
            gsap.to(this.selectedBook.position, {
              z: 0, //初始Z
              duration: 0.5, 
              ease: "power2.out",
            });
            this.isExtract = false;
          }
          this.dynamicText = "";
          this.selectedBook = null;
          // this.scene.remove(this.text3D);
          // this.controller.abort();

        }
      },
      extractBook(book) {
        this.dynamicText = book.userData.title;
        gsap.to(book.position, {
          z: book.position.z + 1,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            // console.log("Animation completed");
          },
        });
      },
      openBook(book) {
        // 实现打开书籍的逻辑
        console.log(`Opening book: ${book.userData.name}`);
        if (book.userData.url) {
          window.open(book.userData.url, "_self");
        }
        this.unhighlightBook();
      },
      createTorusKnotGeometry(){
        const radius =  0.5;  
        const tubeRadius =  0.2;  
        const radialSegments = 30;  
        const tubularSegments = 100;  
        const p =  2;  
        const q =  3;  
        const geometry = new THREE.TorusKnotGeometry(radius, tubeRadius, tubularSegments, radialSegments, p, q ); 

        const mesh = new THREE.Mesh(geometry, createMaterial());
        geometry.computeBoundingBox();
        geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

        return mesh;
      }
    },
  };
</script>

<style scoped>
  .book-shelf-container {
    width: 100%;
    height: 500px;  
  }

  .book-shelf-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    z-index: 101;
    /* background: url(../public/images/gif/heythatme-cloud.gif) no-repeat center center;
    background-size: cover; */
  }

  .overlay-text {
  position: absolute;
  top: 50px; /* Adjust top position as needed */
  left: 50%;
  transform: translateX(-50%);
  color: white; /* Or any color you prefer */
  font-size: 24px; /* Adjust font size as needed */
  font-weight: bold;
  text-shadow: 2px 2px 4px #000000; /* Add shadow for better readability */
  z-index: 1000; /* Ensure it's above the canvas */
  pointer-events: none; /*  So the text doesn't prevent interacting with the canvas */
}
</style>
