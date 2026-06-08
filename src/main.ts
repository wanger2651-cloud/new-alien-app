import { createSSRApp } from "vue";
import App from "./App.vue";
import 'virtual:uno.css';
import { createPiniaInstance } from '@/store';
// import VConsole from 'vconsole'
const app = createSSRApp(App)
const pinia = createPiniaInstance()
// import './assets/tailwind.css';
// import VConsole from 'vconsole'
 
// 创建vConsole实例
// if (process.env.NODE_ENV !== 'production') {
// new VConsole();
// }

// 或者使用配置参数来初始化，详情见文档
// const vConsole = new VConsole({ theme: 'dark' });
export function createApp() {
  const app = createSSRApp(App);
  app.use(pinia);
  return {
    app,
  };
}
