<template>
  <VideoPlayer :videos="videoList" :autoplayOnSwitch="true" />
</template>

<script setup>
import VideoPlayer from './subComponents/VideoPlayer.vue'
import axios from 'axios'

 
const videoList = [
  // 普通 mp4 视频
//   {
//     type: 'file',
//     title: '本地示例视频',
//     src: '/videos/demo1.mp4',
//     poster: '/posters/demo1.jpg',
//     autoplay: false
//   },



//   // 也可以传完整 iframe 地址（例如你有自定义参数）
//   {
//     type: 'bilibili',
//     title: 'B 站完整 iframe',
//     src: 'https://player.bilibili.com/player.html?bvid=BV182421T7J8',
//     autoplay: 0
//   },
  // B 站视频：只传 bvid（更简洁）
  {
    type: 'bilibili',
    title: '你拿机械我刷元素',
    src: 'BV17KtBehEr7',
    pic:'https://i2.hdslb.com/bfs/archive/242ce6ccaf3b9c4ce1e61f905dea579ab8b6e347.jpg',
    autoplay: 0
  },
  {
    type: 'bilibili',
    title: '垃圾跳蛙',
    src: 'BV1EX4seZEEZ',
    pic:'http://i1.hdslb.com/bfs/archive/f376dcddcf3459247845f9b61ce859c481d5dd72.jpg',
    autoplay: 0
  },
  {
    type: 'bilibili',
    title: 'B 站示例 BV',
    src: 'BV1ku4m1u7qW',
    pic:'http://i1.hdslb.com/bfs/archive/da240c43092167586072534204e79254cfa54700.jpg',
    autoplay: 0
  },
  {
    type: 'bilibili',
    title: 'B 站示例 BV',
    src: 'BV182421T7J8',
    pic:'http://i1.hdslb.com/bfs/archive/81b4aa14bb001f694ed33a2814b9d07953f8514d.jpg',
    autoplay: 0
  },
  {
    type: 'bilibili',
    title: '只能再打一次',
    src: 'BV11o4y1o7c8',
    pic:'http://i0.hdslb.com/bfs/archive/ebace9edb693b268e35cafa7eec083849052852e.jpg',
    autoplay: 0
  },
  {
    type: 'bilibili',
    title: '相册底部',
    src: 'BV1sh411y7Uz',
    pic:'http://i1.hdslb.com/bfs/archive/00736b439657ee172e6ba1296ed153186e8828e4.jpg',
    autoplay: 0
  },
]
</script>
