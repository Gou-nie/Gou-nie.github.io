<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-2xl font-bold mb-4">📚 我的在线书架</h1>

    <div class="flex items-center gap-2 mb-6">
      <input
        v-model="newBookUrl"
        placeholder="输入阿里云 OSS 书籍链接"
        class="flex-1 border rounded-lg p-2"
      />
      <button
        @click="addBook"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        添加
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="(book, index) in books"
        :key="index"
        class="p-3 bg-white rounded-lg shadow"
      >
        <p class="font-semibold truncate">{{ getFileName(book.url) }}</p>
        <p class="text-sm text-gray-500 truncate">{{ book.type }}</p>

        <div class="mt-2 flex gap-2">
          <button
            @click="openBook(book)"
            class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            阅读
          </button>
          <button
            @click="removeBook(index)"
            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="currentBook" class="mt-8">
      <h2 class="text-xl font-bold mb-2">{{ getFileName(currentBook.url) }}</h2>
      <div v-if="currentBook.type === 'epub'" id="epub-viewer" class="border rounded h-[80vh]"></div>
      <div v-if="currentBook.type === 'pdf'" class="border rounded h-[80vh] overflow-y-auto">
        <canvas ref="pdfCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import ePub from "epubjs";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

const newBookUrl = ref("https://aleah.oss-cn-heyuan.aliyuncs.com/epub/%20Designing%20Your%20Life%20How%20to%20Build%20a%20Well.epub");
const books = ref([]);
const currentBook = ref(null);
const pdfCanvas = ref(null);

const STORAGE_KEY = "my-books";

// 初始化时加载本地缓存
onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    books.value = JSON.parse(stored);
  }
});

// 添加书籍
function addBook() {
  if (!newBookUrl.value) return;
  const type = newBookUrl.value.endsWith(".epub")
    ? "epub"
    : newBookUrl.value.endsWith(".pdf")
    ? "pdf"
    : "unknown";

  if (type === "unknown") {
    alert("暂不支持的文件类型");
    return;
  }

  books.value.push({ url: newBookUrl.value, type });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books.value));
  newBookUrl.value = "";
}

// 删除书籍
function removeBook(index) {
  books.value.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books.value));
}

// 打开书籍
async function openBook(book) {
  currentBook.value = book;
  await nextTick();

  if (book.type === "epub") {
    // 清空旧的 epub 容器
    const viewerDiv = document.getElementById("epub-viewer");
    viewerDiv.innerHTML = "";

    // 创建 Book 实例
    const bookInstance = ePub(book.url);

    // 创建渲染实例
    const rendition = bookInstance.renderTo("epub-viewer", {
      width: "100%",
      height: "100%",
    });

    // 显示第一页
    rendition.display();

    // 可选：监听目录加载
    bookInstance.loaded.navigation.then(nav => {
      console.log("TOC:", nav.toc);
    });

  } else if (book.type === "pdf") {
    const pdf = await pdfjsLib.getDocument(book.url).promise;
    const page = await pdf.getPage(1);
    const canvas = pdfCanvas.value;
    const context = canvas.getContext("2d");
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    page.render({ canvasContext: context, viewport });
  }
}

// 获取文件名
function getFileName(url) {
  return decodeURIComponent(url.split("/").pop());
}
</script>

<style scoped>
#epub-viewer iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
