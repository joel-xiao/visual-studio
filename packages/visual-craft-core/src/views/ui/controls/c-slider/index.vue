<template>
  <div class="c-slider-wrapper" v-hint="hint || ''" :class="{ 'c-slider-small': size === 'small' }">
    <span v-if="content" class="c-slider-label">{{ content }}</span>
    <div class="c-slider">
      <div class="c-slider-group">
        <div class="slider-btn decrease" @click="onDecrease">
          <BasicIcon icon="mdi:minus" />
        </div>
        <div class="slider-track-wrap">
          <BasicSlider
            v-model="modelValue"
            :min="min"
            :max="max"
            :step="step"
            v-bind="$attrs"
          />
        </div>
        <div class="slider-btn increase" @click="onIncrease">
          <BasicIcon icon="mdi:plus" />
        </div>
      </div>
      <div class="c-slider-input">
        <BasicBox type="input">
          <BasicInput
            v-model="modelValue"
            :data-type="Number"
            type="text"
          />
        </BasicBox>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { hintDirective } from '../../../../directives/hint';

export default {
  name: 'C_SLIDER',
  directives: {
    hint: hintDirective
  },
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import BasicBox from '../../base/basic-box.vue';
import BasicInput from '../../base/basic-input.vue';
import BasicIcon from '../../base/basic-icon.vue';
import BasicSlider from '../../base/basic-slider.vue';

export interface IProps {
  modelValue?: number;
  content?: string | number;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  size?: 'small' | 'default';
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: 0,
  min: 0,
  max: 1,
  step: 0.1,
  size: 'default'
});

const emit = defineEmits(['update:modelValue', 'update']);

const modelValue = computed({
  get: () => props.modelValue ?? 0,
  set: (val) => {
    let value = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(value)) value = props.min;
    value = Math.min(Math.max(value, props.min), props.max);
    
    // Precision fix
    const stepStr = props.step.toString();
    const precision = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
    value = parseFloat(value.toFixed(precision));
    
    emit('update:modelValue', value);
    emit('update', value);
  }
});

const onDecrease = () => {
  modelValue.value = modelValue.value - props.step;
};

const onIncrease = () => {
  modelValue.value = modelValue.value + props.step;
};
</script>

<style lang="scss">
#visual-craft-core .c-slider-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  .c-slider-label {
    font-size: 12px;
    color: var(--theme-color-text-secondary);
    font-weight: 600;
    white-space: nowrap;
    min-width: 60px;
  }

  .c-slider {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;

    .c-slider-group {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--db-color-input-background);
      border-radius: 4px;
      padding: 0 6px;
      height: 30px;

      .slider-btn {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 4px;
        opacity: 0.6;
        transition: all 0.2s;

        &:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.08);
        }

        .basic-icon {
          font-size: 14px;
        }
      }

      .slider-track-wrap {
        flex: 1;
        padding: 0 4px;
        display: flex;
        align-items: center;
        height: 100%;
      }
    }

    .c-slider-input {
      width: 68px;
      flex-shrink: 0;

      .basic-box {
        height: 30px;
      }
      
      .basic-input {
        text-align: center;
        font-size: 13px;
      }
    }
  }

  &.c-slider-small {
    gap: 8px;
    .c-slider-label { font-size: 11px; min-width: 50px; }
    .c-slider {
      .c-slider-group {
        height: 24px;
        padding: 0 4px;
        .slider-btn { width: 18px; height: 18px; .basic-icon { font-size: 12px; } }
      }
      .c-slider-input {
        width: 56px;
        .basic-box { height: 24px; }
        .basic-input { font-size: 11px; }
      }
    }
  }
}
</style>

