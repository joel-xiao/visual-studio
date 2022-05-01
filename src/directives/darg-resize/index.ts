import type { App, DirectiveBinding } from 'vue';
import './index.scss';
import type { DargDataset, Binding } from './interface';
class Drag {
  el?: HTMLElement;
  disabled: boolean;
  active: boolean;
  stickEl?: HTMLElement;
  sticks: string[];
  currentStick: string;
  defaultPos: DargDataset;
  startPos: { x: number; y: number };
  pos: DargDataset;
  constructor() {
    this.disabled = false;
    this.active = true;
    this.sticks = ['tm', 'rm', 'bm', 'lm', 'tl', 'tr', 'br', 'bl'];
    this.currentStick = '';
    this.defaultPos = { x: 0, y: 0, x2: 0, y2: 0 };
    this.pos = { ...this.defaultPos };
    this.startPos = { x: 0, y: 0 };

    this.bodyDown = this.bodyDown.bind(this);
    this.stickDown = this.stickDown.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onMove = this.onMove.bind(this);
  }

  install(el: HTMLElement, binding: Binding): void {
    this.el = el;
    this.el.classList.add('v-drag-resize');
    this.el.addEventListener('mousedown', this.bodyDown, true);

    this.disabled = !!binding.disabled;
    this.active = !!binding.active;
    this.defaultPos = { ...binding.initPos };
    this.pos = { ...this.defaultPos };

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

    this.setDisabled(this.disabled);
    this.setActive(this.active);
    this.updateStyle(this.defaultPos);
  }

  uninstall(): void {
    this.el?.removeEventListener('mousedown', this.bodyDown, true);

    let childNodes: HTMLElement[] | undefined = Array.from(
      this.stickEl?.querySelectorAll('v-drag-stick') || []
    );
    childNodes?.forEach((stickDom: HTMLElement) => {
      stickDom.removeEventListener('mousedown', this.stickDown, true);
      stickDom.remove();
    });

    childNodes = undefined;
    this.stickEl = undefined;
    this.el = undefined;
  }

  setDisabled(val: boolean): void {
    this.stickEl?.classList[val ? 'add' : 'remove']('disabled');
    this.el?.classList[val ? 'add' : 'remove']('disabled');
  }

  setActive(active: boolean): void {
    this.stickEl?.classList[active ? 'add' : 'remove']('active');
    this.el?.classList[active ? 'add' : 'remove']('active');
    this.active = active;
  }

  bodyDown(event: MouseEvent): void {
    this.prevent(event);
    if (this.disabled) return;
    this.setActive(true);
    this.currentStick = 'body';
    this.startPos.x = event.x;
    this.startPos.y = event.y;
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

const dragData: { [uid: string]: Drag } = {};

export default {
  install(app: App<Element>): void {
    app.directive('drag-resize', {
      mounted: (el: HTMLElement, binding: DirectiveBinding<Binding>): void => {
        dragData[binding.instance?.$.uid || ''] = new Drag();
        dragData[binding.instance?.$.uid || '']?.install(el, binding.value);
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
