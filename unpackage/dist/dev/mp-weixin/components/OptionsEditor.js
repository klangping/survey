"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  props: {
    options: Array,
    showOptions: Boolean
  },
  methods: {
    addOption() {
      this.options.push({ id: null, content: "" });
    },
    removeOption(index) {
      this.options.splice(index, 1);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.showOptions
  }, $props.showOptions ? {
    b: common_vendor.f($props.options, (option, index, i0) => {
      return {
        a: option.content,
        b: common_vendor.o(($event) => option.content = $event.detail.value, index),
        c: common_vendor.o(($event) => $options.removeOption(index), index),
        d: index
      };
    }),
    c: common_vendor.o((...args) => $options.addOption && $options.addOption(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/OptionsEditor.js.map
