<template>
	<view class="index-container">
		<!-- 顶部搜索栏 -->
		<view class="search-bar">
			<uni-search-bar v-model="searchText" placeholder="搜索问卷" radius="100" @confirm="handleSearch"
				@clear="clearSearch" />
		</view>

		<!-- 创建问卷按钮 -->
		<view class="create-btn-container">
			<button class="create-btn" @click="navigateToCreate">
				<uni-icons type="plusempty" size="20" color="#fff"></uni-icons>
				<text>创建问卷</text>
			</button>
		</view>

		<!-- 问卷列表 -->
		<view class="survey-list">
			<!-- 下拉刷新 -->
			<uni-refresh-control :refreshing="refreshing" @refresh="onRefresh" v-if="surveys.length > 0" />

			<view v-if="loading && !refreshing" class="loading-container">
				<uni-load-more status="loading"></uni-load-more>
			</view>

			<view v-else-if="surveys.length === 0" class="empty-container">
				<image src="/static/empty.png" mode="aspectFit"></image>
				<text>暂无问卷，点击上方按钮创建</text>
			</view>

			<view v-else>
				<view v-for="survey in filteredSurveys" :key="survey.id" class="survey-item"
					@click="navigateToSurvey(survey.id)">
					<view class="survey-info">
						<text class="survey-title">{{ survey.title }}</text>
						<view class="survey-status" :class="getStatusClass(survey.status)">
							{{ getStatusText(survey.status) }}
						</view>
						<text class="survey-desc" v-if="survey.description">{{ survey.description }}</text>
						<text class="survey-date">{{ formatDate(survey.created_at) }}</text>
					</view>
					<uni-icons type="arrowright" size="20" color="#999"></uni-icons>
				</view>

				<!-- 上拉加载更多 -->
				<uni-load-more :status="loadMoreStatus" v-if="hasMore" @clickLoadMore="loadMore" />
			</view>
		</view>
	</view>
</template>

<script>
	import {
		formatDate
	} from '@/utils/date';
	import http from '@/api/http';
	import uniLoadMore from '@dcloudio/uni-ui/lib/uni-load-more/uni-load-more.vue';
	import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
	import uniSearchBar from '@dcloudio/uni-ui/lib/uni-search-bar/uni-search-bar.vue';
	import uniRefreshControl from '@dcloudio/uni-ui/lib/uni-refresh-control/uni-refresh-control.vue';

	export default {
		components: {
			uniLoadMore,
			uniIcons,
			uniSearchBar,
			uniRefreshControl
		},
		data() {
			return {
				searchText: '',
				surveys: [],
				loading: true,
				refreshing: false,
				page: 1,
				pageSize: 10,
				total: 0,
				loadMoreStatus: 'more'
			};
		},
		computed: {
			// 是否还有更多数据
			hasMore() {
				return this.surveys.length < this.total;
			},

			// 过滤搜索结果
			filteredSurveys() {
				if (!this.searchText) return this.surveys;

				const searchText = this.searchText.toLowerCase();
				return this.surveys.filter(survey =>
					survey.title.toLowerCase().includes(searchText) ||
					(survey.description && survey.description.toLowerCase().includes(searchText))
				);
			}
		},
		onLoad() {
			this.loadSurveys();
		},
		onPullDownRefresh() {
			this.onRefresh();
		},
		onReachBottom() {
			if (this.hasMore) {
				this.loadMore();
			}
		},
		methods: {
			// 加载问卷列表
			async loadSurveys() {
			  this.loading = true;
			  try {
			    const res = await http.get('/surveys', {
			      params: {
			        page: this.page,
			        pageSize: this.pageSize
			      }
			    }).catch(err => {
			      throw new Error(err.error || err.message || '请求失败');
			    });
			    
			    if (!res || !res.data) {
			      throw new Error('无效的响应数据');
			    }
			    
			    this.surveys = this.page === 1 ? res.data.list : [...this.surveys, ...res.data.list];
			    this.total = res.data.total;
			  } catch (error) {
			    console.error('加载问卷失败:', error);
			    uni.showToast({ 
			      title: error.message || '加载问卷失败', 
			      icon: 'none',
			      duration: 2000
			    });
			  } finally {
			    this.loading = false;
			    uni.stopPullDownRefresh();
			  }
			},

			// 刷新数据
			async onRefresh() {
				this.refreshing = true;
				this.page = 1;
				await this.loadSurveys();
				this.refreshing = false;
			},

			// 加载更多数据
			async loadMore() {
				if (this.loadMoreStatus !== 'more') return;

				this.loadMoreStatus = 'loading';
				this.page++;

				try {
					await this.loadSurveys();
					this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
				} catch (error) {
					this.page--;
					this.loadMoreStatus = 'more';
				}
			},

			// 搜索问卷
			handleSearch() {
				this.page = 1;
				this.loadSurveys();
			},

			// 清空搜索
			clearSearch() {
				this.searchText = '';
				this.handleSearch();
			},

			// 跳转到创建问卷页面
			navigateToCreate() {
				uni.navigateTo({
					url: '/pages/survey/create'
				});
			},

			// 跳转到问卷详情
			navigateToSurvey(id) {
				uni.navigateTo({
					url: `/pages/survey/detail?id=${id}`
				});
			},

			// 获取问卷状态文本
			getStatusText(status) {
				const statusMap = {
					draft: '草稿',
					published: '发布中',
					closed: '已结束'
				};
				return statusMap[status] || '未知状态';
			},

			// 获取问卷状态样式类
			getStatusClass(status) {
				return `status-${status}`;
			},

			// 格式化日期
			formatDate
		}
	};
</script>

<style scoped>
	.index-container {
		padding: 20rpx;
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.search-bar {
		background-color: #fff;
		padding: 20rpx;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
	}

	.create-btn-container {
		margin: 20rpx 0;
	}

	.create-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 80rpx;
		line-height: 80rpx;
		background-color: #007aff;
		color: #fff;
		border-radius: 8rpx;
		font-size: 32rpx;
	}

	.create-btn text {
		margin-left: 10rpx;
	}

	.survey-list {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.survey-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.survey-info {
		flex: 1;
		position: relative;
	}

	.survey-title {
		display: block;
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
		color: #333;
	}

	.survey-status {
		position: absolute;
		right: 0;
		top: 0;
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}

	.status-draft {
		background-color: #f0f0f0;
		color: #999;
	}

	.status-published {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.status-closed {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	.survey-desc {
		display: block;
		font-size: 26rpx;
		color: #666;
		margin-bottom: 10rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.survey-date {
		display: block;
		font-size: 24rpx;
		color: #999;
	}

	.loading-container,
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 0;
	}

	.empty-container image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
		opacity: 0.6;
	}

	.empty-container text {
		font-size: 28rpx;
		color: #999;
	}
</style>