<template>
  <div class="mqtt-connection-config">
    <div class="config-section">
      <div class="section-title">
        <span class="dot"></span>
        Broker 服务器地址
      </div>
      <div class="form-row grid-2">
        <div class="form-item">
          <label>服务器地址</label>
          <CInput 
            :model-value="modelValue.brokerUrl" 
            placeholder="mqtt://broker.emqx.io" 
            size="small"
            @update:model-value="(v: string) => update('brokerUrl', v)"
          />
        </div>
        <div class="form-item">
          <label>端口</label>
          <CInput 
            :model-value="String(modelValue.port)" 
            placeholder="1883" 
            size="small"
            @update:model-value="(v: string) => update('port', Number(v))"
          />
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="section-title">
        <span class="dot"></span>
        客户端配置
      </div>
      <div class="form-row grid-2">
        <div class="form-item">
          <label>Client ID</label>
          <CInput 
            :model-value="modelValue.clientId" 
            placeholder="自动生成或手动输入" 
            size="small"
            @update:model-value="(v: string) => update('clientId', v)"
          />
        </div>
        <div class="form-item">
          <label>协议</label>
          <CSelect 
            :model-value="modelValue.protocol" 
            :options="protocolOptions" 
            size="small"
            @update:model-value="(v: string) => update('protocol', v)"
          />
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="section-title">
        <span class="dot"></span>
        安全认证 (可选)
      </div>
      <div class="form-row grid-2">
        <div class="form-item">
          <label>用户名</label>
          <CInput 
            :model-value="modelValue.username" 
            placeholder="Username" 
            size="small"
            @update:model-value="(v: string) => update('username', v)"
          />
        </div>
        <div class="form-item">
          <label>密码</label>
          <CInput 
            :model-value="modelValue.password" 
            type="password"
            placeholder="Password" 
            size="small"
            @update:model-value="(v: string) => update('password', v)"
          />
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="section-title">
        <span class="dot"></span>
        高级参数
      </div>
      <div class="form-row grid-3">
        <div class="form-item">
           <label>心跳间隔 (Keepalive)</label>
           <CInput :model-value="String(modelValue.keepalive)" size="small" @update:model-value="(v: string) => update('keepalive', Number(v))" />
        </div>
        <div class="form-item">
           <label>清除会话 (Clean Session)</label>
           <div class="switch-placeholder">
              <input type="checkbox" :checked="modelValue.clean" @change="e => update('clean', (e.target as HTMLInputElement).checked)" />
           </div>
        </div>
        <div class="form-item">
           <label>重连周期 (ms)</label>
           <CInput :model-value="String(modelValue.reconnectPeriod)" size="small" @update:model-value="(v: string) => update('reconnectPeriod', Number(v))" />
        </div>
      </div>
    </div>

    <div class="test-footer">
       <CButton quaternary @click="$emit('test-connection')">测试连通性</CButton>
       <span class="hint">建立 TCP/WS 连接到指定的 Broker 以验证配置</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import CInput from '@/views/ui/controls/c-input/index.vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue', 'test-connection']);

const protocolOptions = [
  { label: 'MQTT', value: 'mqtt' },
  { label: 'MQTT/SSL', value: 'mqtts' },
  { label: 'WebSocket', value: 'ws' },
  { label: 'WebSocket/SSL', value: 'wss' }
];

function update(key: string, value: any) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>

<style lang="scss" scoped>
.mqtt-connection-config {
  padding: 32px;
  background: var(--db-editor-color-panel-bg);
  height: 100%;
  overflow-y: auto;

  .config-section {
    margin-bottom: 32px;
    
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .dot {
        width: 3px;
        height: 14px;
        background: #818cf8;
        border-radius: 2px;
      }
    }
  }

  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;
    
    &.grid-2 > .form-item { flex: 1; }
    &.grid-3 > .form-item { flex: 1; }
    
    .form-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      label {
        font-size: 12px;
        font-weight: 500;
        color: var(--theme-color-text-secondary);
      }

      .switch-placeholder {
        height: 28px;
        display: flex;
        align-items: center;
      }
    }
  }

  .test-footer {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--db-main-border-black);
    display: flex;
    align-items: center;
    gap: 16px;
    
    .hint {
      font-size: 12px;
      color: var(--theme-color-text-secondary);
      opacity: 0.6;
    }
  }
}
</style>
