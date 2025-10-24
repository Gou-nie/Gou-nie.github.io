<template>
    <div class="flex-container">
        <div class="flex-item">
            <h2>📚在线书架</h2>

            <!-- 添加书籍 -->
            <div>
                <input v-model="newBookUrl" placeholder="输入阿里云 OSS 书籍链接" class="flex-1 border rounded-lg p-2" />
                <button @click="addBook" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    添加
                </button>
            </div>

            <!-- 书架 -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div v-for="(book, index) in books" :key="index" class="p-3 bg-white rounded-lg shadow">
                    <p class="font-semibold truncate">{{ getFileName(book.url) }}</p>
                    <p class="text-sm text-gray-500 truncate">{{ book.type }}</p>

                    <div class="mt-2 flex gap-2">
                        <button @click="openBook(book)"
                            class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                            阅读
                        </button>
                        <button @click="removeBook(index)"
                            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                            删除
                        </button>
                    </div>
                </div>
            </div>
        </div>


        <!-- 阅读器 -->
        <div v-if="currentBook" class="flex-item">
            <h2 class="text-xl font-bold mb-2">{{ getFileName(currentBook.url) }}</h2>

            <div v-if="currentBook.type === 'epub'" class="relative border rounded h-[80vh]" style="background:#aaaa">
                <div id="epub-viewer" class="w-full h-full"></div>

                <!-- 翻页按钮 -->
                <div class="absolute top-1/2 left-2 transform -translate-y-1/2">
                    <button @click="prevPage"
                        class="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">上一页</button>
                </div>
                <div class="absolute top-1/2 right-2 transform -translate-y-1/2">
                    <button @click="nextPage"
                        class="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">下一页</button>
                </div>
            </div>

            <!-- <div v-if="currentBook.type === 'pdf'" class="border rounded h-[80vh] overflow-y-auto">
                <canvas ref="pdfCanvas"></canvas>
            </div> -->
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import ePub from "epubjs";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

const newBookUrl = ref("https://aleah.oss-cn-heyuan.aliyuncs.com/epub/%E5%BD%B1%E5%93%8D%E5%8A%9B%20%28%E7%BB%8F%E5%85%B8%E7%89%88%29%20%3D%20Influence%20The%20Psychology%20of%20Persuasion%20%28%5B%E7%BE%8E%5D%20%E8%A5%BF%E5%A5%A5%E8%BF%AA%E5%B0%BC%20%28Robert%20B.%20Cialdini%29%20%E8%91%97%20%20%E9%97%BE%E4%BD%B3%20%E8%AF%91%29%20%28Z-Library%29.epub");
const books = ref([]);
const currentBook = ref(null);
const pdfCanvas = ref(null);

const STORAGE_KEY = "my-books";
let rendition = null; // epub.js 渲染对象
let bookInstance = null; // epub.js Book 对象

// 初始化加载本地缓存
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
        setTimeout(() => {
            const viewer = document.getElementById("epub-viewer");
            if (!viewer) return;
            viewer.innerHTML = "";
            viewer.style.height = "80vh";
            viewer.style.background = "#aaaa";

            bookInstance = ePub(book.url);
            rendition = bookInstance.renderTo("epub-viewer", {
                width: "100%",
                height: "100%",  
                flow:'scrolled', // paginated翻页｜scrolled滚动
                spread:false,
                // minSpreadWidth:10, //最小触发双页的宽度 
                snap:true,
                allowScriptedContent:true
            });


            rendition.hooks.render.register(() => {
                const iframe = viewer.querySelector("iframe");
                if (iframe) {
                    iframe.removeAttribute("sandbox");
                    // iframe.setAttribute("sandbox", "allow-scripts allow-same-origin"); // 如果你想更安全一些
                }
            });

            rendition.display();

 


            bookInstance.loaded.navigation.then(nav => {
                console.log("TOC:", nav.toc);
            });
        }, 50);
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

// 翻页操作
function nextPage() {
    if (rendition) rendition.next();
}
function prevPage() {
    if (rendition) rendition.prev();
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



.flex-container {
    width: 100%;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    background-color: antiquewhite;

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: stretch;
    align-content: stretch;
    gap: 0px;
}

.flex-item:nth-child(1) {
    flex-grow: 0;
    flex-shrink: 0.5;
    flex-basis: 10%;
    align-self: auto;
    order: 0;
}

.flex-item:nth-child(2) {
    flex-grow: 0;
    flex-shrink: 1;
    flex-basis: 80%;
    align-self: auto;
    order: 0;
}
</style>
