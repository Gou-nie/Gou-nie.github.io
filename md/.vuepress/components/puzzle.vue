<template>
    <div id="puzzleApp">
      <h1>PUZZLE</h1>
      <Board />
    </div>
  </template>
  
  <script>
  import Board from './subComponents/Board.vue';
  
  export default {
    name: 'App',
    components: {
      Board,
    },
  };
  </script>
  
  <style>
  #puzzleApp {
    text-align: center;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    color: #2c3e50;
    margin-top: 60px;
  }
  h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }
  </style>
  