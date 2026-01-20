<template>
  <div class="c-compound-input">
    <BasicBox ref="boxRef" v-bind="$attrs" type="input">
      <div
        v-for="(key, index) in keys"
        :key="key"
        class="c-compound-input-section"
        :class="{ 'has-border': index > 0 }"
      >
        <BasicIcon
          v-if="getIcon(index)"
          v-hint="getHint(index)"
          :icon="getIcon(index)"
          class="part-icon"
          :style="iconStyle"
          @mousedown="onMouseDown($event, index)"
        />
        <BasicInput
          :model-value="getValue(key)"
          :data-type="Number"
          @update="val => onUpdate(key, val)"
          @focus="onFocus"
          @blur="onBlur"
        />
        <span v-if="suffix" class="c-compound-input-suffix">{{ suffix }}</span>
      </div>
    </BasicBox>
  </div>
</template>

<script lang="ts">
import { hintDirective } from '../../../../directives/hint';

export default {
  name: 'C_COMPOUND_INPUT',
  directives: {
    hint: hintDirective
  },
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { get, set, cloneDeep } from 'lodash';
import BasicBox from '../../base/basic-box.vue';
import BasicInput from '../../base/basic-input.vue';
import BasicIcon from '../../base/basic-icon.vue';

export interface IProps {
  modelValue?: Record<string, unknown>;
  keys?: string[];
  icon?: string | string[];
  suffix?: string;
  hint?: string | string[];
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => ({}),
  keys: () => ['h', 'v'],
  icon: () => [],
  suffix: '',
  hint: ''
});

const emit = defineEmits(['update', 'update:modelValue']);

const getValue = (key: string) => {
  return (get(props.modelValue, key) as string | number) ?? 0;
};

const onUpdate = (key: string, val: unknown) => {
  const newValue = cloneDeep(props.modelValue || {});
  set(newValue, key, val);
  emit('update', newValue);
  emit('update:modelValue', newValue);
};

const getIcon = (index: number) => {
  if (Array.isArray(props.icon)) {
    return props.icon[index] || '';
  }
  return index === 0 ? props.icon : '';
};

const getHint = (index: number) => {
  if (Array.isArray(props.hint)) {
    return props.hint[index] || '';
  }
  return index === 0 ? props.hint : '';
};

const boxRef = ref<null | InstanceType<typeof BasicBox>>(null);

const iconStyle = computed(() => {
  return { cursor: 'ew-resize' };
});

const onMouseDown = (e: MouseEvent, index: number) => {
  const key = props.keys[index];
  if (!key) return;

  e.preventDefault();
  const startX = e.clientX;
  const startValue = Number(getValue(key)) || 0;

  const onMouseMove = (event: MouseEvent) => {
    const deltaX = event.clientX - startX;
    const step = event.shiftKey ? 10 : (event.altKey ? 0.1 : 1);
    const newValueNum = startValue + Math.round(deltaX * step * 0.5) / (event.altKey ? 10 : 1);

    onUpdate(key, newValueNum);
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

function onFocus() {
  boxRef.value?.focus();
}

function onBlur() {
  boxRef.value?.blur();
}
</script>

<style lang="scss">
#visual-craft-core .c-compound-input {
  width: 100%;

  .c-compound-input-section {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    padding: 0 8px;
    height: 100%;

    &.has-border {
      border-left: 1px solid var(--theme-color-gray-100);
    }

    .part-icon {
      flex-shrink: 0;
      font-size: 14px;
      margin-right: 4px;
      opacity: 0.5;
    }

    .basic-input {
      flex: 1;
      text-align: center;
    }

    .c-compound-input-suffix {
      font-size: 12px;
      color: var(--theme-color-text-secondary);
      margin-left: 2px;
      flex-shrink: 0;
      opacity: 0.6;
    }
  }
}
</style>
