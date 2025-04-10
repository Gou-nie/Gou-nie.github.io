/*
 * @Autor: LXS
 * @Date: 2025-04-10 18:31:59
 * @LastEditors: LXS 
 * @Description: vue press 配置文件
 */

module.exports = {
    base: "/md/",
    dest: "./dist",
    title: "碎片",
    description: "個人觀點,請勿盲從",
    head: [
        ['link', {
            rel: 'icon',
            href: '/favicon.ico'
        }]
    ],
    markdown: {
        // 开启markdown行号
        lineNumbers: true
    },
    plugins: [
        // 代码块点击复制插件
        ['vuepress-plugin-code-copy', {
            successText: '代码已复制到剪切板'
        }],
        // 进度条插件
        '@vuepress/nprogress'
    ],
    themeConfig: {
        logo: "/logo.png",
        // 平滑滚动
        smoothScroll: true,
        lastUpdated: '最后更新于',
        nav: [{
                text: "首页",
                link: "/"
            },
            {
                text: "觀點",
                items: [
                    {
                        text: "信仰",
                        link: "/text/信仰"
                    },
                    {
                        text: "<this is water>讀後感",
                        link: "/text/water讀後感"
                    }
                ]
            },  
        ],
    //     sidebar: [//左侧列表
    //   ['/cloud/IOS-SDK接口文档', 'ios-sdk'],
    //   ['/cloud/TSP-DK平台接口文档', 'tsp-dk']
    //     ]
                        
    }
}