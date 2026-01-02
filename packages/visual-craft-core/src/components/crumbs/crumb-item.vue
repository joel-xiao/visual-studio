<script setup lang="ts">
interface Props {
  crumbs: CCrumbs;
  size?: CSize;
}
const props = withDefaults(defineProps<Props>(), {
  crumbs: () => [],
  size: ''
});
</script>

<template>
  <div class="c-crumb-item"></div>
</template>

<style>
.c-crumb-item {
}
</style>
