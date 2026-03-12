<template>
  <div class="redis-editor-header">
    <div class="header-breadcrumb">
      <div class="crumb-item">
        <BasicIcon icon="mdi:database-outline" font-size="14px" />
        <span>{{ configName }}</span>
      </div>
      <div class="crumb-separator">/</div>
      <div class="crumb-item active">
        <BasicIcon v-if="currentStepIndex === -2" icon="mdi:cog-box" font-size="14px" />
        <BasicIcon v-else-if="currentStepIndex === -1" icon="mdi:function-variant" font-size="14px" />
        <BasicIcon v-else-if="currentStep.actionType === 'lua'" icon="mdi:script-text-outline" font-size="14px" />
        <BasicIcon v-else icon="mdi:console-line" font-size="14px" />
        <span>{{ currentStep.name || (currentStepIndex === -2 ? 'Redis 配置' : '未命名步骤') }}</span>
      </div>
    </div>

    <div class="header-metadata">
      <div class="meta-item id-badge" @click="copyId(currentStep.id || 'global')">
        <span class="label">ID</span>
        <span class="value">{{ currentStep.id || (currentStepIndex === -2 ? 'GLOBAL' : '-') }}</span>
        <BasicIcon icon="mdi:content-copy" font-size="11px" class="copy-icon" />
      </div>
      
      <div class="meta-divider"></div>

      <div class="meta-item">
        <span class="label">引擎</span>
        <div class="protocol-badge">
          <BasicIcon icon="mdi:redis" font-size="16px" />
          <span class="value">Redis</span>
        </div>
      </div>

      <div class="meta-divider"></div>

      <div class="meta-item">
        <span class="label">状态</span>
        <div class="status-indicator" :class="connectionStatus">
          <div class="pulse-dot"></div>
          <span class="value">{{ statusText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import { copyToClipboard } from '@/assets/utils/index';

const props = defineProps<{
  currentStep: any;
  currentStepIndex: number;
  connectionStatus: string;
  configName?: string;
}>();

const configName = computed(() => props.configName || 'Redis 数据源');

const statusText = computed(() => {
  const map: any = {
    connected: '已连接',
    connecting: '连接中...',
    error: '连接错误',
    disconnected: '未连接'
  };
  return map[props.connectionStatus] || '未知';
});

async function copyId(id: string) {
  await copyToClipboard(id);
}
</script>

<style lang="scss" scoped>
.redis-editor-header {
  height: 48px;
  padding: 0 24px;
  background: var(--db-main-color-left-bar-bg);
  border-bottom: 1px solid var(--db-main-border-black);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: none;

  .header-breadcrumb {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .crumb-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--theme-color-text-secondary);
      opacity: 0.6;
      transition: all 0.2s;
      
      &.active {
        opacity: 1;
        color: var(--theme-color-text-bold);
        font-weight: 700;
        span { margin-bottom: -1px; }
      }
    }
    
    .crumb-separator {
      font-size: 14px;
      color: var(--theme-color-text-secondary);
      opacity: 0.3;
      user-select: none;
    }
  }

  .header-metadata {
    display: flex;
    align-items: center;
    gap: 20px;

    .meta-divider {
      width: 1px;
      height: 16px;
      background: var(--db-main-border-black);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 10px;

      .label {
        font-size: 11px;
        color: var(--theme-color-text-secondary);
        opacity: 0.5;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .value {
        font-size: 12px;
        font-weight: 600;
      }
    }

    .id-badge {
      cursor: pointer;
      padding: 4px 10px;
      background: var(--db-main-border-black);
      border-radius: 6px;
      border: 1px solid transparent;
      transition: all 0.2s;
      
      .value { font-family: 'Fira Code', monospace; color: var(--redis-color-primary); font-size: 11px; }
      .copy-icon { opacity: 0; transition: opacity 0.2s; }

      &:hover {
        border-color: var(--redis-color-primary);
        background: var(--redis-color-primary-light);
        .copy-icon { opacity: 0.6; }
      }
    }

    .protocol-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 2px 10px;
      border-radius: 20px;
      color: var(--redis-color-primary);
      background: var(--redis-color-primary-light);
      .value { font-size: 11px; font-weight: 800; }
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        position: relative;
        background: currentColor;
      }

      &.connected {
        color: #10b981;
        .pulse-dot::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: currentColor;
          animation: status-pulse 1.5s infinite;
          opacity: 0.5;
        }
      }
      &.connecting { color: #f59e0b; }
      &.disconnected { color: var(--theme-color-text-secondary); opacity: 0.6; }
      &.error { color: #ef4444; }

      .value { font-size: 11px; font-weight: 700; }
    }
  }
}

@keyframes status-pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(3.5); opacity: 0; }
}
</style>
