<script setup lang="ts">
import { CoreProjectsLayout as CoreProjects } from 'visual-craft-core';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '@/store/dashboard';
const router = useRouter();

onMounted(() => {
  initLayout();
});

const folderTree = ref<ITreeItemData[]>([]);
const folderMenus = ref<ITreeItemMenu[]>([]);
const buttons = ref<IDbLayoutNewProjectData[]>([]);

function initLayout() {
  folderTree.value = [
    { name: '全部应用', id: 'all', sum: 0, handle: false },
    { name: '未分组', id: 'no-group', sum: 0, handle: false },
    {
      name: 'xiao',
      id: '123',
      sum: 0,
      children: [
        { name: '全部应用', id: '1all', sum: 0 },
        { name: '未分组', id: '1no-group', sum: 0 },
        { name: '其他', id: '1123', sum: 0 }
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
    { name: '可视化', id: 'new', icon: '' },
    { name: '导入', id: 'import', icon: '' }
  ];
}

const { saveCrumbs } = useDashboardStore();
function onButtonClick(opt: DbLayoutCreateProject) {
  saveCrumbs(opt.folder?.cascades);
  router.push('/dashboard/editor');
}

const projects = ref<IDbLayoutProject[]>([]);
</script>

<template>
  <CoreProjects
    :folder-tree="folderTree"
    :folder-menus="folderMenus"
    :buttons="buttons"
    :projects="projects"
    @button-click="onButtonClick"
  />
</template>

<style lang="scss"></style>
