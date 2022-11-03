<template lang="pug">
input(class="basic-input" type="input" v-model="inputValue" v-bind="$attrs" @blur="onBlur")
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: string | number;
}
const props = withDefaults(defineProps<Props>(), {
  lock: false,
  modelValue: ''
});

const emit = defineEmits(['blur', 'update:modelValue', 'update']);

const inputValue = ref(props.modelValue);

watch(props, (newValue) => {
  if (newValue.modelValue !== inputValue.value) {
    inputValue.value = newValue.modelValue;
  }
});

watch(inputValue, (newValue) => {
  if ((newValue ? String(newValue).trim() : newValue) || newValue === 0) {
    emit('update:modelValue', newValue);
    emit('update', newValue);
  }
});

const onBlur = function (event: Event) {
  if (
    !(inputValue.value ? String(inputValue.value).trim() : inputValue.value) &&
    inputValue.value !== 0
  )
    inputValue.value = props.modelValue;
  emit('blur', event);
};
</script>

<style lang="scss">
#editor .basic-input {
  width: 100%;
  height: 100%;
  color: var(--color-text-primary);
  background: transparent;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: inherit;
  font-weight: 500;

  &:disabled {
    color: var(--color-tran-30);
  }
}
</style>
