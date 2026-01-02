<script setup lang="ts">
import { computed } from 'vue';
import CButton from '../../../ui/controls/c-button/index.vue';
import CPopover from '../../../ui/controls/c-popover/index.vue';
import BasicIcon from '../../../ui/base/basic-icon.vue';
import type { AgentRole, IWorkflowControl } from '../types';
import { getAgentSchema } from '../agent/registry';
import { useAgentResponseCardWorkflow } from '../hooks/ui/use-agent-response-card';

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
  enableWorkflowActions?: boolean;
  hidePrimaryAction?: boolean;
  hideSecondaryAction?: boolean;
  handled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  primaryActionText: '应用',
  hasSecondaryAction: false,
  secondaryActionText: '更新',
  enableWorkflowActions: false,
  hidePrimaryAction: false,
  hideSecondaryAction: false,
  handled: false
});

const emit = defineEmits<{
  apply: [];
  secondary: [];
  applyOnly: [];
}>();

const schema = computed(() => props.role ? getAgentSchema(props.role) : null);

const {
  showWorkflowInlineActions,
  showWorkflowPopover,
  remainingWorkflowTitle,
  remainingWorkflowLinear,
  remainingWorkflowEdges,
  workflowInlineActions
} = useAgentResponseCardWorkflow(
  computed(() => props.workflowControl),
  computed(() => props.enableWorkflowActions)
);

const handleWorkflowInlineAction = () => emit('applyOnly');
</script>

<template>
  <div class="agent-card">
    <div class="card-body">
      <slot></slot>
    </div>

    <div v-if="title || badge || workflowControl?.isMultiStep || showActions" class="card-footer">
      <div v-if="title || badge || workflowControl?.isMultiStep" class="footer-left">
        <div class="footer-main">
          <BasicIcon v-if="schema?.icon" class="footer-icon" :icon="schema.icon" :style="{ color: schema.color }" size="small" />
          <span class="title">{{ title || schema?.displayName }}</span>
          <span v-if="badge" class="badge">{{ badge }}</span>
          <span v-if="workflowControl?.isMultiStep" class="progress-text">{{ workflowControl.currentStep }}/{{ workflowControl.totalSteps }}</span>
        </div>
        <div v-if="workflowControl?.isMultiStep" class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${(workflowControl.currentStep / workflowControl.totalSteps) * 100}%` }"
          ></div>
        </div>
      </div>

      <div v-if="showWorkflowInlineActions" class="workflow-actions-left">
        <CButton
          v-for="action in workflowInlineActions"
          :key="`${action.kind}-${action.label}`"
          :title="action.title || action.label"
          @click="handleWorkflowInlineAction()"
        >
          {{ action.label }}
        </CButton>
      </div>
      <slot name="actions-left"></slot>

      <div v-if="showActions" class="footer-actions">
        <CButton
          v-if="hasSecondaryAction && !hideSecondaryAction"
          :title="secondaryActionText"
          @click="emit('secondary')"
        >
          {{ secondaryActionText }}
        </CButton>
        <CButton
          v-if="!showWorkflowPopover && !hidePrimaryAction"
          primary
          :loading="loading"
          :title="primaryActionText"
          @click="emit('apply')"
        >
          {{ primaryActionText }}
        </CButton>
        <CPopover
          v-else-if="!hidePrimaryAction"
          placement="top"
          trigger="hover"
          :to="false"
        >
          <template #trigger>
            <CButton
              primary
              :loading="loading"
              :title="primaryActionText"
              @click="emit('apply')"
            >
              {{ primaryActionText }}
            </CButton>
          </template>
          <div class="workflow-popover">
            <div class="workflow-popover-title">
              {{ remainingWorkflowTitle }}
            </div>
            <div v-if="remainingWorkflowLinear.length" class="workflow-popover-flow">
              <span
                v-for="(step, idx) in remainingWorkflowLinear"
                :key="step.key"
                class="workflow-popover-node"
              >
                <span class="workflow-popover-node-label">{{ step.label }}</span>
                <span v-if="idx < remainingWorkflowLinear.length - 1" class="workflow-popover-arrow">→</span>
              </span>
            </div>
            <div v-else class="workflow-popover-edges">
              <div
                v-for="edge in remainingWorkflowEdges"
                :key="edge.key"
                class="workflow-popover-edge"
              >
                <span class="workflow-popover-edge-source">{{ edge.source }}</span>
                <span class="workflow-popover-arrow">→</span>
                <span class="workflow-popover-edge-target">{{ edge.target }}</span>
                <span v-if="edge.condition" class="workflow-popover-edge-cond">({{ edge.condition }})</span>
              </div>
            </div>
          </div>
        </CPopover>
        <div v-if="handled" class="handled-indicator">
          <BasicIcon icon="mdi:check" size="small" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.agent-card {
  width: 100%;
  background: var(--theme-color-tran-6);
  border: 1px solid var(--theme-color-tran-8);
  border-radius: var(--border-radius-8);
  overflow: hidden;

  .card-body {
    padding: 0;
    position: relative;
  }

  .card-footer {
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: transparent;
    border-top: 1px solid var(--theme-color-tran-8);
    gap: 10px;

    .footer-left {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      min-width: 0;
      flex: 1;

      .footer-main {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        width: 100%;
      }

      :deep(.footer-icon) { opacity: 0.9; }

      .title {
        font-size: 11px;
        font-weight: 600;
        color: var(--theme-color-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        opacity: 0.9;
      }

      .badge {
        font-size: 9px;
        padding: 2px 6px;
        background: var(--theme-color-tran-10);
        color: var(--theme-color-text-secondary);
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: 700;
        flex-shrink: 0;
      }

      .progress-text {
        font-size: 10px;
        color: var(--theme-color-text-secondary);
        font-weight: 500;
        margin-left: auto;
        flex-shrink: 0;
      }

      .progress-bar {
        width: 100%;
        height: 3px;
        background: var(--theme-color-tran-10);
        border-radius: 2px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: var(--db-color-button-primary-bg);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
      }
    }

    .footer-actions {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
      align-items: center;

      :deep(.c-button) {
        height: 28px;
        padding: 0 8px;
        font-size: 11px;
      }

      .handled-indicator {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        background: rgba(46, 204, 113, 0.12);
        color: rgba(46, 204, 113, 0.95);
      }
    }

    .workflow-actions-left {
      display: flex;
      gap: 6px;
      flex-shrink: 0;

      :deep(.c-button) {
        height: 28px;
        padding: 0 8px;
        font-size: 11px;
      }
    }
  }
}

.workflow-popover {
  padding: 8px 10px;
  max-width: 300px;
  color: var(--theme-color-text);
}

.workflow-popover-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--theme-color-text);
  opacity: 0.9;
  margin-bottom: 6px;
}

.workflow-popover-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.workflow-popover-node-label {
  font-size: 11px;
  padding: 2px 6px;
  border: 1px solid var(--theme-color-tran-10);
  background: var(--theme-color-tran-6);
  border-radius: 6px;
  opacity: 0.95;
}

.workflow-popover-arrow {
  margin: 0 4px;
  color: var(--theme-color-text-secondary);
  opacity: 0.7;
}

.workflow-popover-edges {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.workflow-popover-edge {
  font-size: 11px;
  color: var(--theme-color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.workflow-popover-edge-source,
.workflow-popover-edge-target {
  color: var(--theme-color-text);
  opacity: 0.9;
}

.workflow-popover-edge-cond {
  color: var(--theme-color-text-secondary);
  opacity: 0.7;
}
</style>
