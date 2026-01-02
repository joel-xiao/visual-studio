<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

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
    if (props.tabs) {
      onTab(props.tabs[0]);
    }
  }
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
        @click="onTab(nav)"
      >
        {{ nav.name }}
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
      font-size: 12px;
      color: var(--theme-color-tran-50);
      border-radius: 6px;
      padding: 18px 6px;
      text-align: center;
      transition: all 0.2s;

      &:hover {
        color: var(--theme-color-tran-85);
      }

      &.active {
        color: var(--theme-color-tran-85);
        background: var(--theme-color-tran-4);
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
