<template>
<div class="c-position">
  <div class="c-position-grid">
    <div 
      v-for="item in positions" 
      :key="item.value"
      class="c-position-item"
      :class="{ active: modelValue === item.value }"
      @click="onUpdate(item.value)"
    >
      <div class="c-position-icon" :class="item.value"></div>
    </div>
  </div>
</div>
</template>

<script lang="ts">
export default {
  name: 'C_POSITION',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { withDefaults } from 'vue';

export interface IProps {
  modelValue?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: 'top-left'
});

const emit = defineEmits(['update', 'update:modelValue']);

const positions = [
  { value: 'top-left' },
  { value: 'top-center' },
  { value: 'top-right' },
  { value: 'bottom-left' },
  { value: 'bottom-center' },
  { value: 'bottom-right' },
  { value: 'left-top' },
  { value: 'left-middle' },
  { value: 'left-bottom' },
  { value: 'right-top' },
  { value: 'right-middle' },
  { value: 'right-bottom' }
];

const onUpdate = (value: string) => {
  emit('update', value);
  emit('update:modelValue', value);
};
</script>

<style lang="scss">
#visual-craft-core .c-position {
  width: 100%;

  .c-position-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-gap: 4px;
    background: transparent;
  }

  .c-position-item {
    aspect-ratio: 1 / 1;
    background: var(--db-color-input-background);
    border-radius: 4px;
    display: flex;
    position: relative;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;

    &:hover {
      background: var(--db-color-button-bg-hover);
    }

    &.active {
      background: var(--db-color-button-focus-border);
      border-color: var(--db-color-button-focus-border);
      
      .c-position-icon {
        background: #fff;
      }
    }
  }

  .c-position-icon {
    background: var(--theme-color-text-secondary, #999);
    position: absolute;
    border-radius: 1px;

    // Horizontal bars
    &.top-left, &.top-center, &.top-right,
    &.bottom-left, &.bottom-center, &.bottom-right {
      height: 2px;
      width: 8px;
    }

    // Vertical bars
    &.left-top, &.left-middle, &.left-bottom,
    &.right-top, &.right-middle, &.right-bottom {
      width: 2px;
      height: 8px;
    }

    // Exact positions
    &.top-left { top: 4px; left: 4px; }
    &.top-center { top: 4px; left: 50%; transform: translateX(-50%); }
    &.top-right { top: 4px; right: 4px; }
    &.bottom-left { bottom: 4px; left: 4px; }
    &.bottom-center { bottom: 4px; left: 50%; transform: translateX(-50%); }
    &.bottom-right { bottom: 4px; right: 4px; }

    &.left-top { left: 4px; top: 4px; }
    &.left-middle { left: 4px; top: 50%; transform: translateY(-50%); }
    &.left-bottom { left: 4px; bottom: 4px; }
    &.right-top { right: 4px; top: 4px; }
    &.right-middle { right: 4px; top: 50%; transform: translateY(-50%); }
    &.right-bottom { right: 4px; bottom: 4px; }
  }
}
</style>
