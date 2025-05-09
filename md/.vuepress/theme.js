import { hopeTheme } from "vuepress-theme-hope";
// import "./styles/index.css";

export default hopeTheme({
    logo: "/logo.png",
    sidebar: [
        
        {
            text: "首页",
            prefix: "/",
            collapsible: true, // 启用折叠功能
            collapsed: true, // 默认折叠
        },
        {
            collapsible: true, // 启用折叠功能
            collapsed: true, // 默认折叠
            text: "写写",
            prefix: "/content/",
            children: [
                {
                    text: "VuePress 部署指南", 
                    link: "vuepress部署"
                },
                {
                    text: "《This is Water》读后感",  
                    link: "this is water 读后感"
                },
                {
                    text: "坏心情记录",  
                    link: "badMood"
                },
                {
                    text: "信仰探讨",  
                    link: "faith"
                },
                ""
            ],
        },
        {
            collapsible: true, // 启用折叠功能
            collapsed: true, // 默认折叠
            text: "画画",
            prefix: "/content/",
            children: [
                {
                    text: "绘画作品",  
                    link: "draw"
                },
            ],
        },
        {
            collapsible: true, // 启用折叠功能
            collapsed: true, // 默认折叠
            text: "小工具",
            prefix: "/content/",
            children: [
                {
                    text: "抱抱", 
                    link: "hug"
                },
            ],
        }
    ], 
    navbar: [{
        text: "首页",
        link: "/"
    },
    {
        text: "觀點",
        items: [
            {
                text: "faith",
                link: "/content/faith"
            },
            {
                text: "this is water 读后感",
                link: "/content/this is water 读后感"
            },
            {
                text: "vuepress部署",
                link: "/content/vuepress部署",
            },
            {
                text: "资源",
                link: "/content/sources"
            },
            {
                text: "haha",
                link: "/content/laugh"
            },
            {
                text: "badMood",
                link: "/content/badMood"
            },
            {
                text: "operationRecord",
                link: "/content/operationRecord"
            },
            {
                text: "peoples",
                link: "/content/peoples"
            }
        ]
    }, {
        text: "画廊",
        link: "/content/draw"
    }, {
        text: "小工具",
        items: [
            {
                text: "hug",
                link: "/content/hug"
            }
        ]
    }
    ]
})