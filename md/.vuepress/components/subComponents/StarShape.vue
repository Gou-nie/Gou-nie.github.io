<template>
    <svg :width="size" :height="size" viewBox="-2 -2 4 4" xmlns="http://www.w3.org/2000/svg" :fill="color">
        <polygon points="0,2 1.732,-1 -1.732,-1" />
        <polygon points="-1.732,1 1.732,1 0,-2  " />
    </svg>
</template>

<script>
export default {
    name: "SixPointedStar",
    props: {
        color: {
            type: String,
            default: "#aaaaaa",
        },
        size: {
            type: [String, Number],
            default: 100,
        },
    },
};
</script>