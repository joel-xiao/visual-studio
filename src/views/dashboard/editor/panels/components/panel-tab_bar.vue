<template lang="pug">
div.editor-panel-tab_bar
  .tab_container
    div(class="tab_item transition" :class="{ 'active': modelValue === item }" v-for="(item, idx) in data" :key="idx" @click="onSelect(item)") {{ item.name }}
</template>

<script setup lang="ts">
import { ref, reactive, withDefaults } from 'vue';
import type { Tab } from './panel-tab_bar';

interface Props {
  data?: Tab[];
  modelValue?: Tab;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  modelValue: () => ({})
});

const emit = defineEmits(['select', 'update:modelValue']);

const onSelect = function (tab: Tab): void {
  emit('update:modelValue', tab);
  emit('select', tab);
};
</script>

<style lang="scss">
.editor-panel-tab_bar {
  height: 100%;
  .tab_container {
    display: flex;
    align-items: center;
    height: 100%;
    .tab_item {
      height: 100%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      padding: 0 6px;
      color: var(--color-text-secondary);

      &:not(:last-child) {
        margin-right: 12px;
      }

      &:hover,
      &.active {
        color: var(--color-text-bold);
        color: #fff;
        font-weight: 600;
      }
    }
  }
}
</style>
