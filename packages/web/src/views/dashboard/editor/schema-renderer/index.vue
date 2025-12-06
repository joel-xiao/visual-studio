<template>
<div class="editor-schema-renderer">
  <div class="editor-schema-renderer-wrapper" ref="panelSchemaWrapperRef">
    <template v-for="item in PanelSchemaTypes.propsTypes" :key="item.key">
      <template v-if="isComponent(item.name) && item.name !== 'PANEL_PROPS_WRAP'">
        <component :is="getComponent(item.name) as any" v-model="PropsData[item.key]" @update="onUpdate(item.key, item.schema as any, $event)" />
      </template>
      <template v-else>
        <component :is="getComponent('PANEL_PROPS_WRAP') as any" :keyValue="item.key" :propsType="item" v-model="PropsData[item.key]" @update="onUpdate(item.key, item.schema as any, $event)" />
      </template>
    </template>
  </div>
  <Tabs :style="TabsStyle" :tabs="PanelSchemaTypes.categorySchemas as any" @select-tab="onSelectTab">
    <template v-if="currentTab">
      <template v-for="item in currentTab.propsTypes" :key="item.key">
        <template v-if="isComponent(item.name) && item.name !== 'PANEL_PROPS_WRAP'">
          <component :is="getComponent(item.name) as any" v-model="PropsData[item.key]" @update="onUpdate(item.key, item.schema as any, $event)" />
        </template>
        <template v-else>
          <component :is="getComponent('PANEL_PROPS_WRAP') as any" :keyValue="item.key" :propsType="item" v-model="PropsData[item.key]" @update="onUpdate(item.key, item.schema as any, $event)" />
        </template>
      </template>
    </template>
  </Tabs>
</div>
</template>

<script setup lang="ts">
import { computed, reactive, markRaw, watchEffect, ref } from 'vue';
import { cloneDeep } from 'lodash';
import PropsWarp from './props-warp.vue';
import Layout from './layout/index.vue';
import Tabs from './tabs/index.vue';
import { useComponentContext } from '../hooks/component-context';
import { useNodeContext } from '../hooks/node-context';

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
    '--schema-renderer-tabs-wrapper-height': `calc(100% - ${rect.height}px)`
  };
});

const currentTab = ref<CategorySchemaType>();
function onSelectTab(data: CategorySchemaType) {
  currentTab.value = data;
}
</script>

<style lang="scss">
.editor-schema-renderer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: hidden;

  .editor-schema-renderer-wrapper {
    // padding: 0 6px 90px 12px;
    padding: 0 6px 0px 12px;
  }
}
</style>
