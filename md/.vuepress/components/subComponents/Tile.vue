<template>
  <div
    class="tile"
    :class="{ empty: value === null }"
    @click="moveTile"
  >
    <!-- <span v-if="value !== null">{{ value }}</span> -->
    <img v-if="value !== null" draggable="false" :src="`https://gitee.com/xishiliuyu/resource-files/raw/master/public/images/puzzle/${value+1}.png`" />
  </div>
</template>

<script>
export default {
  name: 'Tile',
  props: {
    value: {
      type: Number,
      default: null,
    },
    index: {
      type: Number,
      required: true,
    },
    emptyIndex: {
      type: Number,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  methods: {
    moveTile() {
      const emptyRow = Math.floor(this.emptyIndex / this.size);
      const emptyCol = this.emptyIndex % this.size;
      const currentRow = Math.floor(this.index / this.size);
      const currentCol = this.index % this.size;

      // 如果当前方块和空格是相邻的，则可以交换
      if (
        (Math.abs(currentRow - emptyRow) === 1 && currentCol === emptyCol) ||
        (Math.abs(currentCol - emptyCol) === 1 && currentRow === emptyRow)
      ) {
        this.$emit('move', this.index);
      }
    },
  },
};
</script>

<style scoped>
.tile {
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: lightblue;
  font-size: 24px;
  cursor: pointer;
  user-select: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.empty {
  background-color: white;
}

.tile:hover {
  background-color: #82c9e9;
}
</style>
