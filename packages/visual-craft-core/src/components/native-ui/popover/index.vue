<template>
  <n-popover v-bind="$attrs">
    <template #trigger>
      <slot name="trigger"></slot>
    </template>
    <slot></slot>
  </n-popover>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { NPopover } from 'naive-ui';
</script>
