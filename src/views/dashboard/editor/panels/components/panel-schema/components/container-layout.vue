<template lang="pug">
div(class="schema-container-layout" ref="layout" :key="keyValue")
  div(class="schema-container-layout_title")
    div(class="schema-container-layout_title-text") {{title}}
    div(class="schema-container-layout_title-right_content")
      slot(name="title")
  div(class="schema-container-layout_content")
    slot
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
interface Props {
  keyValue: string;
  title?: string;
}
const props = withDefaults(defineProps<Props>(), {
  keyValue: '',
  title: ''
});

const layout = ref<HTMLElement>();

onMounted(() => {
  layout.value?.setAttribute(props.keyValue, '');
});
</script>

<style lang="scss">
.editor-panel-schema .schema-container-layout {
  --color-divider: var(--theme-color-gray-100);

  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-divider);

  .schema-container-layout_title {
    .schema-container-layout_title-text {
    }
    .schema-container-layout_title-right_content {
    }
  }

  .schema-container-layout_content {
    display: grid;
    grid-row-gap: 6px;
    grid-template-columns: 100%;
    grid-template-rows: auto;
  }
}
</style>
