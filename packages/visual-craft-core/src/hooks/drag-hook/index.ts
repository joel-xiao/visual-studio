// import { Component, App } from 'vue';
// import { createComponent } from './../vue-hooks';
import './drag.scss';

const buildCornerRotateCursor = (angleDeg: number): string => {
  const normalized = ((angleDeg % 360) + 360) % 360;
  const d =
    'M 20 9 L 17 6.5 M 20 9 L 17 11.5 M 9 20 L 6.5 17 M 9 20 L 11.5 17 M 9 17 A 8 8 0 0 1 17 9';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g transform="rotate(${normalized}, 12, 12)"><path d="${d}" fill="none" stroke="#ffffff" stroke-width="3.8" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4"/><path d="${d}" fill="none" stroke="black" stroke-width="2.8" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4"/></g></svg>`;
  const encoded = encodeURIComponent(svg);
  return `url("data:image/svg+xml,${encoded}") 16 16, auto`;
};

export class Drag {
  el?: HTMLElement;
  resize: boolean;
  disabled: boolean;
  active: boolean;
  selection: boolean;
  rotateDisabled: boolean;
  // eslint-disable-next-line no-unused-private-class-members
  #moved: boolean;
  #scale = 1;
  callbackUp?: ((dragDataset: IDragDataset) => void) | null;
  callbackMove?: ((dragDataset: IDragDataset) => void) | null;
  callbackDown?: ((dragDataset: IDragDataset) => void) | null;
  stickEl?: HTMLElement;
  sticks: string[];
  stickEls: HTMLElement[] = [];
  currentStick: string;
  defaultPos: IDragDataset;
  startPos: { x: number; y: number };
  pos: IDragDataset;
  #startInteractionPos: IDragDataset = { x: 0, y: 0, x2: 0, y2: 0 };
  cursorPos?: IDragCursorPos | null;
  centerPos: { x: number; y: number } = { x: 0, y: 0 };
  binding: IDragBinding;
  constructor() {
    this.sticks = ['tm', 'rm', 'bm', 'lm', 'tl', 'tr', 'br', 'bl', 'rotate', 'rot-tl', 'rot-tr', 'rot-br', 'rot-bl'];
    this.currentStick = '';
    this.defaultPos = { x: 0, y: 0, x2: 0, y2: 0 };
    this.pos = { ...this.defaultPos };
    this.#startInteractionPos = { ...this.defaultPos };
    this.startPos = { x: 0, y: 0 };

    this.binding = {
      pos: { ...this.defaultPos },
      cursorPos: null,
      resize: false,
      disabled: false,
      active: true
    };

    this.cursorPos = null;
    this.resize = !!this.binding.resize;
    this.disabled = !!this.binding.disabled;
    this.active = !!this.binding.disabled;
    this.selection = false;
    this.rotateDisabled = false;
    this.#moved = false;

    this.bodyDown = this.bodyDown.bind(this);
    this.stickDown = this.stickDown.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onMove = this.onMove.bind(this);
  }

  install(el: HTMLElement, binding: IDragBinding | null = this.binding): void {
    if (binding) {
      Object.keys(binding).forEach(key => {
        // @ts-expect-error - Dynamic property assignment
        this.binding[key] = binding[key];
      });
    }

    this.el = el;
    this.el.classList.add('v-drag-resize');

    if (this.binding.pos) {
      this.defaultPos = { ...this.binding.pos };
    }
    this.pos = { ...this.defaultPos };
    this.cursorPos = this.binding.cursorPos;
    this.resize = !!this.binding.resize;
    this.disabled = !!this.binding.disabled;
    this.rotateDisabled = !!this.binding.rotateDisabled;
    this.active = !!this.binding.active;
    this.callbackUp = this.binding.onUp;
    this.callbackMove = this.binding.onMove;
    this.callbackDown = this.binding.onDown;

    if (!this.cursorPos) {
      this.el.addEventListener('mousedown', this.bodyDown, true);
    } else {
      this.buttonDown(this.cursorPos);
    }

    if (this.resize) {
      this.stickEl = document.createElement('span');
      this.stickEl.classList.add('v-drag-sticks');
      this.sticks.forEach((stick: string): void => {
        let stickDom: HTMLElement | null = document.createElement('div');
        stickDom.addEventListener('mousedown', this.stickDown, true);
        stickDom.setAttribute('stick', stick);
        stickDom.classList.add('v-drag-stick');
        stickDom.classList.add('v-drag-stick-' + stick);
        this.stickEls.push(stickDom);
        this?.stickEl?.appendChild(stickDom);
        stickDom = null;
      });

      this.el?.appendChild(this.stickEl);
    }

    this.setDisabled(this.disabled);
    this.setRotateDisabled(this.rotateDisabled);
    this.setActive(this.active);
    this.setSelection(this.selection);
    this.setPos(this.defaultPos);
    this.updateSticks();
  }

  uninstall(): void {
    if (!this.cursorPos) {
      this.el?.removeEventListener('mousedown', this.bodyDown, true);
    }

    if (this.resize) {
      let childNodes: HTMLElement[] | undefined = Array.from(
        this.stickEl?.querySelectorAll('v-drag-stick') || []
      );
      childNodes?.forEach((stickDom: HTMLElement) => {
        stickDom.removeEventListener('mousedown', this.stickDown, true);
        stickDom.remove();
      });
      this.stickEl?.remove();

      childNodes = undefined;
      this.stickEl = undefined;
      this.el = undefined;
    }

    this.callbackUp = null;
    this.callbackMove = null;
    this.callbackDown = null;
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.el?.classList[disabled ? 'add' : 'remove']('disabled');
    this.stickEl?.classList[disabled ? 'add' : 'remove']('disabled');
  }

  setRotateDisabled(rotateDisabled: boolean): void {
    this.rotateDisabled = rotateDisabled;
    this.el?.classList[rotateDisabled ? 'add' : 'remove']('rotate-disabled');
    this.stickEl?.classList[rotateDisabled ? 'add' : 'remove']('rotate-disabled');
  }

  setActive(active: boolean): void {
    if (!this.resize) return;
    this.stickEl?.classList[active ? 'add' : 'remove']('active');
    this.el?.classList[active ? 'add' : 'remove']('active');
    this.active = active;
  }

  setSelection(selection: boolean): void {
    this.el?.classList[selection ? 'add' : 'remove']('v-drag-selection');
    this.selection = selection;
  }

  setPos(pos: IDragDataset): void {
    if (!this.resize && !this.selection) return;
    if (this.currentStick !== '') return;
    this.pos = { ...pos };
    this.defaultPos = { ...this.pos };
    this.updateStyle(this.defaultPos);
  }

  setScale(scale: number): void {
    this.#scale = scale;
    this.updateSticks();
  }

  #setMoved(moved: boolean): void {
    if (!this.resize) return;
    this.stickEl?.classList[moved ? 'add' : 'remove']('no-opacity');
    this.#moved = moved;
  }

  bodyDown(event: MouseEvent): void {
    if (event?.button) {
      this.prevent(event);
    }
    if (this.disabled) return;
    this.setActive(true);
    this.currentStick = 'body';
    this.startPos.x = event.x;
    this.startPos.y = event.y;
    this.#startInteractionPos = { ...this.defaultPos };
    this.onDown();
  }

  buttonDown(pos: IDragCursorPos): void {
    if (this.disabled) return;
    this.setActive(true);
    this.currentStick = 'body';
    this.startPos.x = pos.x;
    this.startPos.y = pos.y;
    this.#startInteractionPos = { ...this.defaultPos };
    this.onDown();
  }

  stickDown(event: MouseEvent): void {
    this.prevent(event);
    if (this.disabled) return;
    this.currentStick = (<HTMLElement>event.target).getAttribute('stick') || '';
    if (this.rotateDisabled && (this.currentStick === 'rotate' || this.currentStick.startsWith('rot-'))) {
      this.currentStick = '';
      return;
    }
    this.startPos.x = event.x;
    this.startPos.y = event.y;
    this.#startInteractionPos = { ...this.defaultPos };
    this.onDown();
  }

  onUp(event: MouseEvent): void {
    this.#setMoved(false);
    this.prevent(event);
    this.currentStick = '';
    this.defaultPos = { ...this.pos };
    this.updateStyle(this.defaultPos);

    document.documentElement.removeEventListener('mousemove', this.onMove, false);
    document.documentElement.removeEventListener('mouseup', this.onUp, false);
    document.documentElement.removeEventListener('mouseleave', this.onUp, false);

    // document.documentElement.removeEventListener('mousedown', this.onUp, false);

    // document.documentElement.removeEventListener('touchmove', onMove.bind(this), true);
    // document.documentElement.removeEventListener('touchend', onUp.bind(this), true);
    // document.documentElement.removeEventListener('touchcancel', onUp.bind(this), true);
    // document.documentElement.removeEventListener('touchstart', onUp.bind(this), true);
    this.callbackUp?.(this.defaultPos);
  }

  onDown(): void {
    if (this.el) {
      const rect = this.el.getBoundingClientRect();
      this.centerPos = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    this.callbackDown?.(this.pos);
    document.documentElement.addEventListener('mousemove', this.onMove, false);
    document.documentElement.addEventListener('mouseup', this.onUp, false);
    document.documentElement.addEventListener('mouseleave', this.onUp, false);

    // document.documentElement.addEventListener('mousedown', this.onUp, true);

    // document.documentElement.addEventListener('touchmove', this.onMove, true);
    // document.documentElement.addEventListener('touchend', this.onUp, true);
    // document.documentElement.addEventListener('touchcancel', this.onUp, true);
    // document.documentElement.addEventListener('touchstart', this.onUp, true);
  }

  onMove(event: MouseEvent): void {
    if (!this.active) return;
    if (this.currentStick === 'body') this.#setMoved(true);
    this.prevent(event);

    const stick: string = this.currentStick;
    const startPos: IDragDataset = this.#startInteractionPos;

    const diff_x: number = (event.x - this.startPos.x) / this.#scale;
    const diff_y: number = (event.y - this.startPos.y) / this.#scale;
    if (stick === 'body') {
      this.pos.x = startPos.x + diff_x;
      this.pos.y = startPos.y + diff_y;
      this.pos.x2 = startPos.x2 + diff_x;
      this.pos.y2 = startPos.y2 + diff_y;

    } else if (stick === 'rotate' || stick.startsWith('rot-')) {
      if (this.rotateDisabled) return;
      const cx = this.centerPos.x;
      const cy = this.centerPos.y;
      const startAngle = Math.atan2(this.startPos.y - cy, this.startPos.x - cx);
      const currentAngle = Math.atan2(event.y - cy, event.x - cx);
      const diffAngle = (currentAngle - startAngle) * (180 / Math.PI);
      this.pos.rotate = (startPos.rotate || 0) + diffAngle;
    } else {
      const rotate = startPos.rotate || 0;
      const rad = rotate * (Math.PI / 180);
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const cx = startPos.x + (startPos.x2 - startPos.x) / 2;
      const cy = startPos.y + (startPos.y2 - startPos.y) / 2;
      const w = startPos.x2 - startPos.x;
      const h = startPos.y2 - startPos.y;

      const ux = { x: cos, y: sin };
      const uy = { x: -sin, y: cos };

      let fx_rel = 0, fy_rel = 0;

      switch (stick) {
        case 'tl': fx_rel = w / 2; fy_rel = h / 2; break;
        case 'tr': fx_rel = -w / 2; fy_rel = h / 2; break;
        case 'br': fx_rel = -w / 2; fy_rel = -h / 2; break;
        case 'bl': fx_rel = w / 2; fy_rel = -h / 2; break;
        case 'tm': fx_rel = 0; fy_rel = h / 2; break;
        case 'bm': fx_rel = 0; fy_rel = -h / 2; break;
        case 'lm': fx_rel = w / 2; fy_rel = 0; break;
        case 'rm': fx_rel = -w / 2; fy_rel = 0; break;
      }

      const fx_rot = fx_rel * cos - fy_rel * sin;
      const fy_rot = fx_rel * sin + fy_rel * cos;
      const F = { x: cx + fx_rot, y: cy + fy_rot };

      // Correct M calculation:
      // The Mouse Position is roughly (StartMouse + diff).
      // But diff is in global space.
      // Wait. diff_x = (event.x - startPos.x).
      // But which startPos?
      // In stickDown, startPos.x = event.x.
      // So diff_x is (CurrentMouse - StartMouse).
      // But we need the position relative to the Stick's original position.
      // The stick was at SOME position.
      // The math below uses M as the *Target Stick Position*.
      // TargetStick = StartStick + Diff.
      // Where is StartStick?
      // StartStick is (F + Vector_F_to_Stick).
      // Or simply: M = StartStickPos + Diff.
      // But we don't track StartStickPos explicitly.
      // But we know F (Fixed Point) and the initial Width/Height.
      // StartStickPos relative to Center is (-fx_rel, -fy_rel).
      // So StartStickPos = cx + (-fx_rel * cos - -fy_rel * sin), etc.
      // Let's simplify:
      // V (Vector from F to NewStick) = (Vector F to OldStick) + Diff.
      // Vector F to OldStick = (cx - F.x - fx_rel_rot, cy - F.y - fy_rel_rot)?
      // No. F is the opposite point.
      // Vector F->OldStick is simply (StartW * ux_sign * ux + StartH * uy_sign * uy).
      // It's easier to calculate M directly.
      // M = (StartStickPos) + (diff_x, diff_y).
      // StartStickPos?
      // Center + Rotated(-fx_rel, -fy_rel).

      const hx_rel = -fx_rel, hy_rel = -fy_rel;
      const hx_rot = hx_rel * cos - hy_rel * sin;
      const hy_rot = hx_rel * sin + hy_rel * cos;
      const StartStickPos = { x: cx + hx_rot, y: cy + hy_rot };

      const M_curr = { x: StartStickPos.x + diff_x, y: StartStickPos.y + diff_y };
      const V = { x: M_curr.x - F.x, y: M_curr.y - F.y };

      const proj_x = V.x * ux.x + V.y * ux.y;
      const proj_y = V.x * uy.x + V.y * uy.y;

      let newW = w;
      let newH = h;
      let local_x = 0;
      let local_y = 0;

      if (['tl', 'tr', 'br', 'bl'].includes(stick)) {
        newW = Math.abs(proj_x);
        newH = Math.abs(proj_y);
        local_x = proj_x;
        local_y = proj_y;
      } else if (['tm', 'bm'].includes(stick)) {
        newH = Math.abs(proj_y);
        local_x = 0; // Constrained
        local_y = proj_y;
      } else if (['lm', 'rm'].includes(stick)) {
        newW = Math.abs(proj_x);
        local_x = proj_x;
        local_y = 0; // Constrained
      }

      // Reconstruct vector from F to New Stick Position (aligned)
      const V_aligned_global = {
        x: local_x * ux.x + local_y * uy.x,
        y: local_x * ux.y + local_y * uy.y
      };

      const newCx = F.x + V_aligned_global.x / 2;
      const newCy = F.y + V_aligned_global.y / 2;

      this.pos.x = newCx - newW / 2;
      this.pos.y = newCy - newH / 2;
      this.pos.x2 = newCx + newW / 2;
      this.pos.y2 = newCy + newH / 2;
    }
    this.updateStyle(this.pos);
    this.callbackMove?.(this.pos);
  }

  prevent(event: MouseEvent): void {
    event.preventDefault();
  }

  updateStyle(pos: IDragDataset): void {
    let diff_rotate_x = 0;
    let diff_rotate_y = 0;
    const transforms: string[] = [];
    if (pos.x2 - pos.x < 0 && pos.y2 - pos.y < 0) {
      diff_rotate_x = pos.x2 - pos.x;
      diff_rotate_y = pos.y2 - pos.y;
      transforms.push('rotate(180deg)');
    } else if (pos.x2 - pos.x < 0 && pos.y2 - pos.y >= 0) {
      diff_rotate_x = pos.x2 - pos.x;
      transforms.push('rotateY(180deg)');
    } else if (pos.x2 - pos.x >= 0 && pos.y2 - pos.y <= 0) {
      diff_rotate_y = pos.y2 - pos.y;
      transforms.push('rotateX(180deg)');
    }

    if (pos.rotate) {
      transforms.push(`rotate(${pos.rotate}deg)`);
    }

    if (this.el) {
      const rotate = transforms.join(' ');
      this.el.style.transform = `translate(${pos.x + diff_rotate_x}px, ${pos.y + diff_rotate_y}px) ${rotate}`;
      this.el.style.width = Math.abs(pos.x2 - pos.x) + 'px';
      this.el.style.height = Math.abs(pos.y2 - pos.y) + 'px';
    }

    this.updateSticks(pos);
  }

  updateSticks(pos?: IDragDataset) {
    const scale = 1 / this.#scale;
    this.stickEl?.style.setProperty('--drag-scale', scale.toString());

    const rotate = pos?.rotate ?? this.pos.rotate ?? 0;
    const baseByStick: Record<string, number> = {
      'rot-tl': 0,
      'rot-tr': 90,
      'rot-br': 180,
      'rot-bl': -90
    };
    for (const stickEl of this.stickEls) {
      const stick = stickEl.getAttribute('stick') || '';
      const base = baseByStick[stick];
      if (base === undefined) continue;
      stickEl.style.cursor = buildCornerRotateCursor(rotate + base);
    }
  }
}
