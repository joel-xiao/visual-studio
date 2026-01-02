<script setup lang="ts">
import { markRaw, computed } from 'vue';

interface NavData {
  label: string;
  id: string;
  path: string;
}

interface Props {
  navList?: NavData[];
  activeNavId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  navList: () =>
    markRaw([
      { label: '可视化', id: 'projects', path: '/projects' },
      { label: '数据', id: 'data', path: '/data' }
    ]),
  activeNavId: ''
});

const emit = defineEmits<{
  (e: 'nav-select', nav: NavData): void;
}>();

const currentNav = computed<NavData>(() => {
  const found = props.navList.find(n => n.id === props.activeNavId);
  return found || props.navList[0];
});

function onNavSelect(nav: NavData): void {
  emit('nav-select', nav);
}
</script>

<template>
  <div id="visual-craft-core" class="vc-core-layout">
    <div class="visual-craft-core-header">
      <div class="nav-content">
        <span
          v-for="item in props.navList"
          :key="item.id"
          class="nav-content-span"
          :class="{ active: currentNav.id === item.id }"
          @click="onNavSelect(item)"
        >
          {{ item.label }}
        </span>
      </div>
      <slot name="right"></slot>
    </div>
    <div class="visual-craft-core-content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
#visual-craft-core.vc-core-layout {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--db-color-main);

  .visual-craft-core-header {
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

  .visual-craft-core-content {
    width: 100%;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
}
</style>
