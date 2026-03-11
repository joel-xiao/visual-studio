<template>
  <div class="mqtt-editor-header">
     <div class="header-left">
        <div class="step-badge">
           <span v-if="currentStepIndex === -1">FINAL</span>
           <span v-else-if="currentStepIndex === -2">CONFIG</span>
           <span v-else>STEP {{ currentStepIndex + 1 }}</span>
        </div>
        <div class="step-title-group">
           <div class="main-title">{{ currentStep.name }}</div>
           <div class="sub-path">
              {{ currentStepIndex === -2 ? 'Broker Connection Details' : currentStepIndex === -1 ? 'Data Pipeline Outlet' : currentStep.topic || 'No topic defined' }}
           </div>
        </div>
     </div>

     <div class="header-right">
        <div class="connection-status" :class="connectionStatus">
           <span class="dot"></span>
           <span class="text">{{ statusText }}</span>
        </div>
        <div class="action-buttons">
           <CButton quaternary size="small" icon="mdi:refresh">同步</CButton>
           <CButton primary size="small" icon="mdi:play" @click="$emit('execute')">调试运行</CButton>
        </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CButton from '@/views/ui/controls/c-button/index.vue';

const props = defineProps<{
  currentStep: any;
  currentStepIndex: number;
  connectionStatus: string;
}>();

const emit = defineEmits(['execute']);

const statusText = computed(() => {
  switch (props.connectionStatus) {
    case 'connected': return 'Broker 已连接';
    case 'connecting': return '正在连接...';
    case 'error': return '连接异常';
    default: return '未连接';
  }
});
</script>

<style lang="scss" scoped>
.mqtt-editor-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--db-editor-color-panel-bg);
  border-bottom: 1px solid var(--db-main-border-black);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .step-badge {
      background: var(--db-main-border-black);
      color: var(--theme-color-text-secondary);
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    .step-title-group {
      .main-title { font-size: 15px; font-weight: 700; color: var(--theme-color-text-bold); }
      .sub-path { font-size: 11px; opacity: 0.5; margin-top: 2px; font-family: monospace; }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;

    .connection-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--theme-color-text-secondary);

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--theme-color-gray-400);
      }

      &.connected .dot { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
      &.connecting .dot { background: #f59e0b; animation: pulse 1s infinite; }
      &.error .dot { background: #ef4444; }
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
