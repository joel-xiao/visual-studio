<script setup lang="ts">
import { CoreDataLayout as CoreData } from 'visual-craft-core';
import { ref, onMounted } from 'vue';
import { useDashboardStore } from '@/store/dashboard';

onMounted(() => {
  initLayout();
});

const folderTree = ref<ITreeItemData[]>([]);
const folderMenus = ref<ITreeItemMenu[]>([]);
const buttons = ref<IDbLayoutNewProjectData[]>([]);

function initLayout() {
  folderTree.value = [
    { name: '全部数据', id: 'all', sum: 0, handle: false },
    { name: '未分组', id: 'no-group', sum: 0, handle: false },
    {
      name: 'xiao',
      id: '123',
      sum: 0,
      children: [
        { name: '全部数据', id: 'all', sum: 0, handle: false },
        { name: '未分组', id: 'no-group', sum: 0, handle: false },
        {
          name: 'xiao',
          id: '123',
          sum: 0,
          children: [
            {
              name: '汇总数据',
              id: '1all',
              prefix: '<span class="data-type get">GET</span>',
              handle: false
            },
            {
              name: 'i爱吃醋你时序',
              id: '1no-group',
              prefix: '<span class="data-type post">POST</span>',
              handle: false
            },
            {
              name: '啊数据啊就',
              id: '1123',
              prefix: '<span class="data-type get">GET</span>',
              handle: false
            }
          ]
        }
      ]
    }
  ];

  folderMenus.value = [
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
  ];

  buttons.value = [
    { name: 'POST', id: 'post', icon: '' },
    { name: 'GET', id: 'get', icon: '' },
    { name: '导入', id: 'import', icon: '' }
  ];
}

const { saveCrumbs } = useDashboardStore();
function onButtonClick(opt: DbLayoutCreateProject) {
  saveCrumbs(opt.folder?.cascades);
}
</script>

<template>
  <CoreData
    :folder-tree="folderTree"
    :folder-menus="folderMenus"
    :buttons="buttons"
    @button-click="onButtonClick"
  />
</template>

<style lang="scss">
.data-type {
  font-weight: 600;
  display: block;
  width: 34px;

  &.get {
    color: var(--db-main-color-get);
  }

  &.post {
    color: var(--db-main-color-post);
  }
}
</style>
