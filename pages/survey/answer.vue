<template>
  <view class="answer-container">
    <view class="survey-header">
      <text class="survey-title">{{ survey.title }}</text>
      <text class="survey-desc" v-if="survey.description">{{ survey.description }}</text>
    </view>
    
    <view class="questions-container">
      <view v-for="(question, index) in survey.questions" :key="question.id" class="question-item">
        <text class="question-title">
          {{ index + 1 }}. {{ question.content }}
          <text class="required" v-if="question.is_required">*</text>
        </text>
        
        <!-- 单选题 -->
        <radio-group v-if="question.type === 'radio'" 
          @change="(e) => handleRadioChange(question.id, e.detail.value)">
          <view v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
            <radio :value="option.id" :checked="answers[question.id] === option.id" />
            <text>{{ option.content }}</text>
          </view>
        </radio-group>
        
        <!-- 多选题 -->
        <checkbox-group v-else-if="question.type === 'checkbox'" 
          @change="(e) => handleCheckboxChange(question.id, e.detail.value)">
          <view v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
            <checkbox :value="option.id" :checked="answers[question.id]?.includes(option.id)" />
            <text>{{ option.content }}</text>
          </view>
        </checkbox-group>
        
        <!-- 文本题 -->
        <input v-else-if="question.type === 'text'" 
          v-model="answers[question.id]" 
          placeholder="请输入答案" 
          class="text-input" />
        
        <!-- 文本域题 -->
        <textarea v-else-if="question.type === 'textarea'" 
          v-model="answers[question.id]" 
          placeholder="请输入答案" 
          class="textarea" />
        
        <!-- 评分题 -->
        <view v-else-if="question.type === 'rating'" class="rating-container">
          <uni-rate 
            v-model="answers[question.id]" 
            :max="5" 
            :size="24" 
            color="#bbb" 
            active-color="#ffca28" />
        </view>
      </view>
    </view>
    
    <view class="submit-container">
      <button class="submit-btn" @click="submitAnswers" :loading="submitting">
        提交问卷
      </button>
    </view>
  </view>
</template>

<script>
import http from '@/api/http';

export default {
  data() {
    return {
      surveyId: null,
      survey: {
        title: '',
        description: '',
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
      uni.showLoading({ title: '加载中...' });
      try {
        const res = await http.get(`/surveys/${this.surveyId}`);
        this.survey = res.survey;
        this.survey.questions = res.questions;
        
        // 初始化答案结构
        this.answers = {};
        this.survey.questions.forEach(q => {
          if (['radio', 'text', 'textarea', 'rating'].includes(q.type)) {
            this.answers[q.id] = '';
          } else if (q.type === 'checkbox') {
            this.answers[q.id] = [];
          }
        });
      } catch (error) {
        console.error('加载问卷失败:', error);
        uni.showToast({
          title: error.error || '加载问卷失败',
          icon: 'none'
        });
        setTimeout(() => uni.navigateBack(), 2000);
      } finally {
        uni.hideLoading();
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
          if (
            !this.answers[question.id] || 
            (Array.isArray(this.answers[question.id]) && this.answers[question.id].length === 0)
          ) {
            uni.showToast({
              title: `请回答问题: ${question.content}`,
              icon: 'none'
            });
            return false;
          }
        }
      }
      return true;
    },
    
    async submitAnswers() {
      if (!this.validateAnswers()) return;
      
      this.submitting = true;
      try {
        await http.post(`/surveys/${this.surveyId}/responses`, {
          answers: this.answers
        });
        
        uni.showToast({
          title: '提交成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (error) {
        console.error('提交失败:', error);
        uni.showToast({
          title: error.error || '提交失败',
          icon: 'none'
        });
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
.answer-container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.survey-header {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.survey-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.survey-desc {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.questions-container {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
}

.question-item {
  margin-bottom: 40rpx;
}

.question-title {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.required {
  color: #ff3b30;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
  padding: 15rpx;
  border-radius: 8rpx;
  background-color: #f9f9f9;
}

.text-input, .textarea {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.textarea {
  height: 200rpx;
}

.rating-container {
  padding: 20rpx 0;
}

.submit-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  height: 88rpx;
  line-height: 88rpx;
  background-color: #007aff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 32rpx;
}
</style>