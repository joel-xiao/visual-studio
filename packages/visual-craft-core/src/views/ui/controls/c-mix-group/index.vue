<template>
  <div class="c-mix-group" :class="{ 'c-mix-group-small': size === 'small' }">
    <BasicBox v-bind="$attrs" type="input">
      <div
        v-for="(key, index) in keys"
        :key="key"
        class="c-mix-group-section"
        :class="[
          `type-${ctrls[index]}`,
          { 'has-border': index > 0 }
        ]"
      >
        <!-- Color Picker -->
        <template v-if="ctrls[index] === 'C_COLOR_PICKER'">
          <BasicColorPicker
            :model-value="(getValue(key) as string)"
            :hint="getHint(index)"
            @update:model-value="val => onUpdate(key, val)"
          />
        </template>

        <!-- Input -->
        <template v-else-if="ctrls[index] === 'C_INPUT'">
          <div class="input-inner" v-hint="!getIcon(index) ? getHint(index) : ''">
            <BasicIcon
              v-if="getIcon(index)"
              v-hint="getHint(index)"
              :icon="getIcon(index)"
              class="drag-icon"
              @mousedown="(e: MouseEvent) => onMouseDown(e, key)"
            />
            <BasicInput
              :model-value="(getValue(key) as any)"
              :data-type="Number"
              @update="val => onUpdate(key, val)"
            />
            <span v-if="getSuffix(index)" class="suffix">{{ getSuffix(index) }}</span>
          </div>
        </template>

        <!-- Select -->
        <template v-else-if="ctrls[index] === 'C_SELECT'">
          <div class="select-inner" v-hint="getHint(index)" @click="e => onOpenSelect(e, index)">
            <BasicSelect
              :ref="el => setSelectRef(el, index)"
              :model-value="(getValue(key) as any)"
              :options="getOptions(index)"
              :show-label="true"
              @update="val => onUpdate(key, val)"
            />
          </div>
        </template>
      </div>
    </BasicBox>
  </div>
</template>

<script lang="ts">
import { hintDirective } from '../../../../directives/hint';

export default {
  name: 'C_MIX_GROUP',
  directives: {
    hint: hintDirective
  },
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue';
import { get, set, cloneDeep } from 'lodash';
import BasicBox from '../../base/basic-box.vue';
import BasicInput from '../../base/basic-input.vue';
import BasicColorPicker from '../../base/basic-color-picker.vue';
import BasicSelect from '../../base/basic-select.vue';
import BasicIcon from '../../base/basic-icon.vue';

export interface IProps {
  modelValue?: Record<string, unknown>;
  keys: string[];
  ctrls: string[];
  icons?: string[];
  hints?: string[];
  suffix?: string;
  suffixes?: string[];
  options?: SchemaOptionItem[][];
  size?: 'small' | 'default';
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => ({}),
  keys: () => [],
  ctrls: () => [],
  icons: () => [],
  hints: () => [],
  suffix: '',
  suffixes: () => [],
  options: () => [],
  size: 'default'
});

const emit = defineEmits(['update', 'update:modelValue']);

const getValue = (key: string) => get(props.modelValue, key);

const onUpdate = (key: string, val: unknown) => {
  const newValue = cloneDeep(props.modelValue || {});
  set(newValue, key, val);
  emit('update', newValue);
  emit('update:modelValue', newValue);
};

const getIcon = (index: number) => props.icons?.[index] || '';
const getHint = (index: number) => props.hints?.[index] || '';
const getSuffix = (index: number) => props.suffixes?.[index] || (props.ctrls[index] === 'C_INPUT' ? props.suffix : '') || '';
const getOptions = (index: number) => props.options?.[index] || [];

const selectRefs = ref<Record<number, InstanceType<typeof BasicSelect>>>({});
const setSelectRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) selectRefs.value[index] = el as InstanceType<typeof BasicSelect>;
};

const onOpenSelect = (e: MouseEvent, index: number) => {
  const select = selectRefs.value[index];
  if (select) {
    select.open(e.currentTarget as HTMLElement);
  }
};

const onMouseDown = (e: MouseEvent, key: string) => {
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
</script>

<style lang="scss">
#visual-craft-core .c-mix-group {
  width: 100%;

  .c-mix-group-section {
    display: flex;
    align-items: center;
    height: 100%;
    flex: 1;
    min-width: 0;

    &.has-border {
      border-left: 1px solid var(--theme-color-gray-100);
    }

    &.type-C_COLOR_PICKER {
      flex: 0 0 32px;
      justify-content: center;
      .basic-color-picker-wrapper {
        .n-color-picker { margin: 0; }
      }
    }

    &.type-C_INPUT {
      .input-inner {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        padding: 0 4px;
        .basic-input { text-align: center; }
        .drag-icon { font-size: 14px; margin-right: 4px; opacity: 0.5; cursor: ew-resize; }
        .suffix { font-size: 12px; margin-left: 2px; opacity: 0.5; }
      }
    }

    &.type-C_SELECT {
      flex: 1.2;
      .select-inner {
        width: 100%;
        height: 100%;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 0 4px;
        &:hover { background: var(--db-color-button-bg-hover); }
        .basic-select { width: 100%; }
      }
    }
  }
}
.c-mix-group-small {
  height: 24px;
  .basic-box { height: 100%; min-height: 24px; }
  .c-mix-group-section {
    &.type-C_INPUT {
      .input-inner {
        .basic-input {
          font-size: 12px;
          :deep(.n-input__input-el) { height: 24px; line-height: 24px; }
        }
      }
    }
  }
}
</style>
