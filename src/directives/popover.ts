import type { App } from 'vue';

export default {
  install(app: App<Element>): void {
    app.directive('popover', {
      mounted: (el: HTMLElement, binding): void => {
        console.log(el, binding);
      }
    });
  }
};
