import { App } from 'vue';

// const uses = require.context('../components', true, /use.ts$/);
const uses = import.meta.glob<{ install: (app: App) => void }>('./**/use.ts', {
  eager: true,
  import: 'default'
});
export default {
  install(app: App<Element>): void {
    console.log('install', uses);
    for (const path of Object.keys(uses)) {
      const install = uses[path]?.install;
      install && install(app);
    }
  }
};
