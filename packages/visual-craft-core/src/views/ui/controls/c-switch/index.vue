<template>
  <div class="c-switch">
    <BasicSwitch
      v-bind="$attrs"
      :model-value="modelValue"
      @update:model-value="onUpdate"
    />
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
}

defineProps<Props>();
const emit = defineEmits(['update', 'update:modelValue']);

const onUpdate = (val: boolean) => {
  emit('update:modelValue', val);
  emit('update', val);
};
</script>

<style lang="scss">
#visual-craft-core .c-switch {
  display: flex;
  align-items: center;
  height: 30px;
}
</style>
