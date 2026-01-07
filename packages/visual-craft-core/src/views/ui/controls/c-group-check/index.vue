<template>
<div class="c-group-check">
<basic-box
      v-for="item in options"
      :key="item.value"
      type="group-item"
      :model-value="isChecked(item.value)"
      @click="toggle(item.value)"
    >
    <basic-icon :icon="item.icon" :hint="item.hint" />
  </basic-box>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BasicBox from '../../base/basic-box.vue';
import BasicIcon from '../../base/basic-icon.vue';

export interface Option {
  label?: string;
  value: string | number;
  icon?: string;
  hint?: string;
}

export interface Props {
  modelValue?: (string | number)[];
  options?: Option[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: () => [],
});

const emit = defineEmits(['update:modelValue', 'update']);

const isChecked = (value: string | number) => {
  return props.modelValue.includes(value);
};

const toggle = (value: string | number) => {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(value);

  if (index === -1) {
    newValue.push(value);
  } else {
    newValue.splice(index, 1);
  }

  emit('update:modelValue', newValue);
  emit('update', newValue);
};
</script>

<script lang="ts">
export default {
  name: 'C_GROUP_CHECK'
};
</script>

<style lang="scss">
#visual-craft-core .c-group-check {
  display: flex;
  gap: 4px;
  width: 100%;

  .basic-box {
    flex: 1;
  }
}
</style>
