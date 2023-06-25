import { readonly, Raw, markRaw } from 'vue';
import { useBindKeysContext } from '../bind-keys-context';
import { useOverlay } from '../overlay-context';
import { useRuler } from '../ruler-context';
import { useNodeContext } from '../node-context';

type ContainerOption = {
  parentEl: HTMLElement;
  containerEl: HTMLElement;
};

type Rect = DOMRect | { width: number; height: number };

class Container {
  #scale = 1;
  #option?: ContainerOption;

  constructor() {
    this.uninstall = this.uninstall.bind(this);

    this.addScaleEvent = this.addScaleEvent.bind(this);
    this.removeScaleEvent = this.removeScaleEvent.bind(this);
    this.onWheel = this.onWheel.bind(this);

    this.getScale = this.getScale.bind(this);
  }

  uninstall() {
    this.removeScaleEvent();
  }

  addScaleEvent(opt: ContainerOption) {
    this.#option = opt;
    this.#option?.parentEl.addEventListener('mousewheel', this.onWheel);
  }

  removeScaleEvent() {
    this.#option?.parentEl.removeEventListener('mousewheel', this.onWheel);
    this.#option = undefined;
  }

  onWheel(e: WheelEvent): void {
    e.preventDefault();

    const { getBindKeys } = useBindKeysContext();
    const { getRoot } = useNodeContext();
    const { getScaleOffset, setScaleOffset, getPos } = useOverlay();
    const { setRulerScaleOffset, setRulerScale } = useRuler();

    const { isCtrl } = getBindKeys();
    const root = getRoot();

    if (isCtrl) {
      let ratio = 1.1;
      if (e.deltaY > 0) {
        ratio = 0.9;
      }
      this.#scale = this.#scale * ratio;
      const ratio_scale = ratio - 1;

      if (this.#option?.containerEl) {
        this.#option.containerEl.style.transformOrigin = `0px 0px`;
        this.#option.containerEl.style.scale = `${this.#scale}`;
      }

      if (this.#option?.containerEl && this.#option?.parentEl) {
        const parent_rect = this.#option.parentEl.getBoundingClientRect();
        // Current position after dragging.
        const container_pos = getPos();
        // The current offset position of the scaled container canvas.
        const { x, y } = getScaleOffset() || { x: 0, y: 0 };
        // Calculate the actual position of the container canvas
        const container_rect = {
          left: x + parent_rect.x + container_pos.x,
          top: y + parent_rect.y + container_pos.y
        };
        // Calculate the position of the mouse pointer in the canvas.
        const disX = e.clientX - container_rect.left;
        const disY = e.clientY - container_rect.top;

        const offset = {
          x: x - disX * ratio_scale,
          y: y - disY * ratio_scale
        };

        setScaleOffset(offset);
        setRulerScaleOffset(offset);
        setRulerScale(this.#scale);
      }
    }
  }

  getScale() {
    return this.#scale;
  }
}

let container: Readonly<Raw<Container>> | undefined;
const createContainer = function () {
  if (!container) container = readonly(markRaw(new Container()));
  return container;
};
export const removeContainer = function () {
  container?.uninstall();
  container = undefined;
};
export const useContainer = function () {
  container = createContainer();
  return readonly(
    markRaw({
      addScaleEvent: container.addScaleEvent,
      removeScaleEvent: container.removeScaleEvent,
      getScale: container.getScale
    })
  );
};
