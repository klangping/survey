"use strict";
const common_vendor = require("../../common/vendor.js");
const api_http = require("../../api/http.js");
const _sfc_main = {
  data() {
    return {
      form: {
        username: "",
        password: "",
        confirmPassword: ""
      },
      loading: false,
      errors: {
        username: "",
        password: "",
        confirmPassword: ""
      }
    };
  },
  computed: {
    formValid() {
      return this.form.username && this.form.password && this.form.password === this.form.confirmPassword && !this.errors.username && !this.errors.password && !this.errors.confirmPassword;
    }
  },
  methods: {
    validateUsername() {
      if (!this.form.username.trim()) {
        this.errors.username = "请输入用户名";
        return false;
      }
      if (!/^[a-zA-Z0-9]{4,20}$/.test(this.form.username)) {
        this.errors.username = "用户名需4-20位字母或数字";
        return false;
      }
      this.errors.username = "";
      return true;
    },
    validatePassword() {
      if (!this.form.password) {
        this.errors.password = "请输入密码";
        return false;
      }
      if (this.form.password.length < 6) {
        this.errors.password = "密码长度不能少于6位";
        return false;
      }
      this.errors.password = "";
      return true;
    },
    validateConfirmPassword() {
      if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = "两次输入的密码不一致";
        return false;
      }
      this.errors.confirmPassword = "";
      return true;
    },
    validateForm() {
      const validUsername = this.validateUsername();
      const validPassword = this.validatePassword();
      const validConfirm = this.validateConfirmPassword();
      return validUsername && validPassword && validConfirm;
    },
    async handleRegister() {
      if (!this.validateForm())
        return;
      this.loading = true;
      try {
        const res = await api_http.http.post("/register", {
          username: this.form.username,
          password: this.form.password
        });
        common_vendor.index.showToast({
          title: "注册成功",
          icon: "success",
          duration: 2e3
        });
        this.$store.setUser(res.user, res.token);
        setTimeout(() => {
          if (typeof common_vendor.index.$emit === "function") {
            common_vendor.index.$emit("CLOSE_ALL_WEBVIEWS");
          }
          common_vendor.index.reLaunch({
            url: "/pages/index/index",
            success: () => {
              common_vendor.index.__f__("log", "at pages/auth/register.vue:140", "跳转成功");
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/auth/register.vue:143", "跳转失败:", err);
              common_vendor.index.switchTab({
                url: "/pages/index/index"
              });
            }
          });
        }, 2e3);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/auth/register.vue:152", "注册失败:", error);
        common_vendor.index.showToast({
          title: error.error || error.message || "注册失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    navigateToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/auth/login"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o([($event) => $data.form.username = $event.detail.value, (...args) => $options.validateUsername && $options.validateUsername(...args)]),
    b: $data.form.username,
    c: common_vendor.o([($event) => $data.form.password = $event.detail.value, (...args) => $options.validatePassword && $options.validatePassword(...args)]),
    d: $data.form.password,
    e: common_vendor.o([($event) => $data.form.confirmPassword = $event.detail.value, (...args) => $options.validateConfirmPassword && $options.validateConfirmPassword(...args)]),
    f: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args)),
    g: $data.form.confirmPassword,
    h: $data.loading,
    i: !$options.formValid,
    j: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args)),
    k: common_vendor.o((...args) => $options.navigateToLogin && $options.navigateToLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4bb68961"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/register.js.map
