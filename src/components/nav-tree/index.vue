<script lang="ts" setup>
import TreeItem from './tree-item.vue';
import { ref, reactive, computed, defineProps, withDefaults, defineEmits, onUnmounted } from 'vue';
import type { TreeItemData, TreeItemMenu } from './interface';

interface Props {
  data?: TreeItemData[];
  itemMenus?: TreeItemMenu[];
  itemIcon?: string;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  itemMenus: () => [],
  itemIcon: ''
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
  event: { path: HTMLElement[] },
  cmd: TreeItemMenu,
  item: TreeItemData
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
div(class='c-nav-tree')
  TreeItem(
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
.c-nav-tree {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
