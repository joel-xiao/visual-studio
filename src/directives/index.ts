import { App } from 'vue';

const directives = import.meta.globEager('./**/*.ts');
export default {
  install(app: App<Element>): void {
    for (const path of Object.keys(directives)) {
      const install = directives[path].default?.install;
      install && install(app);
    }
  }
};
