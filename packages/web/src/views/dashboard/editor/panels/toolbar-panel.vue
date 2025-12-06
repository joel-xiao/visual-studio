<template>
<div class="editor-toolbar-panel">
</div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
#editor {
  .editor-toolbar-panel {
    border-bottom: 1px solid var(--db-editor-color-canvas);
    position: absolute;
    top: var(--db-editor-nav-bar-height);
    left: var(--db-editor-left-menu-width);
    right: var(--db-editor-right-menu-width);
    height: var(--db-editor-tool-bar-height);
    padding: 0 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--db-editor-color-panel-bg);
  }
}
</style>
