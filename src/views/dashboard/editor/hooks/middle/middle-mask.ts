interface Pos {
  x: number;
  y: number;
}

interface MaskBinding {
  defaultPos?: Pos;
  onUp?: () => void;
  onUpdated?: (pos: Pos) => void;
}

import './index.scss';

export class MiddleMask {
  el?: HTMLElement;
  disabled: boolean;
  active: boolean;
  callbackUp?: (() => void) | null;
  callbackUpdated?: ((pos: Pos) => void) | null;
  maskEl?: HTMLElement;
  defaultPos: Pos;
  startPos: { x: number; y: number };
  pos: Pos;
  binding: MaskBinding;
  constructor() {
    this.defaultPos = { x: 0, y: 0 };
    this.pos = { ...this.defaultPos };
    this.startPos = { ...this.defaultPos };

    this.binding = {
      defaultPos: { ...this.defaultPos }
    };

    this.disabled = true;
    this.active = false;

    this.setDisabled = this.setDisabled.bind(this);
    this.onMaskDown = this.onMaskDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onMove = this.onMove.bind(this);
  }

  install(
    el: HTMLElement | undefined,
    binding: MaskBinding | null = this.binding,
    key: string
  ): void {
    if (!el) {
      console.warn('el of ContainerMask class is not HTMLElement', 'key=' + key);
      return;
    }
    this.el = el;

    binding &&
      Object.keys(binding).forEach((key) => {
        //@ts-ignore
        this.binding[key] = binding[key];
      });

    this.binding.defaultPos && (this.defaultPos = { ...this.binding.defaultPos });
    this.pos = { ...this.defaultPos };
    this.callbackUp = this.binding.onUp;
    this.callbackUpdated = this.binding.onUpdated;

    this.maskEl = document.createElement('div');
    this.maskEl.classList.add('editor-middle-mask');
    this.maskEl.addEventListener('mousedown', this.onMaskDown, true);
    this.el?.appendChild(this.maskEl);

    this.callbackUpdated?.(this.defaultPos);
  }

  uninstall(): void {
    this.maskEl?.removeEventListener('mousedown', this.onMaskDown, true);
    this.maskEl?.remove();
    this.maskEl = undefined;
    this.el = undefined;
    this.callbackUp = null;
    this.callbackUpdated = null;
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.maskEl?.classList[disabled ? 'remove' : 'add']('show');
  }

  #setActive(active: boolean): void {
    this.maskEl?.classList[active ? 'add' : 'remove']('down');
    this.active = active;
  }

  onMaskDown(event: MouseEvent): void {
    event?.button && this.#prevent(event);
    this.#setActive(true);
    this.startPos.x = event.x;
    this.startPos.y = event.y;

    document.documentElement.addEventListener('mousemove', this.onMove, false);
    document.documentElement.addEventListener('mouseup', this.onUp, false);
    document.documentElement.addEventListener('mouseleave', this.onUp, false);

    // document.documentElement.addEventListener('mousedown', this.onUp, true);

    // document.documentElement.addEventListener('touchmove', this.onMove, true);
    // document.documentElement.addEventListener('touchend', this.onUp, true);
    // document.documentElement.addEventListener('touchcancel', this.onUp, true);
    // document.documentElement.addEventListener('touchstart', this.onUp, true);
  }

  onUp(event: MouseEvent): void {
    this.#prevent(event);
    this.#setActive(false);
    this.defaultPos = { ...this.pos };

    document.documentElement.removeEventListener('mousemove', this.onMove, false);
    document.documentElement.removeEventListener('mouseup', this.onUp), false;
    document.documentElement.removeEventListener('mouseleave', this.onUp, false);

    // document.documentElement.removeEventListener('mousedown', this.onUp, false);

    // document.documentElement.removeEventListener('touchmove', onMove.bind(this), true);
    // document.documentElement.removeEventListener('touchend', onUp.bind(this), true);
    // document.documentElement.removeEventListener('touchcancel', onUp.bind(this), true);
    // document.documentElement.removeEventListener('touchstart', onUp.bind(this), true);

    this.updateStyle(this.defaultPos);
    this.callbackUp?.();
    this.callbackUpdated?.(this.defaultPos);
  }

  onMove(event: MouseEvent): void {
    this.#prevent(event);
    this.pos.x = this.defaultPos.x + (event.x - this.startPos.x);
    this.pos.y = this.defaultPos.y + (event.y - this.startPos.y);
    this.updateStyle(this.pos);
    this.callbackUpdated?.(this.pos);
  }

  #prevent(event: MouseEvent): void {
    event.preventDefault();
  }

  updateStyle(pos: Pos): void {
    // if (!this.disabled && this.el) {
    // }
  }

  get getPos(): Pos {
    return this.pos;
  }
}
