ya
<template lang="pug">
div.editor-nav-panel
  .nav-panel-left
    div.mas-button-icon
      Icon(button size="small" src="icon-gengduo")
    n-breadcrumb
      n-breadcrumb-item( v-for="(item, idx) in crumbs" :key="item.id" @click="onCrumbClick(item, idx)") {{ item.name }}

  .nav-panel-content
    span.nav-panel-content-span(:class="{ active: currentTab.id === item.id }" :key="item.id" v-for="(item, idx) in tabs" @click="onTabSelect(item, idx)")
      | {{ item.label }}
  .nav-panel-right
    n-button(type="primary" size="small" class="share-btn" @click="onShare")
      Icon(src="icon-sousuo" class="share-btn-icon")
      | 分享
    n-button(tertiary circle size="small" class="preview-button-icon")
      Icon(size="small" src="icon-sousuo")
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '@/store/dashboard';
import type { Crumb } from '@/store/dashboard';
let router = useRouter();

let { crumbs } = storeToRefs(useDashboardStore());

const onCrumbClick = function (crumb: Crumb, idx: number): void {
  if (idx === 0) {
    router.push('/');
  }
};

interface Tab {
  label: string;
  id: string;
}
const tabs: Tab[] = reactive([
  { label: '设计', id: 'dashboard' },
  { label: '数据', id: 'web' }
]);

const currentTab = ref<Tab>(tabs[0]);
const onTabSelect = function (item: Tab, idx: number): void {
  currentTab.value = item;
};

const onShare = function (): void {
  console.log('onShare');
};
</script>

<style lang="scss" scoped>
.editor-nav-panel {
  border-bottom: 1px solid var(--theme-color-canvas);
  width: 100%;
  height: var(--nav-bar-height);
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  background-color: var(--editor-panel-bg-color);

  .nav-panel-left,
  .nav-panel-right {
    width: 50%;
    display: flex;
    align-items: center;
    height: 100%;

    .share-btn {
      margin: 0 6px;
      .share-btn-icon {
        margin-right: 4px;
      }
    }
  }

  .nav-panel-left {
    float: left;
    .mas-button-icon {
      margin-left: -2px;
      width: 34px;
      height: 34px;
      margin-right: 4px;
    }
  }

  .nav-panel-right {
    justify-content: flex-end;
    .preview-button-icon {
      height: 30px;
      width: 30px;
    }
  }

  .nav-panel-content {
    flex: none;
    display: flex;
    float: left;
    height: 32px;
    padding: 3px;
    overflow: hidden;
    background-color: var(--color-bg-dark);
    border-radius: var(--border-radius-8);

    .nav-panel-content-span {
      display: flex;
      align-items: center;
      padding: 0 20px;
      color: var(--color-tran-50);
      cursor: pointer;
      border-radius: var(--border-radius-6);
      transition: all 0.2s;

      &:hover {
        color: var(--color-tran-85);
      }

      &.active {
        color: var(--color-tran-85);
        background: var(--color-tran-12);
      }
    }
  }
}
</style>
