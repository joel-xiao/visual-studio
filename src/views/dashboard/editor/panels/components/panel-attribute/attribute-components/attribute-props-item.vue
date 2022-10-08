<template lang="pug">
div(class="attribute-props-item" :class="itemClass")
  slot
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  type: string;
}
const props = withDefaults(defineProps<Props>(), {
  type: ''
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
</script>

<style lang="scss">
.editor-panel-attribute .attribute-props-item {
  height: 30px;
  width: 100%;
  display: grid;
  grid-gap: 6px;
  grid-template-columns: 1fr 1fr 30px;
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
    grid-template-columns: 1fr;
  }
}
</style>
