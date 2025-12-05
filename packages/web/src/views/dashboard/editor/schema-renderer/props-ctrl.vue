<template lang="pug">
div(class="editor-schema-renderer-props-ctrl")
  template(v-if="layout === 'inline'")
    div(class="editor-schema-renderer-props-ctrl-label") {{ label }}
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
  layout?: string;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ctrl: '',
  ctrlType: '',
  layout: '',
  label: ''
});

const component_models = import.meta.glob(
  ['../../ui/controls/*/index.vue', './input-group/index.vue'],
  {
    eager: true,
    import: 'default'
  }
);

const components: { [key: string]: Component } = Object.keys(component_models).reduce(
  (acc, key: string) => {
    const component = component_models[key];
    // @ts-expect-error - Dynamic component registration
    acc[component.name] = component;
    return acc;
  },
  {}
);

const isComponent = (schema_name: string) => {
  return !!components[schema_name];
};

const getComponent = (schema_name: string) => {
  return components[schema_name];
};
</script>
<style lang="scss">
.editor-schema-renderer .schema-ctrl {
}
</style>
