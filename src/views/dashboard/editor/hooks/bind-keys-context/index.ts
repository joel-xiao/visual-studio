import { markRaw } from 'vue';
import { getPlatform } from '@a/utils/index';
import type { ComBindKeys, CallbackUpdate } from './interface';

class BindKeys {
  #comBindKeys: ComBindKeys;
  #callbackUpdates: CallbackUpdate[];
  constructor() {
    this.#comBindKeys = markRaw({
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

  addBindKeysUpdated(fn: CallbackUpdate): void {
    this.#callbackUpdates.push(fn);
  }

  removeBindKeysUpdate(fn: CallbackUpdate): void {
    const idx: number = this.#callbackUpdates.findIndex((r) => r === fn);
    idx && this.#callbackUpdates.splice(idx, 1);
  }

  #comBindKeysUpdate(event: KeyboardEvent, isBoolean: boolean): void {
    event = event || window.event;
    const code = event.keyCode || event.which || event.charCode;
    const key = (event.key && event.key.trim()) || event.code;
    const platform = getPlatform();
    if (key === 'Shift') {
      event.preventDefault();
      if (this.#comBindKeys.isShift === isBoolean) return;
      this.#comBindKeys.isShift = isBoolean;
    } else if (key === 'Control' || key === 'Meta') {
      event.preventDefault();
      if (this.#comBindKeys.isCtrl === isBoolean) return;
      this.#comBindKeys.isCtrl = isBoolean;
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
  if (!bindKeys) {
    bindKeys = new BindKeys();
    bindKeys.install();
  }
  return bindKeys;
};
export const removeBindKeysContext = function () {
  bindKeys?.uninstall();
  bindKeys = undefined;
};

export const useBindKeysContext = function (): BindKeys {
  bindKeys = createBindKeysContext();
  return bindKeys;
};
