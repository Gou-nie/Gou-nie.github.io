<!-- 引自 https://github.com/ZERO-DG/vue3-starry-sky -->

<script setup name="StarrySky">
import { ref, onMounted } from 'vue';

const props = defineProps({
	starsCount: {
		type: Number,
		default: () => 800,
	},
	distance: {
		type: Number,
		default: () => 800,
	},
});

//星星实体
const star = ref();

onMounted(() => {
	let starArr = star.value;
	starArr.forEach((item) => {
		let speed = 0.1 + Math.random() * 1;
		let thisDistance = props.distance + Math.random() * 300;
		item.style.transformOrigin = `0 0 ${thisDistance}px`;
		item.style.transform = `translate3d(0,0,-${thisDistance}px) rotateY(${Math.random() * 360}deg) rotateX(${
			Math.random() * -50
		}deg) scale(${speed},${speed})`;
	});
});
</script>

<template>
	<div class="starry-sky-bg">
		<div class="stars"> 
			<div v-for="item in starsCount" :key="item" class="star" ref="star"></div>
		</div>
	</div>
</template>

<style scoped>
.starry-sky-bg {
	width: 100%;
	height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 99;
	/* background: radial-gradient(200% 100% at bottom center, #f7f7b6, #e96f92, #75517d, #1b2947); */
	/* background: radial-gradient(220% 105% at top center, #1b2947 10%, #75517d 40%, #e96f92 65%, #f7f7b6); */
	
	background-attachment: fixed;

	/* 美学优化后的渐变背景 + 动态光感 */
background: 
  radial-gradient(
    220% 105% at top center,
	 rgba(27, 41, 71, 1) 10%,      
    rgba(37, 30, 38, 0.85) 40%,   
    rgba(70, 35, 45, 0.6) 65%,   
    rgba(55, 55, 40, 0.4)        
  ),
  radial-gradient(
    200% 100% at bottom center,
    rgba(247, 247, 182, 0.2),
    rgba(233, 111, 146, 0.3),
    rgba(117, 81, 125, 0.4),
    rgba(27, 41, 71, 0.5)
  );
background-size: 200% 200%;
background-repeat: no-repeat;
animation: glowBackground 15s ease-in-out infinite;


}
/* 动态背景动画定义 */
@keyframes glowBackground {
  0%   { background-position: 0% 100%; }
  50%  { background-position: 100% 0%; }
  100% { background-position: 0% 100%; }
}
@keyframes rotate {
	0% {
		transform: perspective(400px) rotateZ(20deg) rotateX(-40deg) rotateY(0);
	}
	100% {
		transform: perspective(400px) rotateZ(20deg) rotateX(-40deg) rotateY(-360deg);
	}
}

.stars {
	transform: perspective(500px);
	transform-style: preserve-3d;
	position: fixed;
	perspective-origin: 50% 100%;
	left: 50%;
	animation: rotate 80s infinite linear;
	bottom: 0;
	z-index: 100;
}

.star {
	width: 2px;
	height: 2px;
	background: #f7f7b8;
	position: fixed;
	top: 0px;
	left: 0;
	backface-visibility: hidden;
}
</style>