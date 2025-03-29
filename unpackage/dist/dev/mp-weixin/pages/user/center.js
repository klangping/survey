"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_date = require("../../utils/date.js");
const _sfc_main = {
  data() {
    return {
      user: {}
    };
  },
  computed: {
    userInitial() {
      return this.user.username ? this.user.username.charAt(0).toUpperCase() : "";
    },
    joinDate() {
      return utils_date.formatDate(this.user.created_at);
    }
  },
  onShow() {
    this.loadUser();
  },
  methods: {
    async loadUser() {
      try {
        if (this.$store.state.user) {
          this.user = this.$store.state.user;
        } else {
          this.user = await this.$store.fetchCurrentUser();
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "获取用户信息失败", icon: "none" });
      }
    },
    navigateTo(url) {
      common_vendor.index.navigateTo({ url });
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            this.$store.clearUser();
            common_vendor.index.reLaunch({ url: "/pages/auth/login" });
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.userInitial),
    b: common_vendor.t($data.user.username),
    c: common_vendor.t($options.joinDate),
    d: common_vendor.p({
      type: "arrowright",
      size: "18"
    }),
    e: common_vendor.o(($event) => $options.navigateTo("/pages/user/settings")),
    f: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ba03e1e9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/center.js.map
