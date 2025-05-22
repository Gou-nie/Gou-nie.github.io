---
# layout: Slides
sidebar: false
---
# 烂畫


@slidestart
## 敬请欣赏

---

 <img src="/images/draw/1717238759072.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1717939930133.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266866631.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266874606.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266884390.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266890106.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266895957.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266902319.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266908915.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266916961.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266928506.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266934428.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266942701.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266947882.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266954375.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266960461.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266967691.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266973605.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266980483.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266990314.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747266997332.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747267003031.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747267009237.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747267014539.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747267021504.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747267035125.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747267042934.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747267049496.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747267060036.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

 <img src="/images/draw/1747267065834.jpg" style="max-width:90%; max-height:60vh; margin:0 auto; display:block;">

---

## 感谢观看

*批量处理脚本*
```shell
# md图片直接显示
ls md/.vuepress/public/images/draw/*.jpg | grep -o '[^/]*$' | sort | sed 's/\(.*\)/\n---\n\n![](\/images\/draw\/\1)/'

# img标签显示
ls md/.vuepress/public/images/draw/*.jpg | grep -o '[^/]*$' | sort | sed 's/\(.*\)/\n---\n\n <img src=\"\/images\/draw\/\1\" style=\"max-width:90%; max-height:60vh; margin:0 auto; display:block;\">/'

```



@slideend