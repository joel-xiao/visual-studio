<template>
<div class="c-group-select">
<basic-box
      v-for="item in options"
      :key="item.value"
      type="group-item"
      :model-value="item.value === modelValue"
      @click="select(item.value)"
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
  modelValue?: string | number;
  options?: Option[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  size: 'medium'
});

const emit = defineEmits(['update:modelValue', 'update']);

const select = (value: string | number) => {
  if (props.modelValue !== value) {
    emit('update:modelValue', value);
    emit('update', value);
  }
};
</script>

<script lang="ts">
export default {
  name: 'C_GROUP_SELECT'
};
</script>

<style lang="scss">
#visual-craft-core .c-group-select {
  display: flex;
  gap: 4px;
  width: 100%;

  .basic-box {
    flex: 1;
  }
}
</style>
