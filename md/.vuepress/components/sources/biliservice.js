// server.js
import express from 'express'
import axios from 'axios'

const app = express()

app.get('/api/bili/videos', async (req, res) => {
  try {
    const url = 'https://api.bilibili.com/x/space/wbi/arc/search'
    const params = {
      mid: 472795887,     // 用户UID
      order: 'pubdate',
      ps: 25,
      pn: 1,
      index: 1,
      order_avoided: true,
      platform: 'web',
      web_location: '333.1387',
      dm_img_list: '[]',
      dm_img_str: 'V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ',
      dm_cover_img_str: 'QU5HTEUgKEludGVsLCBBTkdMRSBNZXRhbCBSZW5kZXJlcjogSW50ZWwoUikgVUhEIEdyYXBoaWNzIDYzMCwgVW5zcGVjaWZpZWQgVmVyc2lvbilHb29nbGUgSW5jLiAoSW50ZW',
      dm_img_inter: '{"ds":[],"wh":[2978,1116,110],"of":[242,484,242]}',
      w_rid: '80b76132b42274df1ca7caf3b93a032b',
      wts: 1760407215
    }

    const headers = {
      'Accept': '*/*',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Referer': 'https://space.bilibili.com/472795887',
      'Origin': 'https://space.bilibili.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'Cookie': 'buvid4=B98C66FB-1DE6-DBB5-1C0E-B922B172DA2781984-023102313-rO64Md6QzSJjDFdz1vU8XA%3D%3D; sid=88zatq6c; ...' // 非敏感Cookie即可
    }

    const resp = await axios.get(url, { params, headers })
    res.json(resp.data)
  } catch (err) {
    console.error('Bili API error:', err?.response?.status, err?.message)
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000, () => console.log('✅ Proxy running at http://localhost:3000'))
