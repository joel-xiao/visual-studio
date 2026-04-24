<template>
  <BasicModal
    v-bind="$attrs"
    :model-value="modelValue"
    :title="title"
    :width="width"
    class="c-modal"
    @update:model-value="val => $emit('update:modelValue', val)"
    @close="$emit('close')"
  >
    <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
  </BasicModal>
</template>

<script lang="ts">
export default {
  name: 'C_MODAL',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import BasicModal from '../../base/basic-modal.vue';

defineProps<{
  modelValue: boolean;
  title?: string;
  width?: string;
}>();

defineEmits(['update:modelValue', 'close']);
</script>

<style lang="scss">
</style>
