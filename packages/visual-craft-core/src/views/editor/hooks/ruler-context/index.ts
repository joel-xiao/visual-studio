import { watch, type Ref } from 'vue';

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
  #selection: { x: number; y: number; width: number; height: number }[] = [];
  #parentSize = { width: 0, height: 0 };

  #isDirty = false;
  #rafId: number | null = null;
  #dpr = window.devicePixelRatio || 1;
  #stopSelectionWatch: (() => void) | null = null;

  constructor() {
    this.addRuler = this.addRuler.bind(this);
    this.setRulerPos = this.setRulerPos.bind(this);
    this.setRulerScale = this.setRulerScale.bind(this);
    this.setRulerScaleOffset = this.setRulerScaleOffset.bind(this);
    this.setRulerScaleOffsetDelta = this.setRulerScaleOffsetDelta.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.setSelectionSync = this.setSelectionSync.bind(this);
  }

  #scheduleDraw() {
    if (this.#isDirty) return;
    this.#isDirty = true;
    this.#rafId = requestAnimationFrame(() => {
      this.#draw();
      this.#isDirty = false;
      this.#rafId = null;
    });
  }

  #draw() {
    if (!this.#parentEl) return;

    const width = this.#parentSize.width - (this.#setting.left + this.#setting.right);
    const height = this.#parentSize.height - (this.#setting.top + this.#setting.bottom);

    if (width <= 0 || height <= 0) return;

    this.#drawX(height);
    this.#drawY(width);
    this.#drawRect();
  }

  #getStepByZoom(zoom: number) {
    const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    const step = 50 / zoom;
    for (const s of steps) {
      if (s >= step) return s;
    }
    return steps[steps.length - 1];
  }

  #drawX(totalHeight: number) {
    if (!this.#rulerXEl) return;
    const canvas = this.#rulerXEl;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rulerSize = this.#setting.size;
    const canvasWidth = rulerSize;
    const canvasHeight = totalHeight - rulerSize;

    // Handle High DPI
    if (canvas.width !== canvasWidth * this.#dpr || canvas.height !== canvasHeight * this.#dpr) {
      canvas.width = canvasWidth * this.#dpr;
      canvas.height = canvasHeight * this.#dpr;
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';
      canvas.style.top = (rulerSize + this.#setting.top) + 'px';
      canvas.style.left = this.#setting.left + 'px';
      canvas.style.borderRight = this.#config.border;
    }

    ctx.save();
    ctx.scale(this.#dpr, this.#dpr);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = this.#config.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const offsetY = this.#pos.y + this.#scaleOffset.y;
    const startValue = -offsetY / this.#scale;
    const endValue = (canvasHeight - offsetY) / this.#scale;
    const step = this.#getStepByZoom(this.#scale);

    ctx.font = `10px ${this.#config.background === '#303030' ? 'Inter, sans-serif' : 'sans-serif'}`;
    ctx.fillStyle = this.#config.color;
    ctx.strokeStyle = this.#config.lineColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const majorStep = step;
    const minorStep = majorStep / 10;

    const startIdx = Math.floor(startValue / minorStep);
    const endIdx = Math.ceil(endValue / minorStep);

    // 1. Draw selection background first
    this.#selection.forEach(node => {
      const top = (node.y * this.#scale) + offsetY - rulerSize;
      const bottom = ((node.y + node.height) * this.#scale) + offsetY - rulerSize;
      if (bottom < 0 || top > canvasHeight) return;

      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(0, top, canvasWidth, bottom - top);
    });

    // 2. Draw default scales
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.#config.lineColor;
    ctx.fillStyle = this.#config.color; // Reset to default color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = startIdx; i <= endIdx; i++) {
      const val = i * minorStep;
      const y = val * this.#scale + offsetY - rulerSize;
      if (y < 0 || y > canvasHeight) continue;

      const isMajor = i % 10 === 0;
      const isSemi = i % 5 === 0;

      ctx.beginPath();
      ctx.moveTo(canvasWidth, y);

      if (isMajor) {
        ctx.globalAlpha = 1;
        ctx.lineTo(canvasWidth - 4, y);

        ctx.save();
        ctx.translate(canvasWidth / 2 - 3, y);
        ctx.rotate(-Math.PI / 2);
        const label = Math.abs(val) < 1 ? val.toFixed(1) : String(Math.round(val));
        ctx.fillText(label, 0, 0);
        ctx.restore();
      } else if (isSemi) {
        ctx.globalAlpha = 0.6;
        ctx.lineTo(canvasWidth - 3, y);
      } else {
        ctx.globalAlpha = 0.3;
        ctx.lineTo(canvasWidth - 2, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 3. Draw selection labels on top
    this.#selection.forEach(node => {
      const top = (node.y * this.#scale) + offsetY - rulerSize;
      const bottom = ((node.y + node.height) * this.#scale) + offsetY - rulerSize;
      if (bottom < 0 || top > canvasHeight) return;

      const drawLabel = (val: number, pos: number) => {
        ctx.save();
        const text = Number.isInteger(val) ? String(val) : String(Number(val.toFixed(1)));
        ctx.font = '10px Inter, sans-serif';
        const metrics = ctx.measureText(text);
        const labelWidth = metrics.width + 12;

        ctx.translate(0, pos); // Translate to the left edge of vertical ruler
        ctx.rotate(-Math.PI / 2);

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(-labelWidth / 2, 0, labelWidth, canvasWidth); // Fill from left to right

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, canvasWidth / 2);
        ctx.restore();
      };

      drawLabel(node.y, top);
      drawLabel(node.y + node.height, bottom);
    });
    ctx.globalAlpha = 1;
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  #drawY(totalWidth: number) {
    if (!this.#rulerYEl) return;
    const canvas = this.#rulerYEl;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rulerSize = this.#setting.size;
    const canvasWidth = totalWidth - rulerSize;
    const canvasHeight = rulerSize;

    // Handle High DPI
    if (canvas.width !== canvasWidth * this.#dpr || canvas.height !== canvasHeight * this.#dpr) {
      canvas.width = canvasWidth * this.#dpr;
      canvas.height = canvasHeight * this.#dpr;
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';
      canvas.style.top = this.#setting.top + 'px';
      canvas.style.left = (rulerSize + this.#setting.left) + 'px';
      canvas.style.borderBottom = this.#config.border;
    }

    ctx.save();
    ctx.scale(this.#dpr, this.#dpr);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = this.#config.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const offsetX = this.#pos.x + this.#scaleOffset.x;
    const startValue = -offsetX / this.#scale;
    const endValue = (canvasWidth - offsetX) / this.#scale;
    const step = this.#getStepByZoom(this.#scale);

    ctx.font = `10px ${this.#config.background === '#303030' ? 'Inter, sans-serif' : 'sans-serif'}`;
    ctx.fillStyle = this.#config.color;
    ctx.strokeStyle = this.#config.lineColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const majorStep = step;
    const minorStep = majorStep / 10;

    const startIdx = Math.floor(startValue / minorStep);
    const endIdx = Math.ceil(endValue / minorStep);

    const labelYTranslate = canvasHeight / 2 - 2;

    // 1. Draw selection background
    this.#selection.forEach(node => {
      const left = (node.x * this.#scale) + offsetX - rulerSize;
      const right = ((node.x + node.width) * this.#scale) + offsetX - rulerSize;
      if (right < 0 || left > canvasWidth) return;

      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(left, 0, right - left, canvasHeight);
    });

    // 2. Draw default scales
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.#config.lineColor;
    ctx.fillStyle = this.#config.color; // Reset to default color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = startIdx; i <= endIdx; i++) {
      const val = i * minorStep;
      const x = val * this.#scale + offsetX - rulerSize;
      if (x < 0 || x > canvasWidth) continue;

      const isMajor = i % 10 === 0;
      const isSemi = i % 5 === 0;

      ctx.beginPath();
      ctx.moveTo(x, canvasHeight);

      if (isMajor) {
        ctx.globalAlpha = 1;
        ctx.lineTo(x, canvasHeight - 4);
        const label = Math.abs(val) < 1 ? val.toFixed(1) : String(Math.round(val));
        ctx.fillText(label, x, labelYTranslate);
      } else if (isSemi) {
        ctx.globalAlpha = 0.6;
        ctx.lineTo(x, canvasHeight - 3);
      } else {
        ctx.globalAlpha = 0.3;
        ctx.lineTo(x, canvasHeight - 2);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 3. Draw selection labels on top
    this.#selection.forEach(node => {
      const left = (node.x * this.#scale) + offsetX - rulerSize;
      const right = ((node.x + node.width) * this.#scale) + offsetX - rulerSize;
      if (right < 0 || left > canvasWidth) return;

      const drawLabel = (val: number, pos: number) => {
        ctx.save();
        const text = Number.isInteger(val) ? String(val) : String(Number(val.toFixed(1)));
        ctx.font = '10px Inter, sans-serif';
        const metrics = ctx.measureText(text);
        const labelWidth = metrics.width + 12;

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(pos - labelWidth / 2, 0, labelWidth, canvasHeight);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, pos, canvasHeight / 2);
        ctx.restore();
      };

      drawLabel(node.x, left);
      drawLabel(node.x + node.width, right);
    });
    ctx.globalAlpha = 1;
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  #drawRect() {
    if (!this.#rulerRectEl) return;
    const el = this.#rulerRectEl;
    const size = this.#setting.size;

    el.style.position = 'absolute';
    el.style.borderRight = this.#config.border;
    el.style.borderBottom = this.#config.border;
    el.style.backgroundColor = this.#config.background;
    el.style.left = this.#setting.left + 'px';
    el.style.top = this.#setting.top + 'px';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.zIndex = '100';
  }

  setRulerPos(pos: RulerPos) {
    this.#pos.x = pos.x;
    this.#pos.y = pos.y;
    this.#scheduleDraw();
  }

  setRulerScale(scale: number) {
    this.#scale = scale;
    this.#scheduleDraw();
  }

  setRulerScaleOffset(pos: RulerPos) {
    this.#scaleOffset.x = pos.x;
    this.#scaleOffset.y = pos.y;
    this.#scheduleDraw();
  }

  setRulerScaleOffsetDelta(pos: RulerPos) {
    this.#scaleOffset.x += pos.x;
    this.#scaleOffset.y += pos.y;
    this.#scheduleDraw();
  }

  setSelection(selection: { x: number; y: number; width: number; height: number }[]) {
    this.#selection = selection;
    this.#scheduleDraw();
  }

  setSelectionSync(selectedNodes: Ref<readonly { id: string; x: number; y: number; width: number; height: number }[]>) {
    this.#stopSelectionWatch?.();
    this.#stopSelectionWatch = watch(
      () => selectedNodes.value,
      (nodes: readonly { id: string; x: number; y: number; width: number; height: number }[]) => {
        const selection = nodes
          .filter(n => n.id !== 'root')
          .map(n => ({
            x: n.x,
            y: n.y,
            width: n.width,
            height: n.height
          }));
        this.setSelection(selection);
      },
      { deep: true }
    );
  }

  addRuler(parentEl: Element | string, setting?: RulerSetting): void {
    this.#setting = Object.assign({}, this.#setting, setting || {});
    this.#parentEl = typeof parentEl === 'string' ? document.querySelector(parentEl) : parentEl;

    if (!this.#parentEl) return;

    this.#rulerYEl = document.createElement('canvas');
    this.#rulerXEl = document.createElement('canvas');
    this.#rulerRectEl = document.createElement('div');

    this.#rulerYEl.style.position = 'absolute';
    this.#rulerXEl.style.position = 'absolute';
    this.#rulerRectEl.style.position = 'absolute';

    this.#parentEl.appendChild(this.#rulerYEl);
    this.#parentEl.appendChild(this.#rulerXEl);
    this.#parentEl.appendChild(this.#rulerRectEl);

    const updateSize = () => {
      const rect = (this.#parentEl as Element).getBoundingClientRect();
      this.#parentSize.width = rect.width;
      this.#parentSize.height = rect.height;
      this.#scheduleDraw();
    };

    this.#resizeObserver = new ResizeObserver(updateSize);
    this.#resizeObserver.observe(this.#parentEl);

    updateSize();
    window.addEventListener('resize', updateSize);
  }

  uninstall(): void {
    window.removeEventListener('resize', this.#scheduleDraw.bind(this));
    this.#resizeObserver?.disconnect();
    if (this.#rafId) cancelAnimationFrame(this.#rafId);
    this.#stopSelectionWatch?.();
    this.#stopSelectionWatch = null;

    this.#rulerXEl?.remove();
    this.#rulerYEl?.remove();
    this.#rulerRectEl?.remove();

    this.#parentEl = null;
    this.#rulerXEl = undefined;
    this.#rulerYEl = undefined;
    this.#rulerRectEl = undefined;
  }
}

let ruler: Ruler | undefined;
export const useRuler = function () {
  if (!ruler) ruler = new Ruler();
  return ruler;
};

export const removeRuler = function () {
  ruler?.uninstall();
  ruler = undefined;
};
