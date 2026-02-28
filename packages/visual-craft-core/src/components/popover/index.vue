<template>
  <div
    ref="triggerWrapperRef"
    class="vc-popover-trigger-wrapper"
    @click="onTriggerClick"
    @mouseenter="onTriggerMouseEnter"
    @mouseleave="onTriggerMouseLeave"
  >
    <slot name="trigger"></slot>
  </div>

  <Teleport :to="teleportTarget" :disabled="to === false">
    <Transition name="vc-popover">
      <div
        v-if="isVisible"
        ref="popoverRef"
        :class="['vc-popover', popoverClass]"
        :style="floatingStyle"
        @mouseenter="onPopoverMouseEnter"
        @mouseleave="onPopoverMouseLeave"
      >
        <div v-if="showArrow" ref="arrowRef" class="vc-popover-arrow" :style="arrowStyle"></div>
        <div class="vc-popover-content">
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  type CSSProperties
} from 'vue';

export type PopoverPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

export type PopoverTrigger = 'click' | 'hover' | 'manual';

const props = withDefaults(
  defineProps<{
    /** Control visibility externally (v-model:show) */
    show?: boolean;
    /** How the popover is triggered */
    trigger?: PopoverTrigger;
    /** Preferred placement */
    placement?: PopoverPlacement;
    /** Show arrow indicator */
    showArrow?: boolean;
    /** Offset [crossAxis, mainAxis] from trigger */
    offset?: [number, number];
    /** Teleport target. Set to `false` to disable teleport. */
    to?: string | HTMLElement | false;
    /** Flip to opposite side when overflowing viewport */
    flip?: boolean;
    /** Extra class for the popover element */
    popoverClass?: string;
    /** Delay before showing on hover (ms) */
    showDelay?: number;
    /** Delay before hiding on hover (ms) */
    hideDelay?: number;
  }>(),
  {
    show: undefined,
    trigger: 'click',
    placement: 'bottom',
    showArrow: true,
    offset: () => [0, 8],
    to: 'body',
    flip: true,
    popoverClass: '',
    showDelay: 0,
    hideDelay: 150
  }
);

const emit = defineEmits<{
  'update:show': [value: boolean];
}>();

// Refs
const triggerWrapperRef = ref<HTMLElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const arrowRef = ref<HTMLElement | null>(null);

const internalShow = ref(false);
const resolvedPlacement = ref<PopoverPlacement>(props.placement);

// If `show` prop is provided (controlled mode), use it; otherwise use internal state
const isVisible = computed(() => {
  return props.show !== undefined ? props.show : internalShow.value;
});

const teleportTarget = computed(() => {
  if (props.to === false) return 'body'; // Teleport disabled
  return props.to;
});

// Timers for hover delay
let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (showTimer) { clearTimeout(showTimer); showTimer = null; }
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
}

function setVisible(val: boolean) {
  internalShow.value = val;
  emit('update:show', val);
}

// Trigger handlers
function onTriggerClick() {
  if (props.trigger !== 'click') return;
  setVisible(!isVisible.value);
}

function onTriggerMouseEnter() {
  if (props.trigger !== 'hover') return;
  clearTimers();
  if (props.showDelay > 0) {
    showTimer = setTimeout(() => setVisible(true), props.showDelay);
  } else {
    setVisible(true);
  }
}

function onTriggerMouseLeave() {
  if (props.trigger !== 'hover') return;
  clearTimers();
  hideTimer = setTimeout(() => setVisible(false), props.hideDelay);
}

function onPopoverMouseEnter() {
  if (props.trigger !== 'hover') return;
  clearTimers();
}

function onPopoverMouseLeave() {
  if (props.trigger !== 'hover') return;
  clearTimers();
  hideTimer = setTimeout(() => setVisible(false), props.hideDelay);
}

// Close on outside click
function onDocumentClick(e: MouseEvent) {
  if (props.trigger !== 'click' || !isVisible.value) return;
  const target = e.target as Node;
  if (
    triggerWrapperRef.value?.contains(target) ||
    popoverRef.value?.contains(target)
  ) {
    return;
  }
  setVisible(false);
}

// ---- Positioning Logic ----

const floatingStyle = ref<CSSProperties>({});
const arrowStyle = ref<CSSProperties>({});

const ARROW_SIZE = 8; // px, half-diagonal of the arrow square

/**
 * Parse placement into { side, alignment }
 */
function parsePlacement(p: PopoverPlacement) {
  const parts = p.split('-');
  return {
    side: parts[0] as 'top' | 'bottom' | 'left' | 'right',
    alignment: (parts[1] || 'center') as 'start' | 'end' | 'center'
  };
}

function getOppositeSide(side: string): 'top' | 'bottom' | 'left' | 'right' {
  const map: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
    top: 'bottom', bottom: 'top', left: 'right', right: 'left'
  };
  return map[side];
}

function updatePosition() {
  const triggerEl = triggerWrapperRef.value;
  const popoverEl = popoverRef.value;
  if (!triggerEl || !popoverEl) return;

  const triggerRect = triggerEl.getBoundingClientRect();
  // Use offsetWidth/offsetHeight — these are NOT affected by CSS transforms (scale),
  // unlike getBoundingClientRect() which returns scaled dimensions.
  const popoverW = popoverEl.offsetWidth;
  const popoverH = popoverEl.offsetHeight;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const [crossOffset, mainOffset] = props.offset;

  let { side, alignment } = parsePlacement(props.placement);

  // Flip logic
  if (props.flip) {
    const spaceMap = {
      top: triggerRect.top,
      bottom: viewportH - triggerRect.bottom,
      left: triggerRect.left,
      right: viewportW - triggerRect.right
    };

    const needed = (side === 'top' || side === 'bottom') ? popoverH + mainOffset : popoverW + mainOffset;
    if (spaceMap[side] < needed && spaceMap[getOppositeSide(side)] > needed) {
      side = getOppositeSide(side);
    }
  }

  // Resolved placement string
  const rp = alignment === 'center' ? side : `${side}-${alignment}`;
  resolvedPlacement.value = rp as PopoverPlacement;

  // Compute position
  let top = 0;
  let left = 0;

  // Main axis
  switch (side) {
    case 'bottom':
      top = triggerRect.bottom + mainOffset;
      break;
    case 'top':
      top = triggerRect.top - popoverH - mainOffset;
      break;
    case 'right':
      left = triggerRect.right + mainOffset;
      break;
    case 'left':
      left = triggerRect.left - popoverW - mainOffset;
      break;
  }

  // Cross axis
  if (side === 'top' || side === 'bottom') {
    switch (alignment) {
      case 'start':
        left = triggerRect.left + crossOffset;
        break;
      case 'end':
        left = triggerRect.right - popoverW - crossOffset;
        break;
      default: // center
        left = triggerRect.left + (triggerRect.width - popoverW) / 2 + crossOffset;
    }
  } else {
    switch (alignment) {
      case 'start':
        top = triggerRect.top + crossOffset;
        break;
      case 'end':
        top = triggerRect.bottom - popoverH - crossOffset;
        break;
      default:
        top = triggerRect.top + (triggerRect.height - popoverH) / 2 + crossOffset;
    }
  }

  // Clamp to viewport edges (with comfortable margin)
  const margin = 12;
  left = Math.max(margin, Math.min(left, viewportW - popoverW - margin));
  top = Math.max(margin, Math.min(top, viewportH - popoverH - margin));

  floatingStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 9999
  };

  // Arrow position
  if (props.showArrow && arrowRef.value) {
    const arrowPos: CSSProperties = {};
    const triggerCenter = {
      x: triggerRect.left + triggerRect.width / 2,
      y: triggerRect.top + triggerRect.height / 2
    };

    if (side === 'top' || side === 'bottom') {
      const arrowX = Math.max(
        ARROW_SIZE,
        Math.min(triggerCenter.x - left, popoverW - ARROW_SIZE)
      );
      arrowPos.left = `${arrowX}px`;
      arrowPos.transform = 'translateX(-50%)';
      if (side === 'bottom') {
        arrowPos.top = `-${ARROW_SIZE - 1}px`;
      } else {
        arrowPos.bottom = `-${ARROW_SIZE - 1}px`;
      }
    } else {
      const arrowY = Math.max(
        ARROW_SIZE,
        Math.min(triggerCenter.y - top, popoverH - ARROW_SIZE)
      );
      arrowPos.top = `${arrowY}px`;
      arrowPos.transform = 'translateY(-50%)';
      if (side === 'right') {
        arrowPos.left = `-${ARROW_SIZE - 1}px`;
      } else {
        arrowPos.right = `-${ARROW_SIZE - 1}px`;
      }
    }

    arrowStyle.value = arrowPos;
  }
}

// Watch visibility to update position
watch(isVisible, async (val) => {
  if (val) {
    await nextTick();
    updatePosition();
    // Second pass: DOM may not have fully settled after nextTick
    // (e.g. slot content rendering, font loading). RAF ensures
    // one paint cycle has passed for accurate measurement.
    requestAnimationFrame(() => {
      updatePosition();
    });
  }
});

watch(() => props.placement, () => {
  if (isVisible.value) {
    nextTick(updatePosition);
  }
});

// Lifecycle
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  document.addEventListener('click', onDocumentClick, true);
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition, true);

  // Observe trigger size changes
  if (triggerWrapperRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (isVisible.value) updatePosition();
    });
    resizeObserver.observe(triggerWrapperRef.value);
  }
});

onBeforeUnmount(() => {
  clearTimers();
  document.removeEventListener('click', onDocumentClick, true);
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
  resizeObserver?.disconnect();
});

// Expose methods for parent to control
defineExpose({
  open: () => setVisible(true),
  close: () => setVisible(false)
});
</script>

<style>
.vc-popover-trigger-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}

.vc-popover {
  pointer-events: auto;
  border-radius: 6px;
  box-shadow: var(--db-popover-shadow);
  background: var(--db-popover-bg);
  border: 1px solid var(--db-popover-border);
  color: var(--db-popover-text);
}

.vc-popover-content {
  position: relative;
}

.vc-popover-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--db-popover-bg);
  border-top: 1px solid var(--db-popover-border);
  border-left: 1px solid var(--db-popover-border);
  transform-origin: center;
  transform: rotate(45deg);
  z-index: -1;
}

/* Transition */
.vc-popover-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.vc-popover-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.vc-popover-enter-from,
.vc-popover-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
.vc-popover-enter-to,
.vc-popover-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
