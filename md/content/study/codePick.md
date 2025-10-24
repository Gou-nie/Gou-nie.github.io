---
star: true
tags:
  - animation
category:
  - study
---



# 代码片段和一些配置

* 1. [参数配置](#first)
    * 1.1. [epubJS](#firstPOne)

*好记性不如烂笔头*

## 1.  <a name='first'></a> epubJS配置项

```
type RenditionOptions = {
  width?: string | number; // 视图宽度
  height?: string | number; // 视图高度
  ignoreClass?: string; // 忽略类名
  manager?: 'continuous' | 'default'; // 布局管理器
  view?: 'iframe' | Object | Function; // 视图容器
  flow?: 'paginated' | 'scrolled'; // 阅读方式
  layout?: string; // TODO: 我没看懂
  spread?: 'none' | boolean; // 是否显示双页
  minSpreadWidth?: number; // 最小触发双页的宽度
  resizeOnOrientationChange?: boolean; // 在窗口 resize 时调整内容尺寸
  script?: string; // 注入到 View 中的 js 代码
  stylesheet?: string; // 注入到 View 中的 css 样式
  infinite?: boolean; // 是否无限翻页
  overflow?: string; // 设置视图的 CSS overflow 属性
  snap?: boolean; // 是否支持翻页
  defaultDirection?: string; // 阅读方向
  allowScriptedContent?: boolean; // iframe 沙盒是否能够执行 js
};

```