<script setup lang="ts">
import { computed } from 'vue';
import CButton from '../../../ui/controls/c-button/index.vue';
import CIcon from '../../../ui/controls/c-icon/index.vue';
import type { AgentRole, IWorkflowControl } from '../types';
import { getAgentSchema } from '../agent/registry';

interface Props {
  role?: AgentRole;
  title?: string;
  badge?: string;
  loading?: boolean;
  showActions?: boolean;
  primaryActionText?: string;
  secondaryActionText?: string;
  hasSecondaryAction?: boolean;
  workflowControl?: IWorkflowControl;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  primaryActionText: '应用',
  hasSecondaryAction: false,
  secondaryActionText: '更新'
});

const emit = defineEmits<{
  apply: [];
  secondary: [];
}>();

const schema = computed(() => props.role ? getAgentSchema(props.role) : null);
</script>

<template>
  <div class="agent-card">
    <div v-if="title || badge || workflowControl?.isMultiStep" class="card-header">
      <div class="header-main">
        <CIcon v-if="schema?.icon" :icon="schema.icon" :style="{ color: schema.color }" />
        <span class="title">{{ title || schema?.displayName }}</span>
        <span v-if="badge" class="badge">{{ badge }}</span>
      </div>
      <div v-if="workflowControl?.isMultiStep" class="workflow-progress">
        <span class="progress-text">{{ workflowControl.currentStep }}/{{ workflowControl.totalSteps }}</span>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${(workflowControl.currentStep / workflowControl.totalSteps) * 100}%` }"
          ></div>
        </div>
      </div>
      <slot name="header-right"></slot>
    </div>

    <div class="card-body">
      <slot></slot>
    </div>

    <div v-if="showActions" class="card-actions">
      <slot name="actions-left"></slot>
      <div class="actions-right">
        <CButton 
          v-if="hasSecondaryAction" 
          @click="emit('secondary')"
        >
          {{ secondaryActionText }}
        </CButton>
        <CButton 
          primary 
          :loading="loading" 
          @click="emit('apply')"
        >
          {{ primaryActionText }}
        </CButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.agent-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
  }

  .card-header {
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    flex-wrap: wrap;
    gap: 8px;

    .header-main {
      display: flex;
      align-items: center;
      gap: 8px;

      :deep(.c-icon) {
        font-size: 16px;
      }

      .title {
        font-size: 12px;
        font-weight: 600;
        color: var(--theme-color-text);
      }

      .badge {
        font-size: 9px;
        padding: 1px 6px;
        background: rgba(64, 158, 255, 0.15);
        color: #409eff;
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: 700;
      }
    }

    .workflow-progress {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;

      .progress-text {
        font-size: 10px;
        color: var(--theme-color-text-secondary);
        font-weight: 500;
      }

      .progress-bar {
        width: 60px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #409eff, #67c23a);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
      }
    }
  }

  .card-body {
    padding: 0;
    position: relative;
  }

  .card-actions {
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.01);
    border-top: 1px solid rgba(255, 255, 255, 0.05);

    .actions-right {
      display: flex;
      gap: 8px;
      margin-left: auto;

      :deep(.c-button) {
        font-size: 11px;
        height: 26px;
        padding: 0 12px;
      }
    }
  }
}
</style>
