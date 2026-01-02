<script setup lang="ts">
import MainLayout from '../manage/manage-layout.vue';
import ItemCard from './components/item-card.vue';

type IDbLayoutProject = {
  icon: string;
  label: string;
  id: string;
  folderId: string;
};

type IDbLayoutNewProjectData = {
  name: string;
  icon: string;
  id: string;
};

type DbLayoutCreateProject = {
  folder: ITreeItemData | undefined;
  project: ITreeItemData;
  item: IDbLayoutNewProjectData;
};

interface Props {
  title?: string;
  folderTree?: ITreeItemData[];
  folderMenus?: ITreeItemMenu[];
  buttons?: IDbLayoutNewProjectData[];
  itemIcon?: string;
  currentFolderId?: string;
  projects?: IDbLayoutProject[];
}

const props = withDefaults(defineProps<Props>(), {
  title: '我的项目',
  folderTree: () => [
    { name: '全部应用', id: 'all', sum: 0, handle: false },
    { name: '未分组', id: 'no-group', sum: 0, handle: false },
  ],
  folderMenus: () => [
    {
      name: '更多',
      id: 'more',
      icon: 'icon-dian',
      disabled: true,
      children: [
        { name: '编辑', id: 'edit', icon: 'icon-bianji', disabled: true },
        { name: '删除', id: 'delete', icon: 'icon-delete', disabled: true }
      ]
    },
    { name: '添加组', id: 'add', icon: 'icon-jiahao', disabled: true }
  ],
  buttons: () => [
    { name: '可视化', id: 'new', icon: '' },
    { name: '导入', id: 'import', icon: '' }
  ],
  itemIcon: '',
  currentFolderId: '',
  projects: () => []
});

const emit = defineEmits<{
  (e: 'folder-select', folder: ITreeItemData): void;
  (e: 'button-click', data: DbLayoutCreateProject): void;
}>();

function onFolderSelect(folder: ITreeItemData) {
  emit('folder-select', folder);
}

function onButtonClick(opt: DbLayoutCreateProject) {
  emit('button-click', opt);
}
</script>

<template>
  <MainLayout
    :title="props.title"
    :folder-tree="props.folderTree"
    :folder-menus="props.folderMenus"
    :buttons="props.buttons"
    :item-icon="props.itemIcon"
    :current-folder-id="props.currentFolderId"
    @folder-select="onFolderSelect"
    @button-click="onButtonClick"
  >
    <div class="content">
      <ItemCard v-for="(item, idx) in props.projects" :key="item.id + '_' + idx" :data="item" />
    </div>
  </MainLayout>
</template>

<style lang="scss">
#visual-craft-core-project .content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>
