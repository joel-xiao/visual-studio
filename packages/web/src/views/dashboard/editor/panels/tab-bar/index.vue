<template lang="pug">
div.editor-tab-bar
  .tab-bar__list
    div(class="tab_item transition" :class="{ 'active': modelValue === item }" v-for="(item, idx) in data" :key="idx" @click="onSelect(item)") {{ item.name }}
</template>

<script setup lang="ts">
import { ref, reactive, withDefaults } from 'vue';

interface Props {
  data?: PanelTab[];
  modelValue?: PanelTab;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  modelValue: () => ({})
});

const emit = defineEmits(['select', 'update:modelValue']);

const onSelect = function (tab: PanelTab): void {
  emit('update:modelValue', tab);
  emit('select', tab);
};
</script>

<style lang="scss">
.editor-tab-bar {
  height: 100%;

  .tab-bar__list {
    display: flex;
    align-items: center;
    height: 100%;

    .tab_item {
      height: 100%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      padding: 0 6px;
      color: var(--theme-color-text-secondary);

      &:not(:last-child) {
        margin-right: 12px;
      }

      &:hover,
      &.active {
        color: var(--theme-color-text-bold);
        font-weight: 600;
      }
    }
  }
}
</style>
