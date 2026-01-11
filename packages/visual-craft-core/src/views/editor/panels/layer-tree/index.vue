<script lang="ts" setup>
import LayerItem from './layer-item.vue';
import { reactive, computed, ref, watch } from 'vue';
import ICClickMenu from '@/components/click-menu/index.vue';

interface Props {
  data?: readonly PanelLayerItemData[];
  itemMenus?: readonly PanelLayerItemMenu[];
  itemIcon?: string;
  // 通用化 Hook 依赖为 Prop
  getIcon?: (item: PanelLayerItemData) => string;
  isInheritedHide?: (item: PanelLayerItemData) => boolean;
  isInheritedLock?: (item: PanelLayerItemData) => boolean;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  itemMenus: () => [],
  itemIcon: '',
});

const emit = defineEmits(['select', 'command', 'toggle-hide', 'toggle-lock', 'sort', 'contextmenu', 'toggle-fold']);

// 跟踪展开/收起状态 (ID -> boolean)
const expandedNodes = reactive(new Set<string>());

// 初始化时默认展开所有
watch(() => props.data, (newData) => {
  if (newData && expandedNodes.size === 0) {
    const initExpanded = (nodes: readonly PanelLayerItemData[]) => {
      nodes.forEach(node => {
        expandedNodes.add(node.id);
        if (node.children) initExpanded(node.children);
      });
    };
    initExpanded(newData);
  }
}, { immediate: true });

// 辅助方法：展平树以寻找节点及其父级
const findNodeWithParent = (
  nodes: readonly PanelLayerItemData[],
  targetId: string,
  parent: PanelLayerItemData | null = null
): { node: PanelLayerItemData; siblings: readonly PanelLayerItemData[]; parent: PanelLayerItemData | null } | null => {
  for (const node of nodes) {
    if (node.id === targetId) {
      return { node, siblings: nodes, parent };
    }
    if (node.children) {
      const result = findNodeWithParent(node.children, targetId, node);
      if (result) return result;
    }
  }
  return null;
};

// 辅助方法：获取数据中所有选中的节点
const getAllSelected = (nodes: readonly PanelLayerItemData[]): PanelLayerItemData[] => {
  let selected: PanelLayerItemData[] = [];
  for (const node of nodes) {
    if (node.select) selected.push(node);
    if (node.children) {
      selected = [...selected, ...getAllSelected(node.children)];
    }
  }
  return selected;
};

const findLayer = function (
  folders: readonly PanelLayerItemData[],
  cascades: readonly PanelLayerItemData[] = []
): PanelLayerItemData[] {
  // 按 z 值降序排列
  const list = [...folders].sort((a, b) => {
    const zA = a.data?.z ?? 0;
    const zB = b.data?.z ?? 0;
    return zB - zA;
  });
  
  return list.map(folder => {
    const currentCascades = [...cascades, folder];
    return {
      ...folder,
      AFold: expandedNodes.has(folder.id),
      cascades: currentCascades,
      children: folder.children ? findLayer(folder.children, currentCascades) : []
    };
  });
};

const tree = computed<PanelLayerItemData[]>(() => {
  return findLayer(props.data || []);
});

const lastSelectedId = ref<string | null>(null);

const onNavSelect = function (id: string, shift?: boolean, ctrl?: boolean): void {
  const result = findNodeWithParent(props.data, id);
  if (!result) return;

  const { node: targetNode, siblings } = result;
  const selectedNodes = getAllSelected(props.data);
  
  let newIds: string[] = [];
  const currentParentId = selectedNodes.length > 0 ? selectedNodes[0].parentId : null;

  // 规则：同级多选。如果跨层级，则重置为单选。
  if (selectedNodes.length > 0 && targetNode.parentId === currentParentId) {
    if (shift && lastSelectedId.value) {
      // 这里的 siblings 已经是同级的了
      const sortedSiblings = [...siblings].sort((a, b) => (b.data?.z || 0) - (a.data?.z || 0));
      const startIdx = sortedSiblings.findIndex(n => n.id === lastSelectedId.value);
      const endIdx = sortedSiblings.findIndex(n => n.id === id);
      
      if (startIdx !== -1 && endIdx !== -1) {
        const range = sortedSiblings.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1);
        newIds = range.map(n => n.id);
      } else {
        newIds = [id];
      }
    } else if (ctrl) {
      const selectedIds = selectedNodes.map(n => n.id);
      if (selectedIds.includes(id)) {
        newIds = selectedIds.filter(v => v !== id);
      } else {
        newIds = [...selectedIds, id];
      }
    } else {
      newIds = [id];
    }
  } else {
    newIds = [id];
  }

  if (newIds.length === 0) {
    newIds = ['root'];
  }

  lastSelectedId.value = id;
  emit('select', newIds);
};

const clickMenu: { x: number; y: number; show: boolean } = reactive({
  show: false,
  y: 0,
  x: 0
});

const onContentMenuShow = function (val?: boolean, el?: HTMLElement): void {
  clickMenu.show = !!val;
  const rect: DOMRect | undefined = el && el.getBoundingClientRect();
  if (rect) {
    clickMenu.x = rect.left;
    clickMenu.y = rect.bottom;
  }
};

const commandData = reactive<{
  nodeId: string | null;
  cmd: PanelLayerItemMenu | null;
}>({
  nodeId: null,
  cmd: null
});

const onMenuCommand = function (cmd: PanelLayerItemMenu): void {
  emit('command', cmd, commandData.nodeId);
};

const onCommand = function (
  event: { composedPath: () => HTMLElement[] },
  cmd: PanelLayerItemMenu,
  id: string
): void {
  commandData.cmd = cmd;
  commandData.nodeId = id;

  if (cmd?.children?.length) {
    onContentMenuShow(true, event.composedPath()[1]);
    return;
  }
  onContentMenuShow(false);
  onMenuCommand(cmd);
};

// 转发子项事件
const onToggleHide = (id: string) => emit('toggle-hide', id);
const onToggleLock = (id: string) => emit('toggle-lock', id);
const onSort = (sourceId: string, targetId: string, pos: string) => emit('sort', sourceId, targetId, pos);
const onContextMenu = (e: MouseEvent, id: string) => emit('contextmenu', e, id);

const onToggleFold = (id: string) => {
  if (expandedNodes.has(id)) {
    expandedNodes.delete(id);
  } else {
    expandedNodes.add(id);
  }
};

</script>

<template>
  <div class="editor-layer-tree">
    <LayerItem
      :data="tree"
      :item-icon="itemIcon"
      :item-menus="itemMenus"
      :get-icon="getIcon"
      :is-inherited-hide="isInheritedHide"
      :is-inherited-lock="isInheritedLock"
      @select="(id, shift, ctrl) => onNavSelect(id, shift, ctrl)"
      @command="onCommand"
      @toggle-hide="onToggleHide"
      @toggle-lock="onToggleLock"
      @sort="onSort"
      @contextmenu="onContextMenu"
      @toggle-fold="onToggleFold"
    />
    <ICClickMenu
      v-model="clickMenu.show"
      :data="commandData?.cmd?.children || []"
      :x="clickMenu.x"
      :y="clickMenu.y"
      @command="onMenuCommand"
    />
  </div>
</template>

<style lang="scss">
#visual-craft-core {
  .editor-layer-tree {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 4px 6px 7px;
  }
}
</style>
