<script lang="ts">
export default {
  name: 'C_CHIP_SWITCH',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import BasicChipSwitch from '../../base/basic-chip-switch.vue';
import { computed } from 'vue';

export interface Props {
  modelValue?: any;
  content?: string | number;
  activeValue?: any;
  inactiveValue?: any;
  active_value?: any; // For snake_case schema compatibility
  inactive_value?: any;
}

const props = defineProps<Props>();
const emit = defineEmits(['update', 'update:modelValue']);

const finalActiveValue = computed(() => props.activeValue !== undefined ? props.activeValue : props.active_value);
const finalInactiveValue = computed(() => props.inactiveValue !== undefined ? props.inactiveValue : props.inactive_value);

const onUpdate = (val: any) => {
  emit('update:modelValue', val);
  emit('update', val);
};
</script>

<template>
  <BasicChipSwitch
    class="c-chip-switch"
    v-bind="$attrs"
    :model-value="modelValue"
    :content="content"
    :active-value="finalActiveValue"
    :inactive-value="finalInactiveValue"
    @update:model-value="onUpdate"
  />
</template>
