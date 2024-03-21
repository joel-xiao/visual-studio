<script setup lang="ts">
interface Props {
  separator: string;
  crumbs: CCrumbs;
  size?: CSize;
}
const props = withDefaults(defineProps<Props>(), {
  separator: '/',
  crumbs: () => [],
  size: ''
});
</script>

<template>
  <div class="c-crumbs"></div>
</template>

<style>
.c-crumbs {
  height: 32px;
}
</style>
