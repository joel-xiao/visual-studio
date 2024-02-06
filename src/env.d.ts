/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare interface ElementEventMap {
  mousewheel: WheelEvent;
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $noTauri: function;
    $isTauri: function;
  }
}
