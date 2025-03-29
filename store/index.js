import http from '../api/http';

export default {
  state: {
    user: null,
    isAuthenticated: false
  },
  
  // 初始化从本地存储加载状态
  init() {
    const user = uni.getStorageSync('user');
    const token = uni.getStorageSync('token');
    
    if (user && token) {
      this.state.user = user;
      this.state.isAuthenticated = true;
    }
  },
  
  // 设置用户信息
  setUser(userData, token) {
    this.state.user = userData;
    this.state.isAuthenticated = true;
    
    // 持久化到本地存储
    uni.setStorageSync('user', userData);
    uni.setStorageSync('token', token);
  },
  
  // 清除用户信息
  clearUser() {
    this.state.user = null;
    this.state.isAuthenticated = false;
    
    uni.removeStorageSync('user');
    uni.removeStorageSync('token');
  },
  
  // 获取当前用户
  async fetchCurrentUser() {
    try {
      const user = await hhtp.get('/me');
      this.state.user = user;
      return user;
    } catch (error) {
      this.clearUser();
      throw error;
    }
  }
};