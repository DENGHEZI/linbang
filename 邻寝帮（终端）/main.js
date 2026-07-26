import App from './App';
import store from './store';
import plugin from './js_sdk/uni-admin/plugin';
import messages from './i18n/index.js';

const lang = uni.getLocale();

// 初始化 uniCloud - 连接到与客户端相同的云端服务空间
let cloudReady = false;
try {
  uniCloud.init({
    provider: 'aliyun'
  });
  console.log('[邻寝帮管理后台] uniCloud 初始化成功');
  cloudReady = true;
} catch (e) {
  console.warn('[邻寝帮管理后台] uniCloud 初始化失败:', e.message);
}

// 全局云就绪状态
uni.$cloudReady = cloudReady;

// 云函数调用封装 - 带重试
uni.$callCloud = async function(name, data, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await uniCloud.callFunction({ name, data });
      if (result && result.result) {
        return result.result;
      }
    } catch (e) {
      if (i === retries - 1) {
        console.warn(`[管理后台] 云函数 ${name} 调用失败:`, e.message);
        throw e;
      }
      await new Promise(r => setTimeout(r, 500));
    }
  }
};

// #ifndef VUE3
import Vue from 'vue';
import VueI18n from 'vue-i18n';
Vue.config.productionTip = false;
Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: lang,
  messages,
});
Vue.use(plugin);
App.mpType = 'app';
const app = new Vue({
  i18n,
  store,
  ...App,
});
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue';
import { createI18n } from 'vue-i18n';
export function createApp() {
  const app = createSSRApp(App);
  const i18n = createI18n({
    locale: lang,
    messages,
  });
  app.use(i18n);
  app.use(plugin);
  app.use(store);
  return {
    app,
  };
}
// #endif
