import { Feed } from 'feed'
import fs from 'fs'
import path from 'path'

// 站点信息
const siteUrl = 'https://your-domain.com'

const feed = new Feed({
  title: '你的博客标题',
  description: '博客 RSS 订阅',
  id: siteUrl,
  link: siteUrl,
  language: 'zh-CN',
  favicon: `${siteUrl}/favicon.ico`,
  updated: new Date(),
  generator: 'VuePress 2 + feed',
  author: {
    name: '作者名',
    link: siteUrl,
  },
})

// 读取 VuePress build 后的页面数据
const pagesPath = path.resolve('.vuepress/.temp/internal/pages.json')
const pages = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'))

pages
  .filter(page => page.frontmatter?.date)
  .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
  .forEach(page => {
    feed.addItem({
      title: page.title,
      id: siteUrl + page.path,
      link: siteUrl + page.path,
      description: page.frontmatter.description || '',
      date: new Date(page.frontmatter.date),
    })
  })

// 输出 RSS
fs.writeFileSync('dist/rss.xml', feed.rss2())
fs.writeFileSync('dist/atom.xml', feed.atom1())
fs.writeFileSync('dist/feed.json', feed.json1())
