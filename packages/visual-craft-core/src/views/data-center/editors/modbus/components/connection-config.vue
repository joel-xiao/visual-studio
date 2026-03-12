<template>
  <div class="modbus-connection-config">
    <div class="config-section">
      <div class="section-title">
        <BasicIcon icon="mdi:server-network" font-size="16px" class="section-icon" />
        Modbus TCP 网关配置
      </div>
      <div class="form-grid">
        <div class="form-row-group">
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:ip-network" font-size="13px" /> 服务器地址 (Host) <span class="required">*</span></div>
            <div class="input-wrap full">
              <CInput 
                icon="mdi:server-outline"
                :model-value="modelValue.host" 
                placeholder="192.168.1.100" 
                @update:model-value="(v: string) => update('host', v)"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:ethernet" font-size="13px" /> 端口 (Port) <span class="required">*</span></div>
            <div class="input-wrap">
              <CInput 
                icon="mdi:numeric"
                :model-value="String(modelValue.port)" 
                placeholder="502" 
                @update:model-value="(v: string) => update('port', Number(v))"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="section-title">
        <BasicIcon icon="mdi:cogs" font-size="16px" class="section-icon" />
        设备与协议参数
      </div>
      <div class="form-grid">
        <div class="form-row-group">
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:devices" font-size="13px" /> 从站地址 (Slave / Unit ID) <span class="required">*</span></div>
            <div class="input-wrap">
              <CInput 
                icon="mdi:identifier"
                :model-value="String(modelValue.unitId)" 
                placeholder="1" 
                @update:model-value="(v: string) => update('unitId', Number(v))"
              />
            </div>
            <div class="field-hint">一般网关后的子设备标识，默认为 1。</div>
          </div>
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:timer-sand" font-size="13px" /> 连接/读取超时 (Timeout)</div>
            <div class="input-wrap">
              <CInput 
                icon="mdi:clock-outline"
                :model-value="String(modelValue.timeout || 3000)" 
                suffix="ms"
                @update:model-value="(v: string) => update('timeout', Number(v))"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar">
       <CButton primary size="small" icon="mdi:connection" @click="$emit('test-connection')">
         测试网关通信连通性
       </CButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import CInput from '@/views/ui/controls/c-input/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue', 'test-connection']);

function update(key: string, value: any) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>

<style lang="scss" scoped>
.modbus-connection-config {
  padding: 40px;
  background: var(--db-editor-color-panel-bg);
  height: 100%;
  overflow-y: auto;

  .config-section {
    margin-bottom: 40px;
    
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
      .section-icon { 
        color: var(--modbus-color-primary); 
      }
    }
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 900px;
  }

  .form-row-group {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .label {
      font-size: 13px;
      font-weight: 600;
      color: var(--theme-color-text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
      .required { color: #ef4444; font-size: 11px; }
    }

    .input-wrap {
      &.full { width: 100%; }
    }

    .field-hint {
      font-size: 11px;
      color: var(--theme-color-text-secondary);
      opacity: 0.6;
      margin-top: 2px;
    }
  }

  .action-bar {
    display: flex;
    gap: 12px;
    padding-top: 16px;
    :deep(.c-button) {
      background: var(--modbus-color-primary) !important;
      border-color: var(--modbus-color-primary) !important;
      color: #fff;
      font-weight: 600;
      padding: 0 20px;
      height: 36px;
      &:hover { opacity: 0.9; box-shadow: 0 2px 8px var(--modbus-color-primary-light); }
    }
  }
}
</style>
