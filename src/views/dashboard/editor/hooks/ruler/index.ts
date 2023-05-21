import { onUnmounted, onMounted, Ref, reactive, nextTick } from 'vue';
import { cloneDeep } from 'lodash';
import { RulerConfig, RulerSetting, RulerDOMRect } from './interface';

class Ruler {
  #parentEl?: Element | null;
  #rulerXEl?: HTMLCanvasElement;
  #rulerYEl?: HTMLCanvasElement;
  #config: Readonly<RulerConfig>;
  #setting: Readonly<Required<RulerSetting>>;
  constructor(setting?: RulerSetting) {
    this.#setting = {
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      size: 16
    };
    this.#setting = Object.assign(this.#setting, setting || {});

    this.#config = {
      interval: 5,
      scale: 20,
      scaleTranslate: 4,
      offset: this.#setting.size,
      color: '#fff',
      deputyColor: '#fff',
      lineWidth: 1,
      deputyLineWidth: 0.5,
      fontSize: '9px'
    };

    this.onResize = this.onResize.bind(this);
  }

  #draw() {
    const rect: RulerDOMRect = this.#parentEl?.getBoundingClientRect() || {
      width: window.innerWidth,
      height: window.innerHeight
    };
    rect.width = rect.width - (this.#setting.left + this.#setting.right);
    rect.height = rect.height - (this.#setting.top + this.#setting.bottom);

    this.#drawX(rect);
    this.#drawY(rect);
  }

  #getScales(size: number, interval: number): number[] {
    const scales: number[] = [];
    for (let i = 0; i < size; i++) {
      const prev_scale = scales[scales.length - 1] || 0;
      if (interval + prev_scale === i || prev_scale === 0) scales.push(i);
    }
    return scales;
  }

  #getLineRect(i: number): {
    start: number;
    lineStart: number;
    lineEnd: number;
    deputyLineEnd: number;
  } {
    const config = {
      ...this.#config,
      fontSize: parseFloat(this.#config.fontSize)
    };
    return {
      start: config.offset + i * config.interval,
      lineStart: config.offset,
      lineEnd: config.offset - (config.offset - config.fontSize / 2 - 2),
      deputyLineEnd: config.offset - (config.offset - config.fontSize - 2)
    };
  }

  #drawX(rect: RulerDOMRect) {
    const config = cloneDeep({
      ...this.#config,
      width: this.#config.offset,
      height: rect.height,
      size: rect.height
    });

    if (!this.#rulerXEl) return;
    this.#rulerXEl.width = config.width;
    this.#rulerXEl.height = config.height;

    nextTick(() => {
      if (!this.#rulerXEl) return;
      const ctx = this.#rulerXEl.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, config.width, config.height);
      ctx.font = config.fontSize;

      const scales = this.#getScales(config.size, config.interval);
      for (let i = 0; i < scales.length; i++) {
        const lineRect = this.#getLineRect(i);
        const x = lineRect.lineStart;
        const y = lineRect.start;
        const x2 = lineRect.deputyLineEnd;
        const x2_max = lineRect.lineEnd;

        ctx.beginPath();
        ctx.moveTo(x, y);
        if (i % config.scale === 0) {
          ctx.lineWidth = config.lineWidth;
          ctx.fillStyle = config.color;
          ctx.lineTo(x2_max, y);

          if (i !== 0) {
            const scaleNumber = String(scales[i]);
            const tx = parseFloat(config.fontSize),
              ty = y - config.scaleTranslate;
            ctx.translate(tx, ty);
            ctx.rotate((-90 * Math.PI) / 180);
            ctx.fillText(scaleNumber, 0, 0);
            ctx.rotate((90 * Math.PI) / 180);
            ctx.translate(-tx, -ty);
          }
        } else if (i % (config.scale / 2) === 0) {
          ctx.lineWidth = config.lineWidth;
          ctx.strokeStyle = config.color;
          ctx.lineTo(x2, y);
        } else {
          ctx.lineWidth = config.deputyLineWidth;
          ctx.strokeStyle = config.deputyColor;
          ctx.lineTo(x2, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  #drawY(rect: RulerDOMRect) {
    const config = cloneDeep({
      ...this.#config,
      width: rect.width,
      height: this.#config.offset,
      size: rect.width
    });

    if (!this.#rulerYEl) return;
    this.#rulerYEl.width = config.width;
    this.#rulerYEl.height = config.height;

    nextTick(() => {
      if (!this.#rulerYEl) return;
      const ctx = this.#rulerYEl.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, config.width, config.height);
      ctx.font = config.fontSize;

      const scales = this.#getScales(config.size, config.interval);
      for (let i = 0; i < scales.length; i++) {
        const lineRect = this.#getLineRect(i);
        const x = lineRect.start;
        const y = lineRect.lineStart;
        const y2 = lineRect.deputyLineEnd;
        const y2_max = lineRect.lineEnd;

        ctx.beginPath();
        ctx.moveTo(x, y);
        if (i % config.scale === 0) {
          ctx.lineWidth = config.lineWidth;
          ctx.fillStyle = config.color;
          ctx.lineTo(x, y2_max);
          if (i !== 0) {
            const scaleNumber = String(scales[i]);
            ctx.fillText(scaleNumber, x + config.scaleTranslate, parseFloat(config.fontSize));
          }
        } else if (i % (config.scale / 2) === 0) {
          ctx.lineWidth = config.lineWidth;
          ctx.strokeStyle = config.color;
          ctx.lineTo(x, y2);
        } else {
          ctx.lineWidth = config.deputyLineWidth;
          ctx.strokeStyle = config.deputyColor;
          ctx.lineTo(x, y2);
        }
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  #updateRulerStyle() {
    const els = [this.#rulerXEl, this.#rulerYEl];
    const setting = this.#setting;
    console.log(setting);
    els.forEach((el) => {
      if (!el) return;
      el.style.position = 'absolute';
      el.style.left = (setting.left || 0) + 'px';
      el.style.top = (setting.top || 0) + 'px';
    });
  }

  onResize(event: Event): void {
    this.#draw();
  }

  install(parentEl: Element | string): void {
    this.#install(parentEl);
  }
  #install(parentEl: Element | string): void {
    this.#parentEl = typeof parentEl === 'string' ? document.querySelector(parentEl) : parentEl;

    this.#rulerYEl = document.createElement('canvas');
    this.#rulerXEl = document.createElement('canvas');
    this.#updateRulerStyle();

    if (this.#parentEl) {
      this.#parentEl.appendChild(this.#rulerYEl);
      this.#parentEl.appendChild(this.#rulerXEl);
    }
    this.#draw();

    document.addEventListener('resize', this.onResize);
  }

  uninstall(): void {
    this.#uninstall();
  }
  #uninstall(): void {
    document.removeEventListener('resize', this.onResize);
    this.#rulerXEl?.remove();
    this.#rulerXEl?.remove();
    this.#rulerYEl = undefined;
    this.#rulerXEl = undefined;
  }
}

let ruler: Ruler | undefined;
export const createRuler = function (parentEl: Ref<Element>, setting?: RulerSetting): Ruler {
  ruler = new Ruler(setting);
  onMounted(() => {
    ruler?.install(parentEl.value);
  });
  onUnmounted(() => {
    ruler?.uninstall();
    ruler = undefined;
  });
  return ruler;
};

export const useRuler = function (): Ruler {
  return ruler as Ruler;
};
