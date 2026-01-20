<template>
  <div class="schema-props-item" :style="style">
    <div v-if="label" class="schema-props-item-label">{{ label }}</div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
export default {
  component_name: 'PANEL_PROPS_ITEM'
};
</script>
<script setup lang="ts">
import { ref, computed } from 'vue';

export interface Props {
  type?: string;
  label?: string;
  gridTemplateColumns?: string[];
}
const props = withDefaults(defineProps<Props>(), {
  type: '',
  label: '',
  gridTemplateColumns: () => []
});

const GRID_TEMPLATE_OPTIONS: Record<string, string> = {
  label: '72px',
  default: '1fr',
  small: '0.25fr',
  middle: '0.5fr',
  wide: '0.75fr',
  large: '1fr',
  mini: '30px',
  full: 'calc(100% - 30px)'
};

const style = computed(() => {
  const { gridTemplateColumns, label } = props;
  let columns = [...(gridTemplateColumns || [])];

  if (!columns.length) {
    columns = ['0.5fr', '0.5fr', 'mini'];
  }

  const hasDefault = columns.some(c => c === 'default' || !c);

  if (!hasDefault && columns.length > 0) {
    const lastIsMini = columns[columns.length - 1] === 'mini';
    if (!lastIsMini) {
      columns = [...columns.map(c => c || 'default'), 'mini'];
    }
  }

  // Prepend label column if label exists
  if (label) {
    columns = ['label', ...columns];
  }

  return {
    '--grid-template-columns': columns.map(c => GRID_TEMPLATE_OPTIONS[c] || c).join(' ')
  };
});
</script>

<style lang="scss">
.editor-schema-renderer .schema-props-item {
  width: 100%;
  display: grid;
  grid-gap: 8px;
  grid-template-columns: var(--grid-template-columns);
  align-items: center;
  font-weight: 600;
  color: var(--theme-color-text-secondary);

  .schema-props-item-label {
    font-size: 12px;
    color: var(--theme-color-text-secondary);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
