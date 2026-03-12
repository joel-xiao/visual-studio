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
              <span class="label"><BasicIcon icon="mdi:gesture-tap" font-size="13px" /> 流程动作类型</span>
              <div class="select-wrap">
                <CSelect 
                  icon="mdi:swap-vertical-variant"
                  v-model="step.action" 
                  :options="actionOptions" 
                  size="small" 
                  @update:model-value="(v: string) => update('action', v)" 
                />
              </div>
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
               立即执行 (Mock)
             </CButton>
          </div>
        </div>

        <div class="config-grid">
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:map-marker-path" font-size="13px" /> MQTT 目标主题 (Topic)</div>
            <div class="input-wrap">
              <CInput 
                icon="mdi:tag-outline"
                v-model="step.topic" 
                placeholder="devices/sensor/data" 
                @update:model-value="(v: string) => update('topic', v)" 
              />
            </div>
          </div>

          <div class="form-row-group">
            <div class="form-row">
              <div class="label"><BasicIcon icon="mdi:check-decagram-outline" font-size="13px" /> QoS 质量等级</div>
              <div class="input-wrap">
                <CSelect 
                  icon="mdi:numeric"
                  v-model="step.qos" 
                  :options="qosOptions" 
                  @update:model-value="(v: number) => update('qos', v)" 
                />
              </div>
            </div>
            <div class="form-row" v-if="step.action === 'publish'">
              <div class="label"><BasicIcon icon="mdi:bookmark-check-outline" font-size="13px" /> Retain 消息保留</div>
              <div class="input-wrap">
                <div class="toggle-switch" :class="{ active: step.retain }" @click="update('retain', !step.retain)">
                  <span class="toggle-track">
                    <span class="toggle-thumb"></span>
                  </span>
                  <label>{{ step.retain ? '已启用' : '未启用' }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payload Tab -->
      <div v-if="activeTab === 'payload'" class="payload-section">
        <div class="field-label">
           <BasicIcon icon="mdi:code-json" font-size="16px" class="sec-icon" />
           <span>消息负载 (JSON Payload)</span>
           <span class="format-btn" @click="formatJson">格式化 JSON</span>
        </div>
        <div class="editor-wrap">
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
         <div class="field-label">
            <BasicIcon icon="mdi:filter-check-outline" font-size="16px" class="sec-icon" />
            <span>执行控制条件</span>
            <span class="tip">控制此 MQTT 步骤的触发逻辑</span>
         </div>
         <div class="editor-wrap">
           <textarea 
             v-model="step.condition" 
             class="condition-area" 
             @input="(e: any) => update('condition', e.target.value)"
             placeholder="// 示例: results.step1.temp > 50"
           ></textarea>
         </div>
         <div class="info-banner">
            <BasicIcon icon="mdi:information-outline" font-size="16px" />
            <span>支持 JS 表达式。可使用 <code>results.xxx</code> 引用上一步或 <code>vars.xxx</code> 引用全局变量。</span>
         </div>
      </div>
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

const activeTab = ref('behavior');
const tabs = [
  { id: 'behavior', name: '行为配置', icon: 'mdi:play-box-outline' },
  { id: 'payload', name: '数据负载', icon: 'mdi:toy-brick-plus-outline' },
  { id: 'condition', name: '执行控制', icon: 'mdi:play-pause' }
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
    height: 42px;
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
          left: -4px;
          right: -4px;
          height: 2px;
          background: var(--mqtt-color-primary);
        }
      }
    }
  }

  .tab-pane {
    flex: 1;
    overflow-y: auto;
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
       .select-wrap { width: 180px; }
    }

    .exec-btn {
      background: var(--mqtt-color-primary) !important;
      border-color: var(--mqtt-color-primary) !important;
      color: #000;
      font-weight: 800;
    }
  }

  .config-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 800px;
  }

  .form-row-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    .label {
      font-size: 12px;
      font-weight: 600;
      color: var(--theme-color-text-secondary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .toggle-switch {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    height: 32px;

    .toggle-track {
      width: 28px;
      height: 16px;
      background: var(--theme-color-gray-300);
      border-radius: 10px;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      flex: none;
      .toggle-thumb {
        position: absolute;
        left: 2px;
        top: 2px;
        width: 12px;
        height: 12px;
        background: #fff;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }
    }

    label { font-size: 12px; color: var(--theme-color-text-secondary); cursor: pointer; }
    &.active {
      .toggle-track { background: var(--mqtt-color-primary); }
      .toggle-thumb { left: 14px; }
      label { color: var(--theme-color-text-bold); font-weight: 600; }
    }
  }

  .field-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 700;
    color: var(--theme-color-text-bold);
    margin-bottom: 16px;
    .sec-icon { color: var(--mqtt-color-primary); }
    .tip { font-size: 11px; font-weight: 400; color: var(--theme-color-text-secondary); opacity: 0.6; margin-left: auto; }
    .format-btn { font-size: 11px; color: var(--mqtt-color-primary); cursor: pointer; margin-left: auto; &:hover { text-decoration: underline; } }
  }

  .editor-wrap {
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

  .info-banner {
    margin-top: 16px;
    padding: 12px 16px;
    background: var(--mqtt-color-primary-light);
    border: 1px solid rgba(129, 140, 248, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: var(--theme-color-text-secondary);
    code { background: rgba(0,0,0,0.2); padding: 1px 4px; border-radius: 3px; }
  }
}
</style>
