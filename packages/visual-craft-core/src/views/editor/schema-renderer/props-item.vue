<template>
<div class="schema-props-item" :style="style">
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
  gridTemplateColumns?: string[];
}
const props = withDefaults(defineProps<Props>(), {
  type: '',
  gridTemplateColumns: () => []
});

const GRID_TEMPLATE_OPTIONS: Record<string, string> = {
  default: '1fr',
  small: '0.25fr',
  middle: '0.5fr',
  wide: '0.75fr',
  large: '1fr',
  mini: '30px',
  full: 'calc(100% - 30px)'
};

const style = computed(() => {
  const { gridTemplateColumns } = props;
  if (!gridTemplateColumns?.length) {
    return { '--grid-template-columns': '0.5fr 0.5fr 30px' };
  }

  let columns = [...gridTemplateColumns];
  const hasDefault = columns.some(c => c === 'default' || !c);

  if (!hasDefault) {
    columns = [...columns.filter(c => c !== 'mini').map(c => c || 'default'), 'mini'];
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
  grid-gap: 6px;
  grid-template-columns: var(--grid-template-columns);
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-weight: 600;
  color: var(--theme-color-text-secondary);
}
</style>
