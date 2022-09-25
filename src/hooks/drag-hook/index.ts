import { Component, App } from 'vue';
import { createComponent } from './../vue-hooks';
import type { DargDataset, CursorPos, Binding } from './interface';

import './drag.scss';

export class Drag {
  el?: HTMLElement;
  resize: boolean;
  disabled: boolean;
  active: boolean;
  callbackUp?: (() => void) | null;
  stickEl?: HTMLElement;
  sticks: string[];
  currentStick: string;
  defaultPos: DargDataset;
  startPos: { x: number; y: number };
  pos: DargDataset;
  cursorPos?: CursorPos | null;
  binding: Binding;
  constructor() {
    this.sticks = ['tm', 'rm', 'bm', 'lm', 'tl', 'tr', 'br', 'bl'];
    this.currentStick = '';
    this.defaultPos = { x: 0, y: 0, x2: 0, y2: 0 };
    this.pos = { ...this.defaultPos };
    this.startPos = { x: 0, y: 0 };

    this.binding = {
      initPos: { ...this.defaultPos },
      cursorPos: null,
      resize: false,
      disabled: false,
      active: true
    };

    this.cursorPos = null;
    this.resize = !!this.binding.resize;
    this.disabled = !!this.binding.disabled;
    this.active = !!this.binding.disabled;

    this.bodyDown = this.bodyDown.bind(this);
    this.stickDown = this.stickDown.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onMove = this.onMove.bind(this);
  }

  install(el: HTMLElement, binding: Binding | null = this.binding): void {
    binding &&
      Object.keys(binding).forEach((key) => {
        //@ts-ignore
        this.binding[key] = binding[key];
      });

    this.el = el;
    this.el.classList.add('v-drag-resize');

    this.binding.initPos && (this.defaultPos = { ...this.binding.initPos });
    this.pos = { ...this.defaultPos };
    this.cursorPos = this.binding.cursorPos;
    this.resize = !!this.binding.resize;
    this.disabled = !!this.binding.disabled;
    this.active = !!this.binding.active;
    this.callbackUp = this.binding.onUp;

    if (!this.cursorPos) {
      this.el.addEventListener('mousedown', this.bodyDown, true);
    } else {
      this.buttonDown(this.cursorPos);
    }

    if (this.resize) {
      this.stickEl = document.createElement('span');
      this.stickEl.classList.add('v-drag-sticks');
      this.sticks.forEach((stick: string): void => {
        let stickDom: HTMLElement | null = document.createElement('div');
        stickDom.addEventListener('mousedown', this.stickDown, true);
        stickDom.setAttribute('stick', stick);
        stickDom.classList.add('v-drag-stick');
        stickDom.classList.add('v-drag-stick-' + stick);
        this?.stickEl?.appendChild(stickDom);
        stickDom = null;
      });

      this.el?.appendChild(this.stickEl);
    }

    this.setDisabled(this.disabled);
    this.setActive(this.active);
    this.updateStyle(this.defaultPos);
  }

  uninstall(): void {
    if (!this.cursorPos) {
      this.el?.removeEventListener('mousedown', this.bodyDown, true);
    }

    if (this.resize) {
      let childNodes: HTMLElement[] | undefined = Array.from(
        this.stickEl?.querySelectorAll('v-drag-stick') || []
      );
      childNodes?.forEach((stickDom: HTMLElement) => {
        stickDom.removeEventListener('mousedown', this.stickDown, true);
        stickDom.remove();
      });
      this.stickEl?.remove();

      childNodes = undefined;
      this.stickEl = undefined;
      this.el = undefined;
    }

    this.callbackUp = null;
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  setActive(active: boolean): void {
    if (!this.resize) return;
    this.stickEl?.classList[active ? 'add' : 'remove']('active');
    this.el?.classList[active ? 'add' : 'remove']('active');
    this.active = active;
  }

  bodyDown(event: MouseEvent): void {
    event?.button && this.prevent(event);
    if (this.disabled) return;
    this.setActive(true);
    this.currentStick = 'body';
    this.startPos.x = event.x;
    this.startPos.y = event.y;
    this.onDown();
  }

  buttonDown(pos: CursorPos): void {
    if (this.disabled) return;
    this.setActive(true);
    this.currentStick = 'body';
    this.startPos.x = pos.x;
    this.startPos.y = pos.y;
    this.onDown();
  }

  stickDown(event: MouseEvent): void {
    this.prevent(event);
    if (this.disabled) return;
    this.currentStick = (<HTMLElement>event.target).getAttribute('stick') || '';
    this.startPos.x = event.x;
    this.startPos.y = event.y;
    this.onDown();
  }

  onUp(event: MouseEvent): void {
    this.prevent(event);
    this.defaultPos = { ...this.pos };
    this.updateStyle(this.defaultPos);

    document.documentElement.removeEventListener('mousemove', this.onMove, false);
    document.documentElement.removeEventListener('mouseup', this.onUp), false;
    document.documentElement.removeEventListener('mouseleave', this.onUp, false);

    // document.documentElement.removeEventListener('mousedown', this.onUp, false);

    // document.documentElement.removeEventListener('touchmove', onMove.bind(this), true);
    // document.documentElement.removeEventListener('touchend', onUp.bind(this), true);
    // document.documentElement.removeEventListener('touchcancel', onUp.bind(this), true);
    // document.documentElement.removeEventListener('touchstart', onUp.bind(this), true);

    this.callbackUp?.();
  }

  onDown(): void {
    document.documentElement.addEventListener('mousemove', this.onMove, false);
    document.documentElement.addEventListener('mouseup', this.onUp, false);
    document.documentElement.addEventListener('mouseleave', this.onUp, false);

    // document.documentElement.addEventListener('mousedown', this.onUp, true);

    // document.documentElement.addEventListener('touchmove', this.onMove, true);
    // document.documentElement.addEventListener('touchend', this.onUp, true);
    // document.documentElement.addEventListener('touchcancel', this.onUp, true);
    // document.documentElement.addEventListener('touchstart', this.onUp, true);
  }

  onMove(event: MouseEvent): void {
    if (!this.active) return;
    this.prevent(event);
    const stick: string = this.currentStick;
    const defaultPos: DargDataset = this.defaultPos;
    if (stick === 'body') {
      const diff_x: number = event.x - this.startPos.x;
      const diff_y: number = event.y - this.startPos.y;
      this.pos.x = defaultPos.x + diff_x;
      this.pos.y = defaultPos.y + diff_y;
      this.pos.x2 = defaultPos.x2 + diff_x;
      this.pos.y2 = defaultPos.y2 + diff_y;
    } else if (stick === 'tl') {
      const diff_x: number = event.x - this.startPos.x;
      const diff_y: number = event.y - this.startPos.y;
      this.pos.x = defaultPos.x + diff_x;
      this.pos.y = defaultPos.y + diff_y;
    } else if (stick === 'tr') {
      const diff_x = event.x - this.startPos.x;
      const diff_y = event.y - this.startPos.y;
      this.pos.x2 = defaultPos.x2 + diff_x;
      this.pos.y = defaultPos.y + diff_y;
    } else if (stick === 'br') {
      const diff_x = event.x - this.startPos.x;
      const diff_y = event.y - this.startPos.y;
      this.pos.x2 = defaultPos.x2 + diff_x;
      this.pos.y2 = defaultPos.y2 + diff_y;
    } else if (stick === 'bl') {
      const diff_x = event.x - this.startPos.x;
      const diff_y = event.y - this.startPos.y;
      this.pos.x = defaultPos.x + diff_x;
      this.pos.y2 = defaultPos.y2 + diff_y;
    } else if (stick === 'tm') {
      const diff_y = event.y - this.startPos.y;
      this.pos.y = defaultPos.y + diff_y;
    } else if (stick === 'rm') {
      const diff_x = event.x - this.startPos.x;
      this.pos.x2 = defaultPos.x2 + diff_x;
    } else if (stick === 'bm') {
      const diff_y = event.y - this.startPos.y;
      this.pos.y2 = defaultPos.y2 + diff_y;
    } else if (stick === 'lm') {
      const diff_x = event.x - this.startPos.x;
      this.pos.x = defaultPos.x + diff_x;
    }

    this.updateStyle(this.pos);
  }

  prevent(event: MouseEvent): void {
    event.preventDefault();
  }

  updateStyle(pos: DargDataset): void {
    let diff_rotate_x = 0;
    let diff_rotate_y = 0;
    let rotate = '';
    if (pos.x2 - pos.x < 0 && pos.y2 - pos.y < 0) {
      diff_rotate_x = pos.x2 - pos.x;
      diff_rotate_y = pos.y2 - pos.y;
      rotate = `rotate(180deg)`;
    } else if (pos.x2 - pos.x < 0 && pos.y2 - pos.y >= 0) {
      diff_rotate_x = pos.x2 - pos.x;
      rotate = `rotateY(180deg)`;
    } else if (pos.x2 - pos.x >= 0 && pos.y2 - pos.y <= 0) {
      diff_rotate_y = pos.y2 - pos.y;
      rotate = `rotateX(180deg)`;
    }

    if (this.el) {
      this.el.style.transform = `translate(${pos.x + diff_rotate_x}px, ${
        pos.y + diff_rotate_y
      }px) ${rotate}`;
      this.el.style.width = Math.abs(pos.x2 - pos.x) + 'px';
      this.el.style.height = Math.abs(pos.y2 - pos.y) + 'px';
    }
  }
}

/*
例子
createDrag<T>(
  panelElement.value,
  defineAsyncComponent(() => import('./component-item-drag.vue')),
  item,
  event
);
*/
export const createDrag = function <T>(
  parentEl: HTMLElement | undefined,
  comp: Component,
  prop: T,
  event: MouseEvent | void
): void {
  if (!parentEl) {
    console.error('parentEl not defined for createDrag function');
    return;
  }

  let pos: DargDataset | undefined = undefined;
  let currentTarget: HTMLElement | void;
  if (event) {
    currentTarget = event.currentTarget as HTMLElement;
    const rect: DOMRect = currentTarget.getBoundingClientRect();
    pos = { x: rect.x, y: rect.y, x2: rect.x + rect.width, y2: rect.y + rect.height };
  }

  let app: App | null = createComponent<T>('createDrag', parentEl, comp, {
    ...prop,
    element: currentTarget?.cloneNode(true) as HTMLElement
  });
  const el: HTMLElement = app._container;

  let drag: Drag | null = new Drag();
  drag?.install(el, {
    initPos: pos,
    cursorPos: event ? { x: event.x, y: event.y } : null,
    onUp: function () {
      app?.unmount();
      app = null;
      drag?.uninstall();
      drag = null;
    }
  });
};
