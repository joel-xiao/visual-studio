<template>
  <div class="c-box-spacing">
    <BasicBox ref="boxRef" v-bind="$attrs" type="input">
      <!-- Horizontal Part -->
      <div class="c-box-spacing-section h-part">
        <BasicIcon
          v-hint="hint"
          icon="mdi:format-horizontal-align-center"
          class="part-icon"
          :style="iconStyle"
          @mousedown="onMouseDown($event, 'h')"
        />
        <BasicInput
          :model-value="hModel"
          :data-type="Number"
          @update="onHUpdate"
          @focus="onFocus"
          @blur="onBlur"
        />
        <span class="c-box-spacing-suffix">{{ suffix }}</span>
      </div>

      <!-- Vertical Part -->
      <div class="c-box-spacing-section v-part">
        <BasicIcon
          icon="mdi:format-vertical-align-center"
          class="part-icon"
          :style="iconStyle"
          @mousedown="onMouseDown($event, 'v')"
        />
        <BasicInput
          :model-value="vModel"
          :data-type="Number"
          @update="onVUpdate"
          @focus="onFocus"
          @blur="onBlur"
        />
        <span class="c-box-spacing-suffix">{{ suffix }}</span>
      </div>
    </BasicBox>
  </div>
</template>

<script lang="ts">
import { hintDirective } from '../../../../directives/hint';

export default {
  name: 'C_BOX_SPACING',
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
  modelValue?: Record<string, number>;
  keys?: [string, string];
  suffix?: string;
  hint?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => ({}),
  keys: () => ['h', 'v'],
  suffix: 'px',
  hint: ''
});

const emit = defineEmits(['update', 'update:modelValue']);

const hKey = computed(() => props.keys[0]);
const vKey = computed(() => props.keys[1]);

const hModel = computed({
  get: () => get(props.modelValue, hKey.value) ?? 0,
  set: (val) => {
    const newValue = cloneDeep(props.modelValue || {});
    set(newValue, hKey.value, val);
    emit('update', newValue);
    emit('update:modelValue', newValue);
  }
});

const vModel = computed({
  get: () => get(props.modelValue, vKey.value) ?? 0,
  set: (val) => {
    const newValue = cloneDeep(props.modelValue || {});
    set(newValue, vKey.value, val);
    emit('update', newValue);
    emit('update:modelValue', newValue);
  }
});

const boxRef = ref<null | InstanceType<typeof BasicBox>>(null);

const iconStyle = computed(() => {
  return { cursor: 'ew-resize' };
});

const onMouseDown = (e: MouseEvent, type: 'h' | 'v') => {
  e.preventDefault();
  const startX = e.clientX;
  const startValue = type === 'h' ? hModel.value : vModel.value;

  const onMouseMove = (event: MouseEvent) => {
    const deltaX = event.clientX - startX;
    const step = event.shiftKey ? 10 : (event.altKey ? 0.1 : 1);
    const newValueNum = startValue + Math.round(deltaX * step * 0.5) / (event.altKey ? 10 : 1);

    if (type === 'h') {
      onHUpdate(newValueNum);
    } else {
      onVUpdate(newValueNum);
    }
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

function onHUpdate(val: number) {
  hModel.value = val;
}

function onVUpdate(val: number) {
  vModel.value = val;
}

function onFocus() {
  boxRef.value?.focus();
}

function onBlur() {
  boxRef.value?.blur();
}
</script>

<style lang="scss">
#visual-craft-core .c-box-spacing {
  width: 100%;

  .c-box-spacing-section {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    padding: 0 8px;
    height: 100%;

    &.v-part {
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

    .c-box-spacing-suffix {
      font-size: 12px;
      color: var(--theme-color-text-secondary);
      margin-left: 2px;
      flex-shrink: 0;
      opacity: 0.6;
    }
  }
}
</style>
