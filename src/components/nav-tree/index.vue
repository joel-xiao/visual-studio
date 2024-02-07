<script lang="ts" setup>
import TreeItem from './tree-item.vue';
import { ref, reactive, computed, withDefaults, onUnmounted } from 'vue';
import type { TreeItemData, TreeItemMenu } from './interface';
import type { Size } from './../types.d';

interface Props {
  data?: TreeItemData[];
  itemMenus?: TreeItemMenu[];
  itemIcon?: string;
  size?: Size;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  itemMenus: () => [],
  itemIcon: '',
  size: 'small'
});

const emit = defineEmits(['select', 'command']);

const findTreeFolder = function (
  folders: TreeItemData[],
  cascades?: TreeItemData[]
): TreeItemData[] {
  folders.forEach((folder) => {
    folder.cascades = [{ name: folder.name, id: folder.id }];
    if (cascades) folder.cascades.unshift(...cascades);
    if (folder.children) {
      findTreeFolder(folder.children, folder.cascades);
    } else {
      folder.children = [];
    }
  });
  return folders;
};
const tree = computed<TreeItemData[]>(() => {
  return findTreeFolder(props.data);
});

const currentNav = ref<TreeItemData>();
const onNavSelect = function (item: TreeItemData): void {
  currentNav.value = item;
  emit('select', item);
};

onNavSelect(props.data[0]);

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
  item: TreeItemData | null;
  cmd: TreeItemMenu | null;
}>({
  item: null,
  cmd: null
});

const onMenuCommand = function (cmd: TreeItemMenu): void {
  console.log(cmd);
  emit('command', cmd);
};

const onCommand = function (
  event: { composedPath: () => HTMLElement[] },
  cmd: TreeItemMenu,
  item: TreeItemData
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

defineExpose({
  setSelect: onNavSelect
});
</script>

<template lang="pug">
div(class='c-nav-tree' :class="size")
  TreeItem(
    @select="onNavSelect"
    @command="onCommand"
    :data="tree"
    :size="size"
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

<style lang="scss">
.c-nav-tree {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
