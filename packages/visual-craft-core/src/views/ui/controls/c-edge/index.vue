<template>
<div class="c-edge">
  <div class="c-edge-container">
    <div
      class="c-edge-input-item top"
      :class="{ focused: focusedIndex === 0 }"
      @mouseenter="onMouseEnter(0)"
      @mouseleave="onMouseLeave"
    >
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
    >
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
    >
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
    >
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

    &.focused {
      background: var(--db-color-input-background);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--db-color-button-focus-border);
      z-index: 10;
    }

    .basic-input {
      text-align: center;
      font-size: 12px;
      color: var(--theme-color-text-primary);
    }

    &.top {
      top: 3px;
      left: 50%;
      transform: translateX(-50%);
    }
    &.bottom {
      bottom: 3px;
      left: 50%;
      transform: translateX(-50%);
    }
    &.left {
      left: 4px;
      top: 50%;
      transform: translateY(-50%);
    }
    &.right {
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
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
