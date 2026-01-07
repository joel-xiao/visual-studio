<script setup lang="ts">
import { ref, watch } from 'vue';
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
function onTab(nav: CategorySchemaType) {
  if (currentTab.value === nav) return;
  currentTab.value = nav;
  emits('select-tab', currentTab.value);
}

watch(
  () => props.tabs,
  () => {
    if (props.tabs && props.tabs.length > 0) {
      if (!currentTab.value || !props.tabs.find(t => t.category === currentTab.value?.category)) {
        onTab(props.tabs[0]);
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <div v-show="tabs?.length" class="schemas-tabs">
    <div class="schemas-tabs-nav-wrapper">
      <div
        v-for="(nav, idx) in tabs"
        :key="idx"
        class="schemas-tab-nav"
        :class="{ active: currentTab?.category === nav.category }"
        :title="nav.name"
        @click="onTab(nav)"
      >
        <!-- The discrete active indicator -->
        <div class="active-indicator"></div>

        <BasicIcon v-if="nav.icon" :icon="nav.icon" class="tab-icon" />
        <span class="tab-name">{{ nav.name }}</span>
      </div>
    </div>
    <div class="schemas-tabs-pane-wrapper">
      <slot></slot>
      <!-- 占位元素 - 勿删 -->
      <div class="schemas-tabs-pane-line"></div>
    </div>
  </div>
</template>

<style lang="scss">
.schemas-tabs {
  --color-divider: var(--theme-color-gray-100);
  --color-accent: var(--theme-color-blue-700);

  width: 100%;
  height: var(--schema-renderer-tabs-wrapper-height);
  border-top: 1px solid var(--color-divider);

  .schemas-tabs-nav-wrapper {
    width: 34px;
    height: 100%;
    padding: 3px;
    float: left;
    background-color: var(--theme-color-gray-25);
    box-sizing: border-box;

    .schemas-tab-nav {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 16px 2px;
      text-align: center;
      position: relative;
      color: var(--theme-color-tran-50);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;

      .tab-icon {
        font-size: 16px;
        opacity: 0.7;
      }

      .tab-name {
        font-size: 11px;
        writing-mode: vertical-lr;
        letter-spacing: 1px;
      }

      .active-indicator {
        position: absolute;
        left: 0;
        top: 25%;
        bottom: 25%;
        width: 2px;
        background-color: transparent;
        border-radius: 0 2px 2px 0;
        transition: all 0.2s ease;
      }

      &:hover {
        color: var(--theme-color-tran-85);
        background: var(--theme-color-tran-4);
      }

      &.active {
        color: var(--color-accent);
        background: var(--theme-color-tran-6);

        .tab-icon { opacity: 1; }

        .active-indicator {
          background-color: var(--color-accent);
        }
      }
    }
  }

  .schemas-tabs-pane-wrapper {
    padding: 0px 6px 0px 8px;
    width: calc(100% - 34px);
    height: 100%;
    float: right;
  }
}
</style>
