<template>
  <div class="bookshelf-container">
    <canvas ref="canvasRef"></canvas>
    <div v-if="isLoading" class="loading-overlay">Loading 3D Scene...</div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, reactive } from "vue";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; // Optional, if you have book models
  import gsap from "gsap";

  const canvasRef = ref(null);
  const isLoading = ref(true);

  let scene, camera, renderer, controls;
  let raycaster, mouse;
  let INTERSECTED; // For hover highlight
  let books = []; // To store book meshes and their data

  // --- Configuration ---
  const shelfConfig = {
    width: 5,
    height: 0.1,
    depth: 1,
    levels: 3,
    levelHeight: 1.5, // Vertical distance between shelves
    material: new THREE.MeshStandardMaterial({ color: 0x8b4513 }), // Brown wood
  };

  const bookConfig = {
    minWidth: 0.2,
    maxWidth: 0.4,
    minHeight: 0.8,
    maxHeight: 1.2,
    depth: 0.8, // Slightly less than shelf depth
    colors: [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0x808080,
      0xa9a9a9, 0x008000, 0x800080,
    ],
    highlightEmissive: 0x555500, // Yellowish emissive for highlight
  };

  // Example book data (URL, and optionally a title or texture)
  const bookData = [
    { url: "https://www.google.com", title: "Google Book" },
    { url: "https://www.wikipedia.org", title: "Wiki Book" },
    { url: "https://developer.mozilla.org", title: "MDN Book" },
    { url: "https://threejs.org", title: "Three.js Docs" },
    { url: "https://vuejs.org", title: "Vue.js Docs" },
    { url: "https://github.com", title: "GitHub Projects" },
    { url: "https://stackoverflow.com", title: "StackOverflow Q&A" },
    { url: "https://news.ycombinator.com", title: "Hacker News" },
    { url: "https://www.amazon.com", title: "Amazon Shopping" },
    { url: "https://www.nytimes.com", title: "NY Times" },
    { url: "https://www.bbc.com/news", title: "BBC News" },
  ];

  // --- Three.js Initialization ---
  function initThree() {
    if (!canvasRef.value) return;
    isLoading.value = true;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, shelfConfig.levelHeight * 1.5, 5); // Position camera to see the shelves

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // Enable shadows

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, shelfConfig.levelHeight, 0); // Target the center of the bookshelf

    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Create Bookshelf and Books
    createBookshelf();
    placeBooks();

    // Add event listeners
    window.addEventListener("resize", onWindowResize);
    canvasRef.value.addEventListener("mousemove", onMouseMove);
    canvasRef.value.addEventListener("click", onClick);

    isLoading.value = false;
    animate();
  }

  // --- Create Geometry ---
  function createBookshelf() {
    const shelfGeometry = new THREE.BoxGeometry(
      shelfConfig.width,
      shelfConfig.height,
      shelfConfig.depth
    );
    for (let i = 0; i < shelfConfig.levels; i++) {
      const shelf = new THREE.Mesh(shelfGeometry, shelfConfig.material);
      shelf.position.y = i * shelfConfig.levelHeight;
      shelf.receiveShadow = true; // Shelves can receive shadows
      scene.add(shelf);
    }
  }

  function placeBooks() {
    let bookIndex = 0;
    for (let i = 0; i < shelfConfig.levels; i++) {
      let currentX = -shelfConfig.width / 2 + bookConfig.maxWidth / 2 + 0.1; // Start from left
      const shelfY = i * shelfConfig.levelHeight + shelfConfig.height / 2;

      // Place a few books per shelf, until we run out of bookData or space
      for (let j = 0; j < 5 && bookIndex < bookData.length; j++) {
        // Max 5 books per shelf or as many as in bookData
        if (currentX + bookConfig.maxWidth / 2 > shelfConfig.width / 2) break; // No more space on this shelf

        const bookHeight = THREE.MathUtils.randFloat(
          bookConfig.minHeight,
          bookConfig.maxHeight
        );
        const bookWidth = THREE.MathUtils.randFloat(
          bookConfig.minWidth,
          bookConfig.maxWidth * 0.8
        ); // Make books a bit thinner than max to fit more
        const bookGeometry = new THREE.BoxGeometry(
          bookWidth,
          bookHeight,
          bookConfig.depth
        );

        const bookMaterial = new THREE.MeshStandardMaterial({
          color: bookConfig.colors[bookIndex % bookConfig.colors.length],
          roughness: 0.7,
          metalness: 0.1,
        });

        const book = new THREE.Mesh(bookGeometry, bookMaterial);
        book.position.set(
          currentX,
          shelfY + bookHeight / 2,
          0 // Centered on shelf depth
        );
        book.castShadow = true;
        book.userData = {
          url: bookData[bookIndex].url,
          title: bookData[bookIndex].title,
          originalPositionZ: book.position.z,
          originalEmissive: book.material.emissive.getHex(),
          isPulledOut: false,
        };

        scene.add(book);
        books.push(book);

        currentX += bookWidth + 0.05; // Add book width and a small gap
        bookIndex++;
      }
    }
  }

  // --- Event Handlers ---
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(event) {
    if (!canvasRef.value) return;
    const rect = canvasRef.value.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(books); // Only intersect books

    if (intersects.length > 0) {
      const firstIntersected = intersects[0].object;
      if (INTERSECTED !== firstIntersected) {
        // Reset previous INTERSECTED if it exists
        if (INTERSECTED) {
          INTERSECTED.material.emissive.setHex(
            INTERSECTED.userData.originalEmissive
          );
        }
        INTERSECTED = firstIntersected;
        INTERSECTED.material.emissive.setHex(bookConfig.highlightEmissive);
        canvasRef.value.style.cursor = "pointer";
      }
    } else {
      if (INTERSECTED) {
        INTERSECTED.material.emissive.setHex(
          INTERSECTED.userData.originalEmissive
        );
      }
      INTERSECTED = null;
      canvasRef.value.style.cursor = "default";
    }
  }

  function onClick(event) {
    if (!canvasRef.value) return;
    // Use the current INTERSECTED object if available (from mousemove)
    // or perform a new raycast if needed (e.g., if mouse didn't move before click)
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(books);

    if (intersects.length > 0) {
      const clickedBook = intersects[0].object;

      if (clickedBook.userData.isPulledOut) return; // Already pulled out, do nothing or push back

      clickedBook.userData.isPulledOut = true;

      // Animation: Pull out book
      gsap.to(clickedBook.position, {
        z: clickedBook.userData.originalPositionZ + bookConfig.depth / 2, // Pull out by half its depth
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Navigate after animation
          if (clickedBook.userData.url) {
            // window.location.href = clickedBook.userData.url; // Navigate in same tab
            window.open(clickedBook.userData.url, "_blank"); // Navigate in new tab
          }

          // Optionally, animate back after a delay if not navigating, or if navigation fails
          // For this example, we assume navigation happens, so we don't animate back immediately.
          // If you want it to return:
          // gsap.to(clickedBook.position, {
          //   z: clickedBook.userData.originalPositionZ,
          //   duration: 0.3,
          //   delay: 0.5, // Wait a bit before putting back
          //   ease: 'power2.in',
          //   onComplete: () => {
          //     clickedBook.userData.isPulledOut = false;
          //   }
          // });
        },
      });
    }
  }

  // --- Animation Loop ---
  let animationFrameId;
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  // --- Lifecycle Hooks ---
  onMounted(() => {
    initThree();
  });

  onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener("resize", onWindowResize);
    if (canvasRef.value) {
      canvasRef.value.removeEventListener("mousemove", onMouseMove);
      canvasRef.value.removeEventListener("click", onClick);
    }
    // Dispose Three.js objects to free up resources
    if (renderer) renderer.dispose();
    if (scene) {
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
    if (controls) controls.dispose();
    books = [];
    INTERSECTED = null;
  });
</script>

<style>
  .bookshelf-container {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden; /* Important to prevent scrollbars if canvas is slightly off */
    position: relative; /* For loading overlay */
  }

  canvas {
    display: block; /* Removes bottom space under canvas */
    width: 100%;
    height: 100%;
  }

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
</style>
