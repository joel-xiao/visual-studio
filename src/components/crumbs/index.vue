<script setup lang="ts">
import type { Size } from './../types.d';
import type { Crumbs } from './types.d';
interface Props {
  separator: string;
  crumbs: Crumbs;
  size?: Size;
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
