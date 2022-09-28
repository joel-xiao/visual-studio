<template lang="pug">
div(class = "editor-panel-attribute")
  Input
</template>

<script setup lang="ts">
import Input from './attribute-basic-ctrl/input.vue';
</script>

<style lang="scss">
.editor-panel-attribute {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: hidden;
  padding: 0 6px 90px 12px;
}
</style>
