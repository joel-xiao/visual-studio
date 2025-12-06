<template>
  <div class="c-select">
    <BasicBox ref="boxRef" :type="Type" @click="onOpenWrapper('wrapper')">
      <BasicIcon :lock="lock" :icon="icon" @mousedown="onMouseDown" :style="iconStyle" />
      <div v-if="Type === 'input-select'" class="c-select-label-wrapper">
        <BasicInput
          v-model="modelValue"
          :disabled="lock"
          v-bind="$attrs"
          type="text"
          @update="onUpdate"
        />
      </div>
      <BasicSelect
        ref="basicSelectRef"
        :model-value="modelValue"
        :options="Items"
        :show-label="Type !== 'input-select'"
        :disabled="lock"
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

const onUpdate = function (value: string | number) {
  modelValue.value = value;
  currValue.value = value;
  enterValue.value = value;
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
      const currentIndex = Items.value.findIndex(item => item.value === currValue.value);
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
#dashboard .c-select {
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
}
</style>
