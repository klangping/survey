"use strict";
const common_vendor = require("../common/vendor.js");
const store = {
  state: {
    user: null,
    isAuthenticated: false
  },
  // 初始化从本地存储加载状态
  init() {
    const user = common_vendor.index.getStorageSync("user");
    const token = common_vendor.index.getStorageSync("token");
    if (user && token) {
      this.state.user = user;
      this.state.isAuthenticated = true;
    }
  },
  // 设置用户信息
  setUser(userData, token) {
    this.state.user = userData;
    this.state.isAuthenticated = true;
    common_vendor.index.setStorageSync("user", userData);
    common_vendor.index.setStorageSync("token", token);
  },
  // 清除用户信息
  clearUser() {
    this.state.user = null;
    this.state.isAuthenticated = false;
    common_vendor.index.removeStorageSync("user");
    common_vendor.index.removeStorageSync("token");
  },
  // 获取当前用户
  async fetchCurrentUser() {
    try {
      const user = await request.get("/me");
      this.state.user = user;
      return user;
    } catch (error) {
      this.clearUser();
      throw error;
    }
  }
};
exports.store = store;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/index.js.map
