"use strict";
const common_vendor = require("../common/vendor.js");
const baseURL = "http://localhost:3000/api";
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    let url = baseURL + options.url;
    if (options.method === "GET" && options.data) {
      const params = [];
      for (const key in options.data) {
        if (options.data[key] !== void 0) {
          params.push(`${encodeURIComponent(key)}=${encodeURIComponent(options.data[key])}`);
        }
      }
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
    }
    const timeout = options.timeout || 1e4;
    let timeoutTimer = setTimeout(() => {
      reject({
        error: "请求超时",
        details: `请求超过${timeout}ms未响应`
      });
    }, timeout);
    common_vendor.index.request({
      url,
      method: options.method || "GET",
      data: options.method !== "GET" ? options.data : void 0,
      header: headers,
      success: (res) => {
        var _a;
        clearTimeout(timeoutTimer);
        if (res.statusCode === 401) {
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.removeStorageSync("user");
          common_vendor.index.showToast({
            title: "登录已过期，请重新登录",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({ url: "/pages/auth/login" });
          }, 1500);
          return;
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data || {
            error: `请求失败: ${res.statusCode}`,
            message: ((_a = res.data) == null ? void 0 : _a.message) || "请求失败"
          });
        }
      },
      fail: (err) => {
        clearTimeout(timeoutTimer);
        reject({
          error: "网络错误",
          details: err.errMsg || err
        });
      }
    });
  });
};
const http = {
  get(url, params, options = {}) {
    return request({
      url,
      method: "GET",
      data: params,
      ...options
    });
  },
  post(url, data, options = {}) {
    return request({
      url,
      method: "POST",
      data,
      ...options
    });
  },
  put(url, data, options = {}) {
    return request({
      url,
      method: "PUT",
      data,
      ...options
    });
  },
  delete(url, options = {}) {
    return request({
      url,
      method: "DELETE",
      ...options
    });
  }
};
exports.http = http;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/http.js.map
