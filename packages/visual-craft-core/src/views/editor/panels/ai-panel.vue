<template>
  <div class="ai-panel">
    <AiPanel />
  </div>
</template>

<script setup lang="ts">
import AiPanel from '../ai/chat.vue';
</script>

<style scoped lang="scss">
.ai-panel {
   position: absolute;
   right: 0;
   top: var(--db-editor-nav-bar-height);
   bottom: 0;
   width: var(--db-editor-right-menu-width);
   border-left: 1px solid var(--db-editor-color-canvas);
   display: flex;
   flex-direction: column;
   background-color: var(--db-editor-color-panel-bg, #1e1e1e);
   color: var(--theme-color-text);
   z-index: 20;
}
</style>
