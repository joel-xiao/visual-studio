<template>
  <div class="ws-connection-config">
    <div class="config-section">
      <div class="section-title">
        <BasicIcon icon="mdi:lan-connect" font-size="16px" class="section-icon" />
        WebSocket 连接地址
      </div>
      <div class="form-grid">
        <div class="form-row-group">
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:web" font-size="13px" /> URL (ws:// 或 wss://) <span class="required">*</span></div>
            <div class="input-wrap full">
              <CInput 
                icon="mdi:link-variant"
                :model-value="modelValue.url" 
                placeholder="wss://api.example.com/stream" 
                @update:model-value="(v: string) => update('url', v)"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:format-list-bulleted-type" font-size="13px" /> 子协议 (Subprotocols)</div>
            <div class="input-wrap">
              <CInput 
                icon="mdi:text-short"
                :model-value="modelValue.protocols" 
                placeholder="例如: graphql-ws, my-protocol" 
                @update:model-value="(v: string) => update('protocols', v)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="section-title">
        <BasicIcon icon="mdi:code-brackets" font-size="16px" class="section-icon" />
        连接请求 Header (可选)
      </div>
      <div class="form-grid">
        <KVEditor
           :model-value="modelValue.headers || []"
           label-key="Header Name"
           label-value="Value"
           label-desc="Description"
           @update:model-value="(val: any) => update('headers', val)"
        />
      </div>
    </div>

    <div class="action-bar">
       <CButton primary size="small" icon="mdi:lan" @click="$emit('test-connection')">
         测试 WS 连接
       </CButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import CInput from '@/views/ui/controls/c-input/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import KVEditor from '../../sql/components/kv-editor.vue';

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue', 'test-connection']);

function update(key: string, value: any) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>

<style lang="scss" scoped>
.ws-connection-config {
  padding: 32px;
  background: var(--db-editor-color-panel-bg);
  height: 100%;
  overflow-y: auto;

  .config-section {
    margin-bottom: 36px;
    
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      .section-icon { 
        color: var(--ws-color-primary); 
      }
    }
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-width: 900px;
  }

  .form-row-group {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .label {
      font-size: 12px;
      font-weight: 600;
      color: var(--theme-color-text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
      .required { color: #f5222d; font-size: 11px; }
    }

    .input-wrap {
      &.full { width: 100%; }
    }
  }

  .action-bar {
    display: flex;
    gap: 12px;
    padding-top: 10px;
    :deep(.c-button) {
      background: var(--ws-color-primary) !important;
      border-color: var(--ws-color-primary) !important;
      color: #000;
      font-weight: 800;
      &:hover { opacity: 0.9; box-shadow: 0 2px 8px var(--ws-color-primary-light); }
    }
  }
}
</style>
