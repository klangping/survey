"use strict";
const common_vendor = require("../../common/vendor.js");
const api_http = require("../../api/http.js");
const _sfc_main = {
  data() {
    return {
      surveyId: null,
      survey: {
        title: "",
        description: "",
        questions: []
      },
      answers: {},
      submitting: false
    };
  },
  onLoad(options) {
    if (options.id) {
      this.surveyId = options.id;
      this.loadSurvey();
    }
  },
  methods: {
    async loadSurvey() {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        const res = await api_http.http.get(`/surveys/${this.surveyId}`);
        this.survey = res.survey;
        this.survey.questions = res.questions;
        this.answers = {};
        this.survey.questions.forEach((q) => {
          if (["radio", "text", "textarea", "rating"].includes(q.type)) {
            this.answers[q.id] = "";
          } else if (q.type === "checkbox") {
            this.answers[q.id] = [];
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/survey/answer.vue:105", "加载问卷失败:", error);
        common_vendor.index.showToast({
          title: error.error || "加载问卷失败",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 2e3);
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    handleRadioChange(questionId, value) {
      this.answers[questionId] = value;
    },
    handleCheckboxChange(questionId, values) {
      this.answers[questionId] = values;
    },
    validateAnswers() {
      for (const question of this.survey.questions) {
        if (question.is_required) {
          if (!this.answers[question.id] || Array.isArray(this.answers[question.id]) && this.answers[question.id].length === 0) {
            common_vendor.index.showToast({
              title: `请回答问题: ${question.content}`,
              icon: "none"
            });
            return false;
          }
        }
      }
      return true;
    },
    async submitAnswers() {
      if (!this.validateAnswers())
        return;
      this.submitting = true;
      try {
        await api_http.http.post(`/surveys/${this.surveyId}/responses`, {
          answers: this.answers
        });
        common_vendor.index.showToast({
          title: "提交成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/survey/answer.vue:160", "提交失败:", error);
        common_vendor.index.showToast({
          title: error.error || "提交失败",
          icon: "none"
        });
      } finally {
        this.submitting = false;
      }
    }
  }
};
if (!Array) {
  const _component_uni_rate = common_vendor.resolveComponent("uni-rate");
  _component_uni_rate();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.survey.title),
    b: $data.survey.description
  }, $data.survey.description ? {
    c: common_vendor.t($data.survey.description)
  } : {}, {
    d: common_vendor.f($data.survey.questions, (question, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(index + 1),
        b: common_vendor.t(question.content),
        c: question.is_required
      }, question.is_required ? {} : {}, {
        d: question.type === "radio"
      }, question.type === "radio" ? {
        e: common_vendor.f(question.options, (option, optIndex, i1) => {
          return {
            a: option.id,
            b: $data.answers[question.id] === option.id,
            c: common_vendor.t(option.content),
            d: optIndex
          };
        }),
        f: common_vendor.o((e) => $options.handleRadioChange(question.id, e.detail.value), question.id)
      } : question.type === "checkbox" ? {
        h: common_vendor.f(question.options, (option, optIndex, i1) => {
          var _a;
          return {
            a: option.id,
            b: (_a = $data.answers[question.id]) == null ? void 0 : _a.includes(option.id),
            c: common_vendor.t(option.content),
            d: optIndex
          };
        }),
        i: common_vendor.o((e) => $options.handleCheckboxChange(question.id, e.detail.value), question.id)
      } : question.type === "text" ? {
        k: $data.answers[question.id],
        l: common_vendor.o(($event) => $data.answers[question.id] = $event.detail.value, question.id)
      } : question.type === "textarea" ? {
        n: $data.answers[question.id],
        o: common_vendor.o(($event) => $data.answers[question.id] = $event.detail.value, question.id)
      } : question.type === "rating" ? {
        q: "8b97f557-0-" + i0,
        r: common_vendor.o(($event) => $data.answers[question.id] = $event, question.id),
        s: common_vendor.p({
          max: 5,
          size: 24,
          color: "#bbb",
          ["active-color"]: "#ffca28",
          modelValue: $data.answers[question.id]
        })
      } : {}, {
        g: question.type === "checkbox",
        j: question.type === "text",
        m: question.type === "textarea",
        p: question.type === "rating",
        t: question.id
      });
    }),
    e: common_vendor.o((...args) => $options.submitAnswers && $options.submitAnswers(...args)),
    f: $data.submitting
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8b97f557"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/survey/answer.js.map
