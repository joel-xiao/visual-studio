<template lang="pug">
div(class="schema-props-layout" ref="propsLayout" :key="keyValue")
  div(class="schema-props-layout_title" v-if="showLabel")
    div(class="schema-props-layout_title-text") {{ label }}
    div(class="schema-props-layout_title-right_content")
      slot(name="title")
  div(class="schema-props-layout_content")
    slot
</template>

<script lang="ts">
export default {
  component_name: 'PANEL_PROPS_LAYOUT'
};
</script>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
interface Props {
  keyValue: string;
  label?: string;
}
const props = withDefaults(defineProps<Props>(), {
  keyValue: 'props-layout',
  label: ''
});

const showLabel = computed(() => !!props.label);

const propsLayout = ref<HTMLElement>();

onMounted(() => {
  propsLayout.value?.setAttribute(props.keyValue, '');
});
</script>

<style lang="scss">
.editor-schema-renderer .schema-props-layout {
  --color-divider: var(--theme-color-gray-100);

  display: grid;
  grid-row-gap: 6px;
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-divider);

  &:last-of-type {
    border-bottom: none;
  }

  .schema-props-layout_title {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .schema-props-layout_title-text {
      font-weight: 600;
      font-size: 12px;
      color: var(--theme-color-text-primary);
    }

    .schema-props-layout_title-right_content {
    }
  }

  .schema-props-layout_content {
    display: grid;
    grid-row-gap: 6px;
    grid-template-columns: 100%;
    grid-template-rows: auto;
  }
}
</style>
