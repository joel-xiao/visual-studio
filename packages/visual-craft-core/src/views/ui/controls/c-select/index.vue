<template>
  <div class="c-select" :class="{ 'c-select-small': size === 'small' }">
    <BasicBox ref="boxRef" :type="Type" @click="onOpenWrapper('wrapper')">
      <BasicIcon v-if="size !== 'small'" :lock="lock" :icon="icon" :style="iconStyle" @mousedown="onMouseDown" />
      <div v-if="Type === 'input-select'" class="c-select-label-wrapper">
        <BasicInput
          :model-value="props.modelValue"
          :disabled="lock"
          v-bind="$attrs"
          type="text"
          @update="onUpdate"
        />
      </div>
      <BasicSelect
        ref="basicSelectRef"
        :model-value="props.modelValue"
        :options="Items"
        :show-label="Type !== 'input-select'"
        :disabled="lock"
        :size="size"
        @update="onUpdate"
        @click="onOpenWrapper('arrow')"
      />
    </BasicBox>
  </div>
</template>

<script lang="ts">
export default {
  name: 'C_SELECT',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, computed, withDefaults } from 'vue';
import BasicBox from '../../base/basic-box.vue';
import BasicIcon from '../../base/basic-icon.vue';
import BasicInput from '../../base/basic-input.vue';
import BasicSelect from '../../base/basic-select.vue';

export interface IProps {
  type?: string;
  modelValue: string | number;
  lock?: boolean;
  icon?: string;
  options?: Item[];
  size?: 'small' | 'default';
}
export type Item = {
  label: string;
  value: string | number;
  splitLine?: boolean;
};

const props = withDefaults(defineProps<IProps>(), {
  type: 'select', // select input-select
  modelValue: '',
  lock: false,
  icon: '',
  options: () => [],
  size: 'default'
});

const emit = defineEmits(['update', 'update:modelValue']);

const Type = computed(() => {
  return props.type === 'input-select' ? 'input-select' : 'select';
});

const Items = computed(() => {
  const result = [...(props.options || [])];

  if (!result.some(item => props.modelValue === item.value)) {
    result.unshift({
      label: props.modelValue + '',
      value: props.modelValue,
      splitLine: true
    });
  }

  return result;
});

const onUpdate = function (value: string | number) {
  emit('update:modelValue', value);
  emit('update', value);
};

const iconStyle = computed(() => {
  return !props.lock && props.options?.length ? { cursor: 'ew-resize' } : {};
});

const onMouseDown = (e: MouseEvent) => {
  if (props.lock || !props.options?.length) return;

  e.preventDefault();
  const startX = e.clientX;
  let lastX = startX;
  const threshold = 10; // pixels to move to change one item

  const onMouseMove = (event: MouseEvent) => {
    const currentX = event.clientX;
    const delta = currentX - lastX;

    if (Math.abs(delta) >= threshold) {
      const step = delta > 0 ? 1 : -1;
      const currentIndex = Items.value.findIndex(item => item.value === props.modelValue);
      let newIndex = currentIndex + step;

      // Clamp index
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= Items.value.length) newIndex = Items.value.length - 1;

      if (newIndex !== currentIndex) {
        onUpdate(Items.value[newIndex].value);
        lastX = currentX; // Reset reference point
      }
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

const boxRef = ref<null | InstanceType<typeof BasicBox>>(null);
const basicSelectRef = ref<null | InstanceType<typeof BasicSelect>>(null);

function onOpenWrapper(event_type: string) {
  // input-select type should not open wrapper
  if (Type.value === 'input-select' && event_type === 'wrapper') {
    return;
  }

  if (basicSelectRef.value && boxRef.value) {
    basicSelectRef.value.open(boxRef.value.$el as HTMLElement);
  }
}
</script>

<style lang="scss">
#visual-craft-core .c-select {
  width: 100%;

  .c-select-label-wrapper {
    flex: 1;
    min-width: 0;
    color: #fff;
  }

  .basic-select {
    margin-right: 2px;
    flex-shrink: 0;
  }

  &.c-select-small {
    .basic-box {
      height: 24px;
      min-height: 24px;
      padding: 0 4px;
    }

    .basic-select-label {
      font-size: 11px;
    }

    .basic-select-arrow {
      width: 18px;
      height: 18px;
      transform: scale(0.7) rotate(90deg);
    }
  }
}
</style>
