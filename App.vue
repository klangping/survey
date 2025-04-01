<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

/* App.vue 中添加基础样式 */
<style>
/* 公共样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background-color: #f5f5f5;
  font-size: 28rpx;
  color: #333;
}

/* 统一按钮样式 */
button {
  border-radius: 8rpx !important;
  font-size: 32rpx !important;
}

/* 输入框统一样式 */
input, textarea {
  border: 1rpx solid #e5e5e5;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}
</style>
