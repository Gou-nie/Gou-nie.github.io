<template>
    <div>
      <div class="board">
        <Tile
          v-for="(tile, index) in board"
          :key="index"
          :value="tile"
          :index="index"
          :emptyIndex="emptyIndex"
          :size="size"
          @move="moveTile"
        />
      </div>
      <button @click="shuffleBoard">重新开始</button>
    </div>
  </template>
  
  <script>
  import Tile from './Tile.vue';
  
  export default {
    name: 'Board',
    components: {
      Tile,
    },
    data() {
      return {
        size: 4, // 棋盘的行列数
        board: [null,1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // 初始棋盘
      };
    },
    computed: {
      emptyIndex() {
        return this.board.indexOf(null);
      },
    },
    methods: {
      // 获取空格的索引
      moveTile(index) {
        console.log(index);
        const emptyIndex = this.emptyIndex;
        console.log(emptyIndex);
        // 交换方块和空格的位置
        //vue2: this.$set(this.board, emptyIndex, this.board[index]);
        this.board[emptyIndex] = this.board[index];
        //vue2: this.$set(this.board, index, null);
        this.board[index] = null;
      },
      // 打乱棋盘
      shuffleBoard() {
        let shuffled = [...this.board];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        this.board = shuffled;
      },
    },
  };
  </script>
  
  <style scoped>
  .board {
    display: grid;
    grid-template-columns: repeat(4, 100px);
    grid-gap: 5px;
    margin: 20px auto;
    width: 450px;
  }
  button {
    display: block;
    margin: 20px auto;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
  }
  
  button:hover {
    background-color: #45a049;
  }
  </style>
  