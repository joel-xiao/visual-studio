<template>
  <n-popover v-bind="passthroughAttrs" :to="popoverTo">
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
import { computed, onMounted, ref, useAttrs } from 'vue';

const attrs = useAttrs() as Record<string, unknown>;
const teleportTo = ref<string | HTMLElement>('body');

const passthroughAttrs = computed(() => {
  const { to: _to, ...rest } = attrs as Record<string, unknown> & { to?: unknown };
  return rest;
});

const popoverTo = computed(() => {
  const explicitTo = (attrs as Record<string, unknown> & { to?: unknown }).to;
  if (explicitTo !== undefined) return explicitTo as string | HTMLElement;
  return teleportTo.value;
});

onMounted(() => {
  const target =
    document.querySelector<HTMLElement>('#visual-craft-core') ||
    document.querySelector<HTMLElement>('#visual-craft-core-project');
  if (target) teleportTo.value = target;
});
</script>
