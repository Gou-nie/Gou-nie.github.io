/*
 * @Autor: LXS
 * @Date: 2025-04-10 18:31:59
 * @LastEditors: LXS 
 * @Description: vue press 配置文件
 */
import { defineUserConfig } from 'vuepress'
import  themeConfig  from './theme.js'
import { viteBundler } from '@vuepress/bundler-vite'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'

import path from 'path'

export default defineUserConfig({
  bundler: viteBundler({
    viteOptions: {
      ssr: {
        noExternal: ['fflate']
      }
    }
  }),

  title: 'GouNie',
  description: 'GouNie',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ], 
  markdown:{
    component: true,
    tabs: true,
    spoiler: true,
  },
  theme: themeConfig,
  plugins: [
    registerComponentsPlugin({
      componentsDir: path.resolve(__dirname, './components'),
      componentsPatterns: ['**/*.vue', '!**/3D/**', '!GifEditor.vue', '!MatterJSTest*.vue', '!ThreeTest*.vue'],
      
    }),
    googleAnalyticsPlugin({
      id: 'G-YZQGD3PJJ9',
      debug: true
    })
    
  ]
})
