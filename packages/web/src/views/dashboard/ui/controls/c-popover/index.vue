<template>
  <BasicPopover class="c-popover" v-bind="$attrs">
    <template #trigger>
      <slot name="trigger"></slot>
    </template>
    <slot></slot>
  </BasicPopover>
</template>

<script lang="ts">
export default {
  name: 'C_POPOVER',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import BasicPopover from '../../base/basic-popover.vue';
</script>

