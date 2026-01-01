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
  
  .search-box {
    margin-bottom: 12px;
    :deep(.c-input) { width: 100%; }
  }

  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;

    .theme-item {
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: #409eff;
      }

      .color-strips {
        display: flex;
        height: 12px;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 4px;
        .strip { flex: 1; }
      }

      .name {
        font-size: 10px;
        text-align: center;
        color: var(--theme-color-text-secondary);
        text-transform: capitalize;
      }
    }
  }
}
</style>


