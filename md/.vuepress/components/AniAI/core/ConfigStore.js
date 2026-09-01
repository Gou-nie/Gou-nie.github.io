/**
 * 本地配置缓存：把「键位绑定 / 自定义动作 / 已保存姿态」写进 localStorage，
 * 下次打开页面自动恢复。
 *
 * 按模型分桶（storageKey 带模型标识）：不同 GLB 的骨骼名不同，
 * 配置混用会导致绑定指向不存在的骨骼，所以每个模型各存一份。
 *
 * 数据形状：
 * {
 *   bindings: { [actionId]: { key: string|null, mode: 'press'|'hold'|'toggle' } },
 *   actions:  [ { id, type, label, bone, axis, angle, speed, duration, poseName } ],
 *   poses:    { [poseName]: { [boneName]: [x, y, z, order] } }
 * }
 */
const PREFIX = "aniai:config:v1:";

export class ConfigStore {
  constructor(modelKey = "default") {
    this.storageKey = PREFIX + (modelKey || "default");
  }

  /** localStorage 句柄；SSR 与 Safari 隐私模式下拿不到时返回 null */
  get _storage() {
    try {
      return typeof window !== "undefined" ? window.localStorage : null;
    } catch (err) {
      return null;
    }
  }

  /** 读取配置，永远返回结构完整的对象（缺失/损坏时给空值） */
  load() {
    const empty = { bindings: {}, actions: [], poses: {} };
    let raw = null;
    try {
      raw = this._storage?.getItem(this.storageKey) ?? null;
    } catch (err) {
      return empty;
    }
    if (!raw) return empty;

    try {
      const data = JSON.parse(raw);
      return {
        bindings: isPlainObject(data.bindings) ? data.bindings : {},
        actions: Array.isArray(data.actions) ? data.actions : [],
        poses: isPlainObject(data.poses) ? data.poses : {},
      };
    } catch (err) {
      console.warn("[AniAI] 本地配置解析失败，已忽略", err);
      return empty;
    }
  }

  save(data) {
    const storage = this._storage;
    if (!storage) return false;
    try {
      storage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (err) {
      // 配额写满 / 被禁用：不影响正常使用，只提示一次性失败
      console.warn("[AniAI] 保存本地配置失败", err);
      return false;
    }
  }

  clear() {
    try {
      this._storage?.removeItem(this.storageKey);
    } catch (err) {
      /* 忽略 */
    }
  }
}

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
