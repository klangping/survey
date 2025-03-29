"use strict";
const common_vendor = require("../../common/vendor.js");
const api_http = require("../../api/http.js");
const _sfc_main = {
  data() {
    return {
      title: "",
      description: "",
      loading: false
    };
  },
  methods: {
    async handleCreate() {
      if (!this.title.trim()) {
        common_vendor.index.showToast({ title: "请输入问卷标题", icon: "none" });
        return;
      }
      this.loading = true;
      try {
        const res = await api_http.http.post("/surveys", {
          title: this.title,
          description: this.description
        });
        common_vendor.index.showToast({ title: "创建成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: `/pages/survey/edit?id=${res.survey.id}`
          });
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/survey/create.vue:55", "创建失败:", error);
        common_vendor.index.showToast({
          title: error.error || "创建问卷失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.title,
    b: common_vendor.o(($event) => $data.title = $event.detail.value),
    c: $data.description,
    d: common_vendor.o(($event) => $data.description = $event.detail.value),
    e: common_vendor.o((...args) => $options.handleCreate && $options.handleCreate(...args)),
    f: $data.loading
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d53584e2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/survey/create.js.map
