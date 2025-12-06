<script setup lang="ts">
import { IScene } from '../types';

defineProps<{
  scenes: IScene[];
}>();

const emit = defineEmits<{
  (e: 'select', scene: IScene): void;
}>();
</script>

<template>
  <div class="scene-selector">
    <div
      v-for="scene in scenes"
      :key="scene.id"
      class="scene-card"
      :class="{ disabled: scene.disabled }"
      @click="!scene.disabled && emit('select', scene)"
    >
      <div class="scene-icon">
        <i class="iconfont icon-dashboard" v-if="scene.value === 'scene1'"></i>
        <i class="iconfont icon-app" v-else></i>
      </div>
      <div class="scene-info">
        <div class="scene-title">{{ scene.label }}</div>
        <div class="scene-desc">{{ scene.description || '暂无描述' }}</div>
      </div>
      <div class="scene-action">
        <i class="iconfont icon-arrow-right"></i>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scene-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  width: 100%;

  .scene-card {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: var(--db-main-color-card-bg, #2b2b2b);
    border: 1px solid var(--theme-color-gray-600, #444);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(.disabled) {
      border-color: var(--db-color-button-primary-bg, #409eff);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
      filter: grayscale(1);
    }

    .scene-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--db-editor-color-select-light);
      border-radius: 6px;
      margin-right: 10px;

      .iconfont {
        font-size: 16px;
        color: var(--db-color-button-primary-bg, #409eff);
      }
    }

    .scene-info {
      flex: 1;

      .scene-title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 2px;
        color: var(--theme-color-text);
      }

      .scene-desc {
        font-size: 12px;
        color: var(--theme-color-text-secondary, #999);
        line-height: 1.4;
      }
    }

    .scene-action {
      margin-left: 12px;
      color: var(--theme-color-text-secondary, #999);
    }
  }
}
</style>
