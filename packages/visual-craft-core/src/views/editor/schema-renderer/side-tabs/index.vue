<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import BasicIcon from '../../../ui/base/basic-icon.vue';

type Props = {
  tabs?: CategorySchemaType[];
};
const props = withDefaults(defineProps<Props>(), {
  tabs: undefined
});

const emits = defineEmits<{
  (e: 'select-tab', data: CategorySchemaType): void;
}>();

const currentTab = ref<CategorySchemaType>();
const itemsRef = ref<HTMLElement[]>([]);
const isReady = ref(false);

const activeStyle = computed(() => {
  if (!isReady.value) return { opacity: 0 };

  const index = props.tabs?.findIndex(t => t.category === currentTab.value?.category);
  if (index === undefined || index === -1 || !itemsRef.value[index]) {
    return {
      opacity: 0,
      height: '0px',
      transform: 'translateY(0px)'
    };
  }

  const el = itemsRef.value[index];
  return {
    opacity: 1,
    height: `${el.offsetHeight - 6}px`, // subtract padding
    transform: `translateY(${el.offsetTop + 3}px)`
  };
});

function onTab(nav: CategorySchemaType) {
  if (currentTab.value === nav) return;
  currentTab.value = nav;
  emits('select-tab', currentTab.value);
}

watch(
  () => props.tabs,
  async () => {
    if (props.tabs && props.tabs.length > 0) {
      if (!currentTab.value || !props.tabs.find(t => t.category === currentTab.value?.category)) {
        onTab(props.tabs[0]);
      }
    }
    await nextTick();
    isReady.value = true;
  },
  { immediate: true }
);
</script>

<template>
  <div v-show="tabs?.length" class="schemas-side-tabs">
    <div class="schemas-side-tabs-nav-wrapper">
      <!-- Sliding Indicator -->
      <div class="active-indicator" :style="activeStyle"></div>

      <div
        v-for="(nav, idx) in tabs"
        :key="idx"
        ref="itemsRef"
        class="schemas-side-tab-nav"
        :class="{ active: currentTab?.category === nav.category }"
        :title="nav.name"
        @click="onTab(nav)"
      >
        <BasicIcon v-if="nav.icon" :icon="nav.icon" class="tab-icon" />
        <span class="tab-name">{{ nav.name }}</span>
      </div>
    </div>
    <div class="schemas-side-tabs-pane-wrapper">
      <slot></slot>
      <!-- 占位元素 - 勿删 -->
      <div class="schemas-side-tabs-pane-line"></div>
    </div>
  </div>
</template>

<style lang="scss">
.schemas-side-tabs {
  --color-divider: var(--theme-color-gray-100);
  --color-accent: var(--theme-color-blue-700);

  width: 100%;
  height: var(--schema-renderer-tabs-wrapper-height);
  border-top: 1px solid var(--color-divider);
  display: flex;

  .schemas-side-tabs-nav-wrapper {
    width: 34px;
    height: 100%;
    padding: 3px;
    background-color: var(--theme-color-gray-25);
    box-sizing: border-box;
    position: relative;
    z-index: 1;

    .active-indicator {
      position: absolute;
      left: 3px;
      width: calc(100% - 6px);
      background: var(--theme-color-tran-6);
      border-radius: 4px;
      transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
      z-index: 0;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 25%;
        bottom: 25%;
        width: 2px;
        background-color: var(--color-accent);
        border-radius: 0 2px 2px 0;
      }
    }

    .schemas-side-tab-nav {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 16px 2px;
      text-align: center;
      position: relative;
      color: var(--theme-color-tran-50);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      z-index: 1;

      .tab-icon {
        font-size: 16px;
        opacity: 0.7;
      }

      .tab-name {
        font-size: 11px;
        writing-mode: vertical-lr;
        letter-spacing: 1px;
      }

      &:hover {
        color: var(--theme-color-tran-85);
      }

      &.active {
        color: var(--color-accent);
        .tab-icon {
          opacity: 1;
        }
      }
    }
  }

  .schemas-side-tabs-pane-wrapper {
    padding: 0px 6px 0px 8px;
    flex: 1;
    height: 100%;
    overflow-y: auto;
  }
}
</style>
