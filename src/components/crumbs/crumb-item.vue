<script setup lang="ts">
import type { Size } from './../types.d';
import type { Crumbs } from './types.d';
interface Props {
  crumbs: Crumbs;
  size?: Size;
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
