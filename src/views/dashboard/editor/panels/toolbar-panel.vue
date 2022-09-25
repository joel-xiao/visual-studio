ya
<template lang="pug">
div.editor-toolbar-panel
  |
</template>

<script setup lang="ts"></script>

<style lang="scss">
#editor {
  .editor-toolbar-panel {
    border-bottom: 1px solid var(--theme-color-canvas);
    position: absolute;
    top: var(--nav-bar-height);
    left: var(--left-menu-width);
    right: var(--right-menu-width);
    height: var(--tool-bar-height);
    padding: 0 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--editor-panel-bg-color);
  }
}
</style>
