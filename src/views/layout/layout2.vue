<template lang="pug">
div#layout
    n-layout-header(class="layout-header" bordered)
        Header
    n-layout(has-sider class='layout-contanner' position="absolute")
        Content
</template>

<script setup lang="ts">
import Header from './layout-header.vue';
import Content from './layout-content.vue';
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

  & > .layout-contanner {
    top: 35px !important;
  }
}
</style>
