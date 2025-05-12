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
    component: true
  },
  theme: themeConfig,
  plugins: [
    registerComponentsPlugin({
      // components:{
      //   CanvasBoard: {
      //     path: "./components/CanvasBoard.vue"
      //   }
      // }
      componentsDir: path.resolve(__dirname, './components')
    })
  ]
})
