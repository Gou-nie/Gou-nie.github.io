// md/.vuepress/config.js
import { defineUserConfig } from "vuepress";

// md/.vuepress/theme.js
import { hopeTheme } from "vuepress-theme-hope";
var theme_default = hopeTheme({
  logo: "/logo.png",
  tags: [
    {
      name: "content",
      path: "/content"
    }
  ],
  category: [
    {
      name: "content",
      path: "/content"
    }
  ],
  blog: {
    medias: {
      GitHub: "https://github.com/Gou-nie",
      "163Music": "https://y.music.163.com/m/user?id=436369678",
      Email: "mailto:gounieby@163.com",
      BiliBili: "https://b23.tv/JyhsNpX",
      Essay: {
        link: "https://www.essay.ink/8nvk3xjkrvz2",
        icon: "https://www.essay.ink/favicon.ico"
      }
    }
  },
  sidebar: false,
  navbar: false,
  // sidebar: [
  //     {
  //         text: "首页",
  //         prefix: "/",
  //         collapsible: true, // 启用折叠功能
  //         collapsed: true, // 默认折叠
  //     },
  //     {
  //         collapsible: true, // 启用折叠功能
  //         collapsed: true, // 默认折叠
  //         text: "写写",
  //         prefix: "/content/write/",
  //         children: [
  //             {
  //                 text: "资源收集",
  //                 link: "sources"
  //             },
  //             {
  //                 text: "《This is Water》读后感",
  //                 link: "this is water 读后感"
  //             },
  //             {
  //                 text: "踩坑记录",
  //                 link: "operationRecord"
  //             },
  //             {
  //                 text: "坏心情记录",
  //                 link: "badMood"
  //             },
  //             {
  //                 text: "信仰探讨",
  //                 link: "faith"
  //             }
  //         ],
  //     },
  //     {
  //         collapsible: true, // 启用折叠功能
  //         collapsed: true, // 默认折叠
  //         text: "烂糟画",
  //         prefix: "/content/draw/",
  //         children: [
  //             {
  //                 text: "小画",
  //                 link: "draw"
  //             },
  //             {
  //                 text: "画",
  //                 link: "bigDraw"
  //             }
  //         ],
  //     },
  //     {
  //         collapsible: true, // 启用折叠功能
  //         collapsed: true, // 默认折叠
  //         text: "小工具",
  //         prefix: "/content/tool/",
  //         children: [
  //             {
  //                 text: "抱抱",
  //                 link: "hug"
  //             }, {
  //                 text: "流体动画",
  //                 link: "fluid"
  //             },
  //             {
  //                 text: "幻灯片",
  //                 prefix: "slide/",
  //                 children: [
  //                     {
  //                         text: "幻灯片",
  //                         link: "hdp1"
  //                     }
  //                 ]
  //             }
  //         ],
  //     }, {
  //         text: "VuePress 部署指南",
  //         link: "/content/vuepress部署"
  //     }
  // ],
  // navbar: [{
  //     text: "首页",
  //     link: "/"
  // },
  // {
  //     text: "觀點",
  //     items: [
  //         {
  //             text: "faith",
  //             link: "/content/faith"
  //         },
  //         {
  //             text: "this is water 读后感",
  //             link: "/content/this is water 读后感"
  //         },
  //         {
  //             text: "vuepress部署",
  //             link: "/content/vuepress部署",
  //         },
  //         {
  //             text: "资源",
  //             link: "/content/sources"
  //         },
  //         {
  //             text: "haha",
  //             link: "/content/laugh"
  //         },
  //         {
  //             text: "badMood",
  //             link: "/content/badMood"
  //         },
  //         {
  //             text: "operationRecord",
  //             link: "/content/operationRecord"
  //         },
  //         {
  //             text: "peoples",
  //             link: "/content/peoples"
  //         }
  //     ]
  // }, {
  //     text: "画廊",
  //     link: "/content/draw"
  // }, {
  //     text: "小工具",
  //     items: [
  //         {
  //             text: "hug",
  //             link: "/content/hug"
  //         }
  //     ]
  // }
  // ],
  markdown: {
    revealjs: true
  },
  plugins: {
    blog: true,
    search: true
  }
  // 设置侧边栏显示位置为右侧
  // sidebarDisplay: "mobile",
  // sidebarSorter: ["readme", "order", "title"], 
});

// md/.vuepress/config.js
import { viteBundler } from "@vuepress/bundler-vite";
import { registerComponentsPlugin } from "@vuepress/plugin-register-components";
import { googleAnalyticsPlugin } from "@vuepress/plugin-google-analytics";
import path from "path";
var __vite_injected_original_dirname = "/Users/mac/Documents/githubObject/Gou-nie.github.io/md/.vuepress";
var config_default = defineUserConfig({
  bundler: viteBundler({
    viteOptions: {
      ssr: {
        noExternal: ["fflate"]
      }
    }
  }),
  title: "GouNie",
  description: "GouNie",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }]
  ],
  markdown: {
    component: true,
    tabs: true,
    spoiler: true
  },
  theme: theme_default,
  plugins: [
    registerComponentsPlugin({
      componentsDir: path.resolve(__vite_injected_original_dirname, "./components"),
      componentsPatterns: ["**/*.vue", "!**/3D/**"]
    }),
    googleAnalyticsPlugin({
      id: "G-YZQGD3PJJ9",
      debug: true
    })
  ]
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWQvLnZ1ZXByZXNzL2NvbmZpZy5qcyIsICJtZC8udnVlcHJlc3MvdGhlbWUuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWFjL0RvY3VtZW50cy9naXRodWJPYmplY3QvR291LW5pZS5naXRodWIuaW8vbWQvLnZ1ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbWFjL0RvY3VtZW50cy9naXRodWJPYmplY3QvR291LW5pZS5naXRodWIuaW8vbWQvLnZ1ZXByZXNzL2NvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbWFjL0RvY3VtZW50cy9naXRodWJPYmplY3QvR291LW5pZS5naXRodWIuaW8vbWQvLnZ1ZXByZXNzL2NvbmZpZy5qc1wiOy8qXG4gKiBAQXV0b3I6IExYU1xuICogQERhdGU6IDIwMjUtMDQtMTAgMTg6MzE6NTlcbiAqIEBMYXN0RWRpdG9yczogTFhTIFxuICogQERlc2NyaXB0aW9uOiB2dWUgcHJlc3MgXHU5MTREXHU3RjZFXHU2NTg3XHU0RUY2XG4gKi9cbmltcG9ydCB7IGRlZmluZVVzZXJDb25maWcgfSBmcm9tICd2dWVwcmVzcydcbmltcG9ydCAgdGhlbWVDb25maWcgIGZyb20gJy4vdGhlbWUuanMnXG5pbXBvcnQgeyB2aXRlQnVuZGxlciB9IGZyb20gJ0B2dWVwcmVzcy9idW5kbGVyLXZpdGUnXG5pbXBvcnQgeyByZWdpc3RlckNvbXBvbmVudHNQbHVnaW4gfSBmcm9tICdAdnVlcHJlc3MvcGx1Z2luLXJlZ2lzdGVyLWNvbXBvbmVudHMnXG5pbXBvcnQgeyBnb29nbGVBbmFseXRpY3NQbHVnaW4gfSBmcm9tICdAdnVlcHJlc3MvcGx1Z2luLWdvb2dsZS1hbmFseXRpY3MnXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZVVzZXJDb25maWcoe1xuICBidW5kbGVyOiB2aXRlQnVuZGxlcih7XG4gICAgdml0ZU9wdGlvbnM6IHtcbiAgICAgIHNzcjoge1xuICAgICAgICBub0V4dGVybmFsOiBbJ2ZmbGF0ZSddXG4gICAgICB9XG4gICAgfVxuICB9KSxcblxuICB0aXRsZTogJ0dvdU5pZScsXG4gIGRlc2NyaXB0aW9uOiAnR291TmllJyxcbiAgaGVhZDogW1xuICAgIFsnbGluaycsIHsgcmVsOiAnaWNvbicsIGhyZWY6ICcvZmF2aWNvbi5pY28nIH1dLFxuICBdLCBcbiAgbWFya2Rvd246e1xuICAgIGNvbXBvbmVudDogdHJ1ZSxcbiAgICB0YWJzOiB0cnVlLFxuICAgIHNwb2lsZXI6IHRydWUsXG4gIH0sXG4gIHRoZW1lOiB0aGVtZUNvbmZpZyxcbiAgcGx1Z2luczogW1xuICAgIHJlZ2lzdGVyQ29tcG9uZW50c1BsdWdpbih7XG4gICAgICBjb21wb25lbnRzRGlyOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9jb21wb25lbnRzJyksXG4gICAgICBjb21wb25lbnRzUGF0dGVybnM6IFsnKiovKi52dWUnLCAnISoqLzNELyoqJ10sXG4gICAgICBcbiAgICB9KSxcbiAgICBnb29nbGVBbmFseXRpY3NQbHVnaW4oe1xuICAgICAgaWQ6ICdHLVlaUUdEM1BKSjknLFxuICAgICAgZGVidWc6IHRydWVcbiAgICB9KVxuICAgIFxuICBdXG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWFjL0RvY3VtZW50cy9naXRodWJPYmplY3QvR291LW5pZS5naXRodWIuaW8vbWQvLnZ1ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbWFjL0RvY3VtZW50cy9naXRodWJPYmplY3QvR291LW5pZS5naXRodWIuaW8vbWQvLnZ1ZXByZXNzL3RoZW1lLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYWMvRG9jdW1lbnRzL2dpdGh1Yk9iamVjdC9Hb3UtbmllLmdpdGh1Yi5pby9tZC8udnVlcHJlc3MvdGhlbWUuanNcIjtpbXBvcnQgeyBob3BlVGhlbWUgfSBmcm9tIFwidnVlcHJlc3MtdGhlbWUtaG9wZVwiO1xuLy8gaW1wb3J0IFwiLi9zdHlsZXMvaW5kZXguY3NzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGhvcGVUaGVtZSh7XG4gICAgbG9nbzogXCIvbG9nby5wbmdcIixcbiAgICB0YWdzOiBbe1xuICAgICAgICBuYW1lOiAnY29udGVudCcsXG4gICAgICAgIHBhdGg6ICcvY29udGVudCdcbiAgICB9XG4gICAgXSxcbiAgICBjYXRlZ29yeTogW3tcbiAgICAgICAgbmFtZTogJ2NvbnRlbnQnLFxuICAgICAgICBwYXRoOiAnL2NvbnRlbnQnXG4gICAgfVxuICAgIF0sXG4gICAgYmxvZzoge1xuICAgICAgICBtZWRpYXM6IHtcbiAgICAgICAgICAgIEdpdEh1YjpcImh0dHBzOi8vZ2l0aHViLmNvbS9Hb3UtbmllXCIsXG4gICAgICAgICAgICBcIjE2M011c2ljXCI6XCJodHRwczovL3kubXVzaWMuMTYzLmNvbS9tL3VzZXI/aWQ9NDM2MzY5Njc4XCIsXG4gICAgICAgICAgICBFbWFpbDpcIm1haWx0bzpnb3VuaWVieUAxNjMuY29tXCIsXG4gICAgICAgICAgICBCaWxpQmlsaTpcImh0dHBzOi8vYjIzLnR2L0p5aHNOcFhcIixcbiAgICAgICAgICAgIEVzc2F5OntcbiAgICAgICAgICAgICAgICBsaW5rOlwiaHR0cHM6Ly93d3cuZXNzYXkuaW5rLzhudmszeGprcnZ6MlwiLFxuICAgICAgICAgICAgICAgIGljb246XCJodHRwczovL3d3dy5lc3NheS5pbmsvZmF2aWNvbi5pY29cIlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBzaWRlYmFyOiBmYWxzZSxcbiAgICBuYXZiYXI6IGZhbHNlLFxuICAgIC8vIHNpZGViYXI6IFtcblxuICAgIC8vICAgICB7XG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1OTk5Nlx1OTg3NVwiLFxuICAgIC8vICAgICAgICAgcHJlZml4OiBcIi9cIixcbiAgICAvLyAgICAgICAgIGNvbGxhcHNpYmxlOiB0cnVlLCAvLyBcdTU0MkZcdTc1MjhcdTYyOThcdTUzRTBcdTUyOUZcdTgwRkRcbiAgICAvLyAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSwgLy8gXHU5RUQ4XHU4QkE0XHU2Mjk4XHU1M0UwXG4gICAgLy8gICAgIH0sXG4gICAgLy8gICAgIHtcbiAgICAvLyAgICAgICAgIGNvbGxhcHNpYmxlOiB0cnVlLCAvLyBcdTU0MkZcdTc1MjhcdTYyOThcdTUzRTBcdTUyOUZcdTgwRkRcbiAgICAvLyAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSwgLy8gXHU5RUQ4XHU4QkE0XHU2Mjk4XHU1M0UwXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NTE5OVx1NTE5OVwiLFxuICAgIC8vICAgICAgICAgcHJlZml4OiBcIi9jb250ZW50L3dyaXRlL1wiLFxuICAgIC8vICAgICAgICAgY2hpbGRyZW46IFtcblxuICAgIC8vICAgICAgICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgdGV4dDogXCJcdThENDRcdTZFOTBcdTY1MzZcdTk2QzZcIixcbiAgICAvLyAgICAgICAgICAgICAgICAgbGluazogXCJzb3VyY2VzXCJcbiAgICAvLyAgICAgICAgICAgICB9LFxuICAgIC8vICAgICAgICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgdGV4dDogXCJcdTMwMEFUaGlzIGlzIFdhdGVyXHUzMDBCXHU4QkZCXHU1NDBFXHU2MTFGXCIsXG4gICAgLy8gICAgICAgICAgICAgICAgIGxpbms6IFwidGhpcyBpcyB3YXRlciBcdThCRkJcdTU0MEVcdTYxMUZcIlxuICAgIC8vICAgICAgICAgICAgIH0sXG4gICAgLy8gICAgICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgICAgICB0ZXh0OiBcIlx1OEUyOVx1NTc1MVx1OEJCMFx1NUY1NVwiLFxuICAgIC8vICAgICAgICAgICAgICAgICBsaW5rOiBcIm9wZXJhdGlvblJlY29yZFwiXG4gICAgLy8gICAgICAgICAgICAgfSxcbiAgICAvLyAgICAgICAgICAgICB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHRleHQ6IFwiXHU1NzRGXHU1RkMzXHU2MEM1XHU4QkIwXHU1RjU1XCIsXG4gICAgLy8gICAgICAgICAgICAgICAgIGxpbms6IFwiYmFkTW9vZFwiXG4gICAgLy8gICAgICAgICAgICAgfSxcbiAgICAvLyAgICAgICAgICAgICB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHRleHQ6IFwiXHU0RkUxXHU0RUYwXHU2M0EyXHU4QkE4XCIsXG4gICAgLy8gICAgICAgICAgICAgICAgIGxpbms6IFwiZmFpdGhcIlxuICAgIC8vICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgIF0sXG4gICAgLy8gICAgIH0sXG4gICAgLy8gICAgIHtcbiAgICAvLyAgICAgICAgIGNvbGxhcHNpYmxlOiB0cnVlLCAvLyBcdTU0MkZcdTc1MjhcdTYyOThcdTUzRTBcdTUyOUZcdTgwRkRcbiAgICAvLyAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSwgLy8gXHU5RUQ4XHU4QkE0XHU2Mjk4XHU1M0UwXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NzBDMlx1N0NERlx1NzUzQlwiLFxuICAgIC8vICAgICAgICAgcHJlZml4OiBcIi9jb250ZW50L2RyYXcvXCIsXG4gICAgLy8gICAgICAgICBjaGlsZHJlbjogW1xuICAgIC8vICAgICAgICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgdGV4dDogXCJcdTVDMEZcdTc1M0JcIixcbiAgICAvLyAgICAgICAgICAgICAgICAgbGluazogXCJkcmF3XCJcbiAgICAvLyAgICAgICAgICAgICB9LFxuICAgIC8vICAgICAgICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgdGV4dDogXCJcdTc1M0JcIixcbiAgICAvLyAgICAgICAgICAgICAgICAgbGluazogXCJiaWdEcmF3XCJcbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICBdLFxuICAgIC8vICAgICB9LFxuICAgIC8vICAgICB7XG4gICAgLy8gICAgICAgICBjb2xsYXBzaWJsZTogdHJ1ZSwgLy8gXHU1NDJGXHU3NTI4XHU2Mjk4XHU1M0UwXHU1MjlGXHU4MEZEXG4gICAgLy8gICAgICAgICBjb2xsYXBzZWQ6IHRydWUsIC8vIFx1OUVEOFx1OEJBNFx1NjI5OFx1NTNFMFxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTVDMEZcdTVERTVcdTUxNzdcIixcbiAgICAvLyAgICAgICAgIHByZWZpeDogXCIvY29udGVudC90b29sL1wiLFxuICAgIC8vICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAvLyAgICAgICAgICAgICB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHRleHQ6IFwiXHU2MkIxXHU2MkIxXCIsXG4gICAgLy8gICAgICAgICAgICAgICAgIGxpbms6IFwiaHVnXCJcbiAgICAvLyAgICAgICAgICAgICB9LCB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHRleHQ6IFwiXHU2RDQxXHU0RjUzXHU1MkE4XHU3NTNCXCIsXG4gICAgLy8gICAgICAgICAgICAgICAgIGxpbms6IFwiZmx1aWRcIlxuICAgIC8vICAgICAgICAgICAgIH0sXG4gICAgLy8gICAgICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgICAgICB0ZXh0OiBcIlx1NUU3Qlx1NzA2Rlx1NzI0N1wiLFxuICAgIC8vICAgICAgICAgICAgICAgICBwcmVmaXg6IFwic2xpZGUvXCIsXG4gICAgLy8gICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJcdTVFN0JcdTcwNkZcdTcyNDdcIixcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rOiBcImhkcDFcIlxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgICAgICAgICBdXG4gICAgLy8gICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgXSxcbiAgICAvLyAgICAgfSwge1xuICAgIC8vICAgICAgICAgdGV4dDogXCJWdWVQcmVzcyBcdTkwRThcdTdGNzJcdTYzMDdcdTUzNTdcIixcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2NvbnRlbnQvdnVlcHJlc3NcdTkwRThcdTdGNzJcIlxuICAgIC8vICAgICB9XG4gICAgLy8gXSxcbiAgICAvLyBuYXZiYXI6IFt7XG4gICAgLy8gICAgIHRleHQ6IFwiXHU5OTk2XHU5ODc1XCIsXG4gICAgLy8gICAgIGxpbms6IFwiL1wiXG4gICAgLy8gfSxcbiAgICAvLyB7XG4gICAgLy8gICAgIHRleHQ6IFwiXHU4OUMwXHU5RURFXCIsXG4gICAgLy8gICAgIGl0ZW1zOiBbXG4gICAgLy8gICAgICAgICB7XG4gICAgLy8gICAgICAgICAgICAgdGV4dDogXCJmYWl0aFwiLFxuICAgIC8vICAgICAgICAgICAgIGxpbms6IFwiL2NvbnRlbnQvZmFpdGhcIlxuICAgIC8vICAgICAgICAgfSxcbiAgICAvLyAgICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgICB0ZXh0OiBcInRoaXMgaXMgd2F0ZXIgXHU4QkZCXHU1NDBFXHU2MTFGXCIsXG4gICAgLy8gICAgICAgICAgICAgbGluazogXCIvY29udGVudC90aGlzIGlzIHdhdGVyIFx1OEJGQlx1NTQwRVx1NjExRlwiXG4gICAgLy8gICAgICAgICB9LFxuICAgIC8vICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgIHRleHQ6IFwidnVlcHJlc3NcdTkwRThcdTdGNzJcIixcbiAgICAvLyAgICAgICAgICAgICBsaW5rOiBcIi9jb250ZW50L3Z1ZXByZXNzXHU5MEU4XHU3RjcyXCIsXG4gICAgLy8gICAgICAgICB9LFxuICAgIC8vICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgIHRleHQ6IFwiXHU4RDQ0XHU2RTkwXCIsXG4gICAgLy8gICAgICAgICAgICAgbGluazogXCIvY29udGVudC9zb3VyY2VzXCJcbiAgICAvLyAgICAgICAgIH0sXG4gICAgLy8gICAgICAgICB7XG4gICAgLy8gICAgICAgICAgICAgdGV4dDogXCJoYWhhXCIsXG4gICAgLy8gICAgICAgICAgICAgbGluazogXCIvY29udGVudC9sYXVnaFwiXG4gICAgLy8gICAgICAgICB9LFxuICAgIC8vICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgIHRleHQ6IFwiYmFkTW9vZFwiLFxuICAgIC8vICAgICAgICAgICAgIGxpbms6IFwiL2NvbnRlbnQvYmFkTW9vZFwiXG4gICAgLy8gICAgICAgICB9LFxuICAgIC8vICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgIHRleHQ6IFwib3BlcmF0aW9uUmVjb3JkXCIsXG4gICAgLy8gICAgICAgICAgICAgbGluazogXCIvY29udGVudC9vcGVyYXRpb25SZWNvcmRcIlxuICAgIC8vICAgICAgICAgfSxcbiAgICAvLyAgICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgICB0ZXh0OiBcInBlb3BsZXNcIixcbiAgICAvLyAgICAgICAgICAgICBsaW5rOiBcIi9jb250ZW50L3Blb3BsZXNcIlxuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICBdXG4gICAgLy8gfSwge1xuICAgIC8vICAgICB0ZXh0OiBcIlx1NzUzQlx1NUVDQVwiLFxuICAgIC8vICAgICBsaW5rOiBcIi9jb250ZW50L2RyYXdcIlxuICAgIC8vIH0sIHtcbiAgICAvLyAgICAgdGV4dDogXCJcdTVDMEZcdTVERTVcdTUxNzdcIixcbiAgICAvLyAgICAgaXRlbXM6IFtcbiAgICAvLyAgICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgICB0ZXh0OiBcImh1Z1wiLFxuICAgIC8vICAgICAgICAgICAgIGxpbms6IFwiL2NvbnRlbnQvaHVnXCJcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgXVxuICAgIC8vIH1cbiAgICAvLyBdLFxuICAgIG1hcmtkb3duOiB7XG4gICAgICAgIHJldmVhbGpzOiB0cnVlLFxuICAgIH0sXG4gICAgcGx1Z2luczoge1xuICAgICAgICBibG9nOiB0cnVlLFxuICAgICAgICBzZWFyY2g6IHRydWUsXG4gICAgfSxcbiAgICAvLyBcdThCQkVcdTdGNkVcdTRGQTdcdThGQjlcdTY4MEZcdTY2M0VcdTc5M0FcdTRGNERcdTdGNkVcdTRFM0FcdTUzRjNcdTRGQTdcbiAgICAvLyBzaWRlYmFyRGlzcGxheTogXCJtb2JpbGVcIixcbiAgICAvLyBzaWRlYmFyU29ydGVyOiBbXCJyZWFkbWVcIiwgXCJvcmRlclwiLCBcInRpdGxlXCJdLCBcbn0pXG5cblxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQU1BLFNBQVMsd0JBQXdCOzs7QUNOcVUsU0FBUyxpQkFBaUI7QUFHaFksSUFBTyxnQkFBUSxVQUFVO0FBQUEsRUFDckIsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLElBQUM7QUFBQSxNQUNILE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNWO0FBQUEsRUFDQTtBQUFBLEVBQ0EsVUFBVTtBQUFBLElBQUM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNWO0FBQUEsRUFDQTtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0YsUUFBUTtBQUFBLE1BQ0osUUFBTztBQUFBLE1BQ1AsWUFBVztBQUFBLE1BQ1gsT0FBTTtBQUFBLE1BQ04sVUFBUztBQUFBLE1BQ1QsT0FBTTtBQUFBLFFBQ0YsTUFBSztBQUFBLFFBQ0wsTUFBSztBQUFBLE1BQ1Q7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsU0FBUztBQUFBLEVBQ1QsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUF3SVIsVUFBVTtBQUFBLElBQ04sVUFBVTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxFQUNaO0FBQUE7QUFBQTtBQUFBO0FBSUosQ0FBQzs7O0FEdEtELFNBQVMsbUJBQW1CO0FBQzVCLFNBQVMsZ0NBQWdDO0FBQ3pDLFNBQVMsNkJBQTZCO0FBRXRDLE9BQU8sVUFBVTtBQVpqQixJQUFNLG1DQUFtQztBQWN6QyxJQUFPLGlCQUFRLGlCQUFpQjtBQUFBLEVBQzlCLFNBQVMsWUFBWTtBQUFBLElBQ25CLGFBQWE7QUFBQSxNQUNYLEtBQUs7QUFBQSxRQUNILFlBQVksQ0FBQyxRQUFRO0FBQUEsTUFDdkI7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBQUEsRUFFRCxPQUFPO0FBQUEsRUFDUCxhQUFhO0FBQUEsRUFDYixNQUFNO0FBQUEsSUFDSixDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsTUFBTSxlQUFlLENBQUM7QUFBQSxFQUNoRDtBQUFBLEVBQ0EsVUFBUztBQUFBLElBQ1AsV0FBVztBQUFBLElBQ1gsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLEVBQ1g7QUFBQSxFQUNBLE9BQU87QUFBQSxFQUNQLFNBQVM7QUFBQSxJQUNQLHlCQUF5QjtBQUFBLE1BQ3ZCLGVBQWUsS0FBSyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUNyRCxvQkFBb0IsQ0FBQyxZQUFZLFdBQVc7QUFBQSxJQUU5QyxDQUFDO0FBQUEsSUFDRCxzQkFBc0I7QUFBQSxNQUNwQixJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsSUFDVCxDQUFDO0FBQUEsRUFFSDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
