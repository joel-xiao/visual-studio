<template>
  <div
    class="basic-slider"
    ref="trackRef"
    @mousedown="onMouseDown"
  >
    <div class="basic-slider-track">
      <div class="basic-slider-fill" :style="{ width: percent + '%' }"></div>
    </div>
    <div class="basic-slider-thumb" :style="{ left: percent + '%' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

interface Props {
  modelValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false
});

const emit = defineEmits(['update:modelValue', 'update', 'change']);

const trackRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);

const percent = computed(() => {
  const range = props.max - props.min;
  if (range === 0) return 0;
  return Math.min(Math.max(((props.modelValue - props.min) / range) * 100, 0), 100);
});

const updateValue = (clientX: number) => {
  if (!trackRef.value) return;
  const rect = trackRef.value.getBoundingClientRect();
  const offset = clientX - rect.left;
  let newPercent = offset / rect.width;
  newPercent = Math.min(Math.max(newPercent, 0), 1);
  
  let newValue = props.min + newPercent * (props.max - props.min);
  if (props.step > 0) {
    newValue = Math.round(newValue / props.step) * props.step;
  }
  
  // Precision fix for floating point errors
  const stepStr = props.step.toString();
  const precision = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
  newValue = parseFloat(newValue.toFixed(precision));
  
  if (newValue !== props.modelValue) {
    emit('update:modelValue', newValue);
    emit('update', newValue);
    emit('change', newValue);
  }
};

const onMouseDown = (e: MouseEvent) => {
  if (props.disabled) return;
  updateValue(e.clientX);
  isDragging.value = true;
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};

const onMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    updateValue(e.clientX);
  }
};

const onMouseUp = () => {
  isDragging.value = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
};

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
});
</script>

<style lang="scss">
#visual-craft-core .basic-slider {
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  user-select: none;

  .basic-slider-track {
    width: 100%;
    height: 2px;
    background: var(--theme-color-border-light, rgba(255, 255, 255, 0.1));
    border-radius: 1px;
    position: relative;
    overflow: hidden;

    .basic-slider-fill {
      height: 100%;
      background: var(--theme-color-blue-700);
      position: absolute;
      left: 0;
      top: 0;
    }
  }

  .basic-slider-thumb {
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 4px;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: transform 0.1s;
    pointer-events: none;
    z-index: 1;

    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: rgba(54, 98, 236, 0.1);
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.2s;
    }
  }

  &:hover .basic-slider-thumb {
    transform: translate(-50%, -50%) scale(1.1);
    &::after {
      opacity: 1;
    }
  }
}
</style>
