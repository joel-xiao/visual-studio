<template lang="pug">
div#layout
    n-layout-header(class="layout-header" bordered)
        headerVue
    n-layout(has-sider class='layout-contanner' position="absolute")
        n-layout-sider(class='layout-sider' :native-scrollbar="false")
            |海淀桥
        n-layout(class='layout-content' :native-scrollbar="false")
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
            n-h2
                |平山道
</template>

<script setup lang="ts">
import headerVue from './layout-header.vue';
</script>

<style lang="scss" scoped>
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

    .layout-sider {
      background: blue;
    }

    .layout-content {
      background: green;
    }
  }
}
</style>
