<template>
<BasicBox ref="box" type="textarea" class="c-textarea">
  <BasicTextarea
    v-bind="$attrs"
    :model-value="modelValue"
    :rows="rows"
    :auto-size="autoSize"
    :max-height="maxHeight"
    @focus="onFocus"
    @blur="onBlur"
    @update:model-value="onUpdate"
  />
</BasicBox>
</template>

<script lang="ts">
export default {
  name: 'C_TEXTAREA',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, withDefaults } from 'vue';
import BasicBox from '../../base/basic-box.vue';
import BasicTextarea from '../../base/basic-textarea.vue';

export interface Props {
  modelValue?: string;
  rows?: number;
  autoSize?: boolean;
  maxHeight?: number;
  focus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 4,
  autoSize: false,
  maxHeight: 120,
  focus: true
});

const emit = defineEmits(['update:modelValue', 'update']);
const box = ref<null | InstanceType<typeof BasicBox>>(null);

const onFocus = function () {
  if (props.focus) {
    box.value?.focus();
  }
};

const onBlur = function () {
  box.value?.blur();
};

const onUpdate = function (value: string) {
  emit('update:modelValue', value);
  emit('update', value);
};
</script>

<style lang="scss">
</style>
