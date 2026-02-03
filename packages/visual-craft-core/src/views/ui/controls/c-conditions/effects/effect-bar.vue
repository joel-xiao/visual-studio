<template>
<div class="effect-bar-minimal">
  <!-- Group 1: Primary Color -->
  <div class="prop-item">
    <div class="prop-label">图形填充颜色</div>
    <div class="prop-control">
      <CColorPicker
        type="color-input"
        size="small"
        :model-value="effects.color || '#2362E4'"
        @update:model-value="(val) => updateEffect('color', val)"
      />
    </div>
  </div>
  <!-- Group 2: Border Config -->
  <div class="prop-item">
    <div class="prop-label">描边/边框颜色</div>
    <div class="prop-control">
      <CColorPicker
        type="color-input"
        size="small"
        :model-value="effects.borderColor || 'transparent'"
        @update:model-value="(val) => updateEffect('borderColor', val)"
      />
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import CColorPicker from '../../c-color-picker/index.vue';
import type { IChartEffect } from '../../../../editor/schema/conditions/index';

interface Props { effects: IChartEffect; }
defineProps<Props>();
const emit = defineEmits(['update:effect']);
const updateEffect = (key: keyof IChartEffect, value: unknown) => { emit('update:effect', key, value); };
</script>

<style lang="scss">
#visual-craft-core .effect-bar-minimal {
  display: flex; flex-direction: column; gap: 6px;

  .prop-item { display: flex; flex-direction: column; gap: 4px; }
  .prop-label { font-size: 10px; font-weight: 700; color: #555; text-transform: uppercase; padding-left: 2px; }
  .prop-control { height: 24px; width: 100%; }
}
</style>
