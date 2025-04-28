/*
 * @Autor: LXS
 * @Date: 2025-04-10 18:31:59
 * @LastEditors: LXS 
 * @Description: vue press 配置文件
 */


module.exports = {
    base: "/",
    dest: "./dist",
    title: "勾捏",
    description: "個人觀點,請勿盲從",
    // 开启 生产环境 source map
    // configureWebpack: (config, isServer) => {
    //     if (!isServer) {
    //       config.devtool = 'source-map'; 
    //     }
    // },
    head: [
        ['link', {
            rel: 'icon',
            href: '/favicon.ico'
        }]
    ],
    components:[{
        name:"CanvasBoard",
        path:"./components/CanvasBoard.vue"
    }],
    markdown: {
        // 开启markdown行号
        lineNumbers: true,
        config: {
            // 强制使用轮询
            watchOptions: {
              usePolling: true
            }
        }
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
        git:{
            timezone: 'Asia/Shanghai'},
        nav: [{
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
                        text:"vuepress部署",
                        link: "/content/vuepress部署",
                    }
                ]
            }, {
                text: "画廊",
                link: "/content/draw"
            }
        ],
        sidebar: [ 
            ['content/faith', 'faith'],
            ['content/vuepress部署', 'vuepress部署'],
            ['content/this is water 读后感', 'this is water 读后感'],
            ['content/draw', 'draw'],
            ['content/hug','hug'],
            ['content/operationRecord','records'],
            ['content/sources','sources'],
            ['content/badMood','badMood']
        ]
    
    }
}