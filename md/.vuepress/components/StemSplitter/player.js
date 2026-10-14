/*
 * @Autor: LXS
 * @Date: 2026-10-14
 * @Description: 双轨播放器（人声 / 伴奏）
 *
 * 为什么用「两个 <audio> 元素 + Web Audio 混音」的混合结构：
 *  - 传输控制（play/pause/seek/变速）交给 <audio>，这样变速走的是浏览器的
 *    preservesPitch（变速不变调），跟练降速才有意义。
 *    纯用 AudioBufferSourceNode 的话 playbackRate 会连音调一起改，0.75 倍时人声
 *    下移约 5 个半音，跟练基本没法用。
 *  - 混音（切轨 / 交叉淡化 / 总音量）交给 GainNode，比 element.volume 可靠
 *    （iOS/Safari 上 element 音量常被系统接管）。
 *
 * 单个实例只服务一首歌：换歌请先 dispose() 再 new 一个。
 * 原因：createMediaElementSource() 对同一个元素一辈子只能调用一次，
 * 复用元素会把音频图搞坏。
 */

/** 跟练预设速度（1 为原速，全部不变调） */
export const RATE_PRESETS = [1, 0.9, 0.75, 0.6, 0.5]

/** 两轨都出声时，漂移超过 50ms 才纠正：再小听不出来，再大就开始有镶边感 */
const SYNC_HARD = 0.05
/** 被静音的那一轨可以激进纠正——没人听得见 seek 的爆音 */
const SYNC_SOFT = 0.25
/** 纠正限频，避免 seek 风暴 */
const SYNC_MIN_GAP = 500
/** 切轨淡入淡出时长 */
const FADE = 0.02
/** 认为「这一轨在出声」的音量阈值 */
const AUDIBLE = 0.01

const clamp01 = (v) => Math.min(1, Math.max(0, Number(v) || 0))

/** 等 <audio> 拿到元数据（时长），带超时，避免坏文件把流程卡死 */
function onceMetadata(el, timeoutMs = 15000) {
  if (el.readyState >= 1 && Number.isFinite(el.duration)) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const done = (fn, arg) => {
      el.removeEventListener('loadedmetadata', onOk)
      el.removeEventListener('error', onErr)
      clearTimeout(timer)
      fn(arg)
    }
    const onOk = () => done(resolve)
    const onErr = () => done(reject, new Error('音轨解码失败'))
    const timer = setTimeout(() => done(reject, new Error('音轨加载超时')), timeoutMs)
    el.addEventListener('loadedmetadata', onOk)
    el.addEventListener('error', onErr)
  })
}

export class StemPlayer {
  /**
   * @param {object}   opt
   * @param {HTMLElement} opt.mountEl  隐藏 <audio> 元素的挂载点
   * @param {(t: number, duration: number) => void} [opt.onTime]  每帧回调（镜像当前播放位置）
   * @param {(s: 'playing'|'paused'|'ended') => void} [opt.onState]
   * @param {(ms: number) => void} [opt.onDrift]  两轨漂移（毫秒，带符号），调试用
   */
  constructor({ mountEl, onTime, onState, onDrift } = {}) {
    this.mountEl = mountEl || document.body
    this.onTime = onTime
    this.onState = onState
    this.onDrift = onDrift

    this.ctx = null
    this.srcA = null
    this.srcB = null
    this.gA = null
    this.gB = null
    this.masterNode = null

    this.elA = this._createEl() // 人声
    this.elB = this._createEl() // 伴奏

    this.playing = false
    this.loop = false
    this.volume = 1
    this.rate = 1
    this.levelA = 1
    this.levelB = 0
    this.masterIsA = true
    this.swapped = false

    this.rafId = 0
    this.lastFixAt = 0
    this._drift = 0
    this._disposed = false

    this._onEnded = () => {
      if (!this.playing || this._disposed) return
      if (this.loop) {
        this.elA.currentTime = 0
        this.elB.currentTime = 0
        this.lastFixAt = 0
        Promise.all([this.elA.play(), this.elB.play()]).catch(() => {})
        return
      }
      this.playing = false
      this._stopTick()
      // 让进度条停在末尾
      this.onTime?.(this.duration, this.duration)
      this.onState?.('ended')
    }
    this.elA.addEventListener('ended', this._onEnded)
    this.elB.addEventListener('ended', this._onEnded)
  }

  _createEl() {
    const el = document.createElement('audio')
    el.preload = 'auto'
    el.setAttribute('playsinline', '')
    el.style.display = 'none'
    // 变速不变调（老浏览器用私有前缀）
    el.preservesPitch = true
    el.mozPreservesPitch = true
    el.webkitPreservesPitch = true
    this.mountEl.appendChild(el)
    return el
  }

  // ---------------------------------------------------------------- 生命周期

  /**
   * 绑定两轨并等元数据就绪。
   * @param {[string, string]} urls [0]=人声 [1]=伴奏（blob URL）
   */
  async attach(urls) {
    const [vocals, inst] = urls || []
    if (!vocals || !inst) throw new Error('缺少音轨地址')
    this.elA.src = vocals
    this.elB.src = inst
    this.elA.load()
    this.elB.load()
    await Promise.all([onceMetadata(this.elA), onceMetadata(this.elB)])
    this._applyRate()
    this._applyLevels(0) // 建图前先设好初值，避免 play() 瞬间的跳变
  }

  /** 懒创建 AudioContext 与音频图（必须在用户手势里调用） */
  async ensureContext() {
    if (this._disposed) return
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume()
      return
    }
    // @ts-ignore 老版 Safari 的私有前缀
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) throw new Error('当前浏览器不支持 Web Audio')
    this.ctx = new AC()

    this.srcA = this.ctx.createMediaElementSource(this.elA)
    this.srcB = this.ctx.createMediaElementSource(this.elB)
    this.gA = this.ctx.createGain()
    this.gB = this.ctx.createGain()
    this.masterNode = this.ctx.createGain()

    this.srcA.connect(this.gA)
    this.srcB.connect(this.gB)
    this.gA.connect(this.masterNode)
    this.gB.connect(this.masterNode)
    this.masterNode.connect(this.ctx.destination)

    this.gA.gain.value = this.levelA
    this.gB.gain.value = this.levelB
    this.masterNode.gain.value = this.volume

    if (this.ctx.state === 'suspended') await this.ctx.resume()
  }

  /** 页面从后台回来时调用（移动端 Safari 会把 context 挂起） */
  async resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume()
      } catch {
        /* 忽略：等下次用户手势 */
      }
    }
  }

  // ------------------------------------------------------------------ 传输

  async play() {
    if (this._disposed || !this.elA.src || !this.elB.src) return
    await this.ensureContext()
    if (this.ctx.state === 'suspended') await this.ctx.resume()

    const dur = this.duration
    // 播到头了再点播放，从头开始
    let t = this.masterEl.currentTime
    if (dur && t >= dur - 0.05) t = 0

    this.elA.currentTime = t
    this.elB.currentTime = t
    this.playing = true
    this.lastFixAt = 0
    try {
      // 同一个 task 里同步发起，中间不要 await 别的东西
      await Promise.all([this.elA.play(), this.elB.play()])
    } catch (err) {
      // 自动播放被拦截等情况：把状态退回去，别留下「假装在播」的 UI
      this.playing = false
      this._stopTick()
      throw err
    }
    this.onState?.('playing')
    this._startTick()
  }

  pause() {
    if (this._disposed || !this.playing) return
    this.playing = false
    this._stopTick()
    this.elA.pause()
    this.elB.pause()
    this.onTime?.(this.masterEl.currentTime, this.duration)
    this.onState?.('paused')
  }

  async toggle() {
    if (this.playing) this.pause()
    else await this.play()
  }

  /** @param {number} t 秒 */
  seek(t) {
    if (this._disposed) return
    const dur = this.duration
    const target = Math.min(Math.max(0, t || 0), dur || 0)
    this.elA.currentTime = target
    this.elB.currentTime = target
    // 让下一帧立刻校验一次
    this.lastFixAt = 0
    this.onTime?.(target, dur)
  }

  // ------------------------------------------------------------------ 混音

  /**
   * 0 = 纯人声（满音量）
   * 0.5 = 人声 + 伴奏（满音量，正好还原原始混音）
   * 1 = 纯伴奏（满音量）
   *
   * 为什么不是「两轨音量相加恒为 1」的常规交叉淡化：两条 stem 是相减关系
   * （伴奏 = 混音 − 人声），叠加时系数之和为 2 才等于原混音。
   * 所以中间段让当前占主导的那一轨保持满音量，另一轨从 0 淡入到 1。
   * @param {number} v 0..1
   */
  setMixValue(v) {
    const t = clamp01(v)
    if (t <= 0.5) {
      // 人声满音量，伴奏淡入
      this.levelA = 1
      this.levelB = 2 * t
    } else {
      // 伴奏满音量，人声淡出
      this.levelB = 1
      this.levelA = 2 * (1 - t)
    }
    this.masterIsA = this.levelA >= this.levelB
    this._applyLevels(FADE)
  }

  /** @param {'vocals'|'both'|'inst'} mode */
  setMixMode(mode) {
    if (mode === 'vocals') this.setMixValue(0)
    else if (mode === 'inst') this.setMixValue(1)
    else this.setMixValue(0.5)
  }

  /** 总音量 @param {number} v 0..1 */
  setVolume(v) {
    this.volume = clamp01(v)
    if (this.masterNode) this.masterNode.gain.value = this.volume
  }

  /** 两轨对调（模型输出的标签可能接反时的兜底） */
  setSwapTracks(on) {
    const want = !!on
    if (want === this.swapped) return
    this.swapped = want
    // 纯引用互换：元素、源节点、增益节点一起换，音频图依然自洽
    const el = this.elA
    this.elA = this.elB
    this.elB = el
    const src = this.srcA
    this.srcA = this.srcB
    this.srcB = src
    const g = this.gA
    this.gA = this.gB
    this.gB = g
    this._applyLevels(FADE)
  }

  // ------------------------------------------------------------------ 变速

  /** @param {number} r 0.25~2 */
  setRate(r) {
    this.rate = Number(r) || 1
    this._applyRate()
  }

  setLoop(on) {
    this.loop = !!on
  }

  // ------------------------------------------------------------------ 内部

  _applyRate() {
    for (const el of [this.elA, this.elB]) {
      if (!el) continue
      el.playbackRate = this.rate
      // 暂停后再 play 也保持速率
      el.defaultPlaybackRate = this.rate
    }
  }

  _applyLevels(fade) {
    const at = this.ctx ? this.ctx.currentTime : 0
    for (const [node, level] of [
      [this.gA, this.levelA],
      [this.gB, this.levelB],
    ]) {
      if (!node) continue
      if (fade > 0) node.gain.setTargetAtTime(level, at, fade)
      else node.gain.value = level
    }
  }

  get masterEl() {
    return this.masterIsA ? this.elA : this.elB
  }

  get followerEl() {
    return this.masterIsA ? this.elB : this.elA
  }

  _startTick() {
    if (this.rafId) return
    const tick = () => {
      if (!this.playing || this._disposed) {
        this.rafId = 0
        return
      }
      const m = this.masterEl
      const f = this.followerEl
      if (m && f && Number.isFinite(m.currentTime) && Number.isFinite(f.currentTime)) {
        const drift = f.currentTime - m.currentTime
        this._drift = drift
        this.onDrift?.(drift * 1000)
        // 跟着的那一轨若在出声就得小心纠正；若被静音则可以激进纠正
        const followerAudible = (this.masterIsA ? this.levelB : this.levelA) > AUDIBLE
        const threshold = followerAudible ? SYNC_HARD : SYNC_SOFT
        const now = performance.now()
        if (Math.abs(drift) > threshold && now - this.lastFixAt > SYNC_MIN_GAP) {
          f.currentTime = m.currentTime
          this.lastFixAt = now
        }
        this.onTime?.(m.currentTime, this.duration)
      }
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  _stopTick() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
  }

  // ------------------------------------------------------------------ 只读

  get duration() {
    const d = this.elA?.duration
    return Number.isFinite(d) ? d : 0
  }

  get currentTime() {
    return this.masterEl?.currentTime || 0
  }

  get isPlaying() {
    return this.playing
  }

  /** 两轨漂移（毫秒，带符号） */
  get driftMs() {
    return this._drift * 1000
  }

  /**
   * 停播、断开所有节点、关闭 AudioContext、移除 <audio> 元素。
   * 注意：不负责 revokeObjectURL —— 调用方在本方法返回后再 revoke，
   * 因为这里已经先解绑 src 了，顺序反了会让播放中的元素立刻报错。
   */
  dispose() {
    if (this._disposed) return
    this._disposed = true
    this.playing = false
    this._stopTick()

    for (const el of [this.elA, this.elB]) {
      if (!el) continue
      try {
        el.pause()
      } catch {
        /* 忽略 */
      }
      el.removeEventListener('ended', this._onEnded)
    }
    for (const el of [this.elA, this.elB]) {
      if (!el) continue
      el.removeAttribute('src') // 先解绑，调用方随后才能安全 revoke
      try {
        el.load()
      } catch {
        /* 忽略 */
      }
      el.remove()
    }
    for (const node of [this.srcA, this.srcB, this.gA, this.gB, this.masterNode]) {
      try {
        node?.disconnect()
      } catch {
        /* 忽略 */
      }
    }
    if (this.ctx) {
      try {
        this.ctx.close()
      } catch {
        /* 忽略 */
      }
    }
    this.ctx = null
    this.srcA = this.srcB = this.gA = this.gB = this.masterNode = null
    this.elA = this.elB = null
  }
}
