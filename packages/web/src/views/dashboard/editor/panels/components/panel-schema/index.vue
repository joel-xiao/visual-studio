<template lang="pug">
div(class="editor-panel-schema")
  div(class="editor-panel-schema-wrapper" ref="panelSchemaWrapperRef")
    template(v-for="(item, idx) in PanelSchemaTypes.propsTypes")
      template(v-if="isComponent(item.name)")
        component(:is="getComponent(item.name)" v-model="PropsData[item.key]" @update="onUpdate(item.key, item.schema, $event)")
      template(v-else)
        component(:is="getComponent('PANEL_PROPS_WRAP')" :keyValue="item.key" :propsType="item" v-model="PropsData[item.key]" @update="onUpdate(item.key, item.schema, $event)")
  Tabs(:style="TabsStyle" :tabs="PanelSchemaTypes.categorySchemas" @select-tab="onSelectTab")
    template( v-if="currentTab" v-for="(item, idx) in currentTab.propsTypes")
      template(v-if="isComponent(item.name)")
        component(:is="getComponent(item.name)" v-model="PropsData[item.key]" @update="onUpdate(item.key, item.schema, $event)")
      template(v-else)
        component(:is="getComponent('PANEL_PROPS_WRAP')" :keyValue="item.key" :propsType="item" v-model="PropsData[item.key]" @update="onUpdate(item.key, item.schema, $event)")
</template>

<script setup lang="ts">
import { computed, reactive, markRaw, watchEffect, ref } from 'vue';
import { cloneDeep } from 'lodash';
import PropsWarp from './props-warp.vue';
import Layout from './layout/index.vue';
import Tabs from './tabs/index.vue';
import { useComponentContext } from '../../../hooks/component-context';
import { useNodeContext } from './../../../hooks/node-context';

const components = reactive({
  [Layout.schema_name as string]: markRaw(Layout),
  [PropsWarp.component_name as string]: markRaw(PropsWarp)
});

const isComponent = (schema_name: string) => {
  return !!components[schema_name];
};

const getComponent = (schema_name: string) => {
  return components[schema_name];
};

const { getCurrentNode, updateNodeProps } = useNodeContext();
const currentNode = getCurrentNode();
const PropsData = computed(() => currentNode.value.props);

const { getComponentPropsTypes, formatterComponentProp } = useComponentContext();

const PanelSchemaTypes = computed(() => {
  return getComponentPropsTypes(currentNode.value.schema);
});

const onUpdate = function (
  key: string,
  schema: SchemaKeyTypes,
  [prop_key, prop_value]: [key: string, value: number | string | boolean | undefined | number[]]
) {
  updateNodeProps(currentNode.value.id, {
    key: `${key}.${prop_key}`,
    value: formatterComponentProp(schema, {
      key: prop_key,
      value: prop_value
    })
  });
};

const panelSchemaWrapperRef = ref<HTMLElement>();
const TabsStyle = computed(() => {
  const rect = panelSchemaWrapperRef.value?.getBoundingClientRect() || { height: 0 };
  return {
    '--panel-schema-tabs-wrapper-height': `calc(100% - ${rect.height}px)`
  };
});

const currentTab = ref<CategorySchemaType>();
function onSelectTab(data: CategorySchemaType) {
  currentTab.value = data;
}
</script>

<style lang="scss">
.editor-panel-schema {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: hidden;

  .editor-panel-schema-wrapper {
    // padding: 0 6px 90px 12px;
    padding: 0 6px 0px 12px;
  }
}
</style>
