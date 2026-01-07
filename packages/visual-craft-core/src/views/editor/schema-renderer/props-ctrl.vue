<template>
<div class="editor-schema-renderer-props-ctrl" :class="{ 'is-inline': layout === 'inline' }">
  <div v-if="label" class="editor-schema-renderer-props-ctrl-label">
    {{ label }}
  </div>
  <div class="editor-schema-renderer-props-ctrl-control">
    <template v-if="isComponent(ctrl)">
      <component :is="getComponent(ctrl)" :type="ctrlType" v-bind="$attrs" />
    </template>
    <div v-else>IS NO {{ ctrl }}</div>
  </div>
</div>
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
export interface Props {
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
  ['../../ui/controls/*/index.vue', './input-group/index.vue', './blends/index.vue'],
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
.editor-schema-renderer .editor-schema-renderer-props-ctrl {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .editor-schema-renderer-props-ctrl-label {
    flex: 0 0 auto;
    font-size: 12px;
    font-weight: 600;
    color: var(--theme-color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .editor-schema-renderer-props-ctrl-control {
    flex: 1;
    min-width: 0;
  }

  &.is-inline {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    .editor-schema-renderer-props-ctrl-label {
      width: 72px;
    }
  }
}
</style>
