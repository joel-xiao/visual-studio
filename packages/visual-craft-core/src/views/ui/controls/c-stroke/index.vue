<template>
  <div class="c-stroke">
    <BasicBox ref="boxRef" v-bind="$attrs" type="input">
      <!-- Color Part -->
      <div class="c-stroke-section color-part">
        <BasicColorPicker
          :model-value="colorModel"
          @update:model-value="onColorUpdate"
        />
      </div>

      <!-- Width Part -->
      <div class="c-stroke-section width-part">
        <BasicIcon
          v-if="getIcon(1)"
          v-hint="getHint(1)"
          :icon="getIcon(1)"
          class="part-icon"
          :style="iconStyle"
          @mousedown="onMouseDown"
        />
        <BasicInput
          :model-value="widthModel"
          :data-type="Number"
          @update="onWidthUpdate"
          @focus="onFocus"
          @blur="onBlur"
        />
        <span class="c-stroke-suffix">{{ suffix }}</span>
      </div>

      <!-- Type Part -->
      <div ref="triggerRef" class="c-stroke-section type-part" @click="onOpenWrapper">
        <BasicSelect
          ref="basicSelectRef"
          :model-value="typeModel"
          :options="options"
          @update="onTypeUpdate"
        />
      </div>
    </BasicBox>
  </div>
</template>

<script lang="ts">
import { hintDirective } from '../../../../directives/hint';

export default {
  name: 'C_STROKE',
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
import BasicSelect from '../../base/basic-select.vue';
import BasicColorPicker from '../../base/basic-color-picker.vue';
import BasicIcon from '../../base/basic-icon.vue';

export interface IProps {
  modelValue?: Record<string, string | number>;
  keys?: [string, string, string];
  options?: { label: string; value: string }[];
  suffix?: string;
  hint?: string | string[];
  icon?: string | string[];
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => ({}),
  keys: () => ['color', 'width', 'type'],
  options: () => [
    { label: '实线', value: 'solid' },
    { label: '虚线', value: 'dashed' },
    { label: '点线', value: 'dotted' }
  ],
  suffix: 'px',
  hint: undefined,
  icon: undefined
});

const getHint = (index: number) => {
  if (Array.isArray(props.hint)) {
    return props.hint[index] || '';
  }
  return index === 1 ? (props.hint || '') : ''; // Width part is at index 1 conceptually
};

const getIcon = (index: number) => {
  if (Array.isArray(props.icon)) {
    return props.icon[index] || '';
  }
  return index === 1 ? props.icon : '';
};

const emit = defineEmits(['update', 'update:modelValue']);

const colorKey = computed(() => props.keys[0]);
const widthKey = computed(() => props.keys[1]);
const typeKey = computed(() => props.keys[2]);

const colorModel = computed({
  get: () => (get(props.modelValue, colorKey.value) ?? '#fff') as string,
  set: (val) => {
    const newValue = cloneDeep(props.modelValue || {});
    set(newValue, colorKey.value, val);
    emit('update', newValue);
    emit('update:modelValue', newValue);
  }
});

const widthModel = computed({
  get: () => get(props.modelValue, widthKey.value) ?? 1,
  set: (val) => {
    const newValue = cloneDeep(props.modelValue || {});
    set(newValue, widthKey.value, val);
    emit('update', newValue);
    emit('update:modelValue', newValue);
  }
});

const typeModel = computed({
  get: () => get(props.modelValue, typeKey.value) ?? 'solid',
  set: (val) => {
    const newValue = cloneDeep(props.modelValue || {});
    set(newValue, typeKey.value, val);
    emit('update', newValue);
    emit('update:modelValue', newValue);
  }
});

const boxRef = ref<null | InstanceType<typeof BasicBox>>(null);
const triggerRef = ref<null | HTMLElement>(null);
const basicSelectRef = ref<null | InstanceType<typeof BasicSelect>>(null);

const iconStyle = computed(() => {
  return { cursor: 'ew-resize' };
});

const onMouseDown = (e: MouseEvent) => {
  e.preventDefault();
  const startX = e.clientX;
  const startValue = Number(widthModel.value);

  const onMouseMove = (event: MouseEvent) => {
    const deltaX = event.clientX - startX;
    const step = event.shiftKey ? 10 : (event.altKey ? 0.1 : 1);
    const newValueNum = startValue + Math.round(deltaX * step * 0.5) / (event.altKey ? 10 : 1);

    onWidthUpdate(newValueNum);
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

function onOpenWrapper() {
  if (basicSelectRef.value && triggerRef.value) {
    basicSelectRef.value.open(triggerRef.value);
  }
}

function onColorUpdate(val: string) {
  colorModel.value = val;
}

function onWidthUpdate(val: number) {
  widthModel.value = val;
}

function onTypeUpdate(val: string) {
  typeModel.value = val;
}

function onFocus() {
  boxRef.value?.focus();
}

function onBlur() {
  boxRef.value?.blur();
}
</script>

<style lang="scss">
#visual-craft-core .c-stroke {
  width: 100%;

  .c-stroke-section {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 0 4px;
    height: 100%;

    &.color-part {
      flex: 0 0 auto;
      padding: 0;
      border-right: 1px solid var(--theme-color-gray-100);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &.width-part {
      flex: 1;
      justify-content: center;
      padding: 0 8px;
    }

    &.type-part {
      flex: 1.2;
      cursor: pointer;
      border-radius: 0 4px 4px 0;
      border-left: 1px solid var(--theme-color-gray-100);
      transition: background 0.2s;

      &:hover {
        background: var(--db-color-button-bg-hover);
      }
    }

    .basic-input {
      flex: 1;
      text-align: center;
    }

    .part-icon {
      flex-shrink: 0;
      font-size: 14px;
      margin-right: 4px;
      opacity: 0.5;
    }

    .basic-select {
      flex: 1;
      width: 100%;

      .basic-select-label {
        margin-left: 10px;
      }
    }

    .c-stroke-suffix {
      font-size: 12px;
      color: var(--theme-color-text-secondary);
      margin-left: 2px;
      margin-right: 8px;
      flex-shrink: 0;
      opacity: 0.6;
    }
  }
}
</style>
