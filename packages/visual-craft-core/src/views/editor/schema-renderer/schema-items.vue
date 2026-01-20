<template>
  <template v-for="item in items" :key="item.key">
    <component
      :is="getComponent(item.name)"
      :model-value="propsData[item.key]"
      :key-value="item.key"
      :props-type="item"
      @update="onUpdate(item.key, item.schema, $event)"
    />
  </template>
</template>

<script setup lang="ts">
import { markRaw } from 'vue';
import type { Component } from 'vue';
import PropsWarp from './props-warp.vue';
import Layout from './layout/index.vue';

defineProps<{
  items: readonly any[];
  propsData: any;
}>();

const emit = defineEmits(['update']);

const components: Record<string, Component> = {
  [Layout.schema_name as string]: markRaw(Layout),
  [PropsWarp.component_name as string]: markRaw(PropsWarp)
};

const getComponent = (name: string) => {
  return components[name] || components['PANEL_PROPS_WRAP'];
};

const onUpdate = (key: string, schema: any, event: any) => {
  emit('update', key, schema, event);
};
</script>
