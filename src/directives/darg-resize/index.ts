import type { App, DirectiveBinding } from 'vue';
import { Drag } from '@hooks/drag-hooks';
import type { Binding } from './interface';

const dragData: { [uid: string]: Drag } = {};

export default {
  install(app: App<Element>): void {
    app.directive('drag-resize', {
      mounted: (el: HTMLElement, binding: DirectiveBinding<Binding>): void => {
        dragData[binding.instance?.$.uid || ''] = new Drag();
        dragData[binding.instance?.$.uid || '']?.install(el, { ...binding.value, resize: true });
      },
      updated(el: HTMLElement, binding: DirectiveBinding<Binding>) {
        dragData[binding.instance?.$.uid || '']?.setActive(binding.value.active);
        dragData[binding.instance?.$.uid || '']?.setDisabled(binding.value.disabled);
      },
      beforeUnmount: (el: HTMLElement, binding: DirectiveBinding): void => {
        dragData[binding.instance?.$.uid || '']?.uninstall();
        delete dragData[binding.instance?.$.uid || ''];
      }
    });
  }
};
