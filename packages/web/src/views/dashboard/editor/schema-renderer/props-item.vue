<template lang="pug">
div(class="schema-props-item" :style="style")
  slot
</template>

<script lang="ts">
export default {
  component_name: 'PANEL_PROPS_ITEM'
};
</script>
<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  type?: string;
  gridTemplateColumns?: string[];
}
const props = withDefaults(defineProps<Props>(), {
  type: '',
  gridTemplateColumns: () => []
});

const gridTemplateOption: { [key: string]: string } = {
  default: '1fr',
  small: '0.25fr',
  middle: '0.5fr',
  large: '1fr',
  mini: '30px'
};

const style = computed(() => {
  const style = { '--grid-template-columns': ' 0.5fr 0.5fr 30px' };

  if (props.gridTemplateColumns.length) {
    let columns = props.gridTemplateColumns;
    if (columns.length >= 1 && !columns.some(column => column === 'default' || !column))
      columns = [
        ...columns.filter(column => column !== 'mini').map(column => column || 'default'),
        'mini'
      ];

    style['--grid-template-columns'] = columns.map(column => gridTemplateOption[column]).join(' ');
  }

  return style;
});
</script>

<style lang="scss">
.editor-schema-renderer .schema-props-item {
  min-height: 30px;
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
