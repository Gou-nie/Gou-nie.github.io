import { hopeTheme } from "vuepress-theme-hope";
// import "./styles/index.css";

export default hopeTheme({
    logo: "/logo.png",
    tags: [{
        name: 'content',
        path: '/content'
    }
    ],
    category: [{
        name: 'content',
        path: '/content'
    }
    ],
    blog: {
        medias: {
            GitHub:"https://github.com/Gou-nie",
            "163Music":"https://y.music.163.com/m/user?id=436369678",
            Email:"mailto:gounieby@163.com",
            BiliBili:"https://b23.tv/JyhsNpX",
            Essay:{
                link:"https://www.essay.ink/8nvk3xjkrvz2",
                icon:"https://www.essay.ink/favicon.ico"
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
        revealjs: true,
    },
    plugins: {
        blog: true,
        search: true,
    },
    // 设置侧边栏显示位置为右侧
    // sidebarDisplay: "mobile",
    // sidebarSorter: ["readme", "order", "title"], 
})


