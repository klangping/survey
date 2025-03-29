<template>
	<view class="survey-edit-container">
		<view class="survey-form">
			<view class="form-group">
				<text class="label">问卷标题<text class="required">*</text></text>
				<input v-model="survey.title" placeholder="请输入问卷标题（2-100个字符）" class="input" maxlength="100" />
			</view>

			<view class="form-group">
				<text class="label">问卷描述</text>
				<textarea v-model="survey.description" placeholder="请输入问卷描述（可选）" class="textarea" maxlength="500" />
			</view>

			<view class="form-group">
				<text class="label">问卷状态</text>
				<picker :range="statusOptions" range-key="text" @change="onStatusChange">
					<view class="picker">
						{{ statusOptions.find(o => o.value === survey.status).text }}
						<uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
					</view>
				</picker>
			</view>
		</view>

		<view class="questions-section">
			<view class="section-header">
				<text class="section-title">问卷问题<text class="required">*</text></text>
				<button class="add-question-btn" @click="showAddQuestionModal">
					<uni-icons type="plus" size="16" color="#007aff"></uni-icons>
					<text>添加问题</text>
				</button>
			</view>

			<draggable v-model="questions" handle=".drag-handle" @end="onQuestionSort" v-if="questions.length > 0">
				<view v-for="(question, index) in questions" :key="question.id || `new-${index}`" class="question-item">
					<view class="question-header">
						<uni-icons type="drag" class="drag-handle" size="20" color="#999"></uni-icons>
						<text class="question-title">问题 {{ index + 1 }}<text class="required"
								v-if="question.is_required">*</text></text>
						<uni-icons type="trash" size="20" color="#ff3b30"
							@click="showDeleteQuestionConfirm(question.id, index)"></uni-icons>
					</view>

					<view class="question-content">
						<input v-model="question.content" placeholder="请输入问题内容（至少3个字符）" class="question-input"
							maxlength="500" />

						<view class="question-settings">
							<view class="setting-item">
								<text>问题类型:</text>
								<picker :range="questionTypes" range-key="text" @change="(e) => onTypeChange(e, index)">
									<view class="picker">
										{{ questionTypes.find(t => t.value === question.type).text }}
										<uni-icons type="arrowdown" size="12" color="#999"></uni-icons>
									</view>
								</picker>
							</view>

							<view class="setting-item">
								<text>是否必填:</text>
								<switch :checked="question.is_required" @change="(e) => onRequiredChange(e, index)"
									color="#007aff" />
							</view>
						</view>

						<!-- 选项编辑器 -->
						<options-editor v-if="['radio','checkbox'].includes(question.type)" v-model="question.options"
							class="options-editor" />
					</view>
				</view>
			</draggable>

			<view v-else class="empty-questions">
				<image src="/static/empty-questions.png" mode="aspectFit"></image>
				<text>暂无问题，点击上方按钮添加</text>
			</view>
		</view>

		<view class="action-buttons">
			<button class="cancel-btn" @click="navigateBack">取消</button>
			<button class="save-btn" :loading="saving" @click="saveSurvey">保存问卷</button>
		</view>

		<!-- 添加问题模态框 -->
		<uni-popup ref="addQuestionPopup" type="bottom">
			<view class="add-question-popup">
				<text class="popup-title">选择问题类型</text>
				<view class="question-type-options">
					<view v-for="type in questionTypes" :key="type.value" class="type-option"
						@click="addNewQuestion(type.value)">
						<uni-icons :type="getQuestionTypeIcon(type.value)" size="20" color="#007aff"></uni-icons>
						<text>{{ type.text }}</text>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 删除确认弹窗 -->
		<uni-popup ref="deleteConfirm" type="dialog">
			<uni-popup-dialog type="warn" title="确认删除" content="确定要删除这个问题吗？" :duration="2000"
				@confirm="confirmDeleteQuestion" @cancel="cancelDeleteQuestion"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import draggable from '@/components/draggable';
	import OptionsEditor from '@/components/OptionsEditor';
	import {
		formatDate
	} from '@/utils/date';

	export default {
		components: {
			draggable,
			OptionsEditor
		},
		data() {
			return {
				surveyId: null,
				survey: {
					title: '',
					description: '',
					status: 'draft'
				},
				questions: [],
				statusOptions: [{
						text: '草稿',
						value: 'draft'
					},
					{
						text: '已发布',
						value: 'published'
					},
					{
						text: '已结束',
						value: 'closed'
					}
				],
				questionTypes: [{
						text: '单选题',
						value: 'radio',
						hasOptions: true
					},
					{
						text: '多选题',
						value: 'checkbox',
						hasOptions: true
					},
					{
						text: '单行文本',
						value: 'text',
						hasOptions: false
					},
					{
						text: '多行文本',
						value: 'textarea',
						hasOptions: false
					},
					{
						text: '评分题',
						value: 'rating',
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
					radio: 'radiobox-marked',
					checkbox: 'checkbox-marked',
					text: 'text',
					textarea: 'format-text',
					rating: 'star'
				};
				return icons[type] || 'help';
			},
			confirmStatusChange(newStatus) {
				if (this.survey.status === newStatus) return;

				const statusText = {
					draft: '草稿',
					published: '已发布',
					closed: '已结束'
				};

				uni.showModal({
					title: '确认变更状态',
					content: `确定要将问卷状态从${statusText[this.survey.status]}变更为${statusText[newStatus]}吗？`,
					success: (res) => {
						if (res.confirm) {
							this.survey.status = newStatus;
						}
					}
				});
			},

			hasUnsavedChanges() {
				// 检查是否有未保存的修改
				return this.survey.title ||
					this.questions.length > 0 ||
					this.survey.description;
			},

			showLeaveConfirm() {
				uni.showModal({
					title: '确认离开',
					content: '您有未保存的修改，确定要离开吗？',
					success: (res) => {
						if (res.confirm) {
							uni.navigateBack();
						}
					}
				});
			},

			navigateBack() {
				if (this.hasUnsavedChanges()) {
					this.showLeaveConfirm();
				} else {
					uni.navigateBack();
				}
			},

			validateSurvey() {
				// 问卷标题验证
				if (!this.survey.title || this.survey.title.trim().length < 2) {
					uni.showToast({
						title: '问卷标题不能少于2个字符',
						icon: 'none',
						duration: 2000
					});
					return false;
				}

				if (this.survey.title.length > 100) {
					uni.showToast({
						title: '问卷标题不能超过100个字符',
						icon: 'none',
						duration: 2000
					});
					return false;
				}

				// 问题数量验证
				if (this.questions.length === 0) {
					uni.showToast({
						title: '请至少添加一个问题',
						icon: 'none',
						duration: 2000
					});
					return false;
				}

				// 问题内容验证
				for (const [index, question] of this.questions.entries()) {
					if (!question.content || question.content.trim().length < 3) {
						uni.showToast({
							title: `问题${index + 1}内容不能少于3个字符`,
							icon: 'none',
							duration: 2000
						});
						return false;
					}

					// 选择题选项验证
					if (['radio', 'checkbox'].includes(question.type)) {
						if (!question.options || question.options.length < 2) {
							uni.showToast({
								title: `问题${index + 1}需要至少2个选项`,
								icon: 'none',
								duration: 2000
							});
							return false;
						}

						for (const [optIndex, option] of question.options.entries()) {
							if (!option.content || !option.content.trim()) {
								uni.showToast({
									title: `问题${index + 1}的选项${optIndex + 1}不能为空`,
									icon: 'none',
									duration: 2000
								});
								return false;
							}
						}
					}
				}

				return true;
			},

			async loadSurvey() {
				uni.showLoading({
					title: '加载中...',
					mask: true
				});

				try {
					const res = await this.$http.get(`/surveys/${this.surveyId}`);
					this.survey = {
						title: res.survey.title,
						description: res.survey.description || '',
						status: res.survey.status || 'draft'
					};

					this.questions = res.questions.map(q => ({
						id: q.id,
						content: q.content,
						type: q.type,
						is_required: Boolean(q.is_required),
						sort_order: q.sort_order || 0,
						options: q.options || []
					}));
				} catch (error) {
					console.error('加载问卷失败:', error);
					uni.showToast({
						title: error.error || '加载问卷失败',
						icon: 'none',
						duration: 2000
					});
					setTimeout(() => uni.navigateBack(), 2000);
				} finally {
					uni.hideLoading();
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
				const questionType = this.questionTypes.find(t => t.value === type);
				const newQuestion = {
					content: '',
					type,
					is_required: true,
					sort_order: this.questions.length + 1
				};

				if (questionType.hasOptions) {
					newQuestion.options = [{
							id: null,
							content: '选项1'
						},
						{
							id: null,
							content: '选项2'
						}
					];
				}

				this.questions.push(newQuestion);
				this.$refs.addQuestionPopup.close();

				// 滚动到新添加的问题
				setTimeout(() => {
					uni.pageScrollTo({
						selector: `.question-item:last-child`,
						duration: 300
					});
				}, 100);
			},

			onTypeChange(e, index) {
				const newType = this.questionTypes[e.detail.value].value;
				const oldType = this.questions[index].type;

				if (newType !== oldType) {
					// 如果从选择题切换到非选择题，清空选项
					if (['radio', 'checkbox'].includes(oldType) && !['radio', 'checkbox'].includes(newType)) {
						this.$set(this.questions[index], 'options', undefined);
					}
					// 如果从非选择题切换到选择题，添加默认选项
					else if (!['radio', 'checkbox'].includes(oldType) && ['radio', 'checkbox'].includes(newType)) {
						this.$set(this.questions[index], 'options', [{
								id: null,
								content: '选项1'
							},
							{
								id: null,
								content: '选项2'
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
						uni.showToast({
							title: error.error || '删除问题失败',
							icon: 'none',
							duration: 2000
						});
						return;
					}
				}

				this.questions.splice(index, 1);
				this.deletingQuestion = {
					id: null,
					index: null
				};

				// 重新排序
				this.questions.forEach((q, i) => {
					q.sort_order = i + 1;
				});
			},

			async onQuestionSort() {
				if (!this.surveyId) return;

				try {
					await this.$http.post('/surveys/questions/sort', {
						orderedIds: this.questions.map(q => q.id).filter(Boolean)
					});
				} catch (error) {
					console.error('排序保存失败:', error);
					uni.showToast({
						title: error.error || '排序保存失败',
						icon: 'none',
						duration: 2000
					});
				}
			},

			async saveSurvey() {
				if (!this.validateSurvey()) return;

				this.saving = true;
				uni.showLoading({
					title: '保存中...',
					mask: true
				});

				try {
					if (this.surveyId) {
						// 更新问卷
						await this.$http.put(`/surveys/${this.surveyId}`, this.survey);

						// 更新问题
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
						// 创建新问卷
						const res = await this.$http.post('/surveys', this.survey);
						this.surveyId = res.survey.id;

						// 添加问题
						for (const question of this.questions) {
							const qRes = await this.$http.post(`/surveys/${this.surveyId}/questions`, question);
							question.id = qRes.question.id;
						}
					}

					uni.showToast({
						title: '保存成功',
						icon: 'success',
						duration: 1500
					});

					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/survey/list'
						});
					}, 1500);
				} catch (error) {
					console.error('保存失败:', error);
					uni.showToast({
						title: error.error || '保存失败',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.saving = false;
					uni.hideLoading();
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.survey-edit-container {
		padding: 20rpx;
		padding-bottom: 120rpx;
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.survey-form {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.form-group {
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.label {
		display: block;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 16rpx;
		font-weight: 500;
	}

	.required {
		color: #ff3b30;
		margin-left: 6rpx;
	}

	.input,
	.textarea,
	.picker {
		width: 100%;
		padding: 20rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		font-size: 28rpx;
		color: #333;
		background-color: #fff;
	}

	.input {
		height: 80rpx;
	}

	.textarea {
		height: 150rpx;
	}

	.picker {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.questions-section {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.section-title {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
	}

	.add-question-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 60rpx;
		padding: 0 20rpx;
		background-color: #f0f7ff;
		border-radius: 30rpx;
		font-size: 26rpx;
		color: #007aff;

		text {
			margin-left: 8rpx;
		}
	}

	.empty-questions {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 0;

		image {
			width: 200rpx;
			height: 200rpx;
			opacity: 0.6;
			margin-bottom: 20rpx;
		}

		text {
			font-size: 28rpx;
			color: #999;
		}
	}

	.question-item {
		padding: 30rpx;
		background-color: #fafafa;
		border-radius: 8rpx;
		margin-bottom: 20rpx;
		border: 1rpx solid #eee;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.question-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.drag-handle {
		margin-right: 15rpx;
	}

	.question-title {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.question-content {
		padding-left: 40rpx;
	}

	.question-input {
		width: 100%;
		padding: 20rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		font-size: 28rpx;
		color: #333;
		background-color: #fff;
		margin-bottom: 20rpx;
	}

	.question-settings {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.setting-item {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #666;

		text {
			margin-right: 10rpx;
		}

		.picker {
			width: 180rpx;
			padding: 10rpx 15rpx;
			font-size: 26rpx;
		}
	}

	.options-editor {
		margin-top: 20rpx;
	}

	.action-buttons {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		padding: 20rpx;
		background-color: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.cancel-btn,
	.save-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 8rpx;
		font-size: 30rpx;
	}

	.cancel-btn {
		background-color: #f5f5f5;
		color: #666;
		margin-right: 15rpx;
	}

	.save-btn {
		background-color: #007aff;
		color: #fff;
	}

	.add-question-popup {
		padding: 40rpx;
		background-color: #fff;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
	}

	.popup-title {
		display: block;
		text-align: center;
		font-size: 32rpx;
		font-weight: 500;
		margin-bottom: 30rpx;
		color: #333;
	}

	.question-type-options {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.type-option {
		width: 48%;
		padding: 30rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
		border: 1rpx solid #eee;
		border-radius: 8rpx;

		text {
			margin-top: 15rpx;
			font-size: 28rpx;
			color: #333;
		}

		&:active {
			background-color: #f5f5f5;
		}
	}
</style>