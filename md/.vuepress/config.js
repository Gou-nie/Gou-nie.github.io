/*
 * @Autor: LXS
 * @Date: 2025-04-10 18:31:59
 * @LastEditors: LXS 
 * @Description: vue press 配置文件
 */


module.exports = {
    base: "/",
    dest: "./dist",
    title: "勾捏1",
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
                        text: "faith",
                        link: "/text/faith"
                    },
                    {
                        text: "<this is water>Afterword",
                        link: "/text/<this is water>Afterword"
                    }
                ]
            },  
        ],
        sidebar: [ 
            ['text/faith', 'faith'],
            ['text/<this is water>Afterword', 'tsp-dk']
        ]
    
    }
}