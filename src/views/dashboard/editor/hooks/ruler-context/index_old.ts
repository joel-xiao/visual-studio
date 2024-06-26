// import { Ref, nextTick } from 'vue';
// import { cloneDeep } from 'lodash';

// class Ruler {
//   #config: Readonly<RulerConfig> = {
//     intervalPixel: 5,
//     scale: 20,
//     textTranslateLeft: 4,
//     textMargin: 2,
//     color: '#fff',
//     lineColor: '#fff',
//     lineWidth: 1,
//     deputyLineWidth: 0.5,
//     fontSize: '9px'
//   };
//   #setting: Readonly<Required<RulerSetting>> = { left: 0, right: 0, bottom: 0, top: 0, size: 16 };
//   #parentEl?: Element | null;
//   #rulerXEl?: HTMLCanvasElement;
//   #rulerYEl?: HTMLCanvasElement;
//   #pos = { x: 0, y: 0 };
//   #scaleOffset = { x: 0, y: 0 };
//   #scale = 1;
//   constructor() {
//     this.addRuler = this.addRuler.bind(this);
//     this.setRulerPos = this.setRulerPos.bind(this);
//     this.setRulerScale = this.setRulerScale.bind(this);
//     this.setRulerScaleOffset = this.setRulerScaleOffset.bind(this);
//     this.setRulerScaleOffsetDelta = this.setRulerScaleOffsetDelta.bind(this);
//   }

//   #draw() {
//     const rect: RulerDOMRect = this.#parentEl?.getBoundingClientRect() || {
//       width: window.innerWidth,
//       height: window.innerHeight
//     };
//     rect.width = rect.width - (this.#setting.left + this.#setting.right);
//     rect.height = rect.height - (this.#setting.top + this.#setting.bottom);

//     this.#drawX(rect);
//     this.#drawY(rect);
//   }

//   #getScales(long_size: number, intervalPixel: number, offset: number) {
//     let scale = this.#config.scale;
//     let pixel = intervalPixel;

//     if (this.#scale <= 1) {
//       long_size = Math.ceil(long_size / this.#scale);
//       scale = this.#config.scale;
//       pixel = intervalPixel;
//       intervalPixel = Math.round(intervalPixel / this.#scale);
//     } else {
//       long_size = Math.ceil(long_size * this.#scale);
//       scale = Math.ceil(this.#config.scale / this.#scale);
//       pixel = intervalPixel * this.#scale;
//     }

//     offset = Math.ceil(offset / this.#scale);
//     const is_offset_negative = offset < 0;
//     const abs_offset = Math.abs(offset);
//     long_size = long_size + (is_offset_negative ? abs_offset : -offset);

//     const scales: {
//       sum: number;
//       i: number;
//       size: 'max' | 'min' | 'else';
//       pixel: number;
//     }[] = [];
//     let _pixel = 0;
//     let scaleCount = 0;
//     for (let i = 0; i < long_size; i++) {
//       const prev_scale = scales[scales.length - 1]?.i || 0;
//       if (intervalPixel + prev_scale === i || prev_scale === 0) {
//         scales.push({
//           sum: i,
//           i: i,
//           size:
//             scaleCount % scale === 0 || scale === 1
//               ? 'max'
//               : scale % 2 === 0 && scaleCount % Math.ceil(scale / 2) === 0
//               ? 'min'
//               : 'else',
//           pixel: _pixel
//         });
//         _pixel += pixel;
//         scaleCount++;
//       }
//     }

//     if (!is_offset_negative) {
//       let _pixel = 0;
//       let scaleCount = 0;
//       for (let i = 0; i < abs_offset; i++) {
//         const prev_scale = scales[0]?.i || 0;
//         if (-intervalPixel + prev_scale === -i || prev_scale === 0) {
//           scales.unshift({
//             sum: -i,
//             i: -i,
//             size:
//               scaleCount % scale === 0 || scale === 1
//                 ? 'max'
//                 : scale % 2 === 0 && scaleCount % Math.ceil(scale / 2) === 0
//                 ? 'min'
//                 : 'else',
//             pixel: _pixel
//           });
//           _pixel -= pixel;
//           scaleCount--;
//         }
//       }
//     }

//     return scales;
//   }

//   #getLineRect(
//     pixel: number,
//     offset: number
//   ): {
//     start: number;
//     lineStart: number;
//     lineEnd: number;
//     deputyLineEnd: number;
//   } {
//     const config = {
//       ...this.#config,
//       fontSize: parseFloat(this.#config.fontSize)
//     };
//     return {
//       start: offset + pixel - this.#setting.size,
//       lineStart: this.#setting.size,
//       lineEnd: this.#setting.size - (this.#setting.size - config.fontSize / 2 - 2),
//       deputyLineEnd: this.#setting.size - (this.#setting.size - config.fontSize - 2)
//     };
//   }

//   #drawX(rect: RulerDOMRect) {
//     const config = cloneDeep({
//       ...this.#config,
//       width: this.#setting.size,
//       height: rect.height - this.#setting.size,
//       long_size: rect.height
//     });

//     if (!this.#rulerXEl) return;
//     this.#updateRulerStyle(
//       {
//         width: config.width,
//         height: config.height,
//         top: this.#setting.size + this.#setting.top,
//         left: this.#setting.left
//       },
//       this.#rulerXEl
//     );

//     nextTick(() => {
//       if (!this.#rulerXEl) return;
//       const ctx = this.#rulerXEl.getContext('2d');
//       if (!ctx) return;

//       ctx.clearRect(0, 0, config.width, config.height);
//       ctx.font = config.fontSize;

//       const scales = this.#getScales(
//         config.long_size,
//         config.intervalPixel,
//         this.#pos.y + this.#scaleOffset.y
//       );
//       for (let idx = 0; idx < scales.length; idx++) {
//         const scale = scales[idx];
//         const lineRect = this.#getLineRect(scale.pixel, this.#pos.y + this.#scaleOffset.y);
//         const x = lineRect.lineStart;
//         const y = lineRect.start;
//         const x2 = lineRect.deputyLineEnd;
//         const x2_max = lineRect.lineEnd;

//         ctx.beginPath();
//         ctx.moveTo(x, y);
//         if (scale.size === 'max') {
//           ctx.lineWidth = config.lineWidth;
//           ctx.fillStyle = config.color;
//           ctx.lineTo(x2_max, y);

//           const scaleNumber = String(scale.sum);
//           const tx = parseFloat(config.fontSize),
//             ty = y - config.textTranslateLeft;
//           ctx.translate(tx, ty);
//           ctx.rotate((-90 * Math.PI) / 180);
//           ctx.fillText(scaleNumber, 0, config.textMargin);
//           ctx.rotate((90 * Math.PI) / 180);
//           ctx.translate(-tx, -ty);
//         } else if (scale.size === 'min') {
//           ctx.lineWidth = config.lineWidth;
//           ctx.strokeStyle = config.color;
//           ctx.lineTo(x2, y);
//         } else {
//           ctx.lineWidth = config.deputyLineWidth;
//           ctx.strokeStyle = config.lineColor;
//           ctx.lineTo(x2, y);
//         }
//         ctx.stroke();
//       }
//       ctx.restore();
//     });
//   }

//   #drawY(rect: RulerDOMRect) {
//     const config = cloneDeep({
//       ...this.#config,
//       width: rect.width - this.#setting.size,
//       height: this.#setting.size,
//       long_size: rect.width
//     });

//     if (!this.#rulerYEl) return;
//     this.#updateRulerStyle(
//       {
//         width: config.width,
//         height: config.height,
//         top: this.#setting.top,
//         left: this.#setting.size + this.#setting.left
//       },
//       this.#rulerYEl
//     );

//     nextTick(() => {
//       if (!this.#rulerYEl) return;
//       const ctx = this.#rulerYEl.getContext('2d');
//       if (!ctx) return;

//       ctx.clearRect(0, 0, config.width, config.height);
//       ctx.font = config.fontSize;

//       const scales = this.#getScales(
//         config.long_size,
//         config.intervalPixel,
//         this.#pos.x + this.#scaleOffset.x
//       );
//       for (let idx = 0; idx < scales.length; idx++) {
//         const scale = scales[idx];

//         const lineRect = this.#getLineRect(scale.pixel, this.#pos.x + this.#scaleOffset.x);
//         const x = lineRect.start;
//         const y = lineRect.lineStart;
//         const y2 = lineRect.deputyLineEnd;
//         const y2_max = lineRect.lineEnd;

//         ctx.beginPath();
//         ctx.moveTo(x, y);
//         if (scale.size === 'max') {
//           ctx.lineWidth = config.lineWidth;
//           ctx.fillStyle = config.color;
//           ctx.lineTo(x, y2_max);

//           const scaleNumber = String(scale.sum);
//           ctx.fillText(
//             scaleNumber,
//             x + config.textTranslateLeft,
//             parseFloat(config.fontSize) + config.textMargin
//           );
//         } else if (scale.size === 'min') {
//           ctx.lineWidth = config.lineWidth;
//           ctx.strokeStyle = config.color;
//           ctx.lineTo(x, y2);
//         } else {
//           ctx.lineWidth = config.deputyLineWidth;
//           ctx.strokeStyle = config.lineColor;
//           ctx.lineTo(x, y2);
//         }
//         ctx.stroke();
//       }
//       ctx.restore();
//     });
//   }

//   #updateRulerStyle(
//     config: { left: number; top: number; height: number; width: number },
//     el: HTMLCanvasElement
//   ) {
//     if (!el) return;
//     el.style.position = 'absolute';
//     el.style.left = (config.left || 0) + 'px';
//     el.style.top = (config.top || 0) + 'px';
//     el.width = config.width || 0;
//     el.height = config.height || 0;
//   }

//   #onResize(event: Event): void {
//     this.#draw();
//   }

//   setRulerPos(pos: RulerPos) {
//     this.#setRulerPos(pos);
//   }
//   #setRulerPos(pos: RulerPos) {
//     this.#pos.x = pos.x;
//     this.#pos.y = pos.y;
//     this.#draw();
//   }

//   setRulerScale(scale: number) {
//     this.#setRulerScale(scale);
//   }
//   #setRulerScale(scale: number) {
//     this.#scale = scale;
//     this.#draw();
//   }

//   setRulerScaleOffset(pos: RulerPos) {
//     this.#setRulerScaleOffset(pos);
//   }
//   #setRulerScaleOffset(pos: RulerPos) {
//     this.#scaleOffset.x = pos.x;
//     this.#scaleOffset.y = pos.y;
//     this.#draw();
//   }

//   setRulerScaleOffsetDelta(pos: RulerPos) {
//     this.#setRulerScaleOffsetDelta(pos);
//   }
//   #setRulerScaleOffsetDelta(pos: RulerPos) {
//     this.#scaleOffset.x += pos.x;
//     this.#scaleOffset.y += pos.y;
//     this.#draw();
//   }

//   addRuler(parentEl: Element | string, setting?: RulerSetting): void {
//     this.#addRuler(parentEl, setting);
//   }
//   #addRuler(parentEl: Element | string, setting?: RulerSetting): void {
//     this.#setting = Object.assign(this.#setting, setting || {});

//     this.#parentEl = typeof parentEl === 'string' ? document.querySelector(parentEl) : parentEl;
//     this.#rulerYEl = document.createElement('canvas');
//     this.#rulerXEl = document.createElement('canvas');

//     if (this.#parentEl) {
//       this.#parentEl.appendChild(this.#rulerYEl);
//       this.#parentEl.appendChild(this.#rulerXEl);
//     }
//     this.#draw();

//     document.addEventListener('resize', this.#onResize);
//   }

//   uninstall(): void {
//     this.#uninstall();
//   }
//   #uninstall(): void {
//     document.removeEventListener('resize', this.#onResize);
//     this.#rulerXEl?.remove();
//     this.#rulerXEl?.remove();
//     this.#rulerYEl = undefined;
//     this.#rulerXEl = undefined;
//   }
// }

// let ruler: Ruler | undefined;
// const createRuler = function () {
//   if (!ruler) ruler = new Ruler();
//   return ruler;
// };

// export const removeRuler = function () {
//   ruler?.uninstall();
//   ruler = undefined;
// };

// export const useRuler = function () {
//   ruler = createRuler();
//   return ruler;
// };
