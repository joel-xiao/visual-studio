<template lang="pug">
div(class="schema-props-item" :class="itemClass" :style="style")
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
  gridTemplateColumns: string[];
}
const props = withDefaults(defineProps<Props>(), {
  type: '',
  gridTemplateColumns: []
});

const itemClass = ref<string>('');
switch (props.type) {
  case 'radius':
    itemClass.value = 'radius_more';
    break;
  default:
    itemClass.value = '';
    break;
}

const gridTemplateOption: { [key: string]: string } = {
  right: '30px',
  small: '0.25fr',
  default: '0.5fr',
  large: '1fr'
};

const style = computed(() => {
  let style = {
    '--grid-template-columns': props.gridTemplateColumns.length
      ? [
          ...props.gridTemplateColumns
            .filter((column) => column !== 'right')
            .map((column) => column || 'default'),
          'right'
        ]
          .map((column) => gridTemplateOption[column])
          .join(' ')
      : ' 0.5fr 0.5fr 30px'
  };

  return style;
});
</script>

<style lang="scss">
.editor-panel-schema .schema-props-item {
  height: 30px;
  width: 100%;
  display: grid;
  grid-gap: 6px;
  grid-template-columns: var(--grid-template-columns);
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-weight: 600;
  color: var(--color-text-secondary);

  &.radius_more {
    -webkit-box-align: start;
    -ms-flex-align: start;
    align-items: start;
    height: auto;
    grid-template-columns: 1fr !important;
  }
}
</style>
