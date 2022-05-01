import { createApp } from 'vue';
import { invoke } from '@tauri-apps/api/tauri';
// import 'amfe-flexible';// 用于设置rem基准值
import '@a/style/index.scss';
import '@a/style/font/iconfont.css';
import App from './App.vue';
// import '@/registerServiceWorker'
import router, { setupRouter } from '@/router/index';
import { setupStore } from '@/store/index';
import native from './plugins/native-ui';
import components from './components/index';
import directives from './directives/index';

const app = createApp(App).use(components).use(directives).use(native);
// router
setupRouter(app);
// store
setupStore(app);

router.isReady().then(() => {
  app.mount('#app').$nextTick((): void => {
    invoke('close_splashscreen');
  });
});
