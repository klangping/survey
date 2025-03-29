"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_date = require("../../utils/date.js");
const api_http = require("../../api/http.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      searchText: "",
      surveys: [],
      loading: true,
      refreshing: false,
      page: 1,
      pageSize: 10,
      total: 0,
      loadMoreStatus: "more"
    };
  },
  computed: {
    // 是否还有更多数据
    hasMore() {
      return this.surveys.length < this.total;
    },
    // 过滤搜索结果
    filteredSurveys() {
      if (!this.searchText)
        return this.surveys;
      const searchText = this.searchText.toLowerCase();
      return this.surveys.filter(
        (survey) => survey.title.toLowerCase().includes(searchText) || survey.description && survey.description.toLowerCase().includes(searchText)
      );
    }
  },
  onLoad() {
    this.loadSurveys();
  },
  onPullDownRefresh() {
    this.onRefresh();
  },
  onReachBottom() {
    if (this.hasMore) {
      this.loadMore();
    }
  },
  methods: {
    // 加载问卷列表
    async loadSurveys() {
      this.loading = true;
      try {
        const httpInstance = this.$http || api_http.http;
        const res = await httpInstance.get("/surveys", {
          params: {
            page: this.page,
            pageSize: this.pageSize
          }
        });
        this.surveys = this.page === 1 ? res.data.list : [...this.surveys, ...res.data.list];
        this.total = res.data.total;
        this.totalPages = res.data.totalPages || Math.ceil(res.data.total / this.pageSize);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:133", "加载问卷失败:", error);
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
    // 刷新数据
    async onRefresh() {
      this.refreshing = true;
      this.page = 1;
      await this.loadSurveys();
      this.refreshing = false;
    },
    // 加载更多数据
    async loadMore() {
      if (this.loadMoreStatus !== "more")
        return;
      this.loadMoreStatus = "loading";
      this.page++;
      try {
        await this.loadSurveys();
        this.loadMoreStatus = this.hasMore ? "more" : "noMore";
      } catch (error) {
        this.page--;
        this.loadMoreStatus = "more";
      }
    },
    // 搜索问卷
    handleSearch() {
      this.page = 1;
      this.loadSurveys();
    },
    // 清空搜索
    clearSearch() {
      this.searchText = "";
      this.handleSearch();
    },
    // 跳转到创建问卷页面
    navigateToCreate() {
      common_vendor.index.navigateTo({
        url: "/pages/survey/create"
      });
    },
    // 跳转到问卷详情
    navigateToSurvey(id) {
      common_vendor.index.navigateTo({
        url: `/pages/survey/detail?id=${id}`
      });
    },
    // 获取问卷状态文本
    getStatusText(status) {
      const statusMap = {
        draft: "草稿",
        published: "发布中",
        closed: "已结束"
      };
      return statusMap[status] || "未知状态";
    },
    // 获取问卷状态样式类
    getStatusClass(status) {
      return `status-${status}`;
    },
    // 格式化日期
    formatDate: utils_date.formatDate
  }
};
if (!Array) {
  const _component_uni_search_bar = common_vendor.resolveComponent("uni-search-bar");
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  const _component_uni_refresh_control = common_vendor.resolveComponent("uni-refresh-control");
  const _component_uni_load_more = common_vendor.resolveComponent("uni-load-more");
  (_component_uni_search_bar + _component_uni_icons + _component_uni_refresh_control + _component_uni_load_more)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handleSearch),
    b: common_vendor.o($options.clearSearch),
    c: common_vendor.o(($event) => $data.searchText = $event),
    d: common_vendor.p({
      placeholder: "搜索问卷",
      radius: "100",
      modelValue: $data.searchText
    }),
    e: common_vendor.p({
      type: "plusempty",
      size: "20",
      color: "#fff"
    }),
    f: common_vendor.o((...args) => $options.navigateToCreate && $options.navigateToCreate(...args)),
    g: $data.surveys.length > 0
  }, $data.surveys.length > 0 ? {
    h: common_vendor.o($options.onRefresh),
    i: common_vendor.p({
      refreshing: $data.refreshing
    })
  } : {}, {
    j: $data.loading && !$data.refreshing
  }, $data.loading && !$data.refreshing ? {
    k: common_vendor.p({
      status: "loading"
    })
  } : $data.surveys.length === 0 ? {
    m: common_assets._imports_0
  } : common_vendor.e({
    n: common_vendor.f($options.filteredSurveys, (survey, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(survey.title),
        b: common_vendor.t($options.getStatusText(survey.status)),
        c: common_vendor.n($options.getStatusClass(survey.status)),
        d: survey.description
      }, survey.description ? {
        e: common_vendor.t(survey.description)
      } : {}, {
        f: common_vendor.t($options.formatDate(survey.created_at)),
        g: "1cf27b2a-4-" + i0,
        h: survey.id,
        i: common_vendor.o(($event) => $options.navigateToSurvey(survey.id), survey.id)
      });
    }),
    o: common_vendor.p({
      type: "arrowright",
      size: "20",
      color: "#999"
    }),
    p: $options.hasMore
  }, $options.hasMore ? {
    q: common_vendor.o($options.loadMore),
    r: common_vendor.p({
      status: $data.loadMoreStatus
    })
  } : {}), {
    l: $data.surveys.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
