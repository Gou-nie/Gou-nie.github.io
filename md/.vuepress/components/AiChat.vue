<template>
    <div class="ai-chat">
      <h2>AI 聊天助手</h2>
      <textarea v-model="userInput" placeholder="请输入问题..." rows="3" />
      <button @click="sendMessage" :disabled="loading">
        {{ loading ? "发送中..." : "发送" }}
      </button>
      <div v-if="reply" class="ai-reply">
        <h3>AI 回复：</h3>
        <p>{{ reply }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  export default {
    data() {
      return {
        userInput: '',
        reply: '',
        loading: false,
        apiUrl: 'http://192.168.3.15:9898/aaa'  // 本地 Flask 接口
      };
    },
    methods: {
  async sendMessage() {
    if (!this.userInput.trim()) return;

    this.loading = true;
    this.reply = '';
    await axios.post(this.apiUrl, {
      prompt: this.userInput
    }).then(response => {
        console.log("@@@@#######");
        console.log(response);
      this.reply = response.data;
      this.loading = false;
    }).catch(error => {
      console.error('Error:', error);
      this.reply = '抱歉，请求出错了。';
    })
  }
}
  };
  </script>
  
  <style scoped>
  .ai-chat {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  textarea {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  button {
    padding: 0.5rem 1rem;
  }
  .ai-reply {
    margin-top: 1rem;
    background: #f6f6f6;
    padding: 1rem;
    border-radius: 4px;
  }
  </style>
  