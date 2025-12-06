<script setup lang="ts">
import { computed, ref } from 'vue';
import { chartColorsSearch } from '../../hooks/chart-themes-context/data';

const emit = defineEmits<{
  (e: 'select', theme: string): void;
}>();

const searchQuery = ref('');

const themes = computed(() => {
  return Object.entries(chartColorsSearch).map(([name, colors]) => ({
    name,
    colors
  })).filter(t => t.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const handleSelect = (name: string) => {
  emit('select', name);
};
</script>

<template>
  <div class="theme-selector-container">
    <div class="search-bar">
      <input
        v-model="searchQuery"
        placeholder="搜索主题..."
        class="search-input"
      />
    </div>

    <div class="theme-grid">
      <div
        v-for="theme in themes"
        :key="theme.name"
        class="theme-item"
        @click="handleSelect(theme.name)"
      >
        <div class="color-preview">
          <div
            v-for="(color, index) in theme.colors.slice(0, 5)"
            :key="index"
            class="color-stripe"
            :style="{ backgroundColor: color }"
          ></div>
        </div>
        <div class="theme-name">{{ theme.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.theme-selector-container {
  padding: 0;
  background-color: transparent;
  border: none;
  margin-top: 4px;

  .search-bar {
    margin-bottom: 6px;

    .search-input {
      width: 100%;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--theme-color-gray-600, #444);
      background-color: var(--db-editor-color-panel-bg-lighter, #2b2b2b);
      color: var(--theme-color-text);
      font-size: 12px;

      &:focus {
        border-color: var(--db-color-button-primary-bg, #409eff);
        outline: none;
      }
    }
  }

  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 6px;
    max-height: 200px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--theme-color-gray-500);
      border-radius: 2px;
    }

    .theme-item {
      cursor: pointer;
      border: 1px solid var(--theme-color-gray-600);
      border-radius: 4px;
      padding: 4px;
      transition: all 0.2s;
      background-color: var(--db-editor-color-panel-bg-lighter, #2b2b2b);

      &:hover {
        background-color: var(--db-editor-color-panel-bg-lightest, #333);
        border-color: var(--db-color-button-primary-bg);
        transform: translateY(-1px);
      }

      .color-preview {
        display: flex;
        height: 16px;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 4px;

        .color-stripe {
          flex: 1;
          height: 100%;
        }
      }

      .theme-name {
        font-size: 10px;
        text-align: center;
        color: var(--theme-color-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
