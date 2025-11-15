<template>
  <div class="c-select">
    <BasicBox ref="boxRef" :type="Type" @click="onOpenWrapper('wrapper')">
      <BasicIcon :lock="lock" :icon="icon" />
      <div class="c-select-label-wrapper">
        <BasicInput
          v-if="Type === 'input-select'"
          v-model="modelValue"
          :disabled="lock"
          v-bind="$attrs"
          type="text"
          @update="onUpdate"
        />
        <div v-else class="c-select-current-label">{{ CurrLabel }}</div>
      </div>
      <div class="c-select-icon" @click="onOpenWrapper('arrow')">
        <i class="icon-font icon-shouqi2"></i>
      </div>
    </BasicBox>
    <div ref="selectMaskRef" class="c-select-mask" @click="onClose"></div>
    <div ref="selectWrapperRef" class="c-select-wrapper">
      <template v-for="(item, idx) of Items" :key="idx">
        <div
          class="c-select-item"
          :class="enterValue === item.value ? 'active' : ''"
          @mouseenter="onItemEnter(item)"
          @click="onItemClick(item)"
        >
          <div class="c-select-item-icon">
            <i v-if="currValue === item.value" class="icon-font icon-shouqi2"></i>
          </div>
          <span>{{ item.label }}</span>
        </div>
        <div v-if="item.splitLine" class="c-select-item-split-line"></div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'C_SELECT',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, reactive, computed, provide, withDefaults } from 'vue';
import BasicBox from '../components/basic-box.vue';
import BasicIcon from '../components/basic-icon.vue';
import BasicInput from '../components/basic-input.vue';

interface IProps {
  type?: string;
  modelValue: string | number;
  lock?: boolean;
  icon?: string;
  options?: Item[];
}
type Item = {
  label: string;
  value: string | number;
  splitLine?: boolean;
};

const props = withDefaults(defineProps<IProps>(), {
  type: 'select', // select input-select
  modelValue: '',
  lock: false,
  icon: '',
  options: () => []
});

const emit = defineEmits(['update', 'update:modelValue']);

const Type = computed(() => {
  return props.type === 'input-select' ? 'input-select' : 'select';
});

const items = ref<Item[]>([
  { label: 'item1', value: 'item1' },
  { label: 'item2', value: 'item2' }
]);

const Items = computed(() => {
  const result = [...(props.options || [])];

  if (!result.some(item => modelValue.value === item.value)) {
    result.unshift({
      label: modelValue.value + '',
      value: modelValue.value,
      splitLine: true
    });
  }

  return result;
});

const modelValue = ref(props.modelValue);
const currValue = ref(modelValue.value);
const enterValue = ref(currValue.value);

const CurrLabel = computed(() => {
  const item = Items.value.find(item => item.value === currValue.value);
  return item ? item.label : '';
});

const onUpdate = function (value: string | number) {
  modelValue.value = value;
  currValue.value = value;
  enterValue.value = value;
  emit('update:modelValue', value);
  emit('update', value);
};

const boxRef = ref<null | InstanceType<typeof BasicBox>>(null);
const selectMaskRef = ref<null | HTMLElement>(null);
const selectWrapperRef = ref<null | HTMLElement>(null);

function onOpenWrapper(event_type: string) {
  // input-select type should not open wrapper
  if (Type.value === 'input-select' && event_type === 'wrapper') {
    return;
  }

  if (selectMaskRef.value && selectWrapperRef.value && boxRef.value) {
    const boxRect = boxRef.value.getRect();
    selectMaskRef.value.style.display = 'block';
    selectWrapperRef.value.style.display = 'block';
    selectWrapperRef.value.style.width = boxRect.width + 'px';
    selectWrapperRef.value.style.top = boxRect.top + 'px';
    selectWrapperRef.value.style.left = boxRect.left + 'px';
  }
}

function onClose() {
  if (selectMaskRef.value && selectWrapperRef.value) {
    selectMaskRef.value.style.display = 'none';
    selectWrapperRef.value.style.display = 'none';
  }
}

function onItemEnter(item: Item) {
  enterValue.value = item.value;
}

function onItemClick(item: Item) {
  onUpdate(item.value);
  onClose();
}
</script>

<style lang="scss">
#dashboard .c-select {
  width: 100%;

  .c-select-icon {
    margin-right: 2px;
    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex: none;
    color: var(--db-color-select-arrow);
    user-select: none;
    position: relative;
    transform: scale(0.9) rotate(90deg);
    font-weight: normal;

    width: 26.6px;
    height: 26.6px;
    border-radius: 3px;
  }

  &:hover {
    .c-select-icon {
      background-color: var(--db-color-select-arrow-bg-hover);
    }

    .select-box {
      .c-select-icon {
        background: none;
      }
    }
  }

  .c-select-label-wrapper {
    width: 100%;
    color: #fff;

    .c-select-current-label {
      width: 100%;
      box-sizing: border-box;
    }
  }

  .c-select-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: none;
    z-index: 1;
  }

  .c-select-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    padding: 6px 0px;
    background-color: var(--db-color-select-wrapper-background);
    border: 1px solid var(--theme-color-gray-100);
    border-radius: 6px;
    display: none;
    z-index: 1;

    .c-select-item {
      margin: 0 6px;
      height: 30px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      padding: 0px 4px;
      font-weight: normal;

      &:hover,
      &.active {
        background-color: var(--db-color-select-item-bg-hover);
      }

      .c-select-item-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
      }

      span {
        color: var(--db-color-select-item-text);
        font-size: 12px;
      }
    }

    .c-select-item-split-line {
      height: 1px;
      background-color: var(--theme-color-gray-100);
      margin: 6px 6px;
    }
  }
}
</style>
