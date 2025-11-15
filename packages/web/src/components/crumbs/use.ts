import type { App } from 'vue';
import Index from './index.vue';
import CrumbItem from './crumb-item.vue';

export default {
  install(app: App<Element>): void {
    app.component('Crumb', Index);
    app.component('CrumbItem', CrumbItem);
  }
};
