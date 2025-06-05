import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// 创建文字面板
// 竖向文字
export function createVerticalTextPlane(text = "Hello Three.js", width = 1, height = 2) {
  // 1. 创建 Canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 128;
  canvas.height = 512;

  // 2. 绘制背景
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 3. 绘制文本
  context.font = 'bold 48px Arial';
  context.fillStyle = '#000000';
  context.textAlign = 'center';

  // 横向
  //   context.textBaseline = 'middle';
  //   context.fillText(text, canvas.width / 2, canvas.height / 2);

  // 竖向
  context.textBaseline = 'top';
  const x = canvas.width / 2;
  let y = 20;
  const lineHeight = 48;
  for (let i = 0; i < text.length; i++) {
    context.fillText(text[i], x, y);
    y += lineHeight;
  }
  // 4. 转换为纹理
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // 5. 创建材质和平面几何体
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}
// 横向文字
export function createHorizontalTextPlane(text = "Hello Three.js", width = 2, height = 1) {
  // 1. 创建 Canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 256;

  // 2. 绘制背景
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 3. 绘制文本
  context.font = 'bold 48px Arial';
  context.fillStyle = '#000000';
  context.textAlign = 'center';

  // 横向
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  // 4. 转换为纹理
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // 5. 创建材质和平面几何体
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}
// 花式面板
export function createGlamorousTextPlane(text = "Hello Three.js", width = 1, height = 2) {
  
}



// 创建3D文字
export function createTextMesh(text, x, y, z, signal, fontUrl = '../../fonts/helvetiker_regular.typeface.json') {
  return new Promise((resolve, reject) => {
    console.log(signal, "---------signal is ");
    if (signal?.aborted) {
      reject(new Error('Aborted before start'));
      return;
    }
    const loader = new FontLoader();
    loader.load(fontUrl, (font) => {


      if (signal?.aborted) {
        reject(new Error('Aborted during loading'));
        return;
      }

      const geometry = new TextGeometry(text, {
        font: font,
        size: 1,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: false
      });

      geometry.computeBoundingBox();
      geometry.center(); // 可选：使文本居中

      const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(1, 1, 0.01);
      mesh.position.set(x, y, z);
      resolve(mesh);
    }, undefined, reject);

    signal?.addEventListener('abort', () => {
      reject(new Error('Aborted by signal'));
    });
  });
}
