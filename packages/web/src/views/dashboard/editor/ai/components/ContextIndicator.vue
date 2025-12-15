<template>
  <div class="context-indicator">
    <div class="indicator-left">
      <CIcon icon="mdi:target" />
      <span class="mode-label">Edit Context:</span>
      <span class="target-name">{{ targetName }}</span>
    </div>
    <div class="indicator-right" @click="$emit('clear')">
      <CIcon icon="mdi:close" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CIcon from '../../../ui/controls/c-icon/index.vue';

interface Props {
  targetName: string;
}

defineProps<Props>();
defineEmits<{
  clear: [];
}>();
</script>

<style scoped lang="scss">
.context-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 0 6px;
  background: rgba(64, 158, 255, 0.04);
  border-left: 2px solid var(--db-color-button-primary-bg);
  border-radius: 4px;
  font-size: 11px;
  transition: all 0.2s ease;

  .indicator-left {
    display: flex;
    align-items: center;
    gap: 5px;
    flex: 1;
    min-width: 0;

    :deep(.c-icon) {
      font-size: 13px;
      color: var(--db-color-button-primary-bg);
      opacity: 0.8;
      flex-shrink: 0;
    }

    .mode-label {
      color: var(--theme-color-text-secondary);
      font-weight: 400;
      white-space: nowrap;
    }

    .target-name {
      color: var(--theme-color-text);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }
  }

  .indicator-right {
    cursor: pointer;
    padding: 0 4px;
    border-radius: 3px;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--theme-color-text-secondary);
    opacity: 0.6;

    :deep(.c-icon) {
      font-size: 14px;
    }

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.08);
      color: var(--theme-color-text);
    }
  }
}
</style>

