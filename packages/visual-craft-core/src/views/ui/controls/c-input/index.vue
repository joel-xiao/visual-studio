<template>
<BasicBox ref="box" type="input" :class="{ 'c-input-small': size === 'small' }">
  <BasicIcon v-if="size !== 'small'" v-hint="hint || ''" :lock="lock" :icon="icon" :style="iconStyle" @mousedown="onMouseDown" />
  <div class="c-input-content">
    <BasicInput :disabled="lock" v-bind="$attrs" :model-value="modelValue" type="text" @focus="onFocus" @blur="onBlur" @update="onUpdate" />
    <span v-if="suffix" class="c-input-suffix">{{ suffix }}</span>
  </div>
</BasicBox>
</template>

<script lang="ts">
import { hintDirective } from '../../../../directives/hint';

export default {
  name: 'C_INPUT',
  directives: {
    hint: hintDirective
  },
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, reactive, provide, withDefaults, computed } from 'vue';
import BasicBox from '../../base/basic-box.vue';
import BasicIcon from '../../base/basic-icon.vue';
import BasicInput from '../../base/basic-input.vue';

export interface IProps {
  lock?: boolean;
  icon?: string;
  focus?: boolean;
  modelValue?: string | number;
  suffix?: string;
  hint?: string;
  size?: 'small' | 'default';
}
const props = withDefaults(defineProps<IProps>(), {
  lock: false,
  icon: '',
  focus: true,
  modelValue: '',
  suffix: '',
  hint: '',
  size: 'default'
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

<style lang="scss">
#visual-craft-core {
  .c-input-content {
    flex: 1;
    display: flex;
    align-items: center;
    padding-right: 8px;
    min-width: 0;

    .basic-input {
      flex: 1;
      min-width: 20px;
    }

    .c-input-suffix {
      font-size: 14px;
      color: var(--theme-color-text-secondary);
      margin-left: 2px;
      flex-shrink: 0;
      opacity: 0.8;
      display: flex;
      align-items: center;
      line-height: 1;
    }
  }

  .c-input-small {
    height: 24px;
    min-height: 24px;
    padding: 0 6px;

    .c-input-content {
      padding-right: 4px;
    }

    .basic-input {
      font-size: 11px;
    }
  }
}
</style>
