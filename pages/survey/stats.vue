<template>
	<view class="stats-container">
		<view class="survey-info">
			<text class="survey-title">{{ survey.title }}</text>
			<text class="survey-status" :class="survey.status">{{ getStatusText(survey.status) }}</text>
			<text class="response-count">共收集 {{ totalResponses }} 份回答</text>
		</view>

		<view class="stats-tabs">
			<view v-for="tab in tabs" :key="tab.value" class="tab-item" :class="{ active: activeTab === tab.value }"
				@click="activeTab = tab.value">
				{{ tab.label }}
			</view>
		</view>

		<!-- 概览统计 -->
		<view v-if="activeTab === 'overview'" class="overview-stats">
			<view class="stats-card">
				<text class="stats-value">{{ totalResponses }}</text>
				<text class="stats-label">总回答数</text>
			</view>

			<view class="stats-card">
				<text class="stats-value">{{ completionRate }}%</text>
				<text class="stats-label">完成率</text>
			</view>

			<view class="stats-card">
				<text class="stats-value">{{ avgCompletionTime }}分钟</text>
				<text class="stats-label">平均完成时间</text>
			</view>
		</view>

		<!-- 问题统计 -->
		<view v-if="activeTab === 'questions'" class="question-stats">
			<view v-for="(question, index) in survey.questions" :key="question.id" class="question-stat-item">
				<text class="question-title">{{ index + 1 }}. {{ question.content }}</text>

				<!-- 选择题统计 -->
				<view v-if="['radio', 'checkbox'].includes(question.type)" class="options-stats">
					<view v-for="option in question.options" :key="option.id" class="option-stat">
						<text class="option-content">{{ option.content }}</text>
						<view class="progress-bar-container">
							<view class="progress-bar"
								:style="{ width: `${getOptionPercentage(question.id, option.id)}%` }"></view>
							<text class="percentage">{{ getOptionPercentage(question.id, option.id) }}%</text>
						</view>
						<text class="count">{{ getOptionCount(question.id, option.id) }}人</text>
					</view>
				</view>

				<!-- 文本题统计 -->
				<view v-else class="text-answers">
					<view v-for="(answer, ansIndex) in getTextAnswers(question.id)" :key="ansIndex" class="text-answer">
						<text>{{ answer }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import http from '@/api/http';
	import {
		formatDate
	} from '@/utils/date';

	export default {
		data() {
			return {
				surveyId: null,
				survey: {
					title: '',
					description: '',
					status: '',
					questions: []
				},
				responses: [],
				stats: {},
				activeTab: 'overview',
				tabs: [{
						label: '概览',
						value: 'overview'
					},
					{
						label: '问题',
						value: 'questions'
					}
				]
			};
		},
		computed: {
			totalResponses() {
				return this.responses.length;
			},
			completionRate() {
				const totalQuestions = this.survey.questions.length;
				if (totalQuestions === 0) return 0;

				const avgAnswered = this.responses.reduce((sum, res) => {
					return sum + Object.keys(res.answers).length;
				}, 0) / this.totalResponses;

				return Math.round((avgAnswered / totalQuestions) * 100);
			},
			avgCompletionTime() {
				if (this.totalResponses === 0) return 0;
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
				uni.showLoading({
					title: '加载中...'
				});
				try {
					// 加载问卷基本信息
					const surveyRes = await http.get(`/surveys/${this.surveyId}`);
					this.survey = surveyRes.survey;
					this.survey.questions = surveyRes.questions;

					// 加载回答数据
					const responsesRes = await http.get(`/surveys/${this.surveyId}/responses`);
					this.responses = responsesRes.data;

					// 计算统计数据
					this.calculateStats();
				} catch (error) {
					console.error('加载数据失败:', error);
					uni.showToast({
						title: error.error || '加载数据失败',
						icon: 'none'
					});
					setTimeout(() => uni.navigateBack(), 2000);
				} finally {
					uni.hideLoading();
				}
			},

			calculateStats() {
				const stats = {};

				// 初始化统计结构
				this.survey.questions.forEach(q => {
					stats[q.id] = {
						type: q.type,
						total: 0,
						options: {}
					};

					if (q.options) {
						q.options.forEach(opt => {
							stats[q.id].options[opt.id] = 0;
						});
					}
				});

				// 统计回答数据
				this.responses.forEach(res => {
					Object.entries(res.answers).forEach(([qId, answer]) => {
						const question = this.survey.questions.find(q => q.id == qId);
						if (!question) return;

						stats[qId].total++;

						if (['radio', 'checkbox'].includes(question.type)) {
							const answers = Array.isArray(answer) ? answer : [answer];
							answers.forEach(ans => {
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
				if (!this.stats[qId] || this.stats[qId].total === 0) return 0;
				return Math.round((this.stats[qId].options[optId] / this.stats[qId].total) * 100);
			},

			getOptionCount(qId, optId) {
				return this.stats[qId]?.options[optId] || 0;
			},

			getTextAnswers(qId) {
				return this.responses
					.map(res => res.answers[qId])
					.filter(Boolean)
					.slice(0, 10); // 只显示前10条文本回答
			},

			getStatusText(status) {
				const statusMap = {
					draft: '草稿',
					published: '已发布',
					closed: '已结束'
				};
				return statusMap[status] || status;
			},

			formatDate
		}
	};
</script>

<style scoped>
	.stats-container {
		padding: 30rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.survey-info {
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

	.survey-status {
		display: inline-block;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		margin-right: 20rpx;
	}

	.survey-status.draft {
		background-color: #f0f0f0;
		color: #999;
	}

	.survey-status.published {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.survey-status.closed {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	.response-count {
		display: block;
		font-size: 26rpx;
		color: #666;
		margin-top: 10rpx;
	}

	.stats-tabs {
		display: flex;
		background-color: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 20rpx;
		font-size: 28rpx;
		color: #666;
	}

	.tab-item.active {
		color: #007aff;
		font-weight: 500;
		border-bottom: 4rpx solid #007aff;
	}

	.overview-stats {
		display: flex;
		justify-content: space-between;
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.stats-card {
		flex: 1;
		text-align: center;
		padding: 20rpx;
	}

	.stats-value {
		display: block;
		font-size: 40rpx;
		font-weight: bold;
		color: #007aff;
		margin-bottom: 10rpx;
	}

	.stats-label {
		display: block;
		font-size: 26rpx;
		color: #999;
	}

	.question-stats {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
	}

	.question-stat-item {
		margin-bottom: 40rpx;
	}

	.question-title {
		display: block;
		font-size: 30rpx;
		font-weight: 500;
		margin-bottom: 20rpx;
	}

	.options-stats {
		margin-top: 20rpx;
	}

	.option-stat {
		margin-bottom: 20rpx;
	}

	.option-content {
		display: block;
		font-size: 26rpx;
		margin-bottom: 10rpx;
	}

	.progress-bar-container {
		display: flex;
		align-items: center;
		margin-bottom: 5rpx;
	}

	.progress-bar {
		height: 20rpx;
		background-color: #007aff;
		border-radius: 10rpx;
		margin-right: 15rpx;
	}

	.percentage {
		font-size: 24rpx;
		color: #007aff;
	}

	.count {
		font-size: 24rpx;
		color: #999;
	}

	.text-answers {
		margin-top: 20rpx;
	}

	.text-answer {
		padding: 20rpx;
		background-color: #f9f9f9;
		border-radius: 8rpx;
		margin-bottom: 15rpx;
		font-size: 26rpx;
		color: #333;
	}
</style>