<template>
<div class="editor-left-panel">
  <div class="panel-tab_bar">
    <PanelTabBar v-model="selectTab" :data="tabBars" @select="onSelect" />
  </div>
  <PanelLayer
    v-if="tabBars[0].show"
    v-show="selectTab === tabBars[0]"
    :data="layerData"
    :item-menus="layerMenus"
    item-icon="icon-wenjianjia"
    :get-icon="getLayerIcon"
    :is-inherited-hide="isLayerInheritedHide"
    :is-inherited-lock="isLayerInheritedLock"
    @select="onLayerSelect"
    @toggle-hide="onLayerToggleHide"
    @toggle-lock="onLayerToggleLock"
    @sort="onLayerSort"
    @contextmenu="onLayerContextMenu"
    />
  <div
    v-if="tabBars[1].show"
    v-show="selectTab === tabBars[1]"
    class="panel-component"
    >
    <div class="panel-component-tab_bar">
      <PanelTabBar v-model="componentTab" :data="componentTabBars" />
    </div>
    <PanelComponent :drag="true" :data="componentData" @drag-start="onDragStart" @drag-stop="onDragStop" />
  </div>
</div>
</template>

<script setup lang="ts">
import PanelTabBar from './tab-bar/index.vue';
import PanelLayer from './layer-tree/index.vue';
import PanelComponent from './resource-library/index.vue';
import { ref, reactive } from 'vue';
import { useDrag } from './../hooks/drag-context';
import { useComponentContext } from './../hooks/component-context';
import { useNodeContext } from './../hooks/node-context';
import { useNodeMenu } from './../hooks/context-menu';

const tabBars = reactive<PanelTab[]>([
  { name: '图层', id: 'layer', show: false },
  { name: '组件', id: 'component', show: false },
  { name: '资源库', id: 'repository', show: false }
]);

const selectTab = ref<PanelTab>(tabBars[0]);
selectTab.value.show = true;

const onSelect = function (tab: PanelTab) {
  tab.show = true;
};

const nodeContext = useNodeContext();
const componentContext = useComponentContext();
const { showNodeMenu } = useNodeMenu();
const { getNodeTree } = nodeContext;

const layerData = getNodeTree();
const layerMenus = reactive<PanelLayerItemMenu[]>([]);

const getLayerIcon = (item: PanelLayerItemData) => {
  return item.schema ? componentContext.getComponentIcon(item.schema) : '';
};

const isLayerInheritedHide = (item: PanelLayerItemData) => {
  if (!item.parentId || item.parentId === 'root') return false;
  const parent = nodeContext.getNodeMap().get(item.parentId);
  return !!parent?.hide && !!item.data?.hide;
};

const isLayerInheritedLock = (item: PanelLayerItemData) => {
  if (!item.parentId || item.parentId === 'root') return false;
  const parent = nodeContext.getNodeMap().get(item.parentId);
  return !!parent?.lock && !!item.data?.lock;
};

const onLayerSelect = (ids: string[]) => {
  nodeContext.onSelectNodes(ids);
};

const onLayerToggleHide = (id: string) => {
  const node = nodeContext.getNodeMap().get(id);
  if (node) {
    nodeContext.layer.setRecursiveProperty(id, 'hide', !node.hide);
  }
};

const onLayerToggleLock = (id: string) => {
  const node = nodeContext.getNodeMap().get(id);
  if (node) {
    nodeContext.layer.setRecursiveProperty(id, 'lock', !node.lock);
  }
};

const onLayerSort = (sourceId: string, targetId: string, pos: 'before' | 'after' | 'inside') => {
  const selectedNodes = nodeContext.getNodes().value.filter(n => n.select);
  const selectedIds = selectedNodes.length > 0 ? selectedNodes.map(n => n.id) : [sourceId];
  nodeContext.layer.sortNode(selectedIds, targetId, pos);
};

const onLayerContextMenu = (e: MouseEvent, id: string) => {
  showNodeMenu(e, id, nodeContext, componentContext, 1);
};

const componentTabBars = reactive<PanelTab[]>([{ name: '组件库', id: 'component' }]);
const componentTab = ref<PanelTab>(componentTabBars[0]);

const { onDragStart, onDragStop } = useDrag();
const componentData = reactive<PanelComponentData[]>(componentContext.getMaterials());
</script>

<style lang="scss">
#visual-craft-core {
  .editor-left-panel {
    position: absolute; left: 0px; top: var(--db-editor-nav-bar-height); bottom: 0px;
    width: var(--db-editor-left-menu-width); border-right: 1px solid var(--db-editor-color-canvas);
    background-color: var(--db-editor-color-panel-bg);

    .panel-tab_bar {
      border-bottom: 1px solid var(--db-editor-color-canvas); padding: 0 12px 0 6px;
      height: var(--db-editor-tab-bar-height);
    }

    .panel-component {
      height: calc(100% - var(--db-editor-tab-bar-height));
      .panel-component-tab_bar {
        border-bottom: 1px solid var(--db-editor-color-canvas); padding: 0 12px 0 6px;
        height: var(--db-editor-tab-bar-height);
      }
      .editor-resource-library { height: calc(100% - var(--db-editor-tab-bar-height)); }
    }
  }
}
</style>
