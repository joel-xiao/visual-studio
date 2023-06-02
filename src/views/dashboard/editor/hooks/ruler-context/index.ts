import { onUnmounted, onMounted, Ref, nextTick } from 'vue';
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
  #scaleTranslate: {
    x: number;
    y: number;
  };
  #scale: number;
  constructor(setting?: RulerSetting) {
    this.#setting = { left: 0, right: 0, bottom: 0, top: 0, size: 16 };
    this.#setting = Object.assign(this.#setting, setting || {});

    this.#config = {
      intervalPixel: 5,
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

    this.#translate = { x: 0, y: 0 };
    this.#scaleTranslate = { x: 0, y: 0 };
    this.#scale = 1;

    this.setRulerTranslate = this.setRulerTranslate.bind(this);
    this.setRulerScale = this.setRulerScale.bind(this);
    this.setRulerScaleTranslate = this.setRulerScaleTranslate.bind(this);
    this.setRulerScaleTranslateDelta = this.setRulerScaleTranslateDelta.bind(this);
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

  #getScales(long_size: number, intervalPixel: number, offset: number) {
    let scale = this.#config.scale;
    let pixel = intervalPixel;

    if (this.#scale <= 1) {
      long_size = Math.ceil(long_size / this.#scale);
      scale = this.#config.scale;
      pixel = intervalPixel;
      intervalPixel = Math.round(intervalPixel / this.#scale);
    } else {
      long_size = Math.ceil(long_size * this.#scale);
      scale = Math.ceil(this.#config.scale / this.#scale);
      pixel = intervalPixel * this.#scale;
    }

    offset = Math.ceil(offset / this.#scale);
    const is_offset_negative = offset < 0;
    const abs_offset = Math.abs(offset);
    long_size = long_size + (is_offset_negative ? abs_offset : -offset);

    const scales: {
      sum: number;
      i: number;
      size: 'max' | 'min' | 'else';
      pixel: number;
    }[] = [];
    let _pixel = 0;
    let scaleCount = 0;
    for (let i = 0; i < long_size; i++) {
      const prev_scale = scales[scales.length - 1]?.i || 0;
      if (intervalPixel + prev_scale === i || prev_scale === 0) {
        scales.push({
          sum: i,
          i: i,
          size:
            scaleCount % scale === 0 || scale === 1
              ? 'max'
              : scale % 2 === 0 && scaleCount % Math.ceil(scale / 2) === 0
              ? 'min'
              : 'else',
          pixel: _pixel
        });
        _pixel += pixel;
        scaleCount++;
      }
    }

    if (!is_offset_negative) {
      let _pixel = 0;
      let scaleCount = 0;
      for (let i = 0; i < abs_offset; i++) {
        const prev_scale = scales[0]?.i || 0;
        if (-intervalPixel + prev_scale === -i || prev_scale === 0) {
          scales.unshift({
            sum: -i,
            i: -i,
            size:
              scaleCount % scale === 0 || scale === 1
                ? 'max'
                : scale % 2 === 0 && scaleCount % Math.ceil(scale / 2) === 0
                ? 'min'
                : 'else',
            pixel: _pixel
          });
          _pixel -= pixel;
          scaleCount--;
        }
      }
    }

    return scales;
  }

  #getLineRect(
    pixel: number,
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
      start: offset + pixel,
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

      const scales = this.#getScales(
        config.long_size,
        config.intervalPixel,
        this.#translate.y + this.#scaleTranslate.y
      );
      for (let idx = 0; idx < scales.length; idx++) {
        const scale = scales[idx];
        const lineRect = this.#getLineRect(scale.pixel, this.#translate.y + this.#scaleTranslate.y);
        const x = lineRect.lineStart;
        const y = lineRect.start;
        const x2 = lineRect.deputyLineEnd;
        const x2_max = lineRect.lineEnd;

        ctx.beginPath();
        ctx.moveTo(x, y);
        if (scale.size === 'max') {
          ctx.lineWidth = config.lineWidth;
          ctx.fillStyle = config.color;
          ctx.lineTo(x2_max, y);

          if (scale.pixel !== 0) {
            const scaleNumber = String(scale.sum);
            const tx = parseFloat(config.fontSize),
              ty = y - config.textTranslateLeft;
            ctx.translate(tx, ty);
            ctx.rotate((-90 * Math.PI) / 180);
            ctx.fillText(scaleNumber, 0, config.textTranslateTop);
            ctx.rotate((90 * Math.PI) / 180);
            ctx.translate(-tx, -ty);
          }
        } else if (scale.size === 'min') {
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

      const scales = this.#getScales(
        config.long_size,
        config.intervalPixel,
        this.#translate.x + this.#scaleTranslate.x
      );
      for (let idx = 0; idx < scales.length; idx++) {
        const scale = scales[idx];

        const lineRect = this.#getLineRect(scale.pixel, this.#translate.x + this.#scaleTranslate.x);
        const x = lineRect.start;
        const y = lineRect.lineStart;
        const y2 = lineRect.deputyLineEnd;
        const y2_max = lineRect.lineEnd;

        ctx.beginPath();
        ctx.moveTo(x, y);
        if (scale.size === 'max') {
          ctx.lineWidth = config.lineWidth;
          ctx.fillStyle = config.color;
          ctx.lineTo(x, y2_max);
          if (scale.pixel !== 0) {
            const scaleNumber = String(scale.sum);
            ctx.fillText(
              scaleNumber,
              x + config.textTranslateLeft,
              parseFloat(config.fontSize) + config.textTranslateTop
            );
          }
        } else if (scale.size === 'min') {
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

  setRulerScale(scale: number) {
    this.#setRulerScale(scale);
  }
  #setRulerScale(scale: number) {
    this.#scale = scale;
    this.#draw();
  }

  setRulerScaleTranslate(pos: RulerPos) {
    this.#setRulerScaleTranslate(pos);
  }
  #setRulerScaleTranslate(pos: RulerPos) {
    this.#scaleTranslate.x = pos.x;
    this.#scaleTranslate.y = pos.y;
    this.#draw();
  }

  setRulerScaleTranslateDelta(pos: RulerPos) {
    this.#setRulerScaleTranslateDelta(pos);
  }
  #setRulerScaleTranslateDelta(pos: RulerPos) {
    this.#scaleTranslate.x += pos.x;
    this.#scaleTranslate.y += pos.y;
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
