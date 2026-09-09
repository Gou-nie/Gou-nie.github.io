import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { ModelLoader } from "../../AniAI/core/ModelLoader.js";
import { BUILTIN_FIGHTERS } from "../data/builtins.js";

/**
 * 资产注册表：内置模型清单 + 导入本地 GLB + gltf 缓存 + 克隆分发。
 *
 * 两条硬规则（否则镜像战必然出错）：
 *
 * 1. 同一个 URL 只加载一次，缓存原始 gltf；两个玩家各自拿「克隆体」，
 *    连原始那份都不直接上场。这样两边行为完全对称，不会出现
 *    「P1 用原件、P2 用克隆」的隐性差异。
 *
 * 2. 克隆必须用 SkeletonUtils.clone，绝不能用 Object3D.clone()。
 *    后者不重建 SkinnedMesh 与 Skeleton 的绑定，克隆体的 mesh 会仍然引用原始骨架 ——
 *    结果是两个角色动作完全同步（动 P1 的头，P2 的头跟着动）。
 *    SkeletonUtils.clone 对无骨骼场景会直接退化成 source.clone()，所以刚体战士走同一条路径。
 *
 * 内存注意：source.clone() 共享 geometry 与 material 引用，因此克隆体不可单独 dispose
 *    （会把另一个玩家的资源一起释放）。释放统一在本注册表的 dispose() 里按缓存条目做一次。
 */
export class AssetRegistry {
  constructor() {
    this.loader = new ModelLoader();
    this._cache = new Map(); // cacheKey -> { gltf, scene, source: 'builtin'|'import', meta }
    this._pending = new Map(); // cacheKey -> Promise（并发去重）
    this._blobUrls = new Set();
  }

  /** 内置模型清单（供 Roster 列表） */
  builtins() {
    return BUILTIN_FIGHTERS;
  }

  /**
   * 取得一份可上场的模型场景（已克隆，调用方独占）。
   * @param {{kind: 'builtin'|'import', id?: string, url?: string, file?: File}} spec
   * @returns {Promise<{scene: THREE.Object3D, entry: object}>}
   */
  async acquire(spec) {
    const entry = await this._load(spec);
    // 克隆分发：原始 scene 永不上场
    const scene = cloneSkeleton(entry.scene);
    return { scene, entry };
  }

  /** 载入并缓存（并发去重） */
  async _load(spec) {
    const key = this._cacheKey(spec);
    const cached = this._cache.get(key);
    if (cached) return cached;

    const inflight = this._pending.get(key);
    if (inflight) return inflight;

    const task = this._loadUncached(spec, key)
      .then((entry) => {
        this._cache.set(key, entry);
        this._pending.delete(key);
        return entry;
      })
      .catch((err) => {
        this._pending.delete(key);
        throw err;
      });

    this._pending.set(key, task);
    return task;
  }

  async _loadUncached(spec, key) {
    if (spec.kind === "builtin") {
      const meta = BUILTIN_FIGHTERS.find((m) => m.id === spec.id);
      if (!meta) throw new Error(`未知的内置模型「${spec.id}」`);
      const result = await this.loader.load(meta.url);
      return { key, gltf: result.gltf, scene: result.scene, source: "builtin", meta };
    }

    // 导入：只接受 .glb（自包含）。.gltf 会引用外部 .bin/贴图，
    // 而 Blob URL 在主文件解析完就失效，外部资源必然取不到。
    const file = spec.file;
    if (!file) throw new Error("导入缺少文件");
    const name = file.name || "imported.glb";
    if (!/\.glb$/i.test(name)) {
      throw new Error("只支持 .glb（自包含）格式。.gltf 会引用外部贴图与 .bin，请先导出为 .glb");
    }

    const url = URL.createObjectURL(file);
    this._blobUrls.add(url);
    let result;
    try {
      result = await this.loader.load(url);
    } catch (err) {
      throw new Error(this._explainLoadError(err, name));
    } finally {
      // GLB 自包含，解析完即可释放
      URL.revokeObjectURL(url);
      this._blobUrls.delete(url);
    }

    return {
      key,
      gltf: result.gltf,
      scene: result.scene,
      source: "import",
      meta: { id: key, name: name.replace(/\.glb$/i, ""), url: null, note: "导入" },
    };
  }

  /** 把 GLTFLoader 的报错翻译成人话（压缩扩展是最常见的失败原因） */
  _explainLoadError(err, name) {
    const msg = String(err?.message || err);
    if (/KHR_draco|DRACOLoader/i.test(msg)) {
      return `「${name}」使用了 DRACO 网格压缩，当前未配置解码器。请用 gltf-transform 或 Blender 重新导出为未压缩的 .glb`;
    }
    if (/KHR_texture_basisu|KTX2/i.test(msg)) {
      return `「${name}」使用了 KTX2/Basis 纹理压缩，当前未配置解码器。请重新导出为未压缩的 .glb`;
    }
    if (/meshopt/i.test(msg)) {
      return `「${name}」使用了 Meshopt 压缩，当前不支持。请重新导出为未压缩的 .glb`;
    }
    return `「${name}」加载失败：${msg}`;
  }

  /** 导入的文件用「文件名 + 体积」做 key：重新导入同一个文件时能命中缓存与已存招式 */
  _cacheKey(spec) {
    if (spec.kind === "builtin") return `builtin:${spec.id}`;
    const f = spec.file;
    return `import:${f?.name || "unknown"}:${f?.size ?? 0}`;
  }

  /** 已缓存条目（供调试/Roster 显示"已加载"） */
  cached() {
    return Array.from(this._cache.values());
  }

  /**
   * 释放全部缓存资源。
   * 只在这里 dispose —— 克隆体与原件共享 geometry/material，单独释放克隆体会
   * 连带破坏其他仍在使用的角色。
   */
  dispose() {
    for (const entry of this._cache.values()) {
      entry.scene?.traverse?.((o) => {
        if (!o.isMesh) return;
        o.geometry?.dispose?.();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (!m) continue;
          // 贴图也要显式释放，否则 GPU 显存不回收
          for (const slot of TEXTURE_SLOTS) m[slot]?.dispose?.();
          m.dispose?.();
        }
      });
    }
    this._cache.clear();
    this._pending.clear();
    for (const url of this._blobUrls) URL.revokeObjectURL(url);
    this._blobUrls.clear();
  }
}

const TEXTURE_SLOTS = [
  "map",
  "normalMap",
  "roughnessMap",
  "metalnessMap",
  "emissiveMap",
  "aoMap",
  "alphaMap",
  "bumpMap",
  "displacementMap",
  "envMap",
  "lightMap",
  "clearcoatMap",
  "specularMap",
];
