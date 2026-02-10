<template>
  <template v-for="item in items" :key="item.key">
    <component
      :is="getComponent(item.name)"
      :model-value="getPropValue(propsData, item.key)"
      :key-value="item.key"
      :props-type="item"
      :schema-type="schemaType"
      @update="onUpdate(item.key, item.schema, $event)"
    />
  </template>
</template>

<script setup lang="ts">
import { markRaw } from 'vue';
import type { Component } from 'vue';
import { get } from 'lodash';
import PropsWarp from './props-warp.vue';
import Layout from './layout/index.vue';

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: readonly any[];
  propsData: Record<string, unknown>;
  schemaType?: string;
}>();

const emit = defineEmits(['update']);

const components: Record<string, Component> = {
  [Layout.schema_name as string]: markRaw(Layout),
  [PropsWarp.component_name as string]: markRaw(PropsWarp)
};

const getComponent = (name: string) => {
  return components[name] || components['PANEL_PROPS_WRAP'];
};

const onUpdate = (key: string, schema: unknown, event: unknown) => {
  emit('update', key, schema, event);
};

const getPropValue = (propsData: Record<string, unknown>, key: string) => {
  return get(propsData, key);
};
</script>
