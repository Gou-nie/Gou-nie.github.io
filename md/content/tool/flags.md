---
tags:
  - tool
category:
  - flags
---

# Flags

* 1. [长期](#first)
    * 1.1. [花之舞](#firstPOne)
* 2. [短期](#second)
    * 2.1. [就是爱你](secondPOne)


*能不能做的到呢？*

## 1.  <a name='first'></a> 长期
### 1.1. <a name='firstPOne'></a> 花之舞
*口琴演奏《花之舞》*
<ProgressBar text="完成状态" :progress="flowerdance" :start-time="new Date('2025-11-18')" :end-time="new Date('2026-11-18')"/>


## 2. <a name='second'></a> 短期
### 2.1. <a name='secondPOne'></a> 就是爱你
*尤克里里演奏《就是爱你》*
<ProgressBar text="完成状态" :progress="justloveyou" :start-time="new Date('2025-11-18')" :end-time="new Date('2025-12-18')"/>


 
<script>
export default {
  data(){
    return:{
      flowerdance: 0,
      justloveyou: 0
    }
  }
  methods:{
    getQAddress() {
          fetch('https://pywebtest.aleahquagef.top/read_file/flags.txt')
              .then(response => response.json())
              .then(data => {
                  this.getInfoByStr(data.content);
              })
              .catch(error => {
                  console.error('Error:', error)
                  this.getInfoByStr(null)
              });
      },
      getInfoByStr(content) { 
            const lines = content.split('\n');

            // 生成对象或者数组
            const result = {};
            lines.forEach(line => {
              const [key, value] = line.split('=');
              result[key] = value;
            });
            this.flowerdance = Number(result.flowerdance)
            this.justloveyou = Number(result.justloveyou)
             
      }
  }
}
  
</script>