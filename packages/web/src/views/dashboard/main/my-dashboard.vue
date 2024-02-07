<script setup lang="ts">
import MainLayout from './components/main-layout.vue';
import ItemCard from './components/item-card.vue';
import { ref, reactive, markRaw, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { LayoutCreateProject, ILayoutProject } from './components/types';
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
    { name: '可视化', id: 'new', icon: '' },
    { name: '导入', id: 'import', icon: '' }
    // { name: 'PC端', id: 'web', icon: 'new-project-web.png' },
    // { name: '移动端', id: 'mobile', icon: 'new-project-mobile.png' }
  ]);
}

let { saveCrumbs } = useDashboardStore();
function onButtonClick(opt: LayoutCreateProject) {
  saveCrumbs(opt.folder?.cascades);
  router.push('/dashboard/editor');
}

const projects = ref<ILayoutProject[]>([]);
</script>

<template lang="pug">
MainLayout(ref="layoutRef" @button-click="onButtonClick")
  content
    ItemCard(v-for="(item, idx) in projects" :data="item" :key="item.id + '_' + idx")
</template>

<style lang="scss"></style>
