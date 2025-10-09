<template>
  <div class="p-4 space-y-4">
    <!-- 上传图片 -->
    <div class="flex gap-2">
      <input type="file" accept="image/*" multiple @change="onFilesSelected" />
      <input type="file" accept=".gif" @change="onGifSelected" />
      <span class="text-sm text-gray-500">支持上传GIF自动拆分帧</span>
    </div>

    <!-- 帧预览区域 -->
    <div class="flex overflow-x-auto gap-2 mt-4 pb-2">
      <div v-for="(frame, index) in frames" :key="index"
        class="border p-2 rounded shadow flex flex-col items-center min-w-[100px]">
        <!-- 修改图片预览尺寸为80px × 80px -->
        <img :src="frame.url" class="object-contain" style="width: 80px; height: 80px;" />
        <input type="number" v-model.number="frame.delay" min="20" class="mt-1 w-20 border rounded px-1 text-center" />
        <small>ms</small>
        <button @click="removeFrame(index)" class="text-red-500 mt-1">
          删除
        </button>
      </div>
    </div>

    <!-- 生成按钮 -->
    <button @click="generateGif" class="px-4 py-2 bg-blue-500 text-white rounded shadow"
      :disabled="isProcessing || frames.length === 0">
      {{ isProcessing ? '处理中...' : '生成 GIF' }}
    </button>

    <!-- 生成结果 -->
    <div v-if="resultUrl" class="mt-4">
      <h3 class="font-bold">生成结果：</h3>
      <img :src="resultUrl" class="border rounded shadow" />
      <a :href="resultUrl" download="output.gif" class="block mt-2 text-blue-600 underline">
        下载 GIF
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import GIF from "gif.js";
import { parseGIF, decompressFrames } from "gifuct-js";


// 帧数据集合
const frames = ref([]);
// GIF 生成结果 URL
const resultUrl = ref(null);
// 处理状态
const isProcessing = ref(false);

// 选择图片文件，批量上传
function onFilesSelected(event) {
  const files = event.target.files;
  for (let file of files) {
    const url = URL.createObjectURL(file);
    frames.value.push({
      url,
      delay: 200 // 默认 200ms
    });
  }
}

// 选择GIF文件并拆分帧
async function onGifSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  isProcessing.value = true;

  try {
    // 读取文件为 ArrayBuffer
    const buffer = await file.arrayBuffer();

    // 解析 GIF
    const gif = parseGIF(buffer);

    // 解压帧
    const framesData = decompressFrames(gif, true);

    // 清空旧帧
    frames.value = [];

    // 用于保存上一帧完整画面
    const lastCanvas = document.createElement("canvas");
    lastCanvas.width = gif.lsd.width;
    lastCanvas.height = gif.lsd.height;
    const lastCtx = lastCanvas.getContext("2d");

    // 遍历每一帧
    framesData.forEach((f) => {
      const canvas = document.createElement("canvas");
      canvas.width = gif.lsd.width;
      canvas.height = gif.lsd.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // 先绘制上一帧完整画面
      ctx.drawImage(lastCanvas, 0, 0);

      // 将当前帧 patch 绘制到 canvas，注意偏移
      const imageData = ctx.createImageData(f.dims.width, f.dims.height);
      imageData.data.set(f.patch);
      ctx.putImageData(imageData, f.dims.left, f.dims.top);

      // 保存完整帧
      frames.value.push({
        url: canvas.toDataURL("image/png"),
        delay: f.delay * 10, // 1/100s → ms
      });

      // 更新 lastCanvas 为当前帧
      lastCtx.clearRect(0, 0, lastCanvas.width, lastCanvas.height);
      lastCtx.drawImage(canvas, 0, 0);
    });
  } catch (error) {
    console.error("GIF 拆分失败:", error);
    alert("GIF 拆分失败，请尝试其他文件");
  } finally {
    isProcessing.value = false;
  }
}

// 加载外部脚本
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // 检查脚本是否已加载
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 删除帧
function removeFrame(index) {
  frames.value.splice(index, 1);
}

// 生成GIF
function generateGif() {
  if (!frames.value.length) return;
  isProcessing.value = true;

  // 实例化gif.js对象
  const gif = new GIF({
    workers: 2,
    quality: 10,
    workerScript: "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js",
  });

  // 创建图像加载Promise数组
  const imagePromises = frames.value.map((frame) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = frame.url;
    });
  });

  // 等待所有图像加载完成
  Promise.all(imagePromises).then((images) => {
    // 为每一帧添加图片
    images.forEach((img, index) => {
      gif.addFrame(img, { delay: frames.value[index].delay });
    });

    // 生成完成后存储blob转URL
    gif.on("finished", (blob) => {
      resultUrl.value = URL.createObjectURL(blob);
      isProcessing.value = false;
    });

    gif.render();
  });
}
</script>

<style scoped>
button {
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.flex.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.flex.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.flex.overflow-x-auto::-webkit-scrollbar-track {
  background: #f7fafc;
}

.flex.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}
</style>