<template>
  <Popover v-bind="$attrs">
    <template #trigger>
      <slot name="trigger"></slot>
    </template>
    <slot></slot>
  </Popover>
</template>

<script setup lang="ts">
import Popover from '@/components/native-ui/popover/index.vue';
</script>
