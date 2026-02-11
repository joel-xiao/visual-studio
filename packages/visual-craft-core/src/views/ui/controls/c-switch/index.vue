<template>
  <div class="c-switch-wrapper">
    <BasicSwitch
      class="c-switch"
      v-bind="$attrs"
      :model-value="modelValue"
      @update:model-value="onUpdate"
    />
    <span v-if="content" class="c-switch-content">{{ content }}</span>
  </div>
</template>

<script lang="ts">
export default {
  name: 'C_SWITCH',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import BasicSwitch from '../../base/basic-switch.vue';

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
#visual-craft-core .c-switch-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;

  .c-switch {
    display: flex;
    align-items: center;
  }

  .c-switch-content {
    font-size: 12px;
    color: var(--theme-color-text-secondary);
    font-weight: 600;
    white-space: nowrap;
  }
}
</style>

