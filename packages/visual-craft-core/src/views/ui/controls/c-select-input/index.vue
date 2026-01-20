<template>
  <div class="c-select-input">
    <BasicBox ref="boxRef" type="input">
      <!-- Select Part -->
      <div ref="triggerRef" class="c-select-input-section select-part" @click="onOpenWrapper">
        <BasicIcon :hint="hint" :icon="getIcon(0) || currentOptionIcon" :lock="lock" class="part-icon" />
        <BasicSelect
          ref="basicSelectRef"
          :model-value="selectModel"
          :options="options"
          :disabled="lock"
          @update="onSelectUpdate"
        />
      </div>

      <!-- Input Part -->
      <div class="c-select-input-section input-part">
        <BasicInput
          :model-value="inputModel"
          :data-type="Number"
          :disabled="lock"
          type="text"
          @update="onInputUpdate"
          @focus="onFocus"
          @blur="onBlur"
        />
        <span v-if="suffix" class="c-select-input-suffix">{{ suffix }}</span>
        <BasicIcon v-if="getIcon(1)" :icon="getIcon(1)" :lock="lock" class="part-icon" />
      </div>
    </BasicBox>
  </div>
</template>

<script lang="ts">
export default {
  name: 'C_SELECT_INPUT',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { get, set, cloneDeep } from 'lodash';
import BasicBox from '../../base/basic-box.vue';
import BasicInput from '../../base/basic-input.vue';
import BasicSelect from '../../base/basic-select.vue';
import BasicIcon from '../../base/basic-icon.vue';

export interface IProps {
  modelValue?: Record<string, string | number>;
  options?: { label: string; value: string | number; icon?: string }[];
  keys?: [string, string];
  icon?: string | string[];
  suffix?: string;
  lock?: boolean;
  hint?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => ({}),
  options: () => [],
  keys: () => ['select', 'input'],
  icon: '',
  suffix: '',
  lock: false,
  hint: ''
});

const emit = defineEmits(['update', 'update:modelValue']);

const selectKey = computed(() => props.keys[0]);
const inputKey = computed(() => props.keys[1]);

const selectModel = computed({
  get: () => get(props.modelValue, selectKey.value) ?? '',
  set: (val) => {
    const newValue = cloneDeep(props.modelValue || {});
    set(newValue, selectKey.value, val);
    emit('update', newValue);
    emit('update:modelValue', newValue);
  }
});

const inputModel = computed({
  get: () => get(props.modelValue, inputKey.value) ?? '',
  set: (val) => {
    const newValue = cloneDeep(props.modelValue || {});
    set(newValue, inputKey.value, val);
    emit('update', newValue);
    emit('update:modelValue', newValue);
  }
});

const getIcon = (index: number) => {
  if (Array.isArray(props.icon)) {
    return props.icon[index] || '';
  }
  return index === 0 ? props.icon : '';
};

const currentOptionIcon = computed(() => {
  return props.options.find(opt => opt.value === selectModel.value)?.icon || '';
});

const boxRef = ref<null | InstanceType<typeof BasicBox>>(null);
const triggerRef = ref<null | HTMLElement>(null);
const basicSelectRef = ref<null | InstanceType<typeof BasicSelect>>(null);

function onOpenWrapper() {
  if (props.lock) return;
  if (basicSelectRef.value && triggerRef.value) {
    basicSelectRef.value.open(triggerRef.value);
  }
}

function onSelectUpdate(val: string | number) {
  selectModel.value = val;
}

function onInputUpdate(val: string | number) {
  inputModel.value = val;
}

function onFocus() {
  boxRef.value?.focus();
}

function onBlur() {
  boxRef.value?.blur();
}
</script>

<style lang="scss">
#visual-craft-core .c-select-input {
  width: 100%;

  .c-select-input-section {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    padding: 0 4px;
    height: 100%;

    &.select-part {
      flex: 1.5;
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.2s;

      &:hover {
        background: var(--db-color-button-bg-hover);
      }
    }

    .part-icon {
      flex-shrink: 0;
      margin: 0 4px;
      font-size: 14px;
      opacity: 0.8;
    }

    .basic-select {
      flex: 1;
      width: 100%;
    }

    .basic-input {
      flex: 1;
      text-align: center;
    }

    .c-select-input-suffix {
      font-size: 14px;
      color: var(--theme-color-text-secondary);
      margin-left: 2px;
      margin-right: 2px;
      flex-shrink: 0;
      opacity: 0.8;
      display: flex;
      align-items: center;
      line-height: 1;
    }
  }

  .select-part {
    border-right: 1px solid var(--theme-color-gray-100);
  }
}
</style>
