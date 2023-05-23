import { onUnmounted, onMounted, Ref, reactive, nextTick } from 'vue';
import { cloneDeep } from 'lodash';
import { RulerConfig, RulerSetting, RulerDOMRect, RulerPos } from './interface';

class Ruler {
  #config: Readonly<RulerConfig>;
  #setting: Readonly<Required<RulerSetting>>;
  #parentEl?: Element | null;
  #rulerXEl?: HTMLCanvasElement;
  #rulerYEl?: HTMLCanvasElement;
  #translate: {
    x: number;
    y: number;
  };
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
      textTranslateLeft: 4,
      textTranslateTop: 2,
      size: this.#setting.size,
      color: '#fff',
      deputyColor: '#fff',
      lineWidth: 1,
      deputyLineWidth: 0.5,
      fontSize: '9px'
    };

    this.#translate = {
      x: 0,
      y: 0
    };

    this.setRulerTranslate = this.setRulerTranslate.bind(this);
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

  #getScales(long_size: number, interval: number, offset: number) {
    const is_negative = offset < 0;
    const offset_abs = Math.abs(offset);
    long_size = long_size + offset_abs;
    const scales: { is_continue: boolean; sum: number }[] = [];
    for (let i = 0; i < long_size; i++) {
      const prev_scale = scales[scales.length - 1]?.sum || 0;
      if (interval + prev_scale === i || prev_scale === 0)
        scales.push({
          is_continue: is_negative && i < offset_abs ? true : false,
          sum: i
        });
    }
    return scales;
  }

  #getLineRect(
    i: number,
    offset: number
  ): {
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
      start: offset + i * config.interval,
      lineStart: config.size,
      lineEnd: config.size - (config.size - config.fontSize / 2 - 2),
      deputyLineEnd: config.size - (config.size - config.fontSize - 2)
    };
  }

  #drawX(rect: RulerDOMRect) {
    const config = cloneDeep({
      ...this.#config,
      width: this.#config.size,
      height: rect.height,
      long_size: rect.height
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

      const scales = this.#getScales(config.long_size, config.interval, this.#translate.y);
      for (let i = 0; i < scales.length; i++) {
        const scale = scales[i];
        if (scale.is_continue) continue;

        const lineRect = this.#getLineRect(i, this.#translate.y);
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
            const scaleNumber = String(scale.sum);
            const tx = parseFloat(config.fontSize),
              ty = y - config.textTranslateLeft;
            ctx.translate(tx, ty);
            ctx.rotate((-90 * Math.PI) / 180);
            ctx.fillText(scaleNumber, 0, config.textTranslateTop);
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
      height: this.#config.size,
      long_size: rect.width
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

      const scales = this.#getScales(config.long_size, config.interval, this.#translate.x);
      for (let i = 0; i < scales.length; i++) {
        const scale = scales[i];
        if (scale.is_continue) continue;

        const lineRect = this.#getLineRect(i, this.#translate.x);
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
            const scaleNumber = String(scale.sum);
            ctx.fillText(
              scaleNumber,
              x + config.textTranslateLeft,
              parseFloat(config.fontSize) + config.textTranslateTop
            );
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
    els.forEach((el) => {
      if (!el) return;
      el.style.position = 'absolute';
      el.style.left = (setting.left || 0) + 'px';
      el.style.top = (setting.top || 0) + 'px';
    });
  }

  #onResize(event: Event): void {
    this.#draw();
  }

  setRulerTranslate(pos: RulerPos) {
    this.#setRulerTranslate(pos);
  }
  #setRulerTranslate(pos: RulerPos) {
    this.#translate.x = pos.x;
    this.#translate.y = pos.y;
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

    document.addEventListener('resize', this.#onResize);
  }

  uninstall(): void {
    this.#uninstall();
  }
  #uninstall(): void {
    document.removeEventListener('resize', this.#onResize);
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
