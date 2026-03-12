<template>
  <div class="mqtt-message-editor">
    <div class="config-tabs">
      <div 
        v-for="t in tabs" 
        :key="t.id"
        class="tab-item"
        :class="{ active: activeTab === t.id }"
        @click="activeTab = t.id"
      >
        <BasicIcon :icon="t.icon" font-size="14px" />
        {{ t.name }}
      </div>
    </div>

    <div class="tab-pane">
      <!-- Logic Tab -->
      <div v-if="activeTab === 'behavior'" class="behavior-section">
        <div class="action-toolbar">
          <div class="toolbar-left">
            <div class="action-type-selector">
              <span class="label"><BasicIcon icon="mdi:gesture-tap" font-size="13px" /> 动作类型</span>
              <CSelect 
                icon="mdi:swap-vertical-variant"
                v-model="step.action" 
                :options="actionOptions" 
                size="small" 
                @update:model-value="(v: string) => update('action', v)" 
              />
            </div>
          </div>
          <div class="toolbar-right">
             <CButton 
               primary 
               size="small" 
               icon="mdi:play" 
               class="exec-btn" 
               @click="$emit('send')"
             >
               执行此动作
             </CButton>
          </div>
        </div>

        <div class="config-rows">
          <div class="form-row">
            <div class="form-item main-item">
              <label><BasicIcon icon="mdi:map-marker-path" font-size="13px" /> MQTT 主题 (Topic)</label>
              <CInput 
                icon="mdi:tag-outline"
                v-model="step.topic" 
                placeholder="devices/sensor/data" 
                size="small" 
                @update:model-value="(v: string) => update('topic', v)" 
              />
            </div>
            <div class="form-item small-item">
              <label><BasicIcon icon="mdi:check-decagram-outline" font-size="13px" /> QoS 等级</label>
              <CSelect 
                icon="mdi:numeric"
                v-model="step.qos" 
                :options="qosOptions" 
                size="small" 
                @update:model-value="(v: number) => update('qos', v)" 
              />
            </div>
            <div class="form-item mid-item" v-if="step.action === 'publish'">
              <label><BasicIcon icon="mdi:bookmark-check-outline" font-size="13px" /> Retain 标志</label>
              <div class="switch-placeholder">
                <CSwitch 
                  v-model="step.retain" 
                  @update:model-value="(v: boolean) => update('retain', v)" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payload Tab -->
      <div v-if="activeTab === 'payload'" class="payload-section">
        <div class="json-header">
           <div class="title">
             <BasicIcon icon="mdi:code-json" font-size="16px" />
             <span>消息负载 (JSON Payload)</span>
           </div>
           <div class="format-btn" @click="formatJson">格式化 JSON</div>
        </div>
        <div class="payload-editor-container">
           <textarea 
             v-model="step.payload" 
             class="payload-area" 
             @input="(e: any) => update('payload', e.target.value)"
             placeholder="{ 'key': 'value' }"
           ></textarea>
        </div>
      </div>

      <!-- Condition Tab -->
      <div v-if="activeTab === 'condition'" class="condition-section">
         <div class="condition-header">
            <div class="title">
              <BasicIcon icon="mdi:function-variant" font-size="16px" />
              <span>执行条件 (JS Condition)</span>
            </div>
         </div>
         <div class="condition-editor-container">
           <textarea 
             v-model="step.condition" 
             class="condition-area" 
             @input="(e: any) => update('condition', e.target.value)"
             placeholder="results.step1.success === true"
           ></textarea>
         </div>
         <div class="condition-hint">
            使用 JavaScript 表达式控制此步骤。例如引用上游结果: <code>results.step1.temp > 50</code>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CSwitch from '@/views/ui/controls/c-switch/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';

const props = defineProps<{
  step: any;
  allSteps: any[];
}>();

const emit = defineEmits(['update:step', 'send']);

const activeTab = ref('behavior');
const tabs = [
  { id: 'behavior', name: '行为配置', icon: 'mdi:upload-network' },
  { id: 'payload', name: '消息负载', icon: 'mdi:code-json' },
  { id: 'condition', name: '执行条件', icon: 'mdi:function-variant' }
];

const actionOptions = [
  { label: '发布消息 (Publish)', value: 'publish' },
  { label: '订阅主题 (Subscribe)', value: 'subscribe' }
];

const qosOptions = [
  { label: '0 - 至多一次', value: 0 },
  { label: '1 - 至少一次', value: 1 },
  { label: '2 - 只有一次', value: 2 }
];

function update(key: string, value: any) {
  emit('update:step', { ...props.step, [key]: value });
}

function formatJson() {
  try {
    const formatted = JSON.stringify(JSON.parse(props.step.payload), null, 2);
    update('payload', formatted);
  } catch (err) {
    console.error('JSON 格式化失败', err);
  }
}
</script>

<style lang="scss" scoped>
.mqtt-message-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-editor-color-panel-bg);

  .config-tabs {
    flex: none;
    height: 36px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 24px;
    border-bottom: 1px solid var(--db-main-border-black);
    background: var(--db-main-color-left-bar-bg);

    .tab-item {
      font-size: 13px;
      color: var(--theme-color-text-secondary);
      opacity: 0.6;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      height: 100%;
      position: relative;
      transition: all 0.2s;
      
      &.active {
        color: var(--mqtt-color-primary);
        opacity: 1;
        font-weight: 700;
        &:after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--mqtt-color-primary);
        }
      }
    }
  }

  .tab-pane {
    flex: 1;
    overflow: hidden;
    padding: 24px;
  }

  .action-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--db-main-border-black);

    .action-type-selector {
       display: flex;
       align-items: center;
       gap: 12px;
       .label { font-size: 12px; color: var(--theme-color-text-secondary); opacity: 0.6; }
    }
  }

  .config-rows {
    .form-row {
      display: flex;
      gap: 20px;
      .form-item {
        display: flex;
        flex-direction: column;
        gap: 10px;
        label { font-size: 12px; font-weight: 600; color: var(--theme-color-text-secondary); }
        .switch-placeholder { height: 28px; display: flex; align-items: center; }
      }
      .main-item { flex: 2; }
      .mid-item { flex: 1; }
      .small-item { width: 120px; }
    }
  }

  .json-header, .condition-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    .title {
       display: flex;
       align-items: center;
       gap: 8px;
       font-size: 14px;
       font-weight: 700;
       color: var(--theme-color-text-bold);
    }
    .format-btn {
       font-size: 11px;
       color: var(--mqtt-color-primary);
       cursor: pointer;
       &:hover { opacity: 0.8; }
    }
  }

  .payload-editor-container, .condition-editor-container {
    flex: 1;
    border: 1px solid var(--theme-color-border);
    border-radius: 8px;
    overflow: hidden;
    .payload-area, .condition-area {
      width: 100%;
      height: 300px;
      background: var(--db-color-bg-dark);
      border: none;
      color: #e2e8f0;
      padding: 16px;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      resize: vertical;
      &:focus { outline: none; }
    }
  }

  .condition-hint {
     margin-top: 12px;
     font-size: 12px;
     color: var(--theme-color-text-secondary);
     opacity: 0.6;
     code { background: rgba(0,0,0,0.3); padding: 2px 4px; border-radius: 4px; }
  }
}
</style>
