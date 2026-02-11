<template>
<div class="editor-schema-renderer" :key="currentNode?.id">
  <div ref="panelSchemaWrapperRef" class="editor-schema-renderer-wrapper">
    <SchemaItems :items="PanelSchemaTypes.propsTypes" :props-data="PropsData" :schema-type="currentNode.schema" @update="onUpdate" />
  </div>
  <SideTabs :style="TabsStyle" :tabs="PanelSchemaTypes.categorySchemas as CategorySchemaTypes" @select-tab="onSelectTab">
    <template v-if="currentTab">
      <SchemaItems :items="currentTab.propsTypes" :props-data="PropsData" :schema-type="currentNode.schema" @update="onUpdate" />
      <InnerTabs v-if="currentTab.schemasTabs?.length" v-slot="{ currentTab: innerTab }" :tabs="currentTab.schemasTabs">
        <SchemaItems :items="innerTab?.propsTypes || []" :props-data="PropsData" :schema-type="currentNode.schema" @update="onUpdate" />
      </InnerTabs>
    </template>
  </SideTabs>
</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import SideTabs from './side-tabs/index.vue';
import InnerTabs from './inner-tabs/index.vue';
import SchemaItems from './schema-items.vue';
import { useComponentContext } from '../hooks/component-context';
import { useNodeContext } from '../hooks/node-context';

const { getCurrentNode, updateNodeProp } = useNodeContext();
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
  const path = prop_key ? `${key}.${prop_key}` : key;
  updateNodeProp(
    currentNode.value.id,
    path,
    formatterComponentProp(schema, {
      key: prop_key,
      value: prop_value
    })
  );
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
  height: calc(100% - var(--db-editor-tab-bar-height));
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;

  .editor-schema-renderer-wrapper {
    // padding: 0 6px 90px 12px;
    padding: 0 6px 0px 12px;
  }
}
</style>
