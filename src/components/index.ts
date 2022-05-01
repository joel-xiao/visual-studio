import { App } from 'vue';

// const uses = require.context('../components', true, /use.ts$/);
const uses = import.meta.globEager('./**/use.ts');
export default {
  install(app: App<Element>): void {
    for (const path of Object.keys(uses)) {
      const install = uses[path].default?.install;
      install && install(app);
    }
  }
};
