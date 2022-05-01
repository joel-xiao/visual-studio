<script lang="ts" setup>
import LayerItem from './layer-item.vue';
import { ref, reactive, computed, defineProps, withDefaults, defineEmits, onUnmounted } from 'vue';
import type { LayerItemData, LayerItemMenu } from './interface';

interface Props {
  data?: LayerItemData[];
  itemMenus?: LayerItemMenu[];
  itemIcon?: string;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  itemMenus: () => [],
  itemIcon: ''
});

const emit = defineEmits(['select', 'command']);

const findLayer = function (folders: LayerItemData[], cascades?: LayerItemData[]): LayerItemData[] {
  folders.forEach((folder) => {
    folder.cascades = [{ name: folder.name, id: folder.id }];
    if (cascades) folder.cascades.unshift(...cascades);
    if (folder.children) {
      findLayer(folder.children, folder.cascades);
    } else {
      folder.children = [];
    }
  });
  return folders;
};
const tree = computed<LayerItemData[]>(() => {
  return findLayer(props.data);
});

const currentNav = ref<LayerItemData>();
const onNavSelect = function (item: LayerItemData): void {
  currentNav.value = item;
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
  item: LayerItemData | null;
  cmd: LayerItemMenu | null;
}>({
  item: null,
  cmd: null
});

const onMenuCommand = function (cmd: LayerItemMenu): void {
  emit('command', cmd, commandData.item);
};

const onCommand = function (
  event: { path: HTMLElement[] },
  cmd: LayerItemMenu,
  item: LayerItemData
): void {
  commandData.cmd = cmd;
  commandData.item = item;

  if (cmd?.children?.length) {
    onContentMenuShow(true, event.path[1]);
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
    :itemMenus="itemMenus"
    :currentNav="currentNav")
  ClickMenu(
    v-model='clickMenu.show'
    :data="commandData?.cmd?.children || []"
    :x="clickMenu.x"
    :y="clickMenu.y"
    @command="onMenuCommand")
</template>

<style scoped lang="scss">
.editor-panel-layer {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 4px 6px 7px;
}
</style>
