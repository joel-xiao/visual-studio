import { readonly, Raw, markRaw } from 'vue';
import { useBindKeysContext } from './../../hooks/bind-keys-context';
import { ContainerOverlay, CallbackUpdate } from './container-overlay';

import { useNodeContext } from './../../hooks/node-context';

type ScaleOption = {
  parentEl: HTMLElement;
  containerEl: HTMLElement;
};

type MoveOption = {
  parentEl: HTMLElement;
  containerEl: HTMLElement;
};

type Rect = DOMRect | { width: number; height: number };

class Container {
  #overlay?: ContainerOverlay;
  #scale = 1;
  #scaleOpt?: ScaleOption;
  #moveOpt?: MoveOption;

  constructor() {
    this.#overlay = new ContainerOverlay();

    this.uninstall = this.uninstall.bind(this);

    this.setOverlayDisabled = this.setOverlayDisabled.bind(this);

    this.addScaleEvent = this.addScaleEvent.bind(this);
    this.removeScaleEvent = this.removeScaleEvent.bind(this);
    this.onWheel = this.onWheel.bind(this);

    this.addMoveEvent = this.addMoveEvent.bind(this);
    this.removeMoveEvent = this.removeMoveEvent.bind(this);
    this.addMoveUpdated = this.addMoveUpdated.bind(this);
  }

  uninstall() {
    this.removeScaleEvent();
    this.removeMoveEvent();

    this.#overlay?.uninstall();
    this.#overlay = undefined;
  }

  setOverlayDisabled(disabled: boolean) {
    this.#overlay?.setDisabled(disabled);
  }

  addScaleEvent(opt: ScaleOption) {
    this.#scaleOpt = opt;
    this.#scaleOpt?.parentEl.addEventListener('mousewheel', this.onWheel);
  }

  removeScaleEvent() {
    this.#scaleOpt?.parentEl.removeEventListener('mousewheel', this.onWheel);
    this.#scaleOpt = undefined;
  }

  onWheel(e: WheelEvent): void {
    e.preventDefault();

    const { getBindKeys } = useBindKeysContext();
    const { getRoot } = useNodeContext();

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
      let { x, y } = this.#overlay?.getContainerScaleOffset() || { x: 0, y: 0 };
      x -= ratio_scale * (e.clientX - x - (window.innerWidth - root.width) * 0.5) - origin.x;
      y -= ratio_scale * (e.clientY - y - (window.innerHeight - root.height) * 0.5) - origin.y;
      this.#overlay?.setContainerScaleOffset({ x, y });
      // setContainerScale(scale);
      if (this.#scaleOpt?.containerEl) this.#scaleOpt.containerEl.style.scale = `${this.#scale}`;
    }
  }

  addMoveEvent(opt: MoveOption) {
    this.#moveOpt = opt;

    const containerRect: Rect = this.#moveOpt.containerEl.getBoundingClientRect() || {
      width: 0,
      height: 0
    };
    const parentRect: Rect = this.#moveOpt.parentEl.getBoundingClientRect() || containerRect;

    const defaultPos = {
      x: (parentRect.width - containerRect.width) / 2,
      y: (parentRect.height - containerRect.height) / 2
    };
    defaultPos.x < 0 && (defaultPos.x = 0);
    defaultPos.y < 0 && (defaultPos.y = 0);

    this.#overlay?.addContainerMoveUpdated((pos) => {
      if (this.#moveOpt) {
        this.#moveOpt.containerEl.style.translate = `${pos.x}px ${pos.y}px`;
      }
    });

    this.#overlay?.install(
      this.#moveOpt.parentEl,
      {
        defaultPos
      },
      'editor-container-overlay'
    );
  }
  removeMoveEvent() {
    this.#moveOpt = undefined;
  }

  addMoveUpdated(fn: CallbackUpdate) {
    this.#overlay?.addContainerMoveUpdated(fn);
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
      addMoveEvent: container.addMoveEvent,
      removeMoveEvent: container.removeMoveEvent,
      addMoveUpdated: container.addMoveUpdated,
      setOverlayDisabled: container.setOverlayDisabled
    })
  );
};
