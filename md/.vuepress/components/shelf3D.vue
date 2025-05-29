<template>
  <div class="book-shelf-container">
    <canvas ref="canvas" class="book-shelf-canvas"></canvas>
  </div>
</template>

<script>
  import * as THREE from "three";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import gsap from "gsap";
  export default {
    name: "BookShelf",
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
        this.books = [];
        this.canvas = this.$refs.canvas;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        // 1. 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // 2. 创建相机
        this.camera = new THREE.PerspectiveCamera(
          45,
          width / height,
          0.1,
          1000
        );
        this.camera.position.set(0, 5, 15);

        // 鼠标 和射线
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        // 3. 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
        });
        this.renderer.setSize(width, height);
        // this.renderer.shadowMap.enabled = true; // 启用阴影
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 尝试不同的阴影类型
        this.renderer.setPixelRatio(window.devicePixelRatio); // 解决模糊问题

        // 4. 添加灯光
        this.addLights();

        // 5. 创建书架
        this.createBookShelf();

        // 6. 加载书籍
        this.loadBooks();

        // 7. 添加事件监听器
        this.addEventListeners();

        /**参数是坐标轴的长度，单位是 Three.js 的单位 (默认为 1)
         * 坐标轴颜色
          红色 (Red): X 轴
          绿色 (Green): Y 轴
          蓝色 (Blue): Z 轴
         */
        const axesHelper = new THREE.AxesHelper(9);
        this.scene.add(axesHelper);

        // 8. 添加控制器
        this.controls = new OrbitControls(
          this.camera,
          this.renderer.domElement
        );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
      },
      threeJsAnimate() {
        this.animationFrameId = requestAnimationFrame(this.threeJsAnimate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      },
      addLights() {
        const ambientLight = new THREE.AmbientLight(0x404040); // 柔和的环境光
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // 平行光
        directionalLight.position.set(1, 1, 1).normalize();
        this.scene.add(directionalLight);

        const shadowLight = new THREE.DirectionalLight(0xffffff, 0.5);
        shadowLight.position.set(5, 5, 5);
        // shadowLight.castShadow = true;
        // shadowLight.shadow.mapSize.width = 512;
        // shadowLight.shadow.mapSize.height = 512;
        this.scene.add(shadowLight);
      },
      createBookShelf() {
        const shelfWidth = 10;
        const shelfHeight = 0.2;
        const shelfDepth = 3;
        const shelfSpacing = 2; // 书架层之间的间距
        const numShelves = 3;

        for (let i = 0; i < numShelves; i++) {
          const shelfGeometry = new THREE.BoxGeometry(
            shelfWidth,
            shelfHeight,
            shelfDepth
          );
          const shelfMaterial = new THREE.MeshLambertMaterial({
            color: 0x8b4513,
          }); // 棕色
          const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
          shelf.position.set(0, i * (shelfHeight + shelfSpacing), 0);
          // shelf.receiveShadow = true;
          this.scene.add(shelf);
        }
      },
      async loadBooks() {
        const loader = new GLTFLoader();
        const bookContentArr = [
          {
            fileUrl: "/models/book.glb",
            name: "book1",
            url: "content/draw/bigDraw",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book2",
            url: "content/draw/draw",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book3",
            url: "content/tool/fluid",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book4",
            url: "content/tool/hug",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book5",
            url: "content/tool/three/shelf3D",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book6",
            url: "content/tool/three/testThree",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book7",
            url: "content/vuepress部署",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book8",
            url: "content/write/badMood",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book9",
            url: "content/write/disenchantment",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book10",
            url: "content/write/faith",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book11",
            url: "content/write/iosPriBlue",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book12",
            url: "content/write/love",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book13",
            url: "content/write/operationRecord",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book14",
            url: "content/write/peoples",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book15",
            url: "content/write/songs",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book16",
            url: "content/write/sources",
          },
          {
            fileUrl: "/models/book.glb",
            name: "book17",
            url: "content/write/this is water 读后感",
          },
        ];

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
        };
        // book.scale.set(1, 1, 0.8); // 调整书籍大小
        book.scale.set(2, 2, 1.6); // 调整书籍大小
        book.position.set(state.currentX, state.shelfLevel * 2.2 + 1.2, 0);

        book.rotation.x = Math.PI / 2; // 旋转书籍使其面对相机
        book.rotation.z = -Math.PI / 2;
        // book.castShadow = true;
        // book.receiveShadow = true;

        book.traverse((child) => {
          if (child.isObject3D) {
            child.userData.book = book;
          }
          if (child instanceof THREE.Mesh) {
            child.material.emissive = black; // 黑色
            child.material.emissiveIntensity = 0;
          }
        });

        this.scene.add(book);
        this.books.push(book); // 将书籍添加到数组中

        // 更新位置
        state.currentX += bookWidth * 1.2; // 调整书籍之间的间距
        state.bookIndex++;

        if (state.currentX > shelfWidth / 2 - bookWidth) {
          // 换到下一层书架
          state.shelfLevel++;
          state.currentX = -shelfWidth / 2 + bookWidth;
        }
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
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 检测射线与书籍的相交
        const intersects = this.raycaster.intersectObjects(this.books, true);
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
          this.extractBook(this.selectedBook);
        }
      },
      onWindowResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      },
      highlightBook(book) {
        // 取消之前选中书籍的高亮
        this.unhighlightBook();

        this.selectedBook = book;
        // 对选中的书籍进行高亮显示 (例如，改变颜色)
        this.selectedBook.traverse((child) => {
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
      },
      unhighlightBook() {
        if (this.selectedBook) {
          // 恢复之前选中书籍的颜色
          this.selectedBook.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material.emissive = new THREE.Color(0x000000); // 黑色
              child.material.emissiveIntensity = 0;
            }
          });
          this.selectedBook = null;
        }
      },
      extractBook(book) {
        // Store the original z position for later restoration
        const originalZ = book.position.z;

        gsap.to(book.position, {
          z: book.position.z + 1,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            // Navigate after animation
            if (book.userData.url) {
              //路由跳转
              window.open(book.userData.url, "_blank");
            }

            //  Animate back to the original position after navigating
            gsap.to(book.position, {
              z: originalZ, // Animate back to the stored original z position
              duration: 0.5, // Use the same duration as the original animation
              ease: "power2.out",
            });
            this.unhighlightBook();
          },
        });
      },
    },
  };
</script>

<style scoped>
  .book-shelf-container {
    width: 100%;
    height: 500px; /* 调整高度 */
  }

  .book-shelf-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    z-index: 999;
  }
</style>
