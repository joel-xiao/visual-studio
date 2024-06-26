<script lang="ts" setup>
import LayerItem from './layer-item.vue';
import { ref, reactive, computed, withDefaults, onUnmounted } from 'vue';

interface Props {
  data?: PanelLayerItemData[];
  itemMenus?: PanelLayerItemMenu[];
  itemIcon?: string;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  itemMenus: () => [],
  itemIcon: ''
});

const emit = defineEmits(['select', 'command']);

const findLayer = function (folders: PanelLayerItemData[], cascades?: PanelLayerItemData[]): PanelLayerItemData[] {
  folders.forEach((folder) => {
    folder.cascades = [folder];
    if (cascades) folder.cascades.unshift(...cascades);
    if (folder.children) {
      findLayer(folder.children, folder.cascades);
    } else {
      folder.children = [];
    }
  });
  return folders;
};
const tree = computed<PanelLayerItemData[]>(() => {
  return findLayer(props.data);
});

const oldSelect = ref<PanelLayerItemData>();
const onNavSelect = function (item: PanelLayerItemData): void {
  oldSelect.value && (oldSelect.value.select = false);
  oldSelect.value = item;
  item.select = true;
  emit('select', item);
};

const clickMenu: { x?: number; y?: number; show: boolean } = reactive({
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

let commandData = reactive<{
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

<template lang="pug">
div(class='editor-panel-layer')
  LayerItem(
    @select="onNavSelect"
    @command="onCommand"
    :data="tree"
    :itemIcon="itemIcon"
    :itemMenus="itemMenus")
  ICClickMenu(
    v-model='clickMenu.show'
    :data="commandData?.cmd?.children || []"
    :x="clickMenu.x"
    :y="clickMenu.y"
    @command="onMenuCommand")
</template>

<style lang="scss">
#editor {
  .editor-panel-layer {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 4px 6px 7px;
  }
}
</style>
