<script setup lang="ts">
import MainLayout from './components/main-layout.vue';
import { ref, reactive, markRaw, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { LayoutCreateProject } from './components/types';
import { useDashboardStore } from '@/store/dashboard';
import visual from '@s/visual/visual';
import type { IVisualProjectsResponse } from '@s/visual/types';
const router = useRouter();

const layoutRef = ref();

onMounted(() => {
  initLayout();
});

function initLayout() {
  layoutRef.value.setFolderTree([
    { name: '全部数据', id: 'all', sum: 0, handle: false },
    { name: '未分组', id: 'no-group', sum: 0, handle: false },
    {
      name: 'xiao',
      id: '123',
      sum: 0,
      children: [
        { name: '全部数据', id: '1all', sum: 0 },
        { name: '未分组', id: '1no-group', sum: 0 },
        { name: '其他', id: '1123', sum: 0 }
      ]
    }
  ]);

  layoutRef.value.setFolderMenus([
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
  ]);

  layoutRef.value.setButtons([
    { name: 'POST', id: 'post', icon: '' },
    { name: 'GET', id: 'get', icon: '' }
  ]);
}

let { saveCrumbs } = useDashboardStore();
function onNewProject(opt: LayoutCreateProject) {
  // saveCrumbs(opt.folder?.cascades);
  // router.push('/dashboard/editor');
}
</script>

<template lang="pug">
MainLayout(ref="layoutRef" @create-project="onNewProject")
</template>

<style lang="scss"></style>
