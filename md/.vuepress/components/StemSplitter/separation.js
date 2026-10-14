/*
 * @Autor: LXS
 * @Date: 2026-10-14
 * @Description: 人声/伴奏分离封装
 *
 * 这里是整个项目里唯一 import('web-audio-separation') 的地方。
 * 之所以全部走动态 import，是因为它和 onnxruntime-web 都是纯浏览器包
 * （依赖 navigator / Worker / WebAssembly / OfflineAudioContext），
 * 不能在 VuePress 的 SSR 阶段被加载。
 */

let registryCache = null

/** 模块级单例：SPA 内换页再回来不用重新下载/载入模型 */
const state = {
  modelId: null,
  sep: null,
  loaded: false,
  providers: null,
  onProgress: null,
}

/** 当前浏览器是否有 WebGPU（没有就退回 CPU 的 WASM 推理，会慢很多） */
export function hasWebGPU() {
  return typeof navigator !== 'undefined' && !!navigator.gpu
}

async function getRegistry() {
  if (!registryCache) {
    const mod = await import('web-audio-separation')
    registryCache = mod.MODEL_REGISTRY
  }
  return registryCache
}

async function make(modelId, providers) {
  const { createSeparator } = await import('web-audio-separation')
  return createSeparator(modelId, {
    common: {
      logLevel: 'info',
      // 包一层，这样换歌/重试时可以替换回调而不必重建 separator
      onProgress: (p) => state.onProgress?.(p),
    },
    mdx: { executionProviders: providers },
  })
}

async function ensureSeparator(modelId, onProgress) {
  state.onProgress = onProgress
  if (state.modelId === modelId && state.sep) return state.sep
  // 注意：库内部自己会检查 crossOriginIsolated，只在跨域隔离下才开多线程，
  // 所以这里不需要（也不应该）手动设 ort.env.wasm.numThreads。
  const providers = hasWebGPU() ? ['webgpu', 'wasm'] : ['wasm']
  state.sep = await make(modelId, providers)
  state.modelId = modelId
  state.providers = providers
  state.loaded = false
  return state.sep
}

/**
 * 载入模型（首次会从 HuggingFace 下载约 30~67MB，之后走浏览器 CacheStorage）。
 * WebGPU 建会话失败时自动退回纯 WASM 重试一次。
 * @param {string} modelId
 * @param {(p: {stage: string, fraction: number, chunk?: number, totalChunks?: number}) => void} [onProgress]
 */
export async function loadModel(modelId, onProgress) {
  let sep = await ensureSeparator(modelId, onProgress)
  if (state.loaded) return sep
  try {
    await sep.loadModel()
  } catch (err) {
    if (!state.providers || state.providers[0] !== 'webgpu') throw err
    console.warn('[音轨分离] WebGPU 初始化失败，退回 CPU(WASM) 重试：', err)
    state.sep = await make(modelId, ['wasm'])
    state.providers = ['wasm']
    sep = state.sep
    await sep.loadModel()
  }
  state.loaded = true
  return sep
}

/**
 * 分离一个本地文件。
 *
 * 关于返回顺序：库的 separate() 返回的是 [secondary, primary]，谁是 primary 由模型的
 * primary_stem 决定（Vocals 型模型 → primary 是人声；Instrumental 型 → primary 是伴奏）。
 * 这里按注册表确定性映射，不靠猜。
 *
 * @param {object} sep  loadModel() 返回的 separator
 * @param {File}   file 用户选中的音频文件
 * @param {string} modelId
 * @param {(p: object) => void} [onProgress]
 * @returns {Promise<{vocals: string, instrumental: string}>} 两个 WAV 的 blob URL
 */
export async function separateFile(sep, file, modelId, onProgress) {
  state.onProgress = onProgress
  // 库会 fetch 这个 URL 并解码，所以对象 URL 在它 resolve 之后才能释放
  const url = URL.createObjectURL(file)
  let stems
  try {
    stems = await sep.separate(url)
  } finally {
    URL.revokeObjectURL(url)
  }

  if (!Array.isArray(stems) || stems.length < 2) {
    throw new Error('分离结果不完整（未返回两轨音频）')
  }
  const registry = await getRegistry()
  const primaryStem = registry[modelId]?.modelData?.primary_stem
  const [secondaryUrl, primaryUrl] = stems

  if (primaryStem === 'Instrumental') {
    return { vocals: secondaryUrl, instrumental: primaryUrl }
  }
  if (primaryStem !== 'Vocals') {
    console.warn('[音轨分离] 未知的 primary_stem，按 primary=人声 处理：', primaryStem)
  }
  return { vocals: primaryUrl, instrumental: secondaryUrl }
}
