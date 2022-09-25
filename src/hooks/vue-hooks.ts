import { App, createApp, Component } from 'vue';

export const createComponent = function <T>(
  key: string,
  parentEl: HTMLElement,
  component: Component,
  prop: T | void
): App {
  const app = createApp(component, { ...(prop && prop instanceof Object ? prop : {}) });

  let el: HTMLElement | null = document.createElement('div');
  el.setAttribute('key', key);
  el.setAttribute('type', 'component');
  parentEl && parentEl.appendChild(el);
  app.mount(el);

  let _unmount: null | (() => void) = app.unmount;
  app.unmount = function () {
    _unmount?.();
    _unmount = null;
    el && parentEl.removeChild(el);
    el = null;
  };
  return app;
};
