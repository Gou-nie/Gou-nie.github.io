<template>
  <div>
    <canvas ref="bjsCanvas" style="width: 100%; height: 600px"></canvas>
    <div v-if="loadingMessage" class="loading-overlay">
      {{ loadingMessage }}
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from "vue";
  import * as BABYLON from "@babylonjs/core";
  // 必须导入加载器才能使用 SceneLoader 加载 GLB/GLTF 文件
  import "@babylonjs/loaders/glTF"; // For GLTF and GLB files
  // import '@babylonjs/loaders/OBJ'; // If you were to use OBJ files

  const bjsCanvas = ref(null);
  const loadingMessage = ref("Loading 3D Scene...");
  let engine = null;
  let scene = null;
  let bookTemplateMesh = null; // 用于存储加载的书籍模型模板

  // 初始化Babylon引擎和场景
  const createScene = async (canvas) => {
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);

    // 1. 设置相机
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      new BABYLON.Vector3(0, 2, 0),
      scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 20;

    // 2. 设置灯光
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.7;
    const light2 = new BABYLON.PointLight(
      "pointLight",
      new BABYLON.Vector3(0, 3, -3),
      scene
    );
    light2.intensity = 0.5;

    // 3. 创建一个简单的地面/架子
    const shelf = BABYLON.MeshBuilder.CreateBox(
      "shelf",
      { width: 5, height: 0.2, depth: 1.5 },
      scene
    );
    shelf.position.y = 0;
    const shelfMaterial = new BABYLON.StandardMaterial("shelfMat", scene);
    shelfMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2); // 木头棕色
    shelf.material = shelfMaterial;

    // 4. 异步加载书籍模型
    loadingMessage.value = "Loading Book Model...";
    try {
      // 假设你的模型在 public/models/book.glb
      // 第一个参数 "" 表示加载文件中的所有网格
      // 第二个参数是模型的根URL (相对于 public 目录)
      // 第三个参数是模型文件名
      const result = await BABYLON.SceneLoader.ImportMeshAsync(
        "", // meshNames (string[]), empty string for all
        "./models/", // rootUrl
        "book.glb", // sceneFilename
        scene
      );

      if (result.meshes && result.meshes.length > 0) {
        // 获取加载的第一个网格作为模板 (通常是模型的根节点)
        // 如果你的模型有多个部分，你可能需要处理 result.meshes[0] 的子节点
        bookTemplateMesh = result.meshes[0];
        bookTemplateMesh.name = "bookTemplate";

        // --- 非常重要：根据你的模型调整 ---
        // 模型加载后可能非常大或非常小，或者朝向不对，需要调整
        // bookTemplateMesh.scaling.setAll(0.05); // 例如，缩小到原来的5%
        // bookTemplateMesh.rotation.y = Math.PI / 2; // 例如，旋转90度

        // 将模板设置为不可见，我们只会显示它的克隆体
        bookTemplateMesh.setEnabled(false); // 或者 bookTemplateMesh.isVisible = false;

        loadingMessage.value = "Placing books...";
        populateShelfWithModels(shelf, scene); // 使用加载的模型填充书架
      } else {
        console.error("Book model loaded, but no meshes found.");
        loadingMessage.value =
          "Error loading book model. Using fallback boxes.";
        populateShelfWithBoxes(shelf, scene); // 模型加载失败，使用Box作为后备
      }
    } catch (error) {
      console.error("Error loading book model:", error);
      loadingMessage.value = "Error loading book model. Using fallback boxes.";
      populateShelfWithBoxes(shelf, scene); // 模型加载失败，使用Box作为后备
    } finally {
      // 即使模型加载失败，也可能需要一段时间才显示后备方案
      // 可以设置一个短暂的延迟或者直接清除
      setTimeout(() => {
        loadingMessage.value = "";
      }, 1000);
    }

    return scene;
  };

  // 使用加载的3D模型填充书架
  const populateShelfWithModels = (shelf, scene) => {
    if (!bookTemplateMesh) {
      console.warn("Book template not loaded. Cannot place models.");
      return;
    }

    const numBooks = 8;
    const bookBaseWidth = 0.2; // 假设书本的基础宽度，用于间隔
    const shelfWidth = 5; // 和上面创建的shelf的width一致
    const startX = -shelfWidth / 2 + bookBaseWidth * 1.5; // 起始位置

    for (let i = 0; i < numBooks; i++) {
      // 克隆模板模型来创建新的书本实例
      const bookInstance = bookTemplateMesh.clone(`book_${i}`);
      bookInstance.setEnabled(true); // 使克隆体可见

      // --- 定位和旋转克隆体 ---
      // 这部分非常依赖你的模型原始的尺寸、朝向和中心点
      // 你需要反复试验来找到正确的值

      // 获取模型边界，以便更精确地定位 (可选，但推荐)
      // 注意：如果模型有复杂的层级，getHierarchyBoundingVectors 可能更准确
      const bounds = bookInstance.getHierarchyBoundingVectors(true);
      const modelHeight =
        (bounds.max.y - bounds.min.y) * bookInstance.scaling.y; // 乘以当前的缩放
      // const modelWidth = (bounds.max.x - bounds.min.x) * bookInstance.scaling.x;
      const modelDepth = (bounds.max.z - bounds.min.z) * bookInstance.scaling.z;

      bookInstance.position.x = startX + i * (bookBaseWidth * 1.2); // X轴排列，带一点间隔
      // Y轴位置：架子高度 + 模型高度的一半 (确保书的底部在架子上)
      bookInstance.position.y =
        shelf.position.y +
        (shelf.scaling.y * 0.2) / 2 /*架子厚度一半*/ +
        modelHeight / 2;
      bookInstance.position.z =
        shelf.position.z + (Math.random() - 0.5) * (1.5 - modelDepth) * 0.4; // Z轴上轻微随机偏移

      // 旋转 (示例：让书本稍微倾斜)
      bookInstance.rotation.y = (Math.random() - 0.5) * 0.1; // 轻微的Y轴旋转
      bookInstance.rotation.z = (Math.random() - 0.5) * 0.3; // 轻微的Z轴倾斜

      // (可选) 给每本书不同的材质或颜色变体
      // 如果模型有多个子网格且共享材质，克隆材质可能更复杂
      // 如果模型本身就有材质，通常克隆后也会有
      // 若要修改，例如：
      // const newMaterial = bookInstance.material.clone("bookMat_" + i);
      // newMaterial.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
      // bookInstance.material = newMaterial;
      // 如果模型是多部分的，可能需要遍历子网格并应用材质：
      // bookInstance.getChildMeshes().forEach(childMesh => {
      //   if (childMesh.material) {
      //     const childMat = childMesh.material.clone(`${childMesh.name}_mat_${i}`);
      //     childMat.diffuseColor = new BABYLON.Color3(Math.random() * 0.8, Math.random() * 0.8, Math.random() * 0.8);
      //     childMesh.material = childMat;
      //   }
      // });
    }
  };

  // 后备函数：如果模型加载失败，则创建立方体书本
  const populateShelfWithBoxes = (shelf, scene) => {
    const numBooks = 8;
    const bookWidth = 0.25,
      bookHeight = 1,
      bookDepth = 0.8;
    const shelfWidth = 5;
    const startX = -shelfWidth / 2 + bookWidth * 1.5;

    for (let i = 0; i < numBooks; i++) {
      const book = BABYLON.MeshBuilder.CreateBox(
        `fallback_book_${i}`,
        {
          width: bookWidth,
          height: bookHeight,
          depth: bookDepth,
        },
        scene
      );

      book.position.x = startX + i * (bookWidth * 1.2);
      book.position.y =
        shelf.position.y + (shelf.scaling.y * 0.2) / 2 + bookHeight / 2;
      book.position.z =
        shelf.position.z + (Math.random() - 0.5) * (1.5 - bookDepth) * 0.4;

      book.rotation.z = (Math.random() - 0.5) * 0.3;

      const bookMaterial = new BABYLON.StandardMaterial(
        `fallback_bookMat_${i}`,
        scene
      );
      bookMaterial.diffuseColor = new BABYLON.Color3(
        Math.random() * 0.7,
        Math.random() * 0.7,
        Math.random() * 0.7
      );
      book.material = bookMaterial;
    }
  };

  onMounted(() => {
    if (bjsCanvas.value) {
      createScene(bjsCanvas.value)
        .then((createdScene) => {
          scene = createdScene;
          if (!scene) {
            console.error("Scene not created!");
            loadingMessage.value = "Failed to initialize 3D scene.";
            return;
          }
          engine.runRenderLoop(() => {
            if (scene && scene.activeCamera) {
              // 确保相机和场景都准备好了
              scene.render();
            }
          });
        })
        .catch((error) => {
          console.error("Error in onMounted scene creation:", error);
          loadingMessage.value = "Error initializing 3D scene.";
        });
    }
    window.addEventListener("resize", handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    if (engine) {
      engine.dispose();
      engine = null;
      scene = null;
      bookTemplateMesh = null;
    }
  });

  const handleResize = () => {
    if (engine) {
      engine.resize();
    }
  };
</script>

<style scoped>
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    z-index: 10;
  }
  canvas {
    display: block; /* 避免底部出现小间隙 */
    touch-action: none; /* 避免在触摸设备上滚动页面 */
  }
</style>
