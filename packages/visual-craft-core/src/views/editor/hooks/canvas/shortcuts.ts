import { markRaw } from 'vue';

export interface ShortcutItem {
    id: string;
    key: string; // e.g. 'c', 'v', 'Delete'
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    strict?: boolean; // If true, only trigger if modifiers match exactly
    action: (event: KeyboardEvent) => void;
    allowInInput?: boolean;
}

export interface ComBindKeys {
    isSpace: boolean;
    isShift: boolean;
    isCtrl: boolean;
    isAlt: boolean;
    isMeta: boolean;
}

interface CallbackUpdate {
    (bindKeys: ComBindKeys): void;
}

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export class Shortcuts {
    #comBindKeys: ComBindKeys;
    #callbackUpdates: CallbackUpdate[];
    #shortcuts: Map<string, ShortcutItem>;

    constructor() {
        this.#comBindKeys = markRaw({
            isSpace: false,
            isShift: false,
            isCtrl: false,
            isAlt: false,
            isMeta: false
        });
        this.#callbackUpdates = [];
        this.#shortcuts = new Map();

        this.getBindKeys = this.getBindKeys.bind(this);
        this.addBindKeysUpdated = this.addBindKeysUpdated.bind(this);
        this.bindShortcut = this.bindShortcut.bind(this);
        this.unbindShortcut = this.unbindShortcut.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.install = this.install.bind(this);
        this.uninstall = this.uninstall.bind(this);
    }

    getBindKeys(): ComBindKeys {
        return this.#comBindKeys;
    }

    addBindKeysUpdated(fn: CallbackUpdate): void {
        this.#callbackUpdates.push(fn);
    }

    removeBindKeysUpdate(fn: CallbackUpdate): void {
        const idx = this.#callbackUpdates.findIndex(r => r === fn);
        if (idx !== -1) {
            this.#callbackUpdates.splice(idx, 1);
        }
    }

    bindShortcut(shortcut: ShortcutItem): void {
        this.#shortcuts.set(shortcut.id, shortcut);
    }

    unbindShortcut(id: string): void {
        this.#shortcuts.delete(id);
    }

    #checkShortcuts(event: KeyboardEvent): void {
        const target = event.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey;
        const shift = event.shiftKey;
        const alt = event.altKey;
        const meta = event.metaKey;

        for (const shortcut of this.#shortcuts.values()) {
            if (isInput && !shortcut.allowInInput) continue;

            const matchKey = shortcut.key.toLowerCase() === key;
            if (!matchKey) continue;

            const matchCtrl = !!shortcut.ctrl === ctrl;
            const matchShift = !!shortcut.shift === shift;
            const matchAlt = !!shortcut.alt === alt;
            const matchMeta = !!shortcut.meta === meta;

            if (matchCtrl && matchShift && matchAlt && matchMeta) {
                shortcut.action(event);
            }
        }
    }

    #comBindKeysUpdate(event: KeyboardEvent, isBoolean: boolean): void {
        const key = event.key;
        let changed = false;

        if (key === 'Shift') {
            if (this.#comBindKeys.isShift !== isBoolean) {
                this.#comBindKeys.isShift = isBoolean;
                changed = true;
            }
        } else if (key === 'Control') {
            if (this.#comBindKeys.isCtrl !== isBoolean) {
                this.#comBindKeys.isCtrl = isBoolean;
                changed = true;
            }
        } else if (key === 'Alt') {
            if (this.#comBindKeys.isAlt !== isBoolean) {
                this.#comBindKeys.isAlt = isBoolean;
                changed = true;
            }
        } else if (key === 'Meta') {
            if (this.#comBindKeys.isMeta !== isBoolean) {
                this.#comBindKeys.isMeta = isBoolean;
                changed = true;
            }
        } else if (key === ' ') {
            if (this.#comBindKeys.isSpace !== isBoolean) {
                this.#comBindKeys.isSpace = isBoolean;
                changed = true;
            }
        }

        if (changed) {
            this.#callbackUpdates.forEach(callback => callback({ ...this.#comBindKeys }));
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        this.#comBindKeysUpdate(event, true);
        this.#checkShortcuts(event);
    }

    onKeyUp(event: KeyboardEvent): void {
        this.#comBindKeysUpdate(event, false);
    }

    install(): void {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    uninstall(): void {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }
}


