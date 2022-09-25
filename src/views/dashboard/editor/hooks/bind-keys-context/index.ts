import { onUnmounted, reactive } from 'vue';
import { getPlatform } from '@a/utils/index';
import type { ComBindKeys, callbackUpdate } from './interface';

class BindKeys {
  #comBindKeys: ComBindKeys;
  #callbackUpdates: callbackUpdate[];
  constructor() {
    this.#comBindKeys = reactive({
      isSpace: false,
      isShift: false,
      isCtrl: false,
      isAlt: false
    });
    this.#callbackUpdates = [];

    this.getBindKeys = this.getBindKeys.bind(this);
    this.addBindKeysUpdated = this.addBindKeysUpdated.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  getBindKeys(): ComBindKeys {
    return this.#getBindKeys();
  }

  #getBindKeys(): ComBindKeys {
    return this.#comBindKeys;
  }

  addBindKeysUpdated(fn: callbackUpdate): void {
    this.#callbackUpdates.push(fn);
  }

  removeBindKeysUpdate(fn: callbackUpdate): void {
    const idx: number = this.#callbackUpdates.findIndex((r) => r === fn);
    idx && this.#callbackUpdates.splice(idx, 1);
  }

  #comBindKeysUpdate(event: KeyboardEvent, isBoolean: boolean): void {
    event = event || window.event;
    const code = event.keyCode || event.which || event.charCode;
    const key = event.code || event.key;
    const platform = getPlatform();
    // if (code === 16) {
    //   saveComBindKeys({ isShift: isBoolean });
    // } else if (code === 18) {
    //   saveComBindKeys({ isAlt: isBoolean });
    // } else if (code === 32) {
    //   saveComBindKeys({ isSpace: isBoolean });
    // }
    if (key === 'Shift') {
      event.preventDefault();
      if (this.#comBindKeys.isShift === isBoolean) return;
      this.#comBindKeys.isShift = isBoolean;
    } else if (key === 'Alt') {
      event.preventDefault();
      if (this.#comBindKeys.isAlt === isBoolean) return;
      this.#comBindKeys.isAlt = isBoolean;
    } else if (key === 'Space') {
      event.preventDefault();
      if (this.#comBindKeys.isSpace === isBoolean) return;
      this.#comBindKeys.isSpace = isBoolean;
    }

    this.#callbackUpdates.forEach((callback) => callback({ ...this.#comBindKeys }));
  }

  onKeyDown(event: KeyboardEvent): void {
    this.#comBindKeysUpdate(event, true);
  }
  onKeyUp(event: KeyboardEvent): void {
    this.#comBindKeysUpdate(event, false);
  }

  install(): void {
    this.#install();
  }
  #install(): void {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }

  uninstall(): void {
    this.#uninstall();
  }
  #uninstall(): void {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }
}

let bindKeys: BindKeys | undefined;
export const createBindKeysContext = function (): BindKeys {
  bindKeys = new BindKeys();
  bindKeys.install();
  onUnmounted(() => {
    bindKeys?.uninstall();
    bindKeys = undefined;
  });
  return bindKeys;
};

export const useBindKeysContext = function (): BindKeys {
  return bindKeys as BindKeys;
};
