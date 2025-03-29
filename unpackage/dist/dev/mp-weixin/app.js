"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const store_index = require("./store/index.js");
const api_http = require("./api/http.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/auth/login.js";
  "./pages/auth/register.js";
  "./pages/user/center.js";
  "./pages/survey/edit.js";
  "./pages/survey/list.js";
  "./pages/survey/create.js";
  "./pages/survey/answer.js";
  "./pages/survey/stats.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.config.globalProperties.$store = store_index.store;
  app.config.globalProperties.$http = api_http.http;
  store_index.store.init();
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
