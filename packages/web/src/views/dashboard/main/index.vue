<script setup lang="ts">
import { CoreMainLayout as CoreMain } from 'visual-craft-core';
import { computed, reactive, markRaw } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { noClient } from '@/client/index';
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

const activeNavId = computed(() => String(route.name || navList[0]?.id || ''));

function onNavSelect(nav: navData): void {
  if (nav.path) {
    router.push(nav.path);
  }
}
</script>

<template>
  <CoreMain :nav-list="navList" :active-nav-id="activeNavId" @nav-select="onNavSelect">
    <template #right>
      <div v-if="noClient()" class="nav-right">
        <a
          class="download"
          download="Visual Studio.dmg"
          href="/apps/visual-studio_0.1.0_x64.dmg"
        >
          下载 macOs 应用
        </a>
        <a
          class="download"
          download="Visual Studio.msi"
          href="/apps/visual-studio_0.1.0_x64_en-US.msi"
        >
          下载 Windows 应用
        </a>
      </div>
    </template>
    <router-view />
  </CoreMain>
</template>

<style lang="scss">
.nav-right {
  display: flex;
  column-gap: 16px;
  .download {
    cursor: pointer;
    color: #8181ee;
    font-size: 14px;
  }
}
</style>
