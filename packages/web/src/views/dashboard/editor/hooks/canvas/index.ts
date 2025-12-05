import { readonly, Raw, markRaw } from 'vue';
import { useOverlay } from '../overlay-context';
import { useRuler } from '../ruler-context';
import type { ICallbackUpdate } from './interface';

type CanvasOption = {
  parentEl: HTMLElement;
  canvasEl: HTMLElement;
};

class Canvas {
  #scale = 1;
  #maxScale = 256;
  #minScale = 0.02;
  #option?: CanvasOption;
  #canvasUpdates: ICallbackUpdate[] = [];

  constructor() {
    this.uninstall = this.uninstall.bind(this);

    this.addScaleEvent = this.addScaleEvent.bind(this);
    this.removeScaleEvent = this.removeScaleEvent.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.addCanvasUpdated = this.addCanvasUpdated.bind(this);
    this.removeCanvasUpdated = this.removeCanvasUpdated.bind(this);

    this.getScale = this.getScale.bind(this);
  }

  uninstall() {
    this.removeScaleEvent();
  }

  addScaleEvent(opt: CanvasOption) {
    this.#option = opt;
    this.#option?.parentEl.addEventListener('mousewheel', this.onWheel);
  }

  removeScaleEvent() {
    this.#option?.parentEl.removeEventListener('mousewheel', this.onWheel);
    this.#option = undefined;
  }

  onWheel(e: WheelEvent): void {
    e.preventDefault();
    const { getScaleOffset, setScaleOffset, getPos } = useOverlay();
    const { setRulerScaleOffset, setRulerScale } = useRuler();

    let ratio = 1.1;
    if (e.deltaY > 0) {
      ratio = 0.9;
    }
    const scale = this.#scale * ratio;

    // Limit the maximum and minimum zoom
    if (scale > this.#maxScale || scale < this.#minScale) {
      return;
    }

    this.#scale = scale;
    const ratio_scale = ratio - 1;

    if (this.#option?.canvasEl) {
      this.#option.canvasEl.style.transformOrigin = `0px 0px`;
      this.#option.canvasEl.style.scale = `${this.#scale}`;
    }

    if (this.#option?.canvasEl && this.#option?.parentEl) {
      const parent_rect = this.#option.parentEl.getBoundingClientRect();
      // Current position after dragging.
      const canvas_pos = getPos();
      // The current offset position of the scaled canvas canvas.
      const { x, y } = getScaleOffset() || { x: 0, y: 0 };
      // Calculate the actual position of the canvas canvas
      const canvas_rect = {
        left: x + parent_rect.x + canvas_pos.x,
        top: y + parent_rect.y + canvas_pos.y
      };
      // Calculate the position of the mouse pointer in the canvas.
      const disX = e.clientX - canvas_rect.left;
      const disY = e.clientY - canvas_rect.top;

      const offset = {
        x: x - disX * ratio_scale,
        y: y - disY * ratio_scale
      };

      setScaleOffset(offset);
      setRulerScaleOffset(offset);
      setRulerScale(this.#scale);

      this.#canvasUpdates.forEach(callback => callback({ scale: this.#scale }));
    }
  }

  addCanvasUpdated(fn: ICallbackUpdate) {
    this.#canvasUpdates.push(fn);
  }

  removeCanvasUpdated(fn: ICallbackUpdate) {
    const idx: number = this.#canvasUpdates.findIndex(r => r === fn);
    if (idx !== -1) {
      this.#canvasUpdates.splice(idx, 1);
    }
  }

  getScale() {
    return this.#scale;
  }
}

let canvas: Readonly<Raw<Canvas>> | undefined;
const createCanvas = function () {
  if (!canvas) canvas = readonly(markRaw(new Canvas()));
  return canvas;
};
export const removeCanvas = function () {
  canvas?.uninstall();
  canvas = undefined;
};
export const useCanvas = function () {
  canvas = createCanvas();
  return readonly(
    markRaw({
      addScaleEvent: canvas.addScaleEvent,
      removeScaleEvent: canvas.removeScaleEvent,
      addCanvasUpdated: canvas.addCanvasUpdated,
      removeCanvasUpdated: canvas.removeCanvasUpdated,
      getScale: canvas.getScale
    })
  );
};
