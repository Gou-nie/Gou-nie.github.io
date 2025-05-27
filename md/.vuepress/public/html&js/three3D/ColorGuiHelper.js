export class ColorGUIHelper {
    constructor(object, prop) {
      this.object = object;
      this.prop = prop;
    }
    get value() {
      return `#${this.object[this.prop].getHexString()}`; // 修复模板字符串
    }
    set value(hexString) {
      this.object[this.prop].set(hexString);
    }
  }