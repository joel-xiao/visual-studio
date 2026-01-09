<template>
  <div class="group-container"></div>
</template>

<script setup lang="ts">
interface Props {
  data?: IComponentProps;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => ({})
});
</script>

<style lang="scss">
.group-container {
  width: var(--node-width);
  height: var(--node-height);
  pointer-events: none;
}
</style>
