<template>
	<view class="user-center">
		<view class="profile-card">
			<view class="avatar">
				<text>{{ userInitial }}</text>
			</view>
			<view class="info">
				<text class="username">{{ user.username }}</text>
				<text class="join-date">注册于 {{ joinDate }}</text>
			</view>
		</view>

		<view class="menu-list">
			<view class="menu-item" @click="navigateTo('/pages/user/settings')">
				<text>个人设置</text>
				<uni-icons type="arrowright" size="18"></uni-icons>
			</view>
			<view class="menu-item" @click="handleLogout">
				<text class="logout-text">退出登录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		formatDate
	} from '@/utils/date';
	//import uniIcons from '@/components/uni-icons/uni-icons.vue';
	export default {
		data() {
			return {
				user: {}
			};
		},
		computed: {
			userInitial() {
				return this.user.username ? this.user.username.charAt(0).toUpperCase() : '';
			},
			joinDate() {
				return formatDate(this.user.created_at);
			}
		},
		onShow() {
			this.loadUser();
		},
		methods: {
			async loadUser() {
				try {
					// 从store获取或从API重新获取用户信息
					if (this.$store.state.user) {
						this.user = this.$store.state.user;
					} else {
						this.user = await this.$store.fetchCurrentUser();
					}
				} catch (error) {
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					});
				}
			},

			navigateTo(url) {
				uni.navigateTo({
					url
				});
			},

			handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							this.$store.clearUser();
							uni.reLaunch({
								url: '/pages/auth/login'
							});
						}
					}
				});
			}
		}
	};
</script>

<style scoped>
	.user-center {
		padding: 30rpx;
	}

	.profile-card {
		display: flex;
		align-items: center;
		padding: 40rpx;
		background-color: #fff;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background-color: #007aff;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 30rpx;
	}

	.avatar text {
		color: white;
		font-size: 48rpx;
		font-weight: bold;
	}

	.info {
		display: flex;
		flex-direction: column;
	}

	.username {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.join-date {
		font-size: 24rpx;
		color: #999;
	}

	.menu-list {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.menu-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 2rpx solid #f5f5f5;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.logout-text {
		color: #ff3b30;
	}
</style>