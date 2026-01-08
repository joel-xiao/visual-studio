<template>
<div class="c-edge">
  <div class="c-edge-container">
    <div
      class="c-edge-input-item top"
      :class="{ focused: focusedIndex === 0 }"
      @mouseenter="onMouseEnter(0)"
      @mouseleave="onMouseLeave"
      @mousedown="onMouseDown(0, $event)"
    >
      <div class="drag-handle-bar"></div>
      <BasicInput
        type="text"
        :model-value="modelValue[0]"
        :data-type="Number"
        @update="val => onUpdate(0, val)"
        @focus="onFocus(0)"
        @blur="onBlur"
      />
    </div>
    <div
      class="c-edge-input-item right"
      :class="{ focused: focusedIndex === 1 }"
      @mouseenter="onMouseEnter(1)"
      @mouseleave="onMouseLeave"
      @mousedown="onMouseDown(1, $event)"
    >
      <div class="drag-handle-bar vertical"></div>
      <BasicInput
        type="text"
        :model-value="modelValue[1]"
        :data-type="Number"
        @update="val => onUpdate(1, val)"
        @focus="onFocus(1)"
        @blur="onBlur"
      />
    </div>
    <div
      class="c-edge-input-item bottom"
      :class="{ focused: focusedIndex === 2 }"
      @mouseenter="onMouseEnter(2)"
      @mouseleave="onMouseLeave"
      @mousedown="onMouseDown(2, $event)"
    >
      <div class="drag-handle-bar"></div>
      <BasicInput
        type="text"
        :model-value="modelValue[2]"
        :data-type="Number"
        @update="val => onUpdate(2, val)"
        @focus="onFocus(2)"
        @blur="onBlur"
      />
    </div>
    <div
      class="c-edge-input-item left"
      :class="{ focused: focusedIndex === 3 }"
      @mouseenter="onMouseEnter(3)"
      @mouseleave="onMouseLeave"
      @mousedown="onMouseDown(3, $event)"
    >
      <div class="drag-handle-bar vertical"></div>
      <BasicInput
        type="text"
        :model-value="modelValue[3]"
        :data-type="Number"
        @update="val => onUpdate(3, val)"
        @focus="onFocus(3)"
        @blur="onBlur"
      />
    </div>
    <div class="c-edge-center-box" :class="activeDirection"></div>
  </div>
</div>
</template>

<script lang="ts">
export default {
  name: 'C_EDGE',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, computed, withDefaults } from 'vue';
import BasicInput from '../../base/basic-input.vue';

export interface IProps {
  modelValue?: (string | number)[];
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => [0, 0, 0, 0]
});

const emit = defineEmits(['update', 'update:modelValue']);

const focusedIndex = ref(-1);
const hoveredIndex = ref(-1);

const activeDirection = computed(() => {
  const index = focusedIndex.value !== -1 ? focusedIndex.value : hoveredIndex.value;
  const directions = ['top', 'right', 'bottom', 'left'];
  return directions[index] || '';
});

const onUpdate = (index: number, value: string | number) => {
  const newValue = [...props.modelValue];
  newValue[index] = value;
  emit('update', newValue);
  emit('update:modelValue', newValue);
};

const onFocus = (index: number) => {
  focusedIndex.value = index;
};

const onBlur = () => {
  focusedIndex.value = -1;
};

const onMouseEnter = (index: number) => {
  hoveredIndex.value = index;
};

const onMouseLeave = () => {
  hoveredIndex.value = -1;
};

const onMouseDown = (index: number, e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  const inputEl = target.querySelector('input');

  e.preventDefault();

  const startX = e.clientX;
  const startValue = Number(props.modelValue[index]) || 0;
  let isDragging = false;

  const onMouseMove = (event: MouseEvent) => {
    const deltaX = event.clientX - startX;

    if (Math.abs(deltaX) > 2) {
      isDragging = true;
      document.body.style.cursor = 'ew-resize';
    }

    if (isDragging) {
      const newValue = startValue + deltaX;
      onUpdate(index, newValue);
    }
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';

    if (!isDragging) {
      inputEl?.focus();
    }
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};
</script>

<style lang="scss">
#visual-craft-core .c-edge {
  width: 100%;
  border-radius: 6px;
  overflow: hidden;

  .c-edge-container {
    background: var(--db-color-input-background);
    border-radius: 6px;
    height: 54px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.2s;
    border: 1px solid transparent;

    &:hover {
      background: var(--db-color-button-bg-hover);
    }
  }

  .c-edge-input-item {
    position: absolute;
    width: 30px;
    height: 18px;
    z-index: 2;
    transition: all 0.2s;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ew-resize;

    &:hover {
      .drag-handle-bar {
        background: var(--theme-color-primary);
        opacity: 0.8;
      }
    }

    &.focused {
      background: var(--db-color-input-background);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 10;
      cursor: default;

      .drag-handle-bar {
        opacity: 0;
      }
    }

    .drag-handle-bar {
      position: absolute;
      background: var(--theme-color-text-secondary);
      opacity: 0.3;
      border-radius: 1px;
      transition: all 0.2s;
      pointer-events: none;

      &.vertical {
        width: 2px;
        height: 12px;
        left: 2px;
      }

      &:not(.vertical) {
        width: 12px;
        height: 2px;
        bottom: 2px;
      }
    }

    .basic-input {
      text-align: center;
      font-size: 12px;
      color: var(--theme-color-text-primary);
      width: 100%;
      height: 100%;
      background: transparent;
      pointer-events: none; /* Let parent handle events initially */
    }

    &.focused .basic-input {
      pointer-events: auto;
    }

    &.top {
      top: 0px;
      left: 50%;
      transform: translateX(-50%);

      .drag-handle-bar {
        bottom: 1px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
    &.bottom {
      bottom: 0px;
      left: 50%;
      transform: translateX(-50%);

      .drag-handle-bar {
        top: 1px;
        left: 50%;
        transform: translateX(-50%);
        bottom: auto;
      }
    }
    &.left {
      left: 2px;
      top: 50%;
      transform: translateY(-50%);

      .drag-handle-bar.vertical {
        right: 1px;
        left: auto;
      }
    }
    &.right {
      right: 2px;
      top: 50%;
      transform: translateY(-50%);

      .drag-handle-bar.vertical {
        left: 1px;
      }
    }
  }

  .c-edge-center-box {
    width: 120px;
    height: 14px;
    background: transparent;
    border-radius: 3px;
    border: 1px dashed var(--theme-color-gray-300);
    z-index: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.top {
      border-top-color: var(--db-color-button-focus-border);
      border-top-style: solid;
      background: linear-gradient(to bottom, var(--db-editor-color-select-light), transparent);
    }

    &.bottom {
      border-bottom-color: var(--db-color-button-focus-border);
      border-bottom-style: solid;
      background: linear-gradient(to top, var(--db-editor-color-select-light), transparent);
    }

    &.left {
      border-left-color: var(--db-color-button-focus-border);
      border-left-style: solid;
      background: linear-gradient(to right, var(--db-editor-color-select-light), transparent);
    }

    &.right {
      border-right-color: var(--db-color-button-focus-border);
      border-right-style: solid;
      background: linear-gradient(to left, var(--db-editor-color-select-light), transparent);
    }
  }
}
</style>
