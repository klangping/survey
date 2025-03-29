"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  props: {
    value: {
      type: Array,
      required: true
    },
    handle: {
      type: String,
      default: ".drag-handle"
    }
  },
  data() {
    return {
      dragging: false,
      startY: 0,
      dragIndex: -1,
      originalList: []
    };
  },
  computed: {
    list: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      }
    }
  },
  methods: {
    onTouchStart(e) {
      const handle = e.target.closest(this.handle);
      if (!handle)
        return;
      const item = handle.closest("[draggable]");
      if (!item)
        return;
      this.dragging = true;
      this.startY = e.touches[0].clientY;
      this.dragIndex = Array.from(item.parentNode.children).indexOf(item);
      this.originalList = [...this.list];
      item.style.opacity = "0.5";
      item.style.transition = "none";
    },
    onTouchMove(e) {
      if (!this.dragging)
        return;
      const y = e.touches[0].clientY;
      const deltaY = y - this.startY;
      if (Math.abs(deltaY)) {
        e.preventDefault();
        const items = this.$el.children;
        const dragItem = items[this.dragIndex];
        dragItem.style.transform = `translateY(${deltaY}px)`;
        const newIndex = this.calculateNewIndex(deltaY);
        if (newIndex !== this.dragIndex && newIndex >= 0 && newIndex < items.length) {
          const newList = [...this.list];
          const [removed] = newList.splice(this.dragIndex, 1);
          newList.splice(newIndex, 0, removed);
          this.list = newList;
          this.$el.insertBefore(dragItem, items[newIndex]);
          this.dragIndex = newIndex;
        }
      }
    },
    calculateNewIndex(deltaY) {
      const itemHeight = this.$el.children[0].offsetHeight;
      return this.dragIndex + Math.round(deltaY / itemHeight);
    },
    onTouchEnd() {
      if (!this.dragging)
        return;
      this.dragging = false;
      const dragItem = this.$el.children[this.dragIndex];
      if (dragItem) {
        dragItem.style.opacity = "";
        dragItem.style.transform = "";
        dragItem.style.transition = "all 0.3s";
      }
      if (JSON.stringify(this.list) !== JSON.stringify(this.originalList)) {
        this.$emit("end");
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.onTouchStart && $options.onTouchStart(...args)),
    b: common_vendor.o((...args) => $options.onTouchMove && $options.onTouchMove(...args)),
    c: common_vendor.o((...args) => $options.onTouchEnd && $options.onTouchEnd(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/draggable.js.map
