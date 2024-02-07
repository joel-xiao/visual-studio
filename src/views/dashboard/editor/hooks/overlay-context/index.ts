import './overlay.scss';
import { readonly, Raw, markRaw } from 'vue';

export type Pos = { x: number; y: number };

type Rect = DOMRect | { width: number; height: number };

export type CallbackUpdate = (
  pos: Pos & { scaleOffsetX: number; scaleOffsetY: number; translateX: number; translateY: number }
) => void;

type OverlayOption = {
  parentEl: HTMLElement;
  containerEl: HTMLElement;
  key: string;
};

class Overlay {
  #disabled = true;
  #active = false;
  #callbackUpdates: CallbackUpdate[] = [];
  #overlayEl?: HTMLElement;
  #defaultPos: Pos = { x: 0, y: 0 };
  #startPos: Pos = { x: 0, y: 0 };
  #pos: Pos = { x: 0, y: 0 };
  #scaleOffset: Pos = { x: 0, y: 0 };
  #option?: OverlayOption;
  constructor() {
    this.install = this.install.bind(this);

    this.setDisabled = this.setDisabled.bind(this);
    this.onMaskDown = this.onMaskDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onMove = this.onMove.bind(this);

    this.updatePos = this.updatePos.bind(this);
    this.addMoveUpdated = this.addMoveUpdated.bind(this);
    this.removeMoveUpdate = this.removeMoveUpdate.bind(this);

    this.getPos = this.getPos.bind(this);

    this.setScaleOffset = this.setScaleOffset.bind(this);
    this.getScaleOffset = this.getScaleOffset.bind(this);
  }

  install(opt: OverlayOption): void {
    this.#option = opt;
    if (!opt.parentEl) {
      console.warn('el of Overlay class is not parentEl', 'key=' + this.#option.key);
      return;
    }

    if (!opt.containerEl) {
      console.warn('el of Overlay class is not containerEl', 'key=' + this.#option.key);
      return;
    }

    this.#initPos(opt);

    this.#overlayEl = document.createElement('div');
    this.#overlayEl.classList.add('editor-overlay');
    this.#overlayEl.addEventListener('mousedown', this.onMaskDown, true);
    this.#option?.parentEl?.appendChild(this.#overlayEl);

    this.#updatePos();
  }

  uninstall(): void {
    this.#overlayEl?.removeEventListener('mousedown', this.onMaskDown, true);
    this.#overlayEl?.remove();
    this.#overlayEl = undefined;
    this.#option = undefined;
  }

  #initPos(opt: OverlayOption) {
    const containerRect: Rect = opt.containerEl.getBoundingClientRect() || {
      width: 0,
      height: 0
    };
    const parentRect: Rect = opt.parentEl.getBoundingClientRect() || containerRect;

    const defaultPos = {
      x: (parentRect.width - containerRect.width) / 2,
      y: (parentRect.height - containerRect.height) / 2
    };
    defaultPos.x < 0 && (defaultPos.x = 0);
    defaultPos.y < 0 && (defaultPos.y = 0);

    this.#defaultPos = defaultPos;

    this.#pos = { ...this.#defaultPos };
  }

  setDisabled(disabled: boolean): void {
    this.#disabled = disabled;
    this.#overlayEl?.classList[disabled ? 'remove' : 'add']('show');
  }

  #setActive(active: boolean): void {
    this.#overlayEl?.classList[active ? 'add' : 'remove']('down');
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

  setScaleOffset(pos: Pos) {
    this.#setScaleOffset(pos);
  }
  #setScaleOffset(pos: Pos) {
    this.#scaleOffset.x = pos.x;
    this.#scaleOffset.y = pos.y;
    this.#updatePos();
  }

  getScaleOffset() {
    return this.#getScaleOffset();
  }
  #getScaleOffset() {
    return this.#scaleOffset;
  }

  #prevent(event: MouseEvent): void {
    event.preventDefault();
  }

  updatePos() {
    this.#updatePos();
  }
  #updatePos(): void {
    this.#callbackUpdates.forEach((callback) =>
      callback({
        x: this.#pos.x,
        y: this.#pos.y,
        scaleOffsetX: this.#scaleOffset.x,
        scaleOffsetY: this.#scaleOffset.y,
        translateX: this.#pos.x + this.#scaleOffset.x,
        translateY: this.#pos.y + this.#scaleOffset.y
      })
    );

    if (this.#option) {
      this.#option.containerEl.style.translate = `${this.#pos.x + this.#scaleOffset.x}px ${
        this.#pos.y + this.#scaleOffset.y
      }px`;
    }
    // if (!this.#disabled && this.#option?.parentEl) {
    // }
  }

  getPos(): Pos {
    return this.#pos;
  }

  addMoveUpdated(fn: CallbackUpdate): void {
    this.#callbackUpdates.push(fn);
  }

  removeMoveUpdate(fn: CallbackUpdate): void {
    const idx: number = this.#callbackUpdates.findIndex((r) => r === fn);
    idx && this.#callbackUpdates.splice(idx, 1);
  }
}

let overlay: Readonly<Raw<Overlay>> | undefined;
const createOverlay = function () {
  if (!overlay) overlay = readonly(markRaw(new Overlay()));
  return overlay;
};
export const removeOverlay = function () {
  overlay?.uninstall();
  overlay = undefined;
};
export const useOverlay = function () {
  overlay = createOverlay();
  return readonly(
    markRaw({
      addOverlay: overlay.install,
      overlayUpdatePos: overlay.updatePos,
      addOverlayMoveUpdated: overlay.addMoveUpdated,
      setOverlayDisabled: overlay.setDisabled,
      getPos: overlay.getPos,
      getScaleOffset: overlay.getScaleOffset,
      setScaleOffset: overlay.setScaleOffset
    })
  );
};
