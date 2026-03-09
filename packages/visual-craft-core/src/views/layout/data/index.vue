<script setup lang="ts">
import MainLayout from '../manage/manage-layout.vue';

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
}

const props = withDefaults(defineProps<Props>(), {
  title: '我的数据',
  folderTree: () => [
    { name: '全部数据', id: 'all', sum: 0, handle: false },
    { name: '未分组', id: 'no-group', sum: 0, handle: false,
      children: [
            {
              name: 'GET',
              id: '1all',
              prefix: '<span class="data-type get">GET</span>',
              handle: false
            },
            {
              name: 'POST',
              id: '1no-group',
              prefix: '<span class="data-type post">POST</span>',
              handle: false
            },
          ]
        }
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
    { name: 'POST', id: 'post', icon: '' },
    { name: 'GET', id: 'get', icon: '' },
    { name: '导入', id: 'import', icon: '' }
  ],
  itemIcon: '',
  currentFolderId: ''
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
    <template #content>
      <slot></slot>
    </template>
  </MainLayout>
</template>

<style lang="scss">
#visual-craft-core-project .data-type {
  font-weight: 600;
  display: block;
  width: 34px;

  &.get {
    color: var(--db-main-color-get, #4caf50);
  }

  &.post {
    color: var(--db-main-color-post, #fa8c16);
  }
}
</style>
