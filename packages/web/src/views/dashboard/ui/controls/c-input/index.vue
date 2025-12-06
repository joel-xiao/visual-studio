<template lang="pug">
BasicBox(ref='box' type="input")
  BasicIcon(:lock="lock" :icon="icon" @mousedown="onMouseDown" :style="iconStyle")
  BasicInput(:disabled="lock" v-bind="$attrs" :model-value="modelValue" @focus="onFocus" @blur="onBlur" @update="onUpdate" type="text")
</template>

<script lang="ts">
export default {
  name: 'C_INPUT',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, reactive, provide, withDefaults, computed } from 'vue';
import BasicBox from '../../base/basic-box.vue';
import BasicIcon from '../../base/basic-icon.vue';
import BasicInput from '../../base/basic-input.vue';

interface IProps {
  lock?: boolean;
  icon?: string;
  focus?: boolean;
  modelValue?: string | number;
}
const props = withDefaults(defineProps<IProps>(), {
  lock: false,
  icon: '',
  focus: true,
  modelValue: ''
});

const emit = defineEmits(['update']);

const box = ref<null | InstanceType<typeof BasicBox>>(null);

const isNumeric = computed(() => {
  const val = props.modelValue;
  return (typeof val === 'number' || (typeof val === 'string' && val.trim() !== '')) && !isNaN(Number(val));
});

const iconStyle = computed(() => {
  return isNumeric.value && !props.lock ? { cursor: 'ew-resize' } : {};
});

const onMouseDown = (e: MouseEvent) => {
  if (!isNumeric.value || props.lock) return;

  e.preventDefault();
  const startX = e.clientX;
  const startValue = Number(props.modelValue);
  const isString = typeof props.modelValue === 'string';

  const onMouseMove = (event: MouseEvent) => {
    const deltaX = event.clientX - startX;
    let newValue: string | number = startValue + deltaX;
    if (isString) newValue = String(newValue);
    onUpdate(newValue);
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  document.body.style.cursor = 'ew-resize';
};

const onFocus = function () {
  if (props.focus) {
    box.value?.focus();
  }
};

const onBlur = function () {
  box.value?.blur();
};

const onUpdate = function (value: string | number) {
  emit('update', value);
};
</script>

<style lang="scss"></style>
