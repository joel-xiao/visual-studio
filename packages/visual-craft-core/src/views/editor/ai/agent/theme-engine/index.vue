<script setup lang="ts">
import { computed, ref } from 'vue';
import { chartColorsSearch } from '../../../hooks/chart-themes-context/data';
import CInput from '../../../../ui/controls/c-input/index.vue';

const searchQuery = ref('');

const themes = computed(() => {
  return Object.entries(chartColorsSearch).map(([name, colors]) => ({
    name,
    colors
  })).filter(t => t.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const emit = defineEmits<{
  apply: [data: { theme: string }];
}>();

const handleSelect = (name: string) => {
  emit('apply', { theme: name });
};
</script>

<template>
  <div class="theme-selector">
    <div class="search-box">
      <CInput
        :model-value="searchQuery"
        icon="mdi:magnify"
        placeholder="搜索主题..."
        @update="searchQuery = $event as string"
      />
    </div>

    <div class="theme-grid">
      <div
        v-for="theme in themes"
        :key="theme.name"
        class="theme-item"
        @click="handleSelect(theme.name)"
      >
        <div class="color-strips">
          <div
            v-for="(color, index) in theme.colors.slice(0, 5)"
            :key="index"
            class="strip"
            :style="{ backgroundColor: color }"
          ></div>
        </div>
        <div class="name">{{ theme.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.theme-selector {
  padding: 12px;
  width: 100%;

  .search-box {
    margin-bottom: 12px;
    :deep(.c-input) { width: 100%; }
  }

  .theme-grid {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    gap: 10px;
    max-height: 240px;
    overflow-y: auto;

    .theme-item {
      cursor: pointer;
      min-width: 0;
      padding: 8px;
      border-radius: var(--border-radius-8);
      background: var(--theme-color-tran-6);
      border: 1px solid var(--theme-color-tran-8);
      transition: all 0.2s;

      &:hover {
        background: var(--theme-color-tran-10);
        border-color: var(--db-color-button-primary-bg);
      }

      .color-strips {
        display: flex;
        height: 14px;
        border-radius: var(--border-radius-6);
        overflow: hidden;
        margin-bottom: 6px;
        .strip { flex: 1; }
      }

      .name {
        font-size: 11px;
        text-align: center;
        color: var(--theme-color-text-secondary);
        text-transform: capitalize;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
