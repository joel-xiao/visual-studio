<template lang="pug">
div(class = "editor-panel-schema")
  Layout(v-model="data")
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import Layout from './layout/index.vue';
const data = reactive({
  x: 0,
  y: 0,
  w: 100,
  h: 100,
  rotate: 0,
  radius: [0, 0, 0, 0]
});
</script>

<style lang="scss">
.editor-panel-schema {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: hidden;
  padding: 0 6px 90px 12px;
}
</style>
