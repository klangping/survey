"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const draggable = () => "../../components/draggable.js";
const OptionsEditor = () => "../../components/OptionsEditor.js";
const _sfc_main = {
  components: {
    draggable,
    OptionsEditor
  },
  data() {
    return {
      surveyId: null,
      survey: {
        title: "",
        description: "",
        status: "draft"
      },
      questions: [],
      statusOptions: [
        {
          text: "草稿",
          value: "draft"
        },
        {
          text: "已发布",
          value: "published"
        },
        {
          text: "已结束",
          value: "closed"
        }
      ],
      questionTypes: [
        {
          text: "单选题",
          value: "radio",
          hasOptions: true
        },
        {
          text: "多选题",
          value: "checkbox",
          hasOptions: true
        },
        {
          text: "单行文本",
          value: "text",
          hasOptions: false
        },
        {
          text: "多行文本",
          value: "textarea",
          hasOptions: false
        },
        {
          text: "评分题",
          value: "rating",
          hasOptions: false
        }
      ],
      saving: false,
      deletingQuestion: {
        id: null,
        index: null
      }
    };
  },
  onLoad(options) {
    if (options.id) {
      this.surveyId = options.id;
      this.loadSurvey();
    }
  },
  onBackPress() {
    if (this.hasUnsavedChanges()) {
      this.showLeaveConfirm();
      return true;
    }
  },
  methods: {
    getQuestionTypeIcon(type) {
      const icons = {
        radio: "radiobox-marked",
        checkbox: "checkbox-marked",
        text: "text",
        textarea: "format-text",
        rating: "star"
      };
      return icons[type] || "help";
    },
    confirmStatusChange(newStatus) {
      if (this.survey.status === newStatus)
        return;
      const statusText = {
        draft: "草稿",
        published: "已发布",
        closed: "已结束"
      };
      common_vendor.index.showModal({
        title: "确认变更状态",
        content: `确定要将问卷状态从${statusText[this.survey.status]}变更为${statusText[newStatus]}吗？`,
        success: (res) => {
          if (res.confirm) {
            this.survey.status = newStatus;
          }
        }
      });
    },
    hasUnsavedChanges() {
      return this.survey.title || this.questions.length > 0 || this.survey.description;
    },
    showLeaveConfirm() {
      common_vendor.index.showModal({
        title: "确认离开",
        content: "您有未保存的修改，确定要离开吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateBack();
          }
        }
      });
    },
    navigateBack() {
      if (this.hasUnsavedChanges()) {
        this.showLeaveConfirm();
      } else {
        common_vendor.index.navigateBack();
      }
    },
    validateSurvey() {
      if (!this.survey.title || this.survey.title.trim().length < 2) {
        common_vendor.index.showToast({
          title: "问卷标题不能少于2个字符",
          icon: "none",
          duration: 2e3
        });
        return false;
      }
      if (this.survey.title.length > 100) {
        common_vendor.index.showToast({
          title: "问卷标题不能超过100个字符",
          icon: "none",
          duration: 2e3
        });
        return false;
      }
      if (this.questions.length === 0) {
        common_vendor.index.showToast({
          title: "请至少添加一个问题",
          icon: "none",
          duration: 2e3
        });
        return false;
      }
      for (const [index, question] of this.questions.entries()) {
        if (!question.content || question.content.trim().length < 3) {
          common_vendor.index.showToast({
            title: `问题${index + 1}内容不能少于3个字符`,
            icon: "none",
            duration: 2e3
          });
          return false;
        }
        if (["radio", "checkbox"].includes(question.type)) {
          if (!question.options || question.options.length < 2) {
            common_vendor.index.showToast({
              title: `问题${index + 1}需要至少2个选项`,
              icon: "none",
              duration: 2e3
            });
            return false;
          }
          for (const [optIndex, option] of question.options.entries()) {
            if (!option.content || !option.content.trim()) {
              common_vendor.index.showToast({
                title: `问题${index + 1}的选项${optIndex + 1}不能为空`,
                icon: "none",
                duration: 2e3
              });
              return false;
            }
          }
        }
      }
      return true;
    },
    async loadSurvey() {
      common_vendor.index.showLoading({
        title: "加载中...",
        mask: true
      });
      try {
        const res = await this.$http.get(`/surveys/${this.surveyId}`);
        this.survey = {
          title: res.survey.title,
          description: res.survey.description || "",
          status: res.survey.status || "draft"
        };
        this.questions = res.questions.map((q) => ({
          id: q.id,
          content: q.content,
          type: q.type,
          is_required: Boolean(q.is_required),
          sort_order: q.sort_order || 0,
          options: q.options || []
        }));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/survey/edit.vue:334", "加载问卷失败:", error);
        common_vendor.index.showToast({
          title: error.error || "加载问卷失败",
          icon: "none",
          duration: 2e3
        });
        setTimeout(() => common_vendor.index.navigateBack(), 2e3);
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    onStatusChange(e) {
      const newStatus = this.statusOptions[e.detail.value].value;
      this.confirmStatusChange(newStatus);
    },
    showAddQuestionModal() {
      this.$refs.addQuestionPopup.open();
    },
    addNewQuestion(type) {
      const questionType = this.questionTypes.find((t) => t.value === type);
      const newQuestion = {
        content: "",
        type,
        is_required: true,
        sort_order: this.questions.length + 1
      };
      if (questionType.hasOptions) {
        newQuestion.options = [
          {
            id: null,
            content: "选项1"
          },
          {
            id: null,
            content: "选项2"
          }
        ];
      }
      this.questions.push(newQuestion);
      this.$refs.addQuestionPopup.close();
      setTimeout(() => {
        common_vendor.index.pageScrollTo({
          selector: `.question-item:last-child`,
          duration: 300
        });
      }, 100);
    },
    onTypeChange(e, index) {
      const newType = this.questionTypes[e.detail.value].value;
      const oldType = this.questions[index].type;
      if (newType !== oldType) {
        if (["radio", "checkbox"].includes(oldType) && !["radio", "checkbox"].includes(newType)) {
          this.$set(this.questions[index], "options", void 0);
        } else if (!["radio", "checkbox"].includes(oldType) && ["radio", "checkbox"].includes(newType)) {
          this.$set(this.questions[index], "options", [
            {
              id: null,
              content: "选项1"
            },
            {
              id: null,
              content: "选项2"
            }
          ]);
        }
        this.questions[index].type = newType;
      }
    },
    onRequiredChange(e, index) {
      this.questions[index].is_required = e.detail.value;
    },
    showDeleteQuestionConfirm(id, index) {
      this.deletingQuestion = {
        id,
        index
      };
      this.$refs.deleteConfirm.open();
    },
    cancelDeleteQuestion() {
      this.deletingQuestion = {
        id: null,
        index: null
      };
    },
    async confirmDeleteQuestion() {
      const {
        id,
        index
      } = this.deletingQuestion;
      if (id) {
        try {
          await this.$http.delete(`/questions/${id}`);
        } catch (error) {
          common_vendor.index.showToast({
            title: error.error || "删除问题失败",
            icon: "none",
            duration: 2e3
          });
          return;
        }
      }
      this.questions.splice(index, 1);
      this.deletingQuestion = {
        id: null,
        index: null
      };
      this.questions.forEach((q, i) => {
        q.sort_order = i + 1;
      });
    },
    async onQuestionSort() {
      if (!this.surveyId)
        return;
      try {
        await this.$http.post("/surveys/questions/sort", {
          orderedIds: this.questions.map((q) => q.id).filter(Boolean)
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/survey/edit.vue:472", "排序保存失败:", error);
        common_vendor.index.showToast({
          title: error.error || "排序保存失败",
          icon: "none",
          duration: 2e3
        });
      }
    },
    async saveSurvey() {
      if (!this.validateSurvey())
        return;
      this.saving = true;
      common_vendor.index.showLoading({
        title: "保存中...",
        mask: true
      });
      try {
        if (this.surveyId) {
          await this.$http.put(`/surveys/${this.surveyId}`, this.survey);
          for (const question of this.questions) {
            if (question.id) {
              await this.$http.put(`/questions/${question.id}`, {
                content: question.content,
                type: question.type,
                is_required: question.is_required,
                options: question.options
              });
            } else {
              const res = await this.$http.post(`/surveys/${this.surveyId}/questions`, question);
              question.id = res.question.id;
            }
          }
        } else {
          const res = await this.$http.post("/surveys", this.survey);
          this.surveyId = res.survey.id;
          for (const question of this.questions) {
            const qRes = await this.$http.post(`/surveys/${this.surveyId}/questions`, question);
            question.id = qRes.question.id;
          }
        }
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success",
          duration: 1500
        });
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: "/pages/survey/list"
          });
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/survey/edit.vue:533", "保存失败:", error);
        common_vendor.index.showToast({
          title: error.error || "保存失败",
          icon: "none",
          duration: 2e3
        });
      } finally {
        this.saving = false;
        common_vendor.index.hideLoading();
      }
    }
  }
};
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  const _component_options_editor = common_vendor.resolveComponent("options-editor");
  const _component_draggable = common_vendor.resolveComponent("draggable");
  const _component_uni_popup = common_vendor.resolveComponent("uni-popup");
  const _component_uni_popup_dialog = common_vendor.resolveComponent("uni-popup-dialog");
  (_component_uni_icons + _component_options_editor + _component_draggable + _component_uni_popup + _component_uni_popup_dialog)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.survey.title,
    b: common_vendor.o(($event) => $data.survey.title = $event.detail.value),
    c: $data.survey.description,
    d: common_vendor.o(($event) => $data.survey.description = $event.detail.value),
    e: common_vendor.t($data.statusOptions.find((o) => o.value === $data.survey.status).text),
    f: common_vendor.p({
      type: "arrowdown",
      size: "14",
      color: "#999"
    }),
    g: $data.statusOptions,
    h: common_vendor.o((...args) => $options.onStatusChange && $options.onStatusChange(...args)),
    i: common_vendor.p({
      type: "plus",
      size: "16",
      color: "#007aff"
    }),
    j: common_vendor.o((...args) => $options.showAddQuestionModal && $options.showAddQuestionModal(...args)),
    k: $data.questions.length > 0
  }, $data.questions.length > 0 ? {
    l: common_vendor.f($data.questions, (question, index, i0) => {
      return common_vendor.e({
        a: "bbf24e7a-3-" + i0 + ",bbf24e7a-2",
        b: common_vendor.t(index + 1),
        c: question.is_required
      }, question.is_required ? {} : {}, {
        d: common_vendor.o(($event) => $options.showDeleteQuestionConfirm(question.id, index), question.id || `new-${index}`),
        e: "bbf24e7a-4-" + i0 + ",bbf24e7a-2",
        f: question.content,
        g: common_vendor.o(($event) => question.content = $event.detail.value, question.id || `new-${index}`),
        h: common_vendor.t($data.questionTypes.find((t) => t.value === question.type).text),
        i: "bbf24e7a-5-" + i0 + ",bbf24e7a-2",
        j: common_vendor.o((e) => $options.onTypeChange(e, index), question.id || `new-${index}`),
        k: question.is_required,
        l: common_vendor.o((e) => $options.onRequiredChange(e, index), question.id || `new-${index}`),
        m: ["radio", "checkbox"].includes(question.type)
      }, ["radio", "checkbox"].includes(question.type) ? {
        n: "bbf24e7a-6-" + i0 + ",bbf24e7a-2",
        o: common_vendor.o(($event) => question.options = $event, question.id || `new-${index}`),
        p: common_vendor.p({
          modelValue: question.options
        })
      } : {}, {
        q: question.id || `new-${index}`
      });
    }),
    m: common_vendor.p({
      type: "drag",
      size: "20",
      color: "#999"
    }),
    n: common_vendor.p({
      type: "trash",
      size: "20",
      color: "#ff3b30"
    }),
    o: common_vendor.p({
      type: "arrowdown",
      size: "12",
      color: "#999"
    }),
    p: $data.questionTypes,
    q: common_vendor.o($options.onQuestionSort),
    r: common_vendor.o(($event) => $data.questions = $event),
    s: common_vendor.p({
      handle: ".drag-handle",
      modelValue: $data.questions
    })
  } : {
    t: common_assets._imports_0$1
  }, {
    v: common_vendor.o((...args) => $options.navigateBack && $options.navigateBack(...args)),
    w: $data.saving,
    x: common_vendor.o((...args) => $options.saveSurvey && $options.saveSurvey(...args)),
    y: common_vendor.f($data.questionTypes, (type, k0, i0) => {
      return {
        a: "bbf24e7a-8-" + i0 + ",bbf24e7a-7",
        b: common_vendor.p({
          type: $options.getQuestionTypeIcon(type.value),
          size: "20",
          color: "#007aff"
        }),
        c: common_vendor.t(type.text),
        d: type.value,
        e: common_vendor.o(($event) => $options.addNewQuestion(type.value), type.value)
      };
    }),
    z: common_vendor.sr("addQuestionPopup", "bbf24e7a-7"),
    A: common_vendor.p({
      type: "bottom"
    }),
    B: common_vendor.o($options.confirmDeleteQuestion),
    C: common_vendor.o($options.cancelDeleteQuestion),
    D: common_vendor.p({
      type: "warn",
      title: "确认删除",
      content: "确定要删除这个问题吗？",
      duration: 2e3
    }),
    E: common_vendor.sr("deleteConfirm", "bbf24e7a-9"),
    F: common_vendor.p({
      type: "dialog"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bbf24e7a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/survey/edit.js.map
