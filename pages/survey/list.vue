<template>
	<view class="survey-list-container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<uni-search-bar v-model="searchText" placeholder="搜索问卷" :radius="100" clearButton="always"
				cancelButton="none" @confirm="handleSearch" @clear="clearSearch" />
		</view>

		<!-- 创建按钮 -->
		<view class="create-btn-container">
			<button class="create-btn" @click="navigateToCreate">
				<uni-icons type="plusempty" size="18" color="#fff"></uni-icons>
				<text>新建问卷</text>
			</button>
		</view>

		<!-- 问卷列表 -->
		<view class="survey-list">
			<template v-if="loading">
				<view class="loading-container">
					<uni-load-more status="loading" :icon-size="16"></uni-load-more>
				</view>
			</template>

			<template v-else-if="filteredSurveys.length === 0">
				<view class="empty-container">
					<image src="/static/empty.png" mode="aspectFit"></image>
					<text>{{ searchText ? '没有找到匹配的问卷' : '暂无问卷，点击上方按钮创建' }}</text>
				</view>
			</template>

			<template v-else>
				<uni-swipe-action>
					<uni-swipe-action-item v-for="(survey, index) in filteredSurveys" :key="survey.id"
						:right-options="swipeOptions" @click="handleSwipeClick($event, index)">
						<view class="survey-item" @click="navigateToEdit(survey.id)">
							<view class="survey-info">
								<text class="survey-title">{{ survey.title }}</text>
								<text class="survey-desc" v-if="survey.description">{{ survey.description }}</text>
								<view class="meta-container">
									<text class="survey-status"
										:class="survey.status">{{ getStatusText(survey.status) }}</text>
									<text class="survey-date">{{ formatDate(survey.created_at) }}</text>
								</view>
							</view>
							<uni-icons type="arrowright" size="18" color="#999"></uni-icons>
						</view>
					</uni-swipe-action-item>
				</uni-swipe-action>
			</template>

			<uni-load-more :status="loadMoreStatus" :content-text="{
          contentdown: '上拉加载更多',
          contentrefresh: '正在加载...',
          contentnomore: '没有更多数据了'
        }" />
		</view>

		<!-- 删除确认弹窗 -->
		<uni-popup ref="deleteConfirm" type="dialog">
			<uni-popup-dialog type="warn" title="确认删除" content="确定要删除这个问卷吗？删除后无法恢复" :duration="2000"
				@confirm="confirmDelete" @cancel="cancelDelete"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import {
		formatDate
	} from '@/utils/date';
	import {
		debounce
	} from '@/utils/util';

	export default {
		data() {
			return {
				searchText: '',
				surveys: [],
				loading: false,
				refreshing: false,
				page: 1,
				pageSize: 10,
				total: 0,
				loadMoreStatus: 'more'
			};
		},
		computed: {
			filteredSurveys() {
				if (!this.searchText.trim()) return this.surveys;
				const searchText = this.searchText.toLowerCase();
				return this.surveys.filter(survey => {
					return (
						survey.title.toLowerCase().includes(searchText) ||
						(survey.description && survey.description.toLowerCase().includes(searchText))
					);
				});
			}
		},
		onLoad() {
			this.loadSurveys();
		},
		onReachBottom() {
			if (this.currentPage < this.totalPages && !this.loading) {
				this.loadMore();
			}
		},
		onPullDownRefresh() {
			this.refreshSurveys();
		},
		methods: {
			getStatusText(status) {
				const statusMap = {
					draft: '草稿',
					published: '已发布',
					closed: '已结束'
				};
				return statusMap[status] || status;
			},

			async loadSurveys() {
				this.loading = true;
				try {
					const res = await this.$http.get('/surveys', {
						params: {
							page: this.page,
							pageSize: this.pageSize
						}
					});
					this.surveys = this.page === 1 ? res.data.list : [...this.surveys, ...res.data.list];
					this.total = res.data.total;
				} catch (error) {
					console.error('加载问卷失败:', error);
					uni.showToast({
						title: error.error || '加载问卷失败',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.loading = false;
					uni.stopPullDownRefresh();
				}
			},

			async loadMore() {
				if (this.currentPage >= this.totalPages) {
					this.loadMoreStatus = 'noMore';
					return;
				}

				this.loadMoreStatus = 'loading';
				try {
					const res = await this.$http.get('/surveys', {
						params: {
							page: this.currentPage + 1,
							pageSize: 10
						}
					});

					this.surveys = [...this.surveys, ...res.data.surveys];
					this.currentPage++;
					this.totalPages = res.data.totalPages;

					this.loadMoreStatus = res.data.surveys.length > 0 ? 'more' : 'noMore';
				} catch (error) {
					console.error('加载更多失败:', error);
					this.loadMoreStatus = 'more';
					uni.showToast({
						title: error.error || '加载更多失败',
						icon: 'none',
						duration: 2000
					});
				}
			},

			async refreshSurveys() {
				this.currentPage = 1;
				await this.loadSurveys();
			},

			navigateToCreate() {
				uni.navigateTo({
					url: '/pages/survey/create'
				});
			},

			navigateToEdit(id) {
				uni.navigateTo({
					url: `/pages/survey/edit?id=${id}`
				});
			},

			handleSwipeClick(e, index) {
				this.currentDeleteId = this.filteredSurveys[index].id;
				this.$refs.deleteConfirm.open();
			},

			async confirmDelete() {
				if (!this.currentDeleteId) return;

				try {
					await this.$http.delete(`/surveys/${this.currentDeleteId}`);
					this.surveys = this.surveys.filter(s => s.id !== this.currentDeleteId);
					uni.showToast({
						title: '删除成功',
						icon: 'success',
						duration: 1500
					});
				} catch (error) {
					console.error('删除失败:', error);
					uni.showToast({
						title: error.error || '删除失败',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.currentDeleteId = null;
				}
			},

			cancelDelete() {
				this.currentDeleteId = null;
			},

			handleSearch: debounce(function() {
				if (this.searchText.trim()) {
					// 实际项目中可以调用API搜索
					console.log('执行搜索:', this.searchText);
				}
			}, 500),

			clearSearch() {
				this.searchText = '';
			},

			formatDate
		}
	};
</script>

<style scoped>
	.survey-list-container {
		padding: 20rpx;
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.search-bar {
		background-color: #fff;
		padding: 10rpx 20rpx;
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
		font-size: 30rpx;
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
		margin-right: 20rpx;
	}

	.survey-title {
		display: block;
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
		color: #333;
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

	.meta-container {
		display: flex;
		align-items: center;
	}

	.survey-status {
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		margin-right: 15rpx;
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

	.survey-date {
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