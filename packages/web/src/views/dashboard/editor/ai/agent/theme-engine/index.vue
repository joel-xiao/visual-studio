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
  // 通过 emit 通知父组件，由父组件调用 apply 函数
  emit('apply', { theme: name });
};
</script>

<template>
  <div class="theme-selector-container">
    <div class="search-bar">
      <CInput
        :model-value="searchQuery"
        icon="mdi:magnify"
        placeholder="搜索主题..."
        class="search-input"
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
  margin-top: 0;

  .search-bar {
    margin-bottom: 7px;

    .search-input {
      width: 100%;

      :deep(.c-input) {
        width: 100%;
      }

      :deep(.basic-input) {
        font-size: 11px;
        font-weight: 500;
      }
    }
  }

  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(68px, 1fr));
    gap: 6px;
    max-height: 170px;
    overflow-y: auto;
    padding: 0;
    margin: 0;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }
    }

    .theme-item {
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 5px;
      transition: all 0.2s;
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(8px);
      position: relative;
      overflow: hidden;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--db-color-button-primary-bg);
        transform: translateY(-1px);

        .theme-name {
          color: var(--db-color-button-primary-bg);
          font-weight: 600;
        }
      }

      .color-preview {
        display: flex;
        height: 17px;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 4px;
        transition: transform 0.2s;

        .color-stripe {
          flex: 1;
          height: 100%;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.1) 0%,
              transparent 50%,
              rgba(0, 0, 0, 0.1) 100%
            );
          }
        }
      }

      .theme-name {
        font-size: 10px;
        font-weight: 500;
        text-align: center;
        color: var(--theme-color-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: all 0.2s;
        text-transform: capitalize;
        letter-spacing: 0.15px;
      }
    }
  }
}
</style>

