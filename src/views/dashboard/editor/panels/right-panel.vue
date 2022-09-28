<template lang="pug">
div.editor-right-panel
  .panel-tab_bar
    PanelTabBar
  PanelAttribute
</template>

<script setup lang="ts">
import PanelTabBar from './components/panel-tab-bar/index.vue';
import PanelAttribute from './components/panel-attribute/index.vue';
</script>

<style lang="scss">
#editor {
  .editor-right-panel {
    position: absolute;
    right: 0px;
    top: var(--nav-bar-height);
    bottom: 0px;
    width: var(--right-menu-width);
    border-left: 1px solid var(--theme-color-canvas);
    background-color: var(--editor-panel-bg-color);
    .panel-tab_bar {
      border-bottom: 1px solid var(--theme-color-canvas);
      padding: 0 6px 0 12px;
      height: var(--tab-bar-height);
    }
  }
}
</style>
