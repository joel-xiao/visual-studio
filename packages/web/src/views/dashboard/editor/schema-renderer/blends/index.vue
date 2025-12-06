<template>
<div class="schema-blends">
  <div v-for="(item, index) in list" :key="index" class="schema-blends-item">
    <CBlend
      v-model="list[index]"
      v-bind="$attrs"
      @update="onUpdate"
    />
    <Button icon="icon-remove" type="hover" @click="onRemove(index)" />
  </div>
</div>
</template>

<script lang="ts">
export default {
  name: 'BLENDS',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, watch } from 'vue';
import CBlend from '../../../ui/controls/c-blend/index.vue';
import Button from '../../../ui/controls/c-button/index.vue';

const props = defineProps<{
  modelValue: {
    mix: string;
    opacity: number;
    visible: boolean;
  }[];
}>();

const emit = defineEmits(['update:modelValue', 'update']);

const list = ref(props.modelValue || []);

watch(
  () => props.modelValue,
  (val) => {
    list.value = val || [];
  },
  { deep: true }
);

function onUpdate() {
  emit('update:modelValue', list.value);
  emit('update', list.value);
}

function onRemove(index: number) {
  list.value.splice(index, 1);
  onUpdate();
}
</script>

<style lang="scss">
#dashboard .schema-blends {
  width: 100%;

  .schema-blends-item {
    display: flex;
    align-items: center;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }

    .c-blend {
      flex: 1;
      width: 0;
      margin-right: 6px;
    }
  }
}
</style>
