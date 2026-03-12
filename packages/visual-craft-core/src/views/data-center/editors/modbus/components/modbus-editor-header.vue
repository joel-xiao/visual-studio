<template>
  <div class="modbus-editor-header">
    <div class="header-breadcrumb">
      <div class="crumb-item">
        <BasicIcon icon="mdi:engine-outline" font-size="14px" />
        <span>{{ configName }}</span>
      </div>
      <div class="crumb-separator">/</div>
      <div class="crumb-item active">
        <BasicIcon v-if="currentStepIndex === -2" icon="mdi:cog-box" font-size="14px" />
        <BasicIcon v-else-if="currentStepIndex === -1" icon="mdi:function-variant" font-size="14px" />
        <BasicIcon v-else-if="isWriteFunc(currentStep.functionCode)" icon="mdi:pencil" font-size="14px" />
        <BasicIcon v-else icon="mdi:eye-outline" font-size="14px" />
        <span>{{ currentStep.name || (currentStepIndex === -2 ? '全局配置' : '未命名步骤') }}</span>
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
        <span class="label">协议</span>
        <div class="protocol-badge">
          <BasicIcon icon="mdi:alpha-m-box" font-size="16px" />
          <span class="value">Modbus/TCP</span>
        </div>
      </div>

      <div class="meta-divider"></div>

      <div class="meta-item">
        <span class="label">连接状态</span>
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

const configName = computed(() => props.configName || 'Modbus 设备介入');

const statusText = computed(() => {
  const map: any = { connected: '已连接', connecting: '连接中...', error: '连接异常', disconnected: '未连接' };
  return map[props.connectionStatus] || '未知';
});

function isWriteFunc(code: number) { return [5, 6, 15, 16].includes(code); }

async function copyId(id: string) { await copyToClipboard(id); }
</script>

<style lang="scss" scoped>
.modbus-editor-header {
  height: 52px;
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
    gap: 24px;

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
      padding: 6px 12px;
      background: var(--db-main-border-black);
      border-radius: 6px;
      border: 1px solid transparent;
      transition: all 0.2s;
      
      .value { font-family: 'Fira Code', monospace; color: var(--modbus-color-primary); font-size: 11px; }
      .copy-icon { opacity: 0; transition: opacity 0.2s; }

      &:hover {
        border-color: var(--modbus-color-primary);
        background: var(--modbus-color-primary-light);
        .copy-icon { opacity: 0.6; }
      }
    }

    .protocol-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      color: var(--modbus-color-primary);
      background: var(--modbus-color-primary-light);
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
      &.connecting { color: var(--modbus-color-primary); }
      &.disconnected { color: var(--theme-color-text-secondary); opacity: 0.6; }
      &.error { color: #ef4444; }

      .value { font-size: 12px; font-weight: 700; }
    }
  }
}

@keyframes status-pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(3.5); opacity: 0; }
}
</style>
