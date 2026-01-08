// import { Component, App } from 'vue';
// import { createComponent } from './../vue-hooks';
import './drag.scss';

export class Drag {
  el?: HTMLElement;
  resize: boolean;
  disabled: boolean;
  active: boolean;
  selection: boolean;
  // eslint-disable-next-line no-unused-private-class-members
  #moved: boolean;
  #scale = 1;
  callbackUp?: ((dragDataset: IDragDataset) => void) | null;
  callbackMove?: ((dragDataset: IDragDataset) => void) | null;
  callbackDown?: ((dragDataset: IDragDataset) => void) | null;
  stickEl?: HTMLElement;
  sticks: string[];
  stickEls: HTMLElement[] = [];
  currentStick: string;
  defaultPos: IDragDataset;
  startPos: { x: number; y: number };
  pos: IDragDataset;
  #startInteractionPos: IDragDataset = { x: 0, y: 0, x2: 0, y2: 0 };
  cursorPos?: IDragCursorPos | null;
  binding: IDragBinding;
  constructor() {
    this.sticks = ['tm', 'rm', 'bm', 'lm', 'tl', 'tr', 'br', 'bl'];
    this.currentStick = '';
    this.defaultPos = { x: 0, y: 0, x2: 0, y2: 0 };
    this.pos = { ...this.defaultPos };
    this.#startInteractionPos = { ...this.defaultPos };
    this.startPos = { x: 0, y: 0 };

    this.binding = {
      pos: { ...this.defaultPos },
      cursorPos: null,
      resize: false,
      disabled: false,
      active: true
    };

    this.cursorPos = null;
    this.resize = !!this.binding.resize;
    this.disabled = !!this.binding.disabled;
    this.active = !!this.binding.disabled;
    this.selection = false;
    this.#moved = false;

    this.bodyDown = this.bodyDown.bind(this);
    this.stickDown = this.stickDown.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onMove = this.onMove.bind(this);
  }

  install(el: HTMLElement, binding: IDragBinding | null = this.binding): void {
    if (binding) {
      Object.keys(binding).forEach(key => {
        // @ts-expect-error - Dynamic property assignment
        this.binding[key] = binding[key];
      });
    }

    this.el = el;
    this.el.classList.add('v-drag-resize');

    if (this.binding.pos) {
      this.defaultPos = { ...this.binding.pos };
    }
    this.pos = { ...this.defaultPos };
    this.cursorPos = this.binding.cursorPos;
    this.resize = !!this.binding.resize;
    this.disabled = !!this.binding.disabled;
    this.active = !!this.binding.active;
    this.callbackUp = this.binding.onUp;
    this.callbackMove = this.binding.onMove;
    this.callbackDown = this.binding.onDown;

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
        this.stickEls.push(stickDom);
        this?.stickEl?.appendChild(stickDom);
        stickDom = null;
      });

      this.el?.appendChild(this.stickEl);
    }

    this.setDisabled(this.disabled);
    this.setActive(this.active);
    this.setSelection(this.selection);
    this.setPos(this.defaultPos);
    this.updateSticks();
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
    this.callbackMove = null;
    this.callbackDown = null;
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

  setSelection(selection: boolean): void {
    this.el?.classList[selection ? 'add' : 'remove']('v-drag-selection');
    this.selection = selection;
  }

  setPos(pos: IDragDataset): void {
    if (!this.resize && !this.selection) return;
    if (this.currentStick !== '') return;
    this.pos = { ...pos };
    this.defaultPos = { ...this.pos };
    this.updateStyle(this.defaultPos);
  }

  setScale(scale: number): void {
    this.#scale = scale;
    this.updateSticks();
  }

  #setMoved(moved: boolean): void {
    if (!this.resize) return;
    this.stickEl?.classList[moved ? 'add' : 'remove']('no-opacity');
    this.#moved = moved;
  }

  bodyDown(event: MouseEvent): void {
    if (event?.button) {
      this.prevent(event);
    }
    if (this.disabled) return;
    this.setActive(true);
    this.currentStick = 'body';
    this.startPos.x = event.x;
    this.startPos.y = event.y;
    this.#startInteractionPos = { ...this.defaultPos };
    this.onDown();
  }

  buttonDown(pos: IDragCursorPos): void {
    if (this.disabled) return;
    this.setActive(true);
    this.currentStick = 'body';
    this.startPos.x = pos.x;
    this.startPos.y = pos.y;
    this.#startInteractionPos = { ...this.defaultPos };
    this.onDown();
  }

  stickDown(event: MouseEvent): void {
    this.prevent(event);
    if (this.disabled) return;
    this.currentStick = (<HTMLElement>event.target).getAttribute('stick') || '';
    this.startPos.x = event.x;
    this.startPos.y = event.y;
    this.#startInteractionPos = { ...this.defaultPos };
    this.onDown();
  }

  onUp(event: MouseEvent): void {
    this.#setMoved(false);
    this.prevent(event);
    this.currentStick = '';
    this.defaultPos = { ...this.pos };
    this.updateStyle(this.defaultPos);

    document.documentElement.removeEventListener('mousemove', this.onMove, false);
    document.documentElement.removeEventListener('mouseup', this.onUp, false);
    document.documentElement.removeEventListener('mouseleave', this.onUp, false);

    // document.documentElement.removeEventListener('mousedown', this.onUp, false);

    // document.documentElement.removeEventListener('touchmove', onMove.bind(this), true);
    // document.documentElement.removeEventListener('touchend', onUp.bind(this), true);
    // document.documentElement.removeEventListener('touchcancel', onUp.bind(this), true);
    // document.documentElement.removeEventListener('touchstart', onUp.bind(this), true);
    this.callbackUp?.(this.defaultPos);
  }

  onDown(): void {
    this.callbackDown?.(this.pos);
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
    if (this.currentStick === 'body') this.#setMoved(true);
    this.prevent(event);

    const stick: string = this.currentStick;
    const startPos: IDragDataset = this.#startInteractionPos;

    const diff_x: number = (event.x - this.startPos.x) / this.#scale;
    const diff_y: number = (event.y - this.startPos.y) / this.#scale;
    if (stick === 'body') {
      this.pos.x = startPos.x + diff_x;
      this.pos.y = startPos.y + diff_y;
      this.pos.x2 = startPos.x2 + diff_x;
      this.pos.y2 = startPos.y2 + diff_y;
    } else if (stick === 'tl') {
      this.pos.x = startPos.x + diff_x;
      this.pos.y = startPos.y + diff_y;
    } else if (stick === 'tr') {
      this.pos.x2 = startPos.x2 + diff_x;
      this.pos.y = startPos.y + diff_y;
    } else if (stick === 'br') {
      this.pos.x2 = startPos.x2 + diff_x;
      this.pos.y2 = startPos.y2 + diff_y;
    } else if (stick === 'bl') {
      this.pos.x = startPos.x + diff_x;
      this.pos.y2 = startPos.y2 + diff_y;
    } else if (stick === 'tm') {
      this.pos.y = startPos.y + diff_y;
    } else if (stick === 'rm') {
      this.pos.x2 = startPos.x2 + diff_x;
    } else if (stick === 'bm') {
      this.pos.y2 = startPos.y2 + diff_y;
    } else if (stick === 'lm') {
      this.pos.x = startPos.x + diff_x;
    }

    this.updateStyle(this.pos);
    this.callbackMove?.(this.pos);
  }

  prevent(event: MouseEvent): void {
    event.preventDefault();
  }

  updateStyle(pos: IDragDataset): void {
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
      this.el.style.transform = `translate(${pos.x + diff_rotate_x}px, ${pos.y + diff_rotate_y
        }px) ${rotate}`;
      this.el.style.width = Math.abs(pos.x2 - pos.x) + 'px';
      this.el.style.height = Math.abs(pos.y2 - pos.y) + 'px';
    }
  }

  updateSticks() {
    for (const stickDom of this.stickEls) {
      const scale = 1 / this.#scale;
      const stick = stickDom.getAttribute('stick');
      switch (stick) {
        case 'rm':
          stickDom.style.transformOrigin = 'right';
          stickDom.style.transform = `scaleX(${scale})`;
          break;
        case 'lm':
          stickDom.style.transformOrigin = 'left';
          stickDom.style.transform = `scaleX(${scale})`;
          break;
        case 'tm':
          stickDom.style.transformOrigin = 'top';
          stickDom.style.transform = `scaleY(${scale})`;
          break;
        case 'bm':
          stickDom.style.transformOrigin = 'bottom';
          stickDom.style.transform = `scaleY(${scale})`;
          break;
        case 'tl':
          stickDom.style.transformOrigin = 'center';
          stickDom.style.transform = `translate(-50%, -50%) scale(${scale})`;
          break;
        case 'tr':
          stickDom.style.transformOrigin = 'center';
          stickDom.style.transform = `translate(50%, -50%)  scale(${scale})`;
          break;
        case 'br':
          stickDom.style.transformOrigin = 'center';
          stickDom.style.transform = `translate(50%, 50%) scale(${scale})`;
          break;
        case 'bl':
          stickDom.style.transformOrigin = 'center';
          stickDom.style.transform = `translate(-50%, 50%) scale(${scale})`;
          break;
        default:
          break;
      }
    }
  }
}
