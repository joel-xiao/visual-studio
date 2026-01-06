<template>
<div class="c-edge">
  <div class="c-edge-container">
    <div class="c-edge-input-item top">
      <BasicInput 
        type="text" 
        :model-value="modelValue[0]" 
        :data-type="Number"
        @update="val => onUpdate(0, val)" 
      />
    </div>
    <div class="c-edge-input-item right">
      <BasicInput 
        type="text" 
        :model-value="modelValue[1]" 
        :data-type="Number"
        @update="val => onUpdate(1, val)" 
      />
    </div>
    <div class="c-edge-input-item bottom">
      <BasicInput 
        type="text" 
        :model-value="modelValue[2]" 
        :data-type="Number"
        @update="val => onUpdate(2, val)" 
      />
    </div>
    <div class="c-edge-input-item left">
      <BasicInput 
        type="text" 
        :model-value="modelValue[3]" 
        :data-type="Number"
        @update="val => onUpdate(3, val)" 
      />
    </div>
    <div class="c-edge-center-box"></div>
  </div>
</div>
</template>

<script lang="ts">
export default {
  name: 'C_EDGE',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { withDefaults } from 'vue';
import BasicInput from '../../base/basic-input.vue';

export interface IProps {
  modelValue?: (string | number)[];
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => [0, 0, 0, 0]
});

const emit = defineEmits(['update', 'update:modelValue']);

const onUpdate = (index: number, value: string | number) => {
  const newValue = [...props.modelValue];
  newValue[index] = value;
  emit('update', newValue);
  emit('update:modelValue', newValue);
};
</script>

<style lang="scss">
#visual-craft-core .c-edge {
  width: 100%;
  border-radius: 6px;
  overflow: hidden;

  .c-edge-container {
    background: var(--db-color-input-background);
    border-radius: 6px;
    height: 54px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    &:hover {
      background: var(--db-color-button-bg-hover);
    }
  }

  .c-edge-input-item {
    position: absolute;
    width: 30px;
    height: 18px;
    z-index: 2;

    .basic-input {
      text-align: center;
      font-size: 12px;
      color: var(--theme-color-text-primary);

      &:focus {
        color: var(--theme-color-blue-700);
      }
    }

    &.top {
      top: 3px;
      left: 50%;
      transform: translateX(-50%);
    }
    &.bottom {
      bottom: 3px;
      left: 50%;
      transform: translateX(-50%);
    }
    &.left {
      left: 4px;
      top: 50%;
      transform: translateY(-50%);
    }
    &.right {
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .c-edge-center-box {
    width: 120px;
    height: 14px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
    border: 1px dashed var(--theme-color-gray-400);
    z-index: 1;
  }
}
</style>
