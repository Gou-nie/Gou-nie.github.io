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
        // fflate 需要内联进 SSR bundle（CJS/ESM 互操作）
        noExternal: ['fflate'],
        // 音轨分离用的两个包是纯浏览器包（navigator / Worker / WebAssembly / OfflineAudioContext），
        // SSR 阶段一律保持 external，绝不让 Node 去加载它们。
        // 注意：它们要放 external，不能放 noExternal —— 后者会把包打进 SSR bundle 由 Node 执行。
        external: ['onnxruntime-web', 'web-audio-separation'],
      },
      optimizeDeps: {
        // 不做 esbuild 预打包：ort.bundle.min.mjs 是自包含单文件，
        // 且内部用了 import.meta / new Worker / Blob worker，预打包反而有改写风险。
        exclude: ['onnxruntime-web', 'web-audio-separation'],
      },
      resolve: {
        // 保证我们和 web-audio-separation 内部拿到同一个 ORT 模块实例
        dedupe: ['onnxruntime-web'],
      },
      build: {
        // onnxruntime-web 的 ESM 用了较新的语法，避免 Vite 默认 target 下的降级报错
        target: 'esnext',
      },
    }
  }),

  title: 'GouNie',
  description: 'GouNie',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ], 
  markdown:{
    component: true,
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
