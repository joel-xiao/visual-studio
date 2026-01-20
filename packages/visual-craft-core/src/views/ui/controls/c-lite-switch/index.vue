<template>
  <LiteSwitch
    class="c-lite-switch"
    v-bind="$attrs"
    :model-value="modelValue"
    @update:model-value="onUpdate"
  />
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
}

defineProps<Props>();
const emit = defineEmits(['update', 'update:modelValue']);

const onUpdate = (val: boolean) => {
  emit('update:modelValue', val);
  emit('update', val);
};
</script>

<style lang="scss">
#visual-craft-core .c-lite-switch {
  display: flex;
  align-items: center;
  height: 16px;
}
</style>
