<script lang="ts" setup>
import TreeItem from './tree-item.vue';
import { ref, reactive, computed, withDefaults, onUnmounted } from 'vue';
interface Props {
  data?: ITreeItemData[];
  itemMenus?: ITreeItemMenu[];
  itemIcon?: string;
  size?: CSize;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  itemMenus: () => [],
  itemIcon: '',
  size: 'small'
});

const emit = defineEmits(['select', 'command']);

const findTreeFolder = function (
  folders: ITreeItemData[],
  cascades?: ITreeItemData[]
): ITreeItemData[] {
  folders.forEach(folder => {
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
const tree = computed<ITreeItemData[]>(() => {
  return findTreeFolder(props.data);
});

const currentNav = ref<ITreeItemData>();
const onNavSelect = function (item: ITreeItemData): void {
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

const commandData = reactive<{
  item: ITreeItemData | null;
  cmd: ITreeItemMenu | null;
}>({
  item: null,
  cmd: null
});

const onMenuCommand = function (cmd: ITreeItemMenu): void {
  console.log(cmd);
  emit('command', cmd);
};

const onCommand = function (
  event: { composedPath: () => HTMLElement[] },
  cmd: ITreeItemMenu,
  item: ITreeItemData
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

<template>
  <div class="c-nav-tree" :class="size">
    <TreeItem
      :data="tree"
      :size="size"
      :item-icon="itemIcon"
      :item-menus="itemMenus"
      :current-nav="currentNav"
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
.c-nav-tree {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
