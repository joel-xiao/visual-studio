<template>
  <div class="c-lite-switch-wrapper">
    <LiteSwitch
      class="c-lite-switch"
      v-bind="$attrs"
      :model-value="modelValue"
      @update:model-value="onUpdate"
    />
    <span v-if="content" class="c-lite-switch-content">{{ content }}</span>
  </div>
</template>

<script lang="ts">
export default {
  name: 'C_LITE_SWITCH',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import LiteSwitch from '../../base/lite-switch.vue';

export interface Props {
  modelValue?: boolean;
  content?: string | number;
}

defineProps<Props>();
const emit = defineEmits(['update', 'update:modelValue']);

const onUpdate = (val: boolean) => {
  emit('update:modelValue', val);
  emit('update', val);
};
</script>

<style lang="scss">
#visual-craft-core .c-lite-switch-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;

  .c-lite-switch {
    display: flex;
    align-items: center;
    height: 16px;
  }

  .c-lite-switch-content {
    font-size: 12px;
    color: var(--theme-color-text-secondary);
    font-weight: 600;
    white-space: nowrap;
  }
}
</style>
