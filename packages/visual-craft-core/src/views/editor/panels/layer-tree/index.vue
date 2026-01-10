<script lang="ts" setup>
import LayerItem from './layer-item.vue';
import { reactive, computed } from 'vue';
import ICClickMenu from '@/components/click-menu/index.vue';

interface Props {
  data?: readonly PanelLayerItemData[];
  itemMenus?: readonly PanelLayerItemMenu[];
  itemIcon?: string;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  itemMenus: () => [],
  itemIcon: ''
});

const emit = defineEmits(['select', 'command']);

const findLayer = function (
  folders: readonly PanelLayerItemData[],
  cascades?: readonly PanelLayerItemData[]
): PanelLayerItemData[] {
  // 按 z 值降序排列（z 大的在前面，显示在顶部）
  const list = [...folders].sort((a, b) => {
    const zA = a.data?.z ?? 0;
    const zB = b.data?.z ?? 0;
    return zB - zA; // 降序
  }) as PanelLayerItemData[];
  
  list.forEach(folder => {
    // Default to expanded (AFold = true) if not previously set
    if (folder.AFold === undefined || folder.AFold === null) {
      folder.AFold = true;
    }
    
    folder.cascades = cascades ? [...cascades, folder] : [folder];
    const children = folder.children || [];
    folder.children = findLayer(children, folder.cascades);
  });
  return list;
};
const tree = computed<PanelLayerItemData[]>(() => {
  return findLayer(props.data || []);
});

const onNavSelect = function (item: PanelLayerItemData): void {
  emit('select', item);
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
  item: PanelLayerItemData | null;
  cmd: PanelLayerItemMenu | null;
}>({
  item: null,
  cmd: null
});

const onMenuCommand = function (cmd: PanelLayerItemMenu): void {
  emit('command', cmd, commandData.item);
};

const onCommand = function (
  event: { composedPath: () => HTMLElement[] },
  cmd: PanelLayerItemMenu,
  item: PanelLayerItemData
): void {
  commandData.cmd = cmd;
  commandData.item = item;

  if (cmd?.children?.length) {
    onContentMenuShow(true, event.composedPath()[1]);
    return;
  }
  onContentMenuShow(false);
  onMenuCommand(cmd);
};
</script>

<template>
  <div class="editor-layer-tree">
    <LayerItem
      :data="tree"
      :item-icon="itemIcon"
      :item-menus="itemMenus"
      @select="onNavSelect"
      @command="onCommand"
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
