import { nextTick } from 'vue';
import { cloneDeep } from 'lodash';
class Ruler {
  #config: Readonly<RulerConfig> = {
    textTranslateLeft: 0,
    textMargin: [3, 0, 7, 0],
    border: '1px solid #212121',
    background: '#303030',
    color: '#6f6f6f',
    lineColor: '#6f6f6f',
    lineWidth: 1,
    deputyLineWidth: 0.5,
    fontSize: '9px'
  };
  #setting: Readonly<Required<RulerSetting>> = {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    size: 18
  };
  #parentEl?: Element | null;
  #rulerXEl?: HTMLCanvasElement;
  #rulerYEl?: HTMLCanvasElement;
  #rulerRectEl?: HTMLDivElement;
  #resizeObserver?: ResizeObserver;
  #pos = { x: 0, y: 0 };
  #scaleOffset = { x: 0, y: 0 };
  #scale = 1;
  constructor() {
    this.addRuler = this.addRuler.bind(this);
    this.setRulerPos = this.setRulerPos.bind(this);
    this.setRulerScale = this.setRulerScale.bind(this);
    this.setRulerScaleOffset = this.setRulerScaleOffset.bind(this);
    this.setRulerScaleOffsetDelta = this.setRulerScaleOffsetDelta.bind(this);
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
    this.#drawRect();
  }

  #getStepByZoom(zoom: number) {
    const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
    const step = 50 / zoom;
    for (let i = 0, len = steps.length; i < len; i++) {
      if (steps[i] >= step) return steps[i];
    }
    return steps[0];
  }

  #getScales(long_size: number, offset: number) {
    const step = this.#getStepByZoom(this.#scale);
    const fontSize = parseFloat(this.#config.fontSize);
    const scales: {
      number: number;
      numberOffset: number;
      opacity: string;
      size: 'max' | 'min' | 'else';
      pixel: number;
    }[] = [];

    if (this.#scale <= 1) {
      long_size = Math.ceil(long_size / this.#scale);
      offset = Math.ceil(offset / this.#scale);
    }

    let currentStep = 0;
    while (currentStep <= long_size) {
      scales.push({
        number: currentStep,
        numberOffset: getNumberOffset(currentStep, fontSize),
        opacity: '',
        size: 'max',
        pixel: currentStep * this.#scale
      });
      currentStep = currentStep + step;
    }

    const is_offset_negative = offset > 0;
    if (is_offset_negative) {
      let currentStep = 0;
      while (currentStep >= -offset) {
        scales.push({
          number: currentStep,
          numberOffset: getNumberOffset(currentStep, fontSize),
          opacity: '',
          size: 'max',
          pixel: currentStep * this.#scale
        });
        currentStep = currentStep - step;
      }
    }

    function getNumberOffset(number: number, fontSize: number) {
      const textOffsets: { [key: string]: number } = {
        '-': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 2,
        '6': 0,
        '7': 0,
        '8': 0,
        '9': 0,
        '0': 2
      };
      let textOffset = 0;

      for (const text of number + '') {
        textOffset += fontSize / 2 - textOffsets[text];
      }
      return -textOffset;
    }

    scales[scales.length - 1].opacity = '80';
    return scales;
  }

  #getLineRect(pixel: number, offset: number) {
    const config = {
      ...this.#config,
      fontSize: parseFloat(this.#config.fontSize)
    };
    return {
      start: offset + pixel - this.#setting.size,
      lineStart: this.#setting.size,
      lineEnd: this.#setting.size - config.fontSize + this.#config.textMargin[2],
      deputyLineEnd: this.#setting.size - config.fontSize + this.#config.textMargin[2]
    };
  }

  #drawX(rect: RulerDOMRect) {
    const config = cloneDeep({
      ...this.#config,
      width: this.#setting.size,
      height: rect.height - this.#setting.size,
      long_size: rect.height
    });

    if (!this.#rulerXEl) return;
    this.#updateRulerStyle(
      {
        width: config.width,
        height: config.height,
        top: this.#setting.size + this.#setting.top,
        left: this.#setting.left
      },
      this.#rulerXEl,
      'X'
    );

    nextTick(() => {
      if (!this.#rulerXEl) return;
      const ctx = this.#rulerXEl.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, config.width, config.height);
      ctx.font = config.fontSize + 'Microsoft YaHei';

      const scales = this.#getScales(config.long_size, this.#pos.y + this.#scaleOffset.y);
      for (let idx = 0; idx < scales.length; idx++) {
        const scale = scales[idx];
        const lineRect = this.#getLineRect(scale.pixel, this.#pos.y + this.#scaleOffset.y);
        const x = lineRect.lineStart;
        const y = lineRect.start;
        const x2 = lineRect.deputyLineEnd;
        const x2_max = lineRect.lineEnd;

        ctx.beginPath();
        ctx.moveTo(x, y);
        if (scale.size === 'max') {
          ctx.lineWidth = config.lineWidth;
          ctx.fillStyle = config.color + scale.opacity;
          ctx.strokeStyle = config.lineColor + scale.opacity;
          ctx.lineTo(x2_max, y);

          const scaleNumber = String(scale.number);
          const tx = parseFloat(config.fontSize),
            ty = y - config.textTranslateLeft - scale.numberOffset;
          ctx.translate(tx, ty);
          ctx.rotate((-90 * Math.PI) / 180);
          ctx.fillText(scaleNumber, 0, config.textMargin[0]);
          ctx.rotate((90 * Math.PI) / 180);
          ctx.translate(-tx, -ty);
        } else if (scale.size === 'min') {
          ctx.lineWidth = config.lineWidth;
          ctx.strokeStyle = config.lineColor + scale.opacity;
          ctx.lineTo(x2, y);
        } else {
          ctx.lineWidth = config.deputyLineWidth;
          ctx.strokeStyle = config.lineColor + scale.opacity;
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
      width: rect.width - this.#setting.size,
      height: this.#setting.size,
      long_size: rect.width
    });

    if (!this.#rulerYEl) return;
    this.#updateRulerStyle(
      {
        width: config.width,
        height: config.height,
        top: this.#setting.top,
        left: this.#setting.size + this.#setting.left
      },
      this.#rulerYEl,
      'Y'
    );

    nextTick(() => {
      if (!this.#rulerYEl) return;
      const ctx = this.#rulerYEl.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, config.width, config.height);
      ctx.font = config.fontSize + 'Microsoft YaHei';

      const scales = this.#getScales(config.long_size, this.#pos.x + this.#scaleOffset.x);
      for (let idx = 0; idx < scales.length; idx++) {
        const scale = scales[idx];

        const lineRect = this.#getLineRect(scale.pixel, this.#pos.x + this.#scaleOffset.x);
        const x = lineRect.start;
        const y = lineRect.lineStart;
        const y2 = lineRect.deputyLineEnd;
        const y2_max = lineRect.lineEnd;

        ctx.beginPath();
        ctx.moveTo(x, y);
        if (scale.size === 'max') {
          ctx.lineWidth = config.lineWidth;
          ctx.fillStyle = config.color + scale.opacity;
          ctx.strokeStyle = config.lineColor + scale.opacity;
          ctx.lineTo(x, y2_max);

          const scaleNumber = String(scale.number);
          ctx.fillText(
            scaleNumber,
            x + scale.numberOffset + config.textTranslateLeft,
            parseFloat(config.fontSize) + config.textMargin[0]
          );
        } else if (scale.size === 'min') {
          ctx.lineWidth = config.lineWidth;
          ctx.strokeStyle = config.lineColor + scale.opacity;
          ctx.lineTo(x, y2);
        } else {
          ctx.lineWidth = config.deputyLineWidth;
          ctx.strokeStyle = config.lineColor + scale.opacity;
          ctx.lineTo(x, y2);
        }
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  #drawRect() {
    if (!this.#rulerRectEl) return;
    const config = {
      width: this.#setting.size + 1,
      height: this.#setting.size + 1,
      top: this.#setting.top,
      left: this.#setting.left
    };

    const el = this.#rulerRectEl;
    el.style.position = 'absolute';
    el.style.borderRight = this.#config.border;
    el.style.borderBottom = this.#config.border;
    el.style.backgroundColor = this.#config.background;
    el.style.left = (config.left || 0) + 'px';
    el.style.top = (config.top || 0) + 'px';
    el.style.width = (config.width || 0) + 'px';
    el.style.height = (config.height || 0) + 'px';
  }

  #updateRulerStyle(
    config: { left: number; top: number; height: number; width: number },
    el: HTMLCanvasElement,
    type: string
  ) {
    if (!el) return;
    if (type === 'Y') {
      el.style.borderBottom = this.#config.border;
    } else if (type === 'X') {
      el.style.borderRight = this.#config.border;
    }

    el.style.boxSizing = 'border-box';
    el.style.backgroundColor = this.#config.background;
    el.style.position = 'absolute';
    el.style.left = (config.left || 0) + 'px';
    el.style.top = (config.top || 0) + 'px';
    el.width = config.width || 0;
    el.height = config.height || 0;
  }

  #onResize = (_event?: Event | ResizeObserverEntry[]) => {
    this.#draw();
  };

  setRulerPos(pos: RulerPos) {
    this.#setRulerPos(pos);
  }
  #setRulerPos(pos: RulerPos) {
    this.#pos.x = pos.x;
    this.#pos.y = pos.y;
    this.#draw();
  }

  setRulerScale(scale: number) {
    this.#setRulerScale(scale);
  }
  #setRulerScale(scale: number) {
    this.#scale = scale;
    this.#draw();
  }

  setRulerScaleOffset(pos: RulerPos) {
    this.#setRulerScaleOffset(pos);
  }
  #setRulerScaleOffset(pos: RulerPos) {
    this.#scaleOffset.x = pos.x;
    this.#scaleOffset.y = pos.y;
    this.#draw();
  }

  setRulerScaleOffsetDelta(pos: RulerPos) {
    this.#setRulerScaleOffsetDelta(pos);
  }
  #setRulerScaleOffsetDelta(pos: RulerPos) {
    this.#scaleOffset.x += pos.x;
    this.#scaleOffset.y += pos.y;
    this.#draw();
  }

  addRuler(parentEl: Element | string, setting?: RulerSetting): void {
    this.#addRuler(parentEl, setting);
  }
  #addRuler(parentEl: Element | string, setting?: RulerSetting): void {
    this.#setting = Object.assign(this.#setting, setting || {});

    this.#parentEl = typeof parentEl === 'string' ? document.querySelector(parentEl) : parentEl;
    this.#rulerYEl = document.createElement('canvas');
    this.#rulerXEl = document.createElement('canvas');
    this.#rulerRectEl = document.createElement('div');

    if (this.#parentEl) {
      this.#parentEl.appendChild(this.#rulerYEl);
      this.#parentEl.appendChild(this.#rulerXEl);
      this.#parentEl.appendChild(this.#rulerRectEl);

      this.#resizeObserver = new ResizeObserver(() => {
        this.#draw();
      });
      this.#resizeObserver.observe(this.#parentEl);
    }
    this.#draw();

    window.addEventListener('resize', this.#onResize);
  }

  uninstall(): void {
    this.#uninstall();
  }
  #uninstall(): void {
    window.removeEventListener('resize', this.#onResize);
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;
    this.#rulerXEl?.remove();
    this.#rulerYEl?.remove();
    this.#rulerRectEl?.remove();
    this.#rulerYEl = undefined;
    this.#rulerXEl = undefined;
    this.#rulerRectEl = undefined;
  }
}

let ruler: Ruler | undefined;
const createRuler = function () {
  if (!ruler) ruler = new Ruler();
  return ruler;
};

export const removeRuler = function () {
  ruler?.uninstall();
  ruler = undefined;
};

export const useRuler = function () {
  ruler = createRuler();
  return ruler;
};
