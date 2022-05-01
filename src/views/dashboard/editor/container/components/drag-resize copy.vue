<template lang="pug">
div(
  class="editor-drag-resize"
  :class="containerClass"
  :style="containerStyle"
  @mousedown.stop.prevent="bodyDown($event)"
  )
  div.editor-drag-resize-container
    slot
  span
    div(class="vdr-stick"
      v-for="stick in sticks"
      :key="stick"
      :class="'vdr-stick-' + stick"
      @mousedown.stop.prevent="stickDown(stick, $event)"
      )
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  readonly,
  markRaw,
  defineExpose,
  defineEmits,
  withDefaults,
  defineProps
} from 'vue';
import type { DargDataset } from '@d/darg-resize/interface';

interface Props {
  data: DargDataset;
  disabled: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => ({ y2: 0, x2: 0, x: 0, y: 0 }),
  disabled: false
});

const emit = defineEmits(['resizing']);

const containerClass = computed<{ disabled: boolean }>(() => {
  return {
    disabled: props.disabled || false
  };
});

const sticks = readonly(
  reactive<string[]>(markRaw(['tl', 'tm', 'tr', 'rm', 'br', 'bm', 'bl', 'lm']))
);

let defaultPos = reactive<DargDataset>(markRaw({ ...props.data }));
let pos = reactive<DargDataset>({ ...defaultPos });
let startPos = reactive<{ x: number; y: number }>(markRaw({ x: 0, y: 0 }));
const currentStick = markRaw(ref<string>(''));

const containerStyle = computed<{ transform: string; width: string; height: string }>(() => {
  let diff_rotate_x = 0;
  let diff_rotate_y = 0;
  let rotate = '';
  if (pos.x2 - pos.x < 0 && pos.y2 - pos.y < 0) {
    diff_rotate_x = pos.x2 - pos.x;
    diff_rotate_y = pos.y2 - pos.y;
    rotate = `rotate(180deg)`;
  } else if (pos.x2 - pos.x < 0 && pos.y2 - pos.y >= 0) {
    diff_rotate_x = pos.x2 - pos.x;
    rotate = `rotateY(180deg)`;
  } else if (pos.x2 - pos.x >= 0 && pos.y2 - pos.y <= 0) {
    diff_rotate_y = pos.y2 - pos.y;
    rotate = `rotateX(180deg)`;
  }

  return {
    transform: `translate(${pos.x + diff_rotate_x}px, ${pos.y + diff_rotate_y}px) ${rotate}`,
    width: Math.abs(pos.x2 - pos.x) + 'px',
    height: Math.abs(pos.y2 - pos.y) + 'px'
  };
});

const onMove = function (event: MouseEvent): void {
  let stick: string = currentStick.value;
  if (stick === 'body') {
    let diff_x: number = event.x - startPos.x;
    let diff_y: number = event.y - startPos.y;
    pos.x = defaultPos.x + diff_x;
    pos.y = defaultPos.y + diff_y;
    pos.x2 = defaultPos.x2 + diff_x;
    pos.y2 = defaultPos.y2 + diff_y;
  } else if (stick === 'tl') {
    let diff_x: number = event.x - startPos.x;
    let diff_y: number = event.y - startPos.y;
    pos.x = defaultPos.x + diff_x;
    pos.y = defaultPos.y + diff_y;
  } else if (stick === 'tr') {
    let diff_x = event.x - startPos.x;
    let diff_y = event.y - startPos.y;
    pos.x2 = defaultPos.x2 + diff_x;
    pos.y = defaultPos.y + diff_y;
  } else if (stick === 'br') {
    let diff_x = event.x - startPos.x;
    let diff_y = event.y - startPos.y;
    pos.x2 = defaultPos.x2 + diff_x;
    pos.y2 = defaultPos.y2 + diff_y;
  } else if (stick === 'bl') {
    let diff_x = event.x - startPos.x;
    let diff_y = event.y - startPos.y;
    pos.x = defaultPos.x + diff_x;
    pos.y2 = defaultPos.y2 + diff_y;
  } else if (stick === 'tm') {
    let diff_y = event.y - startPos.y;
    pos.y = defaultPos.y + diff_y;
  } else if (stick === 'rm') {
    let diff_x = event.x - startPos.x;
    pos.x2 = defaultPos.x2 + diff_x;
  } else if (stick === 'bm') {
    let diff_y = event.y - startPos.y;
    pos.y2 = defaultPos.y2 + diff_y;
  } else if (stick === 'lm') {
    let diff_x = event.x - startPos.x;
    pos.x = defaultPos.x + diff_x;
  }

  emit('resizing', pos);
};

const onUp = function (): void {
  defaultPos = { ...pos };
  emit('resizing', defaultPos);

  document.documentElement.removeEventListener('mousemove', onMove);
  document.documentElement.removeEventListener('mouseup', onUp);
  document.documentElement.removeEventListener('mouseleave', onUp);

  document.documentElement.removeEventListener('mousedown', onUp);

  // document.documentElement.removeEventListener('touchmove', onMove, true);
  // document.documentElement.removeEventListener('touchend', onUp, true);
  // document.documentElement.removeEventListener('touchcancel', onUp, true);
  // document.documentElement.removeEventListener('touchstart', onUp, true);
};

const onDown = function (): void {
  document.documentElement.addEventListener('mousemove', onMove);
  document.documentElement.addEventListener('mouseup', onUp);
  document.documentElement.addEventListener('mouseleave', onUp);

  document.documentElement.addEventListener('mousedown', onUp);

  // document.documentElement.addEventListener('touchmove', onMove, true);
  // document.documentElement.addEventListener('touchend', onUp, true);
  // document.documentElement.addEventListener('touchcancel', onUp, true);
  // document.documentElement.addEventListener('touchstart', onUp, true);
};

const stickDown = function (stick: string, event: MouseEvent): void {
  event.preventDefault();
  if (props.disabled) return;
  currentStick.value = stick;
  startPos.x = event.x;
  startPos.y = event.y;
  onDown();
};

const bodyDown = function (event: MouseEvent): void {
  event.preventDefault();
  if (props.disabled) return;
  currentStick.value = 'body';
  startPos.x = event.x;
  startPos.y = event.y;
  onDown();
};
</script>

<style lang="scss" scoped>
.editor-drag-resize {
  --drag-resize-color: #8b50ff;
  position: absolute;
  left: 0px;
  top: 0px;
  box-sizing: border-box;
  /* border: 1px solid var(--drag-resize-color); */

  .editor-drag-resize-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  &.disabled {
    .vdr-stick {
      display: none;
    }
  }

  .vdr-stick {
    position: absolute;

    &.vdr-stick-tl,
    &.vdr-stick-br,
    &.vdr-stick-tr,
    &.vdr-stick-bl {
      width: 9px;
      height: 9px;
      border-radius: 2px;
      background: #fff;
      border: 1px solid var(--drag-resize-color);
    }

    &.vdr-stick-tl,
    &.vdr-stick-br {
      cursor: nwse-resize;
    }

    &.vdr-stick-tr,
    &.vdr-stick-bl {
      cursor: nesw-resize;
    }

    &.vdr-stick-tm,
    &.vdr-stick-bm {
      cursor: ns-resize;
    }
    &.vdr-stick-lm,
    &.vdr-stick-rm {
      cursor: ew-resize;
    }

    &.vdr-stick-tl {
      left: -4px;
      top: -4px;
    }

    &.vdr-stick-tr {
      right: -4px;
      top: -4px;
    }

    &.vdr-stick-br {
      right: -4px;
      bottom: -4px;
    }

    &.vdr-stick-bl {
      left: -4px;
      bottom: -4px;
    }

    &.vdr-stick-tm {
      left: 4px;
      top: 0px;
      right: 4px;
      border-top: 1px solid var(--drag-resize-color);
    }
    &.vdr-stick-bm {
      left: 4px;
      right: 4px;
      bottom: 0px;
      border-bottom: 1px solid var(--drag-resize-color);
    }
    &.vdr-stick-rm {
      right: 0px;
      top: 4px;
      bottom: 4px;
      border-right: 1px solid var(--drag-resize-color);
    }
    &.vdr-stick-lm {
      left: 0px;
      top: 4px;
      bottom: 4px;
      border-left: 1px solid var(--drag-resize-color);
    }
  }
}
</style>
