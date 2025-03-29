import App from './App'
import store from './store'
import http from '@/api/http' // 导入封装好的http实例
import * as uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import * as uniLoadMore from '@dcloudio/uni-ui/lib/uni-load-more/uni-load-more.vue'
// #ifndef VUE3
// Vue2 配置
import Vue from 'vue'
import './uni.promisify.adaptor'

Vue.config.productionTip = false
App.mpType = 'app'
Vue.component('uni-icons', uniIcons)
Vue.component('uni-load-more', uniLoadMore)
// 挂载store到Vue2原型
Vue.prototype.$store = store
Vue.prototype.$http = http // 挂载http实例

// 初始化store
store.init()

const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
// Vue3 配置
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
    app.component('uni-icons', uniIcons)
    app.component('uni-load-more', uniLoadMore)
  // 挂载store到全局
  app.config.globalProperties.$store = store
  app.config.globalProperties.$http = http // 挂载http实例
  // 初始化store
  store.init()
  
  return {
    app
  }
}
// #endif