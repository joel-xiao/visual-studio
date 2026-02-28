<template>
  <Popover ref="popoverRef" v-bind="$attrs">
    <template #trigger>
      <slot name="trigger"></slot>
    </template>
    <slot></slot>
  </Popover>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref } from 'vue';
import Popover from '@/components/popover/index.vue';

const popoverRef = ref<InstanceType<typeof Popover> | null>(null);

defineExpose({
  open: () => popoverRef.value?.open(),
  close: () => popoverRef.value?.close()
});
</script>
