<template lang="pug">
component(v-if="isComponent(ctrl)" :is="getComponent(ctrl)" :type="ctrlType" v-bind="$attrs")
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
  panel_name: 'PANEL_PROPS_CTRL'
};
</script>
<script setup lang="ts">
import { reactive, markRaw, defineAsyncComponent } from 'vue';
import type { Component } from 'vue';
interface Props {
  ctrl: string;
  ctrlType: string;
}

const props = withDefaults(defineProps<Props>(), {
  ctrl: '',
  ctrlType: ''
});

const components = reactive<{ [key: string]: Component }>({
  ['input']: markRaw(
    defineAsyncComponent(() => import('./../../../../../components/basic/c-input/index.vue'))
  ),
  ['button']: markRaw(
    defineAsyncComponent(() => import('./../../../../../components/basic/c-button/index.vue'))
  ),
  ['input-group']: markRaw(defineAsyncComponent(() => import('./input-group/index.vue')))
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
