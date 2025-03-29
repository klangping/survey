"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_date = require("../../utils/date.js");
const utils_util = require("../../utils/util.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      searchText: "",
      surveys: [],
      loading: false,
      refreshing: false,
      page: 1,
      pageSize: 10,
      total: 0,
      loadMoreStatus: "more"
    };
  },
  computed: {
    filteredSurveys() {
      if (!this.searchText.trim())
        return this.surveys;
      const searchText = this.searchText.toLowerCase();
      return this.surveys.filter((survey) => {
        return survey.title.toLowerCase().includes(searchText) || survey.description && survey.description.toLowerCase().includes(searchText);
      });
    }
  },
  onLoad() {
    this.loadSurveys();
  },
  onReachBottom() {
    if (this.currentPage < this.totalPages && !this.loading) {
      this.loadMore();
    }
  },
  onPullDownRefresh() {
    this.refreshSurveys();
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        draft: "草稿",
        published: "已发布",
        closed: "已结束"
      };
      return statusMap[status] || status;
    },
    async loadSurveys() {
      this.loading = true;
      try {
        const res = await this.$http.get("/surveys", {
          params: {
            page: this.page,
            pageSize: this.pageSize
          }
        });
        this.surveys = this.page === 1 ? res.data.list : [...this.surveys, ...res.data.list];
        this.total = res.data.total;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/survey/list.vue:133", "加载问卷失败:", error);
        common_vendor.index.showToast({
          title: error.error || "加载问卷失败",
          icon: "none",
          duration: 2e3
        });
      } finally {
        this.loading = false;
        common_vendor.index.stopPullDownRefresh();
      }
    },
    async loadMore() {
      if (this.currentPage >= this.totalPages) {
        this.loadMoreStatus = "noMore";
        return;
      }
      this.loadMoreStatus = "loading";
      try {
        const res = await this.$http.get("/surveys", {
          params: {
            page: this.currentPage + 1,
            pageSize: 10
          }
        });
        this.surveys = [...this.surveys, ...res.data.surveys];
        this.currentPage++;
        this.totalPages = res.data.totalPages;
        this.loadMoreStatus = res.data.surveys.length > 0 ? "more" : "noMore";
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/survey/list.vue:166", "加载更多失败:", error);
        this.loadMoreStatus = "more";
        common_vendor.index.showToast({
          title: error.error || "加载更多失败",
          icon: "none",
          duration: 2e3
        });
      }
    },
    async refreshSurveys() {
      this.currentPage = 1;
      await this.loadSurveys();
    },
    navigateToCreate() {
      common_vendor.index.navigateTo({
        url: "/pages/survey/create"
      });
    },
    navigateToEdit(id) {
      common_vendor.index.navigateTo({
        url: `/pages/survey/edit?id=${id}`
      });
    },
    handleSwipeClick(e, index) {
      this.currentDeleteId = this.filteredSurveys[index].id;
      this.$refs.deleteConfirm.open();
    },
    async confirmDelete() {
      if (!this.currentDeleteId)
        return;
      try {
        await this.$http.delete(`/surveys/${this.currentDeleteId}`);
        this.surveys = this.surveys.filter((s) => s.id !== this.currentDeleteId);
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success",
          duration: 1500
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/survey/list.vue:210", "删除失败:", error);
        common_vendor.index.showToast({
          title: error.error || "删除失败",
          icon: "none",
          duration: 2e3
        });
      } finally {
        this.currentDeleteId = null;
      }
    },
    cancelDelete() {
      this.currentDeleteId = null;
    },
    handleSearch: utils_util.debounce(function() {
      if (this.searchText.trim()) {
        common_vendor.index.__f__("log", "at pages/survey/list.vue:228", "执行搜索:", this.searchText);
      }
    }, 500),
    clearSearch() {
      this.searchText = "";
    },
    formatDate: utils_date.formatDate
  }
};
if (!Array) {
  const _component_uni_search_bar = common_vendor.resolveComponent("uni-search-bar");
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  const _component_uni_load_more = common_vendor.resolveComponent("uni-load-more");
  const _component_uni_swipe_action_item = common_vendor.resolveComponent("uni-swipe-action-item");
  const _component_uni_swipe_action = common_vendor.resolveComponent("uni-swipe-action");
  const _component_uni_popup_dialog = common_vendor.resolveComponent("uni-popup-dialog");
  const _component_uni_popup = common_vendor.resolveComponent("uni-popup");
  (_component_uni_search_bar + _component_uni_icons + _component_uni_load_more + _component_uni_swipe_action_item + _component_uni_swipe_action + _component_uni_popup_dialog + _component_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handleSearch),
    b: common_vendor.o($options.clearSearch),
    c: common_vendor.o(($event) => $data.searchText = $event),
    d: common_vendor.p({
      placeholder: "搜索问卷",
      radius: 100,
      clearButton: "always",
      cancelButton: "none",
      modelValue: $data.searchText
    }),
    e: common_vendor.p({
      type: "plusempty",
      size: "18",
      color: "#fff"
    }),
    f: common_vendor.o((...args) => $options.navigateToCreate && $options.navigateToCreate(...args)),
    g: $data.loading
  }, $data.loading ? {
    h: common_vendor.p({
      status: "loading",
      ["icon-size"]: 16
    })
  } : $options.filteredSurveys.length === 0 ? {
    j: common_assets._imports_0,
    k: common_vendor.t($data.searchText ? "没有找到匹配的问卷" : "暂无问卷，点击上方按钮创建")
  } : {
    l: common_vendor.f($options.filteredSurveys, (survey, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(survey.title),
        b: survey.description
      }, survey.description ? {
        c: common_vendor.t(survey.description)
      } : {}, {
        d: common_vendor.t($options.getStatusText(survey.status)),
        e: common_vendor.n(survey.status),
        f: common_vendor.t($options.formatDate(survey.created_at)),
        g: "b35d42f3-5-" + i0 + "," + ("b35d42f3-4-" + i0),
        h: common_vendor.o(($event) => $options.navigateToEdit(survey.id), survey.id),
        i: survey.id,
        j: common_vendor.o(($event) => $options.handleSwipeClick($event, index), survey.id),
        k: "b35d42f3-4-" + i0 + ",b35d42f3-3"
      });
    }),
    m: common_vendor.p({
      type: "arrowright",
      size: "18",
      color: "#999"
    }),
    n: common_vendor.p({
      ["right-options"]: _ctx.swipeOptions
    })
  }, {
    i: $options.filteredSurveys.length === 0,
    o: common_vendor.p({
      status: $data.loadMoreStatus,
      ["content-text"]: {
        contentdown: "上拉加载更多",
        contentrefresh: "正在加载...",
        contentnomore: "没有更多数据了"
      }
    }),
    p: common_vendor.o($options.confirmDelete),
    q: common_vendor.o($options.cancelDelete),
    r: common_vendor.p({
      type: "warn",
      title: "确认删除",
      content: "确定要删除这个问卷吗？删除后无法恢复",
      duration: 2e3
    }),
    s: common_vendor.sr("deleteConfirm", "b35d42f3-7"),
    t: common_vendor.p({
      type: "dialog"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b35d42f3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/survey/list.js.map
