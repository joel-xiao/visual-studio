<template lang="pug">
div(class = "editor-panel-attribute")
  AttributeComponentContainer
</template>

<script setup lang="ts">
import AttributeComponentContainer from './attribute-packing/attribute-component-container.vue';
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
