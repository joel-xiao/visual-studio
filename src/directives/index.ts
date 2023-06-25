import { App } from 'vue';

const directives = import.meta.glob<{ install: (app: App) => void }>(
  ['./**/*.ts', '!./**/*.d.ts'],
  {
    eager: true,
    import: 'default'
  }
);
export default {
  install(app: App<Element>): void {
    for (const path of Object.keys(directives)) {
      const install = directives[path]?.install;
      install && install(app);
    }
  }
};
