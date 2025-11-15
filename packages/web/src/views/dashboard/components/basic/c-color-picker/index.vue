<template lang="pug">
BasicBox(ref='box' class="c-color-picker" type="input")
  BasicColorPicker(v-bind="$attrs"  v-model="modelValue")
  BasicInput( v-if="type === 'color-input'" v-bind="$attrs" v-model="modelValue" @focus="onFocus" @blur="onBlur" @update="onUpdate" type="text")
</template>

<script lang="ts">
export default {
  name: 'C_COLOR_PICKER',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, computed, withDefaults } from 'vue';
import BasicBox from '../components/basic-box.vue';
import BasicColorPicker from '../components/basic-color-picker.vue';
import BasicInput from '../components/basic-input.vue';

interface IProps {
  type?: string; // color-input color
  modelValue?: string;
  focus?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  type: 'color',
  modelValue: '',
  focus: true
});

const emit = defineEmits(['update:modelValue', 'update']);

const modelValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

const box = ref<null | InstanceType<typeof BasicBox>>(null);

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

<style lang="scss">
#dashboard .c-color-picker {
  display: flex;
  justify-content: center;
}
</style>
