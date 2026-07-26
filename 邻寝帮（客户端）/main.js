import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'

// 初始化 uniCloud - 连接到云端服务空间
let cloudReady = false
try {
  uniCloud.init({
    provider: 'aliyun'
  })
  console.log('[邻寝帮] uniCloud 初始化成功')
  cloudReady = true
} catch (e) {
  console.warn('[邻寝帮] uniCloud 初始化失败:', e.message)
}

// 全局云就绪状态
uni.$cloudReady = cloudReady

// 云函数调用封装 - 带重试和错误提示
uni.$callCloud = async function(name, data, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await uniCloud.callFunction({ name, data })
      if (result && result.result) {
        return result.result
      }
    } catch (e) {
      if (i === retries - 1) {
        console.warn(`[邻寝帮] 云函数 ${name} 调用失败:`, e.message)
        throw e
      }
      await new Promise(r => setTimeout(r, 500))
    }
  }
}

const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif
