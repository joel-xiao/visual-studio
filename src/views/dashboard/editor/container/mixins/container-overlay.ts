import './container-overlay.scss';

export type Pos = {
  x: number;
  y: number;
};

export type CallbackUpdate = (pos: Pos) => void;

interface OverlayBinding {
  defaultPos?: Pos;
  onUp?: () => void;
  onUpdated?: (pos: Pos) => void;
}
export class ContainerOverlay {
  #parentEl?: HTMLElement;
  #disabled = true;
  #active = false;
  #callbackUpdates: CallbackUpdate[] = [];
  #maskEl?: HTMLElement;
  #defaultPos: Pos = { x: 0, y: 0 };
  #startPos: Pos = { x: 0, y: 0 };
  #pos: Pos = { x: 0, y: 0 };
  #scaleOffset: Pos = { x: 0, y: 0 };
  #binding: OverlayBinding = { defaultPos: { x: 0, y: 0 } };
  constructor() {
    this.setDisabled = this.setDisabled.bind(this);
    this.onMaskDown = this.onMaskDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onMove = this.onMove.bind(this);
    this.setContainerScaleOffset = this.setContainerScaleOffset.bind(this);
    this.getContainerScaleOffset = this.getContainerScaleOffset.bind(this);
  }

  install(
    parentEl: HTMLElement | undefined,
    binding: OverlayBinding | null = this.#binding,
    key: string
  ): void {
    if (!parentEl) {
      console.warn('el of ContainerMask class is not HTMLElement', 'key=' + key);
      return;
    }
    this.#parentEl = parentEl;

    binding &&
      Object.keys(binding).forEach((key) => {
        //@ts-ignore
        this.#binding[key] = binding[key];
      });

    this.#binding.defaultPos && (this.#defaultPos = { ...this.#binding.defaultPos });
    this.#pos = { ...this.#defaultPos };

    this.#maskEl = document.createElement('div');
    this.#maskEl.classList.add('editor-container-overlay');
    this.#maskEl.addEventListener('mousedown', this.onMaskDown, true);
    this.#parentEl?.appendChild(this.#maskEl);

    this.#updatePos();
  }

  uninstall(): void {
    this.#maskEl?.removeEventListener('mousedown', this.onMaskDown, true);
    this.#maskEl?.remove();
    this.#maskEl = undefined;
    this.#parentEl = undefined;
  }

  setDisabled(disabled: boolean): void {
    this.#disabled = disabled;
    this.#maskEl?.classList[disabled ? 'remove' : 'add']('show');
  }

  #setActive(active: boolean): void {
    this.#maskEl?.classList[active ? 'add' : 'remove']('down');
    this.#active = active;
  }

  onMaskDown(event: MouseEvent): void {
    event?.button && this.#prevent(event);
    this.#setActive(true);
    this.#startPos.x = event.x;
    this.#startPos.y = event.y;

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
    this.#defaultPos = { ...this.#pos };

    document.documentElement.removeEventListener('mousemove', this.onMove, false);
    document.documentElement.removeEventListener('mouseup', this.onUp), false;
    document.documentElement.removeEventListener('mouseleave', this.onUp, false);

    // document.documentElement.removeEventListener('mousedown', this.onUp, false);

    // document.documentElement.removeEventListener('touchmove', onMove.bind(this), true);
    // document.documentElement.removeEventListener('touchend', onUp.bind(this), true);
    // document.documentElement.removeEventListener('touchcancel', onUp.bind(this), true);
    // document.documentElement.removeEventListener('touchstart', onUp.bind(this), true);

    this.#updatePos();
  }

  onMove(event: MouseEvent): void {
    this.#prevent(event);
    this.#pos.x = this.#defaultPos.x + (event.x - this.#startPos.x);
    this.#pos.y = this.#defaultPos.y + (event.y - this.#startPos.y);
    this.#updatePos();
  }

  setContainerScaleOffset(pos: Pos) {
    this.#setContainerScaleOffset(pos);
  }
  #setContainerScaleOffset(pos: Pos) {
    this.#scaleOffset.x = pos.x;
    this.#scaleOffset.y = pos.y;
    this.#updatePos();
  }

  getContainerScaleOffset() {
    return this.#getContainerScaleOffset();
  }
  #getContainerScaleOffset() {
    return this.#scaleOffset;
  }

  #prevent(event: MouseEvent): void {
    event.preventDefault();
  }

  #updatePos(): void {
    this.#callbackUpdates.forEach((callback) =>
      callback({
        x: this.#pos.x + this.#scaleOffset.x,
        y: this.#pos.y + this.#scaleOffset.y
      })
    );
    // if (!this.#disabled && this.#parentEl) {
    // }
  }

  get getPos(): Pos {
    return this.#pos;
  }

  addContainerMoveUpdated(fn: CallbackUpdate): void {
    this.#callbackUpdates.push(fn);
  }

  removeContainerMoveUpdate(fn: CallbackUpdate): void {
    const idx: number = this.#callbackUpdates.findIndex((r) => r === fn);
    idx && this.#callbackUpdates.splice(idx, 1);
  }
}
