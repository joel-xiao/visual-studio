<template>
  <BasicChipSwitch
    class="c-chip-switch"
    v-bind="$attrs"
    :model-value="modelValue"
    :content="content"
    @update:model-value="onUpdate"
  />
</template>

<script lang="ts">
export default {
  name: 'C_CHIP_SWITCH',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import BasicChipSwitch from '../../base/basic-chip-switch.vue';

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
