<template>
  <div class="editor-tabs">
    <div class="header-left">
      <div v-if="currentStepIndex !== -1" class="active-step-info">
         <div v-if="currentStep?.method" class="method-badge" :class="currentStep.method?.toLowerCase()">{{ currentStep.method }}</div>
         <input v-model="currentStep.name" class="header-step-name" placeholder="步骤名称" />
         <div class="header-id-badge">
           <span class="label">ID:</span>
           <input v-model="currentStep.id" class="badge-id-input" placeholder="stepId" />
           <BasicIcon icon="mdi:content-copy" font-size="10px" class="copy-icon" @click="copyId(currentStep.id)" />
         </div>
      </div>
      <div v-else class="active-step-info transformation">
         <BasicIcon icon="mdi:auto-fix" font-size="14px" />
         <span class="header-step-name">结果数据转换 (Final Output)</span>
      </div>
    </div>

    <div class="header-right">
      <div class="cascading-toggle" :class="{ active: isCascading }" @click="$emit('update:isCascading', !isCascading)">
         <span class="toggle-track">
           <span class="toggle-thumb"></span>
         </span>
         <label>多接口联动模式</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import { copyToClipboard } from '@/assets/utils/index';

const props = defineProps<{
  currentStep: any;
  currentStepIndex: number;
  isCascading: boolean;
}>();

const emit = defineEmits(['update:isCascading']);

const copyId = async (id: string) => {
  await copyToClipboard(id);
};
</script>

<style lang="scss" scoped>
.editor-tabs {
  display: flex;
  padding: 0 16px;
  height: 48px;
  background: var(--db-editor-color-panel-bg);
  border-bottom: 1px solid var(--theme-color-border);
  justify-content: space-between;
  align-items: center;
  flex: none;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;

    .active-step-info {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--db-color-main);
      padding: 4px 12px;
      border-radius: 6px;
      border: 1px solid var(--theme-color-border);
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);

      .method-badge {
        font-size: 10px;
        font-weight: 800;
        color: var(--theme-color-blue-700);
        background: rgba(54, 98, 236, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        
        &.get { color: var(--db-main-color-get); background: rgba(14, 165, 233, 0.1); }
        &.post { color: var(--db-main-color-post); background: rgba(52, 211, 153, 0.1); }
        &.put { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
        &.delete { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
      }

      .header-step-name {
        border: none;
        background: transparent;
        font-size: 14px;
        font-weight: 600;
        color: var(--theme-color-text-bold);
        width: 200px;
        height: 24px;
        padding: 0;
        &:focus { outline: none; }
      }

      .header-id-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--theme-color-gray-50);
        padding: 2px 8px;
        padding-right: 0px;
        border-radius: 4px;
        border: 1px solid var(--theme-color-border);
        .label { font-size: 10px; font-weight: 700; color: var(--theme-color-text-secondary); opacity: 0.7; }
        .badge-id-input {
          border: none;
          background: transparent;
          font-size: 11px;
          font-family: monospace;
          color: var(--theme-color-blue-700);
          width: 80px;
          padding: 0;
          &:focus { outline: none; }
        }
        .copy-icon {
           cursor: pointer;
           opacity: 0.4;
           transition: all 0.2s;
           transform: scale(0.8);
           &:hover { opacity: 1; color: var(--theme-color-blue-700); }
        }
      }

      &.transformation {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.05);
        color: #3b82f6;
        box-shadow: none;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .cascading-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
      
      &:hover { background: var(--theme-color-gray-50); }

      .toggle-track {
        width: 28px;
        height: 16px;
        background: var(--theme-color-gray-300);
        border-radius: 10px;
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        .toggle-thumb {
          position: absolute;
          left: 2px;
          top: 2px;
          width: 12px;
          height: 12px;
          background: #fff;
          border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      }

      label {
        font-size: 12px;
        color: var(--theme-color-text-secondary);
        font-weight: 500;
        cursor: pointer;
      }

      &.active {
        .toggle-track { background: var(--theme-color-blue-700); }
        .toggle-thumb { left: 14px; }
        label { color: var(--theme-color-text-bold); font-weight: 600; }
      }
    }
  }
}
</style>
