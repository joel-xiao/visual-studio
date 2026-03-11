<template>
  <div class="mqtt-message-editor">
    <div class="editor-scroll-container">
      <div class="config-section">
        <div class="section-title">行为配置</div>
        <div class="form-row">
           <div class="form-item action-select">
              <label>动作流程</label>
              <CSelect 
                :model-value="step.action" 
                :options="actionOptions" 
                size="small"
                @update:model-value="(v: any) => update('action', v)"
              />
           </div>
           <div class="form-item topic-input">
              <label>主题 (Topic)</label>
              <CInput 
                :model-value="step.topic" 
                placeholder="devices/sensors/temperature" 
                size="small"
                @update:model-value="(v: string) => update('topic', v)"
              />
           </div>
        </div>
      </div>

      <div class="config-section">
        <div class="section-title">传输质量</div>
        <div class="form-row">
           <div class="form-item qos-select">
              <label>QoS (服务质量)</label>
              <CSelect 
                :model-value="step.qos" 
                :options="qosOptions" 
                size="small"
                @update:model-value="(v: any) => update('qos', Number(v))"
              />
           </div>
           <div v-if="step.action === 'publish'" class="form-item retain-toggle">
              <label>保留消息 (Retain)</label>
              <div class="toggle-wrap">
                 <input type="checkbox" :checked="step.retain" @change="e => update('retain', (e.target as HTMLInputElement).checked)" />
                 <span class="hint">新订阅者将接收到最后一条保留消息</span>
              </div>
           </div>
        </div>
      </div>

      <div v-if="step.action === 'publish'" class="config-section payload-section">
        <div class="section-title">消息负载 (Payload)</div>
        <div class="payload-editor-container">
           <div class="editor-header">
              <span>JSON 格式</span>
              <BasicIcon icon="mdi:code-json" font-size="14px" />
           </div>
           <textarea 
             class="payload-area" 
             :value="step.payload" 
             @input="e => update('payload', (e.target as HTMLTextAreaElement).value)"
             placeholder='{ "status": "active", "value": {{variables.temp}} }'
           ></textarea>
        </div>
      </div>

      <div class="config-section pre-condition">
        <div class="section-title">执行条件 (JS Condition)</div>
        <CInput 
          :model-value="step.condition" 
          placeholder="例如：results.step1.success === true" 
          size="small"
          @update:model-value="(v: string) => update('condition', v)"
        />
      </div>
    </div>

    <div class="editor-footer">
       <CButton primary icon="mdi:rocket-launch" @click="$emit('send')">执行动作</CButton>
       <span class="stats">最后执行时间: {{ lastExecuted || '-' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';

const props = defineProps<{
  step: any;
  allSteps: any[];
}>();

const emit = defineEmits(['update:step', 'send']);

const lastExecuted = ref('');

const actionOptions = [
  { label: '发布消息 (Publish)', value: 'publish' },
  { label: '监听主题 (Subscribe)', value: 'subscribe' }
];

const qosOptions = [
  { label: '0 - 最多交付一次', value: 0 },
  { label: '1 - 至少交付一次', value: 1 },
  { label: '2 - 只交付一次', value: 2 }
];

function update(key: string, value: any) {
  emit('update:step', { ...props.step, [key]: value });
}
</script>

<style lang="scss" scoped>
.mqtt-message-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-editor-color-panel-bg);

  .editor-scroll-container {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
  }

  .config-section {
    margin-bottom: 32px;
    
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      &::before {
        content: '';
        width: 3px;
        height: 12px;
        background: #818cf8;
        border-radius: 1px;
      }
    }
  }

  .form-row {
    display: flex;
    gap: 16px;
    
    .form-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      label {
        font-size: 11px;
        font-weight: 600;
        color: var(--theme-color-text-secondary);
        opacity: 0.8;
      }
      
      &.action-select { width: 180px; }
      &.topic-input { flex: 1; }
      &.qos-select { width: 180px; }
      &.retain-toggle { flex: 1; }
    }
  }

  .toggle-wrap {
    height: 28px;
    display: flex;
    align-items: center;
    gap: 12px;
    .hint { font-size: 11px; opacity: 0.5; color: var(--theme-color-text-secondary); }
  }

  .payload-section {
    .payload-editor-container {
       border: 1px solid var(--db-main-border-black);
       border-radius: 8px;
       overflow: hidden;
       background: var(--db-color-main);
       
       .editor-header {
         padding: 8px 12px;
         background: var(--db-main-color-card-bg);
         border-bottom: 1px solid var(--db-main-border-black);
         display: flex;
         justify-content: space-between;
         align-items: center;
         font-size: 10px;
         font-weight: 700;
         color: var(--theme-color-text-secondary);
         letter-spacing: 0.5px;
       }

       .payload-area {
         width: 100%;
         height: 160px;
         padding: 12px;
         background: transparent;
         border: none;
         color: #e2e8f0;
         font-family: 'Fira Code', monospace;
         font-size: 12px;
         resize: none;
         outline: none;
         line-height: 1.6;
         &::placeholder { color: var(--theme-color-text-secondary); opacity: 0.3; }
       }
    }
  }

  .editor-footer {
    height: 60px;
    padding: 0 32px;
    border-top: 1px solid var(--db-main-border-black);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--db-main-color-left-bar-bg);
    
    .stats {
      font-size: 11px;
      color: var(--theme-color-text-secondary);
      opacity: 0.5;
    }
  }
}
</style>
