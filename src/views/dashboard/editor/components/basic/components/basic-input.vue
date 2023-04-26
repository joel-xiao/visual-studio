<template lang="pug">
input(class="basic-input" type="input" v-model="inputValue" v-bind="$attrs" @focus="onFocus" @blur="onBlur")
</template>

<script setup lang="ts">
import { ref, watchEffect, watch } from 'vue';

interface Props {
  modelValue: string | number;
  dataType?: NumberConstructor | StringConstructor;
}
const props = withDefaults(defineProps<Props>(), {
  lock: false,
  modelValue: '',
  dataType: String
});

const emit = defineEmits(['blur', 'update:modelValue', 'update']);

const inputValue = ref(props.modelValue);

const focus = ref(false);

watch(props, (newValue) => {
  if (newValue.modelValue !== inputValue.value) {
    inputValue.value = newValue.modelValue;
  }
});

watchEffect(() => {
  if (!focus.value) return;
  let value = inputValue.value;
  if ((value ? String(value).trim() : value) || value === 0) {
    if (props.dataType === Number) {
      value = Number(value);
      isNaN(value) && (value = inputValue.value);
    } else if (props.dataType === String) {
      value = value + '';
    }
    emit('update:modelValue', value);
    emit('update', value);
  }
});

const onFocus = function (event: Event) {
  focus.value = true;
  emit('blur', event);
};

const onBlur = function (event: Event) {
  focus.value = false;
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
