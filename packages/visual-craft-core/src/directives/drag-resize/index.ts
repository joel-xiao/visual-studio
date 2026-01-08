import type { App, Directive, DirectiveBinding } from 'vue';
import { Drag } from '../../hooks/drag-hook';

const dragData: { [uid: string]: Drag } = {};

export const dragResizeDirective: Directive<HTMLElement, IDragResizeBinding> = {
  mounted: (el: HTMLElement, binding: DirectiveBinding<IDragResizeBinding>): void => {
    dragData[binding.instance?.$.uid || ''] = new Drag();
    dragData[binding.instance?.$.uid || '']?.install(el, { ...binding.value, resize: true });
  },
  updated: (_el: HTMLElement, binding: DirectiveBinding<IDragResizeBinding>) => {
    dragData[binding.instance?.$.uid || '']?.setActive(binding.value.active);
    dragData[binding.instance?.$.uid || '']?.setSelection(!!binding.value.selection);
    dragData[binding.instance?.$.uid || '']?.setDisabled(binding.value.disabled);
    dragData[binding.instance?.$.uid || '']?.setPos(binding.value.pos);
    dragData[binding.instance?.$.uid || '']?.setScale(binding.value.scale || 1);
  },
  beforeUnmount: (_el: HTMLElement, binding: DirectiveBinding): void => {
    dragData[binding.instance?.$.uid || '']?.uninstall();
    delete dragData[binding.instance?.$.uid || ''];
  }
};

export default {
  install(app: App<Element>): void {
    app.directive('drag-resize', dragResizeDirective);
  }
};
