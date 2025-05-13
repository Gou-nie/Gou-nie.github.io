<h1>vuepress部署</h1>
<h2>目录</h2>

* 1. [githubPages](#first)
   * 1.1. [创建仓库](#firstFist)
   * 1.2. [拉取仓库并提交代码](#firstSecond)
   * 1.3. [githubPagesBase](#firstThird)
   
* 2. [项目配置](#second)
   * 2.1. [代码中配置](#secondFirst)  
   * 2.2. [github页配置](#secondSecond)  



## 1.  <a name=first></a> githubPages 

### 1.1 <a name=firstFirst></a> 创建仓库
什么是代码仓库=>放代码的地方，有一个链接可以直接获取它）

<br> &emsp;a.右上角的加号下选择New repo。如图1 

![图1](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE1.png "Magic Gardens")

<center>图1</center>

<br> &emsp;b. 仓库名称规则：username.github.io  username替换成自己的账户名字，例Aleahpeal如图2

![图2](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE2.png "Magic Gardens")
<center>图2</center>

<br> &emsp;c. 查看选择public，private是不行的，踩过坑T_T。如图3

![图3](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE3.png "Magic Gardens")
<center>图3</center>
<br> &emsp;d. 勾选生成readme.md。这样就不用初始化仓库了。如图4

![图4](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE4.png "Magic Gardens")
<center>图4</center>
<br> &emsp;e. create repo  完成！^_^
 

<br> &emsp;





### 1.2 <a name=firstSecond></a> 拉取仓库并提交代码
 *注：可以按照本文命令操作git，也可以去安装可视化软件“小乌龟”操作，在此不做赘述*

 <br> &emsp;a.在仓库的code页点击大绿按钮复制仓库地址。如图5

![图5](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE5.png "Magic Gardens")
<center>图5</center>
 <br> &emsp;b.在装好git的环境找一个你准备放代码的位置然后点击右键出现git bash点击选择它就会出现一个黑色窗口。（呜呜呜 希望git你那里有 ）在窗口输入执行命令 git clone + https://test.com[刚复制的内容]如图6则算成功。

![图6](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE6.png "Magic Gardens")
<center>图6</center>
 <br> &emsp;c.输入命令ls查看文件列表是不是多一个跟项目名称【username.github.io】相同的文件夹。然后呢数日命令cd + 文件夹名（这里可以输入头两个字母然后按tab【q左边】补全），进入目录之后使用echo创建文件index.html如图7

![图7](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE7.png "Magic Gardens")
<center>图7</center>
 <br> &emsp;d.执行git add 。&& git commit -m “feat” && git push 提交推送【上传】index文件到仓库。然后在github的那个仓库里就能看到刚刚上传的文件和提交记录了。如图8 图9 完成^_^ ! 

![图8](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE8.png "Magic Gardens")
<center>图8</center>

![图9](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE9.png "Magic Gardens")
<center>图9</center>
 <br> &emsp;


### 1.3 <a name=firstThird></a> githubPagesBase

 <br> &emsp;这个时候访问地址https://gou-nie.github.io/【htts://username.github.io】就是渲染的刚写的index.html页面，如图10. 这样我们的静态页面就发布到网上了。完成^_^ 

![图10](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE10.png "Magic Gardens")
<center>图10</center>

到这里简单了解了github pages的提供的功能，按用户划分一个域名【username.github.io】去找到【username.github.io】这个仓库并渲染代码到端口给浏览器展示，注意格式是固定的。ok，休息一下。这里可以将许多静态页面发布，比如我列表里的adForAle这个库直接放到你的这个pages仓库里。接下来来点操作了。

## 2.  <a name='second'></a> 项目配置
<br>&emsp;如果第一次搞的话,前面可能会遇到各种问题.第一次学习总是这样的,都是一个坎一个坎走过来的,相信你成功之后的成就感已经给你鼓舞了,让我们进入下一步吧.
<br>&emsp;上一节已经发一个hello页到自己的github.io上了,我们的最终目的是将我们日常记录内容放在web上去展示.首先找了一个简单的框架-vuepress:只需要在config.js中配置相关参数就能将md文件渲染到网页上,所以2.1节就说一下相关配置. 
<br>&emsp;因为要发布到githubPages需要的是打包好的静态文件,这里我们采用github上的工作流来线上node打包将静态文件推送到新的分支gh-pages上,然后给pages去转发到github.io的域名.

### 2.1. <a name='secondFirst'></a> 代码中配置
vuepress官方文档: https://v1.vuepress.vuejs.org/zh/

项目目录结构大致如下.

| 路径 | 文件/文件夹 | 说明 |
|------|-------------|------|
| `./` | `README.md` | 项目说明文档 |
| `./` | `index.html` | 首页 HTML |
| `./md/` | `.DS_Store` | 系统文件 |
| `./md/` | `.vuepress/` | VuePress 配置目录 |
| `./md/.vuepress/` | `config.js` | 配置规则和路由 |
| `./md/.vuepress/public/` | `favicon.ico` | 标签页图标 |
| `./md/.vuepress/public/` | `logo.png` | 头像或 logo |
| `./md/.vuepress/styles/` | `palette.styl` | 样式自定义文件 |
| `./md/` | `content/` | 存放内容的目录（Markdown 格式） |
| `./md/content/` | `faith.md` | 一篇文章 |
| `./md/content/` | `this is water 读后感.md` | 读后感文章 |
| `./md/` | `index.md` | 入口 Markdown 文件 |
| `./` | `package-lock.json` | 锁定依赖版本 |
| `./` | `package.json` | 项目依赖配置 |
| `./` | `test.txt` | 测试文件 |

先看下配置文件,
<br>md/.vuepress/config.js

```js
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
    head: [
        ['link', { //这里是标签头的图标
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
        nav: [{//这里是顶部菜单栏
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
            },  
        ],
        sidebar: [ //这里是侧边导航栏
            ['content/faith', 'faith'],
            ['content/vuepress部署', 'vuepress部署'],
            ['content/this is water 读后感', 'this is water 读后感']
        ]
    
    }
}
```
<br>&emsp;仔细看的话你已经发现有点规律了,我们所有的md文件都放在md/content中,然后在config.js中的themeConfig字段的nav和sidebar中填写具体的md文件地址,让vuepress去处理的时候映射数据和页面结构的关系.你看nav使用[]中括号扩起来是个列表，{}大括号括起来的是对象实体，看text为‘首页’的那个和text为‘觀點’的那个他俩是平级的，在页面上的右上角可以看到，‘觀點’里面也是一个有三个元素的列表，鼠标悬停上你可以看到下拉出来的三个菜单。sidebar这个就好理解一点，[[index1,tag1],[index2,tag2],[index3,tag3]] 但是你看到页面上侧边栏有子目录是吧，那个是md文档的目录自动识别过去的 这里sidebar只是设置文件索引就行。
不确定这里说的清楚与否，前置理解内容：“json数据结构”。这个主要还是看themeConfig里面的配置和页面的映射来理解怎么配置。别混淆,这个需要耐心看看,切忌急躁,越急是越看不进去的.

<br>&emsp;上边说的是项目内部结构,再看下githubPages的流水线脚本:

<br>.github/deploy.yml

```yml
name: Deploy VuePress to GitHub Pages 1

on:
  push:
    branches:
      - main   

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'   

      - name: Install dependencies
        run: npm install

      - name: Build VuePress site
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.ACCESS_TOKEN }}
          publish_dir: ./dist

```
<br>&emsp;这个就是将node启动脚本(没法展开说,不本地运行不用关心),主要注意个点secrets.ACCESS_TOKEN这个令牌是需要在github上配置的,虽然有默认的但是有可能出现意外,所以下面一节会说到这个令牌的申请和使用.


### 2.2. <a name='secondSecond'></a> github页配置

好的,如果前面的都看的差不多了,现在开始登录github,搞一下这边的配置.
<br>&emsp;a. 创建令牌.首先点击右上方头像找到setting进入再点击最下面的DeveloperSetting如图11和图12

![图11](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE11.png "Magic Gardens")
<center>图11</center>

![图12](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE12.png "Magic Gardens")
<center>图12</center>
<br>&emsp;然后按图13所示,进入令牌创建页

![图13](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE13.png "Magic Gardens")
<center>图13</center>

<br>&emsp;b. 找到repo权限设置的地方选择[username.github.io]这个仓库如图14

![图14](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE14.png "Magic Gardens")
<center>图14</center>

<br>&emsp;接着设置权限打开图15所示的下拉项,选择其中Action | Content | workflows 三个权限设置为读写都允许.

![图15](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE15.png "Magic Gardens")
<center>图15</center>
完成之后点击生成令牌,会展示如图16内容,这个令牌复制出来存好,待会要放到仓库里.令牌会在页面刷新之后就不可见.

![图16](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE16.png "Magic Gardens")
<center>图16</center>

<br>&emsp;c. 现在转到仓库页面,点击setting去填写action允许的安全令牌如图17所示

![图17](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE17.png "Magic Gardens")
<center>图17</center>

<br>&emsp;这里令牌名称填写"ACCESS_TOKEN"需要和工作流脚本里引用的名称一致[.github/workflows/deploy.yml]如图18所示

![图18](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE18.png "Magic Gardens")
<center>图18</center>

<br>&emsp;这时候将已经写好的md放到相应位置并配置好config.js之后就能将代码提交远程主分支,此时会触发工作流,可以去action里看下执行情况,这里你会看到一个和提交重名的执行记录.如图19

![图19](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE19.png "Magic Gardens")
<center>图19</center>

<br>&emsp;如果这时候访问https://${username}/github.io 发现还是404找不到也面是怎么回事?  回想第一节直接将静态index.html放仓库就可以了的.为什么更新过的还是原本的index页呢? 细心的你一定发现了分支不一样,我们的工作流将打包好的文件推送到了gh-pages分支上还记得么?看下仓库的这个分支是不是也有一个index.html呢?

<br>&emsp;那我们怎么去设置让 https://${username}/github.io 展示的是gh-pages分支下的文件呢?这里需要去到仓库的setting页的pages选项中的构建部署设置中选择按分支部署并选定gh-pages分支即可,如图20所示


![图20](http://aleah.oss-cn-heyuan.aliyuncs.com/static/%E5%9B%BE20.png "Magic Gardens")
<center>图20</center>

ok 这里我们就可以访问 https://${username}/github.io 我们自己的页面了,


虽然只是个简单的文档列表页,但是东西细节很多呢.  感谢阅读!



