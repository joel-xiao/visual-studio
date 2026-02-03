<template>
<BasicBox ref="box" class="c-color-picker" :class="{ 'c-color-picker-small': size === 'small' }" type="input">
  <BasicColorPicker v-model="modelValue" v-hint="hint" v-bind="$attrs" @click="onFocus" @focus="onFocus" @blur="onBlur" @update:show="onUpdateShow" />
  <BasicInput v-if="type === 'color-input'" v-bind="$attrs" v-model="modelValue" :style="size === 'small' ? { fontSize: '11px' } : {}" type="text" @focus="onFocus" @blur="onBlur" />
</BasicBox>
</template>

<script lang="ts">
import { hintDirective } from '../../../../directives/hint';

export default {
  name: 'C_COLOR_PICKER',
  directives: {
    hint: hintDirective
  },
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, computed, withDefaults } from 'vue';
import BasicBox from '../../base/basic-box.vue';
import BasicColorPicker from '../../base/basic-color-picker.vue';
import BasicInput from '../../base/basic-input.vue';

export interface IProps {
  type?: string; // color-input color
  modelValue?: string;
  focus?: boolean;
  hint?: string;
  size?: 'small' | 'default';
}

const props = withDefaults(defineProps<IProps>(), {
  type: 'color',
  modelValue: '',
  focus: true,
  hint: '',
  size: 'default'
});

const emit = defineEmits(['update:modelValue', 'update']);

const modelValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
    emit('update', value);
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

const onUpdateShow = (show: boolean) => {
  if (!show) {
    onBlur();
  } else {
    onFocus();
  }
};
</script>

<style lang="scss">
#visual-craft-core .c-color-picker {
  display: flex;
  justify-content: center;

  &.c-color-picker-small {
    height: 24px;
    min-height: 24px;
    padding: 0 4px;
  }
}
</style>
