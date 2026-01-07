<template>
  <div
    v-if="isSelecting"
    class="marquee-select"
    :style="style"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMarqueeState } from '../../hooks/node-context/marquee-select';

const { isSelecting, rect } = useMarqueeState();

const style = computed(() => ({
  left: `${rect.x}px`,
  top: `${rect.y}px`,
  width: `${rect.width}px`,
  height: `${rect.height}px`
}));
</script>

<style lang="scss">
#visual-craft-core {
  .marquee-select {
    position: absolute;
    border: 1px solid var(--theme-color-blue-700);
    background-color: rgba(54, 98, 236, 0.1);
    pointer-events: none;
    z-index: 9999;
  }
}
</style>
