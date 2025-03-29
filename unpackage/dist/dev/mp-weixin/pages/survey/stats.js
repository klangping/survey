"use strict";
const common_vendor = require("../../common/vendor.js");
const api_http = require("../../api/http.js");
const utils_date = require("../../utils/date.js");
const _sfc_main = {
  data() {
    return {
      surveyId: null,
      survey: {
        title: "",
        description: "",
        status: "",
        questions: []
      },
      responses: [],
      stats: {},
      activeTab: "overview",
      tabs: [
        { label: "概览", value: "overview" },
        { label: "问题", value: "questions" }
      ]
    };
  },
  computed: {
    totalResponses() {
      return this.responses.length;
    },
    completionRate() {
      const totalQuestions = this.survey.questions.length;
      if (totalQuestions === 0)
        return 0;
      const avgAnswered = this.responses.reduce((sum, res) => {
        return sum + Object.keys(res.answers).length;
      }, 0) / this.totalResponses;
      return Math.round(avgAnswered / totalQuestions * 100);
    },
    avgCompletionTime() {
      if (this.totalResponses === 0)
        return 0;
      return Math.round(this.responses.reduce((sum, res) => {
        return sum + (res.completion_time || 0);
      }, 0) / this.totalResponses);
    }
  },
  onLoad(options) {
    if (options.id) {
      this.surveyId = options.id;
      this.loadSurveyData();
    }
  },
  methods: {
    async loadSurveyData() {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        const surveyRes = await api_http.http.get(`/surveys/${this.surveyId}`);
        this.survey = surveyRes.survey;
        this.survey.questions = surveyRes.questions;
        const responsesRes = await api_http.http.get(`/surveys/${this.surveyId}/responses`);
        this.responses = responsesRes.data;
        this.calculateStats();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/survey/stats.vue:143", "加载数据失败:", error);
        common_vendor.index.showToast({
          title: error.error || "加载数据失败",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 2e3);
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    calculateStats() {
      const stats = {};
      this.survey.questions.forEach((q) => {
        stats[q.id] = {
          type: q.type,
          total: 0,
          options: {}
        };
        if (q.options) {
          q.options.forEach((opt) => {
            stats[q.id].options[opt.id] = 0;
          });
        }
      });
      this.responses.forEach((res) => {
        Object.entries(res.answers).forEach(([qId, answer]) => {
          const question = this.survey.questions.find((q) => q.id == qId);
          if (!question)
            return;
          stats[qId].total++;
          if (["radio", "checkbox"].includes(question.type)) {
            const answers = Array.isArray(answer) ? answer : [answer];
            answers.forEach((ans) => {
              if (stats[qId].options[ans]) {
                stats[qId].options[ans]++;
              }
            });
          }
        });
      });
      this.stats = stats;
    },
    getOptionPercentage(qId, optId) {
      if (!this.stats[qId] || this.stats[qId].total === 0)
        return 0;
      return Math.round(this.stats[qId].options[optId] / this.stats[qId].total * 100);
    },
    getOptionCount(qId, optId) {
      var _a;
      return ((_a = this.stats[qId]) == null ? void 0 : _a.options[optId]) || 0;
    },
    getTextAnswers(qId) {
      return this.responses.map((res) => res.answers[qId]).filter(Boolean).slice(0, 10);
    },
    getStatusText(status) {
      const statusMap = {
        draft: "草稿",
        published: "已发布",
        closed: "已结束"
      };
      return statusMap[status] || status;
    },
    formatDate: utils_date.formatDate
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.survey.title),
    b: common_vendor.t($options.getStatusText($data.survey.status)),
    c: common_vendor.n($data.survey.status),
    d: common_vendor.t($options.totalResponses),
    e: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab.label),
        b: tab.value,
        c: $data.activeTab === tab.value ? 1 : "",
        d: common_vendor.o(($event) => $data.activeTab = tab.value, tab.value)
      };
    }),
    f: $data.activeTab === "overview"
  }, $data.activeTab === "overview" ? {
    g: common_vendor.t($options.totalResponses),
    h: common_vendor.t($options.completionRate),
    i: common_vendor.t($options.avgCompletionTime)
  } : {}, {
    j: $data.activeTab === "questions"
  }, $data.activeTab === "questions" ? {
    k: common_vendor.f($data.survey.questions, (question, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(index + 1),
        b: common_vendor.t(question.content),
        c: ["radio", "checkbox"].includes(question.type)
      }, ["radio", "checkbox"].includes(question.type) ? {
        d: common_vendor.f(question.options, (option, k1, i1) => {
          return {
            a: common_vendor.t(option.content),
            b: `${$options.getOptionPercentage(question.id, option.id)}%`,
            c: common_vendor.t($options.getOptionPercentage(question.id, option.id)),
            d: common_vendor.t($options.getOptionCount(question.id, option.id)),
            e: option.id
          };
        })
      } : {
        e: common_vendor.f($options.getTextAnswers(question.id), (answer, ansIndex, i1) => {
          return {
            a: common_vendor.t(answer),
            b: ansIndex
          };
        })
      }, {
        f: question.id
      });
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f82dd4c6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/survey/stats.js.map
