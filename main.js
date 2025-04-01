// main.js
import App from './App'
import store from './store'
import http from '@/api/http'

// #ifndef VUE3
// Vue2 配置
import Vue from 'vue'
import './uni.promisify.adaptor'
import VueCompositionAPI from '@vue/composition-api'

// 按需导入组件（推荐方式）
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import uniLoadMore from '@dcloudio/uni-ui/lib/uni-load-more/uni-load-more.vue'
import uniSearchBar from '@dcloudio/uni-ui/lib/uni-search-bar/uni-search-bar.vue'

Vue.config.productionTip = false
App.mpType = 'app'

// 注册全局组件
Vue.component('uni-icons', uniIcons)
Vue.component('uni-load-more', uniLoadMore)
Vue.component('uni-search-bar', uniSearchBar)

Vue.use(VueCompositionAPI)
Vue.prototype.$store = store
Vue.prototype.$http = http

store.init()

const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
// Vue3 配置
import {
	createSSRApp
} from 'vue'
import {
	createPinia
} from 'pinia'
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import uniLoadMore from '@dcloudio/uni-ui/lib/uni-load-more/uni-load-more.vue'

export function createApp() {
	const app = createSSRApp(App)
	const pinia = createPinia()

	app.component('uni-icons', uniIcons)
	app.component('uni-load-more', uniLoadMore)
	
	app.use(store)
	app.use(pinia)
	app.config.globalProperties.$http = http

	return {
		app
	}
}
// #endif