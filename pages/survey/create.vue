<template>
	<view class="create-container">
		<view class="form-card">
			<view class="form-group">
				<text class="label">问卷标题<text class="required">*</text></text>
				<input v-model="title" placeholder="请输入问卷标题" class="input" />
			</view>

			<view class="form-group">
				<text class="label">问卷描述</text>
				<textarea v-model="description" placeholder="请输入问卷描述" class="textarea"></textarea>
			</view>

			<button class="create-btn" @click="handleCreate" :loading="loading">
				创建问卷
			</button>
		</view>
	</view>
</template>

<script>
	import http from '@/api/http';

	export default {
		data() {
			return {
				title: '',
				description: '',
				loading: false
			};
		},
		methods: {
			async handleCreate() {
				if (!this.title.trim()) {
					uni.showToast({
						title: '请输入问卷标题',
						icon: 'none'
					});
					return;
				}

				this.loading = true;

				try {
					const res = await http.post('/surveys', {
						title: this.title,
						description: this.description
					});

					uni.showToast({
						title: '创建成功',
						icon: 'success'
					});

					setTimeout(() => {
						uni.navigateTo({
							url: `/pages/survey/edit?id=${res.survey.id}`
						});
					}, 1500);
				} catch (error) {
					console.error('创建失败:', error);
					uni.showToast({
						title: error.error || '创建问卷失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			}
		}
	};
</script>

<style scoped>
	.create-container {
		padding: 20rpx;
	}

	.form-card {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
	}

	.form-group {
		margin-bottom: 30rpx;
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

	.input {
		width: 100%;
		height: 80rpx;
		padding: 0 20rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		font-size: 28rpx;
	}

	.textarea {
		width: 100%;
		height: 150rpx;
		padding: 20rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		font-size: 28rpx;
	}

	.create-btn {
		height: 88rpx;
		line-height: 88rpx;
		background-color: #007aff;
		color: white;
		border-radius: 8rpx;
		font-size: 32rpx;
		margin-top: 40rpx;
	}
</style>