<template lang="pug">
component(v-if="isComponent(ctrl)" :is="getComponent(ctrl)" v-bind="$attrs")
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
  panel_name: 'PANEL_PROPS_CTRL'
};
</script>
<script setup lang="ts">
import { reactive, markRaw } from 'vue';
import Input from './../../../../components/basic/c-input/index.vue';
import Button from './../../../../components/basic/c-button/index.vue';

interface Props {
  ctrl: string;
}

const props = withDefaults(defineProps<Props>(), {
  ctrl: ''
});

const components = reactive({
  ['input' as string]: markRaw(Input),
  ['button' as string]: markRaw(Button)
});

const isComponent = (schema_name: string) => {
  return !!components[schema_name];
};

const getComponent = (schema_name: string) => {
  return components[schema_name];
};
</script>
<style lang="scss">
.editor-panel-schema .schema-ctrl {
}
</style>
