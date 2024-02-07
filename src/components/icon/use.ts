import { App } from 'vue';
import Index from './index.vue';

export default {
  install(app: App<Element>): void {
    app.component('Icon' as string, Index);
  }
};
