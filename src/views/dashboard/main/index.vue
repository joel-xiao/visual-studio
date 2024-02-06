<script setup lang="ts">
import { ref, reactive, markRaw, onMounted, getCurrentInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

interface navData {
  label: string;
  id: string;
  path: string;
}
const navList: navData[] = reactive(
  markRaw([
    { label: '可视化', id: 'dashboard-projects', path: '/dashboard/main/projects' },
    // { label: '网页', id: 'web', path: '' },
    // { label: '3D', id: '3d', path: '' },
    { label: '数据', id: 'dashboard-data', path: '/dashboard/main/data' }
    // { label: '我的资产', id: 'com' },
    // { label: '教程', id: 'case' }
  ])
);

const currentNav = ref<navData>(navList[0]);
const onNavSelect = function (nav: navData): void {
  currentNav.value = nav;
  nav.path && router.push(nav.path);
};

onMounted(() => {
  initCurrentNav();
});
function initCurrentNav() {
  const nav = navList.find((nav) => nav.id === route.name);
  if (nav) onNavSelect(nav);
}
</script>

<template lang="pug">
.dashboard-header
  .nav-content
    span.nav-content-span(@click="onNavSelect(item)" :class="{ active: currentNav.id === item.id }" :key="item.id" v-for="(item, idx) in navList")
      | {{ item.label }}
  .nav-right(v-if="$noTauri()")
    a(class="download" download="Visual Studio.dmg" href="/apps/visual-studio_0.1.0_x64.dmg")
      | 下载 macOs 应用
    a(class="download" download="Visual Studio.msi" href="/apps/visual-studio_0.1.0_x64_en-US.msi")
      | 下载 Windows 应用
.dashboard-content
  router-view
</template>

<style lang="scss">
#dashboard {
  position: relative;
  width: 100%;
  height: 100%;

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 47px;
    padding: 0 20px;
    border-bottom: 1px solid var(--db-main-border-black);

    .nav-content {
      display: flex;
      float: left;
      height: 32px;
      padding: 3px;
      overflow: hidden;
      background-color: var(--db-color-bg-dark);
      border-radius: var(--border-radius-8);

      .nav-content-span {
        display: flex;
        align-items: center;
        padding: 0 20px;
        color: var(--theme-color-tran-50);
        border-radius: var(--border-radius-6);
        transition: all 0.2s;

        &:hover {
          color: var(--theme-color-tran-85);
        }

        &.active {
          color: var(--theme-color-tran-85);
          background: var(--theme-color-tran-12);
        }
      }
    }

    .nav-right {
      display: flex;
      column-gap: 16px;
      .download {
        cursor: pointer;
        color: #8181ee;
        font-size: 14px;
      }
    }
  }

  .dashboard-content {
    width: 100%;
    height: 100%;
  }
}
</style>
