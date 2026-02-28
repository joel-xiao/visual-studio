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
  modelValue?: string | number | boolean;
  content?: string | number;
  /* eslint-disable vue/prop-name-casing */
  active_value?: string | number | boolean; // 开启态的值
  inactive_value?: string | number | boolean; // 关闭态的值
  /* eslint-enable vue/prop-name-casing */
}

const props = defineProps<Props>();
const emit = defineEmits(['update', 'update:modelValue']);

const onUpdate = (val: string | number | boolean) => {
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
    :active-value="active_value"
    :inactive-value="inactive_value"
    @update:model-value="onUpdate"
  />
</template>
