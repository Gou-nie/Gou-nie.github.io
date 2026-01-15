const { Feed } = require('feed');
const fs = require('fs');
const path = require('path');

const siteUrl = 'https://gou-nie.github.io/';

const feed = new Feed({
  title: 'GouNie',
  description: 'GouNie',
  id: siteUrl,
  link: siteUrl,
  language: 'zh-CN',
  favicon: `${siteUrl}/favicon.ico`,
  updated: new Date(),
  generator: 'VuePress 2 + feed',
  author: {
    name: 'gounie',
    link: siteUrl,
  },
});

const pagesPath = path.resolve('.vuepress/.temp/internal/pages.json');
const pages = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'));

pages
  .filter((page) => page.frontmatter && page.frontmatter.date)
  .sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  )
  .forEach((page) => {
    feed.addItem({
      title: page.title,
      id: siteUrl + page.path,
      link: siteUrl + page.path,
      description: page.frontmatter.description || '',
      date: new Date(page.frontmatter.date),
    });
  });

const outDir = path.resolve('.vuepress/dist');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'rss.xml'), feed.rss2());
fs.writeFileSync(path.join(outDir, 'atom.xml'), feed.atom1());
fs.writeFileSync(path.join(outDir, 'feed.json'), feed.json1());
