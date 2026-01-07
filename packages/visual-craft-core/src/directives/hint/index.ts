import type { App, Directive, DirectiveBinding } from 'vue';

type HintBindingValue =
  | string
  | {
      content?: string;
      delay?: number;
    };

type HintState = {
  el: HTMLElement;
  getContent: () => string;
  getDelay: () => number;
  tipEl: HTMLDivElement;
  contentEl: HTMLDivElement;
  arrowEl: HTMLDivElement;
  timer?: number;
  shown: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onUpdatePosition: () => void;
  cleanup: () => void;
};

const hintData = new WeakMap<HTMLElement, HintState>();

function normalizeBinding(binding: DirectiveBinding<HintBindingValue>) {
  const raw = binding.value;
  if (typeof raw === 'string') {
    return { content: raw, delay: 120 };
  }
  return { content: raw?.content ?? '', delay: raw?.delay ?? 120 };
}

function createTipEl(): { tipEl: HTMLDivElement; contentEl: HTMLDivElement; arrowEl: HTMLDivElement } {
  const tipEl = document.createElement('div');
  tipEl.style.position = 'fixed';
  tipEl.style.zIndex = '9999';
  tipEl.style.filter = 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.28))';
  tipEl.style.pointerEvents = 'none';
  tipEl.style.display = 'none';

  const arrowEl = document.createElement('div');
  arrowEl.style.position = 'absolute';
  arrowEl.style.top = '-5px';
  arrowEl.style.width = '0';
  arrowEl.style.height = '0';
  arrowEl.style.borderLeft = '5px solid transparent';
  arrowEl.style.borderRight = '5px solid transparent';
  arrowEl.style.borderBottom = '5px solid rgba(0, 0, 0, 0.82)';
  arrowEl.style.transform = 'translateX(-50%)';

  const contentEl = document.createElement('div');
  contentEl.style.background = 'rgba(0, 0, 0, 0.82)';
  contentEl.style.color = '#fff';
  contentEl.style.borderRadius = '4px';
  contentEl.style.padding = '4px 8px';
  contentEl.style.fontSize = '11px';
  contentEl.style.fontWeight = '600';
  contentEl.style.lineHeight = '1.1';
  contentEl.style.letterSpacing = '0.2px';
  contentEl.style.whiteSpace = 'nowrap';

  tipEl.appendChild(arrowEl);
  tipEl.appendChild(contentEl);

  return { tipEl, contentEl, arrowEl };
}

function updatePosition(state: HintState) {
  const rect = state.el.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const nextTop = rect.bottom + 6;
  const padding = 8;
  const tipWidth = state.tipEl.offsetWidth;

  const clampedCenterX = Math.max(
    padding + tipWidth / 2,
    Math.min(centerX, window.innerWidth - padding - tipWidth / 2)
  );
  const leftEdge = clampedCenterX - tipWidth / 2;
  const arrowPadding = 10;
  const arrowX = centerX - leftEdge;
  const clampedArrowX = Math.max(arrowPadding, Math.min(arrowX, tipWidth - arrowPadding));

  state.tipEl.style.left = `${clampedCenterX}px`;
  state.tipEl.style.top = `${nextTop}px`;
  state.tipEl.style.transform = 'translateX(-50%)';
  state.arrowEl.style.left = `${clampedArrowX}px`;
}

export const hintDirective: Directive<HTMLElement, HintBindingValue> = {
  mounted: (el: HTMLElement, binding: DirectiveBinding<HintBindingValue>): void => {
    const { tipEl, contentEl, arrowEl } = createTipEl();
    document.body.appendChild(tipEl);

    const state: HintState = {
      el,
      tipEl,
      contentEl,
      arrowEl,
      timer: undefined,
      shown: false,
      getContent: () => normalizeBinding(binding).content.trim(),
      getDelay: () => normalizeBinding(binding).delay,
      onUpdatePosition: () => {
        if (!state.shown) return;
        updatePosition(state);
      },
      onEnter: () => {
        const content = state.getContent();
        if (!content) return;
        window.clearTimeout(state.timer);
        state.timer = window.setTimeout(() => {
          const next = state.getContent();
          if (!next) return;
          state.tipEl.style.display = 'block';
          state.shown = true;
          state.contentEl.textContent = next;
          updatePosition(state);
        }, state.getDelay());
      },
      onLeave: () => {
        window.clearTimeout(state.timer);
        state.tipEl.style.display = 'none';
        state.shown = false;
      },
      cleanup: () => {
        window.clearTimeout(state.timer);
        state.tipEl.remove();
        state.el.removeEventListener('mouseenter', state.onEnter);
        state.el.removeEventListener('mouseleave', state.onLeave);
        window.removeEventListener('resize', state.onUpdatePosition);
        window.removeEventListener('scroll', state.onUpdatePosition, true);
      }
    };

    el.addEventListener('mouseenter', state.onEnter);
    el.addEventListener('mouseleave', state.onLeave);
    window.addEventListener('resize', state.onUpdatePosition);
    window.addEventListener('scroll', state.onUpdatePosition, true);

    hintData.set(el, state);
  },
  updated: (el: HTMLElement, binding: DirectiveBinding<HintBindingValue>) => {
    const state = hintData.get(el);
    if (!state) return;

    const { content } = normalizeBinding(binding);
    const next = content.trim();
    if (!next) {
      state.onLeave();
      return;
    }
    if (state.shown) {
      state.contentEl.textContent = next;
      updatePosition(state);
    }
  },
  beforeUnmount: (el: HTMLElement): void => {
    const state = hintData.get(el);
    state?.cleanup();
    hintData.delete(el);
  }
};

export default {
  install(app: App<Element>): void {
    app.directive('hint', hintDirective);
  }
};
