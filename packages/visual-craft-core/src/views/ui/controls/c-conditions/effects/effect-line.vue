<template>
<div class="effect-line">
  <div class="effect-item">
    <span class="effect-label">线条颜色</span>
    <div class="effect-color">
      <BasicColorPicker
        :model-value="effects.lineColor || effects.color || '#2362E4'"
        @update:model-value="(val) => updateEffect('lineColor', val)"
      />
      <span class="effect-color-value">{{ effects.lineColor || effects.color || '#2362E4' }}</span>
    </div>
  </div>
  <div class="effect-item">
    <span class="effect-label">填充颜色</span>
    <div class="effect-color">
      <BasicColorPicker
        :model-value="effects.areaColor || 'transparent'"
        @update:model-value="(val) => updateEffect('areaColor', val)"
      />
      <span class="effect-color-value">{{ effects.areaColor || 'transparent' }}</span>
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
#visual-craft-core .effect-line {
  display: flex;
  flex-direction: column;
  gap: 8px;

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
    min-width: 60px;
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
