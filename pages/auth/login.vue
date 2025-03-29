<template>
	<view class="login-container">
		<view class="login-card">
			<text class="title">欢迎回来</text>

			<view class="form-group">
				<text class="label">用户名</text>
				<input v-model="form.username" placeholder="请输入用户名" class="input" @confirm="handleLogin" />
			</view>

			<view class="form-group">
				<text class="label">密码</text>
				<input v-model="form.password" placeholder="请输入密码" password class="input" @confirm="handleLogin" />
			</view>

			<button class="login-btn" :loading="loading" @click="handleLogin">
				登录
			</button>

			<view class="footer">
				<text>还没有账号？</text>
				<text class="register-link" @click="navigateToRegister">立即注册</text>
			</view>
		</view>
	</view>
</template>

<script>
	import http from '@/api/http';

	export default {
		data() {
			return {
				form: {
					username: '',
					password: ''
				},
				loading: false
			};
		},
		methods: {
			validateForm() {
				if (!this.form.username.trim()) {
					uni.showToast({
						title: '请输入用户名',
						icon: 'none'
					});
					return false;
				}
				if (!this.form.password) {
					uni.showToast({
						title: '请输入密码',
						icon: 'none'
					});
					return false;
				}
				return true;
			},

			async handleLogin() {
				if (!this.validateForm()) return;

				this.loading = true;

				try {
					const res = await http.post('/login', this.form);

					// 保存用户状态
					this.$store.setUser(res.user, res.token);

					uni.showToast({
						title: '登录成功',
						icon: 'success'
					});

					// 跳转到首页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						});
					}, 1500);
				} catch (error) {
					console.error('登录失败:', error);
					uni.showToast({
						title: error.error || '登录失败，请重试',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},

			navigateToRegister() {
				uni.navigateTo({
					url: '/pages/auth/register'
				});
			}
		}
	};
</script>

<style scoped>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 40rpx;
		background-color: #f5f5f5;
	}

	.login-card {
		width: 100%;
		max-width: 600rpx;
		padding: 60rpx 40rpx;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.title {
		display: block;
		font-size: 44rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 60rpx;
		color: #333;
	}

	.form-group {
		margin-bottom: 40rpx;
	}

	.label {
		display: block;
		font-size: 28rpx;
		margin-bottom: 16rpx;
		color: #666;
	}

	.input {
		height: 88rpx;
		padding: 0 24rpx;
		border: 2rpx solid #eee;
		border-radius: 8rpx;
		font-size: 30rpx;
	}

	.login-btn {
		height: 88rpx;
		line-height: 88rpx;
		background-color: #007aff;
		color: white;
		border-radius: 8rpx;
		font-size: 32rpx;
		margin-top: 40rpx;
	}

	.footer {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 40rpx;
		font-size: 28rpx;
		color: #999;
	}

	.register-link {
		color: #007aff;
		margin-left: 10rpx;
	}
</style>