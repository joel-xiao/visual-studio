<template lang="pug">
div(class = "editor-panel-attribute")
  AttributeComponentContainer(v-model="data")
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import AttributeComponentContainer from './attribute-packing/attribute-component-container.vue';
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
.editor-panel-attribute {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: hidden;
  padding: 0 6px 90px 12px;
}
</style>
