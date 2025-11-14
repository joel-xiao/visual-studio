import { createApp } from 'vue';
import { setupNative } from '@/service.native';
import '@a/style/index.scss';
import '@a/style/font/iconfont.css';
import App from './App.vue';
import router, { setupRouter } from '@/router/index';
import { setupStore } from '@/store/index';
import native from './plugins/native-ui';
import components from './components/index';
import directives from './directives/index';

const app = createApp(App).use(components).use(directives).use(native);
setupRouter(app);
setupStore(app);
setupNative(app);

router.isReady().then(() => {
  app.mount('#app');
});
