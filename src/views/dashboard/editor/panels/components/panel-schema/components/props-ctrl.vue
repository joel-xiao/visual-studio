<template lang="pug">
component(v-if="isComponent(ctrl)" :is="getComponent(ctrl)" :type="ctrlType" v-bind="$attrs")
div(v-else) IS NO {{ ctrl }}
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

const component_models = import.meta.glob(['./../../../../../components/basic/*/index.vue', './input-group/index.vue'], {
  eager: true,
  import: 'default'
});

const components: { [key: string]: Component } = Object.keys(component_models).reduce((acc, key: string) => {
  const component = component_models[key];
  // @ts-ignore
  acc[component.name] = component;
  return acc;
}, {});

const isComponent = (schema_name: string) => {
  return !!components[schema_name];
};

const getComponent = (schema_name: string) => {
  return components[schema_name];
};
</script>
<style lang="scss">
.editor-panel-schema .schema-ctrl {}
</style>
