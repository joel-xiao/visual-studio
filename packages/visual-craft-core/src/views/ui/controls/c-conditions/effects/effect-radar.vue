<template>
<div class="effect-radar">
  <div class="effect-item">
    <span class="effect-label">雷达颜色</span>
    <div class="effect-color">
      <BasicColorPicker
        :model-value="effects.color || '#2362E4'"
        @update:model-value="(val) => updateEffect('color', val)"
      />
      <span class="effect-color-value">{{ effects.color || '#2362E4' }}</span>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import BasicColorPicker from '../../../base/basic-color-picker.vue';
import type { IChartEffect } from '../../../../editor/schema/conditions/index';

interface Props {
  effects: IChartEffect;
}

defineProps<Props>();

const emit = defineEmits(['update:effect']);

const updateEffect = (key: keyof IChartEffect, value: unknown) => {
  emit('update:effect', key, value);
};
</script>

<style lang="scss">
#visual-craft-core .effect-radar {
  .effect-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--db-color-input-background);
    border-radius: 6px;
  }

  .effect-label {
    font-size: 12px;
    color: var(--theme-color-text-secondary);
    flex-shrink: 0;
  }

  .effect-color {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }

  .effect-color-value {
    font-size: 12px;
    color: var(--theme-color-text-primary);
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  }
}
</style>
