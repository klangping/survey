"use strict";
const common_vendor = require("../../common/vendor.js");
const api_http = require("../../api/http.js");
const _sfc_main = {
  data() {
    return {
      form: {
        username: "",
        password: ""
      },
      loading: false
    };
  },
  methods: {
    validateForm() {
      if (!this.form.username.trim()) {
        common_vendor.index.showToast({ title: "请输入用户名", icon: "none" });
        return false;
      }
      if (!this.form.password) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return false;
      }
      return true;
    },
    async handleLogin() {
      if (!this.validateForm())
        return;
      this.loading = true;
      try {
        const res = await api_http.http.post("/login", this.form);
        this.$store.setUser(res.user, res.token);
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/auth/login.vue:87", "登录失败:", error);
        common_vendor.index.showToast({
          title: error.error || "登录失败，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    navigateToRegister() {
      common_vendor.index.navigateTo({ url: "/pages/auth/register" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    b: $data.form.username,
    c: common_vendor.o(($event) => $data.form.username = $event.detail.value),
    d: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    e: $data.form.password,
    f: common_vendor.o(($event) => $data.form.password = $event.detail.value),
    g: $data.loading,
    h: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    i: common_vendor.o((...args) => $options.navigateToRegister && $options.navigateToRegister(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2cc9f8c3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/login.js.map
