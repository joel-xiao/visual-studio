<template lang="pug">
div(class="attribute-basic-status-button-box transition" :key="keyValue" :class="{'status-button-active': modelValue}" @click="onClick")
  slot
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';

interface Props {
  modelValue: boolean;
  keyValue: string;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  keyValue: ''
});

const emit = defineEmits(['update:modelValue']);

const onClick = function () {
  emit('update:modelValue', !props.modelValue);
};
</script>

<style lang="scss">
.editor-panel-attribute .attribute-basic-status-button-box {
  border-radius: 6px;
  height: 30px;
  width: 30px;
  position: relative;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  box-shadow: 0 0 0 1px var(--color-tran-6) inset;
  color: var(--theme-color-gray-800);

  &:hover {
    box-shadow: 0 0 0 1px var(--color-tran-12) inset;
  }

  &.status-button-active {
    background: var(--color-blue-700);
    color: var(--color-text-primary-white);
  }
}
</style>
