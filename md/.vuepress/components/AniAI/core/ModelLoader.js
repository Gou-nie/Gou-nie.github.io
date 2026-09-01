import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * GLB/GLTF 模型加载器：把 GLTFLoader 的回调式 API 包装成 Promise，
 * 并归一化返回结构，供上层（AniAI 门面）使用。
 */
export class ModelLoader {
  constructor() {
    this.loader = new GLTFLoader();
  }

  /**
   * 加载模型
   * @param {string} url 模型地址
   * @param {(event: ProgressEvent) => void} [onProgress] 加载进度回调
   * @returns {Promise<{
   *   gltf: object,
   *   scene: import('three').Group,
   *   skeletons: import('three').Skeleton[],
   *   animations: import('three').AnimationClip[],
   * }>}
   */
  load(url, onProgress) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          resolve({
            gltf,
            scene: gltf.scene,
            skeletons: gltf.skins || [],
            animations: gltf.animations || [],
          });
        },
        onProgress,
        reject
      );
    });
  }
}
