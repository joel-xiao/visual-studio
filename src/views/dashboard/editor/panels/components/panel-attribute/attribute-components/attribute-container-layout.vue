<template lang="pug">
div(class="attribute-container-layout" :key="keyValue")
  div(class="attribute-container-layout_title")
    div(class="attribute-container-layout_title-text") {{title}}
    div(class="attribute-container-layout_title-right_content")
      slot(name="title")
  div(class="attribute-container-layout_content")
    slot
</template>

<script setup lang="ts">
interface Props {
  keyValue: string;
  title: string;
}
const props = withDefaults(defineProps<Props>(), {
  keyValue: '',
  title: ''
});
</script>

<style lang="scss">
.editor-panel-attribute .attribute-container-layout {
  --color-divider: var(--theme-color-gray-100);

  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-divider);

  .attribute-container-layout_title {
    .attribute-container-layout_title-text {
    }
    .attribute-container-layout_title-right_content {
    }
  }

  .attribute-container-layout_content {
    display: grid;
    grid-row-gap: 6px;
    grid-template-columns: 100%;
    grid-template-rows: auto;
  }
}
</style>
