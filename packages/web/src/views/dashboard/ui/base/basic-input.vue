<template>
<input v-model="modelValue" class="basic-input" type="input" v-bind="$attrs" @focus="onFocus" @blur="onBlur" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  modelValue?: string | number;
  dataType?: NumberConstructor | StringConstructor;
  input?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  lock: false,
  modelValue: '',
  dataType: String,
  input: false
});

const emit = defineEmits(['focus', 'blur', 'update:modelValue', 'update']);

const focus = ref(false);

const modelValue = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    let value = newValue;
    if (props.input) {
      value = newValue;
      emit('update:modelValue', value);
      emit('update', value);
    } else if (focus.value) {
      if ((value ? String(value).trim() : value) || value === 0) {
        if (props.dataType === Number) {
          value = Number(value);
          if (isNaN(value)) {
            value = newValue;
          }
        } else if (props.dataType === String) {
          value = value + '';
        }
        emit('update:modelValue', value);
        emit('update', value);
      }
    }
  }
});

const onFocus = function (event: Event) {
  focus.value = true;
  emit('focus', event);
};

const onBlur = function (event: Event) {
  focus.value = false;
  if (
    !(modelValue.value ? String(modelValue.value).trim() : modelValue.value) &&
    modelValue.value !== 0
  ) {
    modelValue.value = props.modelValue;
  }
  emit('blur', event);
};
</script>

<style lang="scss">
#dashboard .basic-input {
  width: 100%;
  height: 100%;
  color: var(--db-color-input);
  background: transparent;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: inherit;
  font-weight: 500;

  &::placeholder {
    font-weight: normal;
    opacity: 0.7;
  }

  &:disabled {
    color: var(--db-color-input-disabled-background);
  }
}
</style>
