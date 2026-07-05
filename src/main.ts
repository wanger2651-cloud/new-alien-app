	import { createSSRApp } from "vue";
import App from "./App.vue";
import 'virtual:uno.css';
import { createPiniaInstance } from '@/store';
// #ifdef MP-WEIXIN
import router from '@/router';
// #endif

export function createApp() {
  const app = createSSRApp(App);
  app.use(createPiniaInstance());
  // #ifdef MP-WEIXIN
  app.use(router);
  // #endif
  return {
    app,
  };
}
