import { readonly, Raw, markRaw } from 'vue';
import { useBindKeysContext } from './../../hooks/bind-keys-context';
import { useOverlay } from './../../hooks/overlay-context';
import { useRuler } from './../../hooks/ruler-context';
import { useNodeContext } from './../../hooks/node-context';

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
    const { getScaleOffset, setScaleOffset } = useOverlay();
    const { setRulerScaleTranslate, setRulerScale } = useRuler();

    const { isCtrl } = getBindKeys();
    const root = getRoot();

    if (isCtrl) {
      let ratio = 1.1;
      if (e.deltaY > 0) {
        ratio = 0.9;
      }
      this.#scale = this.#scale * ratio;
      const ratio_scale = ratio - 1;
      const origin = {
        x: ratio_scale * root.width * 0.5,
        y: ratio_scale * root.height * 0.5
      };
      // let { x, y } = getScaleOffset() || { x: 0, y: 0 };
      // x -= ratio_scale * (e.clientX - x - (window.innerWidth - root.width) * 0.5) - origin.x;
      // y -= ratio_scale * (e.clientY - y - (window.innerHeight - root.height) * 0.5) - origin.y;
      // setScaleOffset({ x, y });
      setRulerScaleTranslate({
        x: ((1 - this.#scale) * root.width) / 2,
        y: ((1 - this.#scale) * root.height) / 2
      });
      setRulerScale(this.#scale);
      if (this.#option?.containerEl) this.#option.containerEl.style.scale = `${this.#scale}`;
    }
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
      removeScaleEvent: container.removeScaleEvent
    })
  );
};