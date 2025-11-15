<template lang="pug">
div#layout
  div(class="layout-header")
    Header
  div(class='layout-container')
    Content
</template>

<script setup lang="ts">
import Header from './components/layout-header.vue';
import Content from './components/layout-content.vue';
</script>

<style lang="scss">
#layout {
  position: relative;
  width: 100%;
  height: 100%;

  & > .layout-header {
    height: 36px;
    padding: 0 10px;
  }

  & > .layout-container {
  }
}
</style>
