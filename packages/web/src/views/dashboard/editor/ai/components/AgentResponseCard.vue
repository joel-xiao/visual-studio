<script setup lang="ts">
import { computed } from 'vue';
import CButton from '../../../ui/controls/c-button/index.vue';
import CIcon from '../../../ui/controls/c-icon/index.vue';
import type { AgentRole } from '../types';
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
    <div v-if="title || badge" class="card-header">
      <div class="header-main">
        <CIcon v-if="schema?.icon" :icon="schema.icon" :style="{ color: schema.color }" />
        <span class="title">{{ title || schema?.displayName }}</span>
        <span v-if="badge" class="badge">{{ badge }}</span>
      </div>
      <slot name="header-right" />
    </div>

    <div class="card-body">
      <slot />
    </div>

    <div v-if="showActions" class="card-actions">
      <slot name="actions-left" />
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
