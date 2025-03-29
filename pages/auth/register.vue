<template>
	<view class="register-container">
		<view class="register-card">
			<text class="title">创建账号</text>

			<view class="form-group">
				<text class="label">用户名</text>
				<input v-model="form.username" placeholder="4-20位字母或数字" class="input" @input="validateUsername" />
			</view>

			<view class="form-group">
				<text class="label">密码</text>
				<input v-model="form.password" placeholder="至少6位字符" password class="input" @input="validatePassword" />
			</view>

			<view class="form-group">
				<text class="label">确认密码</text>
				<input v-model="form.confirmPassword" placeholder="再次输入密码" password class="input"
					@input="validateConfirmPassword" @confirm="handleRegister" />
			</view>

			<button class="register-btn" :loading="loading" :disabled="!formValid" @click="handleRegister">
				注册
			</button>

			<view class="footer">
				<text>已有账号？</text>
				<text class="login-link" @click="navigateToLogin">立即登录</text>
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
					password: '',
					confirmPassword: ''
				},
				loading: false,
				errors: {
					username: '',
					password: '',
					confirmPassword: ''
				}
			};
		},
		computed: {
			formValid() {
				return (
					this.form.username &&
					this.form.password &&
					this.form.password === this.form.confirmPassword &&
					!this.errors.username &&
					!this.errors.password &&
					!this.errors.confirmPassword
				);
			}
		},
		methods: {
			validateUsername() {
				if (!this.form.username.trim()) {
					this.errors.username = '请输入用户名';
					return false;
				}
				if (!/^[a-zA-Z0-9]{4,20}$/.test(this.form.username)) {
					this.errors.username = '用户名需4-20位字母或数字';
					return false;
				}
				this.errors.username = '';
				return true;
			},

			validatePassword() {
				if (!this.form.password) {
					this.errors.password = '请输入密码';
					return false;
				}
				if (this.form.password.length < 6) {
					this.errors.password = '密码长度不能少于6位';
					return false;
				}
				this.errors.password = '';
				return true;
			},

			validateConfirmPassword() {
				if (this.form.password !== this.form.confirmPassword) {
					this.errors.confirmPassword = '两次输入的密码不一致';
					return false;
				}
				this.errors.confirmPassword = '';
				return true;
			},

			validateForm() {
				const validUsername = this.validateUsername();
				const validPassword = this.validatePassword();
				const validConfirm = this.validateConfirmPassword();

				return validUsername && validPassword && validConfirm;
			},

			async handleRegister() {
				if (!this.validateForm()) return;

				this.loading = true;

				try {
					const res = await http.post('/register', {
						username: this.form.username,
						password: this.form.password
					});

					uni.showToast({
						title: '注册成功',
						icon: 'success',
						duration: 2000
					});

					// 自动登录处理
					this.$store.setUser(res.user, res.token);

					// 使用setTimeout确保动画完成
					setTimeout(() => {
						// 先尝试关闭所有webview
						if (typeof uni.$emit === 'function') {
							uni.$emit('CLOSE_ALL_WEBVIEWS');
						}

						// 使用reLaunch清除页面栈
						uni.reLaunch({
							url: '/pages/index/index',
							success: () => {
								console.log('跳转成功');
							},
							fail: (err) => {
								console.error('跳转失败:', err);
								// 备用跳转方案
								uni.switchTab({
									url: '/pages/index/index'
								});
							}
						});
					}, 2000);
				} catch (error) {
					console.error('注册失败:', error);
					uni.showToast({
						title: error.error || error.message || '注册失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},

			navigateToLogin() {
				uni.navigateTo({
					url: '/pages/auth/login'
				});
			}
		}
	};
</script>

<style scoped>
	.register-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 40rpx;
		background-color: #f5f5f5;
	}

	.register-card {
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

	.input:focus {
		border-color: #007aff;
	}

	.register-btn {
		height: 88rpx;
		line-height: 88rpx;
		background-color: #007aff;
		color: white;
		border-radius: 8rpx;
		font-size: 32rpx;
		margin-top: 40rpx;
		transition: opacity 0.3s;
	}

	.register-btn:disabled {
		opacity: 0.6;
	}

	.footer {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 40rpx;
		font-size: 28rpx;
		color: #999;
	}

	.login-link {
		color: #007aff;
		margin-left: 10rpx;
	}

	.error-message {
		color: #ff3b30;
		font-size: 24rpx;
		margin-top: 8rpx;
	}
</style>