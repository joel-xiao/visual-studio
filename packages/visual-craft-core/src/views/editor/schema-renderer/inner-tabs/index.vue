<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';

type Props = {
  tabs?: SchemaTabType[];
};
const props = withDefaults(defineProps<Props>(), {
  tabs: undefined
});

const emits = defineEmits<{
  (e: 'select-tab', data: SchemaTabType): void;
}>();

const currentTab = ref<SchemaTabType>();
const navRef = ref<HTMLElement>();
const itemsRef = ref<HTMLElement[]>([]);
const isReady = ref(false);

const activeStyle = computed(() => {
  if (!isReady.value) return { opacity: 0 };

  const index = props.tabs?.findIndex(t => t.tab === currentTab.value?.tab);
  if (index === undefined || index === -1 || !itemsRef.value[index]) {
    return {
      opacity: 0,
      width: '0px',
      transform: 'translateX(0px)'
    };
  }

  const el = itemsRef.value[index];
  return {
    opacity: 1,
    width: `${el.offsetWidth}px`,
    transform: `translateX(${el.offsetLeft - 2}px)` // -2 for padding
  };
});

const onTab = (tab: SchemaTabType) => {
  if (currentTab.value?.tab === tab.tab) return;
  currentTab.value = tab;
  emits('select-tab', tab);
};

watch(() => props.tabs, async (tabs) => {
  if (tabs?.length && (!currentTab.value || !tabs.find(t => t.tab === currentTab.value?.tab))) {
    onTab(tabs[0]);
  }
  await nextTick();
  isReady.value = true;
}, { immediate: true });

const hasMultipleTabs = computed(() => props.tabs && props.tabs.length > 1);
</script>

<template>
  <div v-if="tabs?.length" class="schema-inner-tabs">
    <div v-if="hasMultipleTabs" ref="navRef" class="schema-inner-tabs-nav">
      <!-- Sliding Indicator -->
      <div class="active-indicator" :style="activeStyle"></div>

      <div
        v-for="(tab, idx) in tabs"
        :key="idx"
        ref="itemsRef"
        class="schema-inner-tab"
        :class="{ active: currentTab?.tab === tab.tab }"
        @click="onTab(tab)"
      >
        {{ tab.name }}
      </div>
    </div>
    <div class="schema-inner-tabs-content">
      <slot :current-tab="currentTab"></slot>
    </div>
  </div>
</template>

<style lang="scss">
.editor-schema-renderer .schema-inner-tabs {
  width: 100%;

  .schema-inner-tabs-nav {
    display: inline-flex;
    align-items: center;
    position: relative;
    padding: 2px;
    margin: 10px auto 14px;
    margin-bottom: 0px;
    background: rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 7px;
    left: 50%;
    transform: translateX(-50%);
    gap: 0;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);

    .active-indicator {
      position: absolute;
      top: 2px;
      left: 2px;
      height: calc(100% - 4px);
      background: var(--db-color-button-group-item-active, #3b82f6);
      border-radius: 5px;
      transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
      z-index: 0;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    }

    .schema-inner-tab {
      position: relative;
      padding: 0 12px;
      height: 20px;
      min-width: 44px;
      font-size: 11px;
      font-weight: 500;
      color: var(--theme-color-text-secondary);
      cursor: pointer;
      transition: color 0.2s ease;
      user-select: none;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none !important;
      border: none !important;
      box-shadow: none !important;
      letter-spacing: 0.01em;

      &:hover:not(.active) {
        color: var(--theme-color-text-primary);
      }

      &.active {
        color: var(--db-color-button-group-item-active-text, #fff);
        font-weight: 500;
      }
    }
  }
}
</style>
