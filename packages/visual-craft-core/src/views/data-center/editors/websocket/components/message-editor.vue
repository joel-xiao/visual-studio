<template>
  <div class="ws-message-editor">
    <!-- Tab Navigation -->
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
      <!-- Interaction Tab -->
      <div v-if="activeTab === 'behavior'" class="behavior-section">
        <div class="action-toolbar">
          <div class="toolbar-left">
            <div class="action-type-selector">
              <span class="label"><BasicIcon icon="mdi:swap-horizontal" font-size="13px" /> 行为模式</span>
              <div class="select-wrap">
                <CSelect 
                  icon="mdi:swap-vertical-variant"
                  v-model="step.action" 
                  :options="actionOptions" 
                  size="small" 
                  @update:model-value="(v: string) => updateStep('action', v)" 
                />
              </div>
            </div>
            
            <div class="action-type-selector" v-if="step.action === 'send'">
              <span class="label"><BasicIcon icon="mdi:code-json" font-size="13px" /> 数据类型</span>
              <div class="select-wrap" style="width: 120px;">
                <CSelect 
                  v-model="step.format" 
                  :options="formatOptions" 
                  size="small" 
                  @update:model-value="(v: string) => updateStep('format', v)" 
                />
              </div>
            </div>
          </div>
          <div class="toolbar-right">
             <div class="tool-btn" @click="insertTemplate" v-if="step.action === 'send'">
               <BasicIcon icon="mdi:file-code-outline" font-size="16px" />
               <span>插入模板</span>
             </div>
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

        <div v-if="step.action === 'send'" class="editor-wrap">
           <CCodeEditor 
             :model-value="step.payload" 
             :language="step.format === 'json' ? 'json' : 'text'" 
             class="ws-payload-editor"
             @update:model-value="(val: string) => updateStep('payload', val)"
           />
        </div>

        <div v-else class="listen-config-wrap">
           <div class="info-banner">
             <BasicIcon icon="mdi:information-outline" font-size="16px" />
             <span>监听模式下，编辑器将挂起执行，直到接收到符合条件的数据或超时为止。</span>
           </div>
           
           <div class="form-grid">
             <div class="form-row">
                <div class="label"><BasicIcon icon="mdi:timer-sand" font-size="13px" /> 最大等待时长 (Timeout)</div>
                <div class="input-wrap">
                  <CInput icon="mdi:clock-outline" :model-value="String(step.timeout || 5000)" suffix="ms" @update:model-value="(v: string) => updateStep('timeout', Number(v))" />
                </div>
             </div>
           </div>
        </div>
      </div>

      <!-- Condition Tab -->
      <div v-if="activeTab === 'condition'" class="condition-section">
         <div class="field-label">
            <BasicIcon icon="mdi:filter-check-outline" font-size="16px" class="sec-icon" />
            <span>执行（或提取）控制条件</span>
            <span class="tip">控制此 WS 步骤的触发，或作为 listen 模式的命中条件</span>
         </div>
         <div class="editor-wrap">
           <CCodeEditor
             :model-value="step.condition"
             language="javascript"
             placeholder="// 若作为监听命中条件，返回 true 即代表阻断等待并继续后续流程：\n// return data.event === 'pong';"
             @update:model-value="(val: string) => updateStep('condition', val)"
           />
         </div>
         <div class="info-banner">
            <BasicIcon icon="mdi:information-outline" font-size="16px" />
            <span>支持 JS 表达式。可使用 <code>data</code> 引用 WebSocket 中的原始流转数据。</span>
         </div>
      </div>

      <!-- Transform Tab -->
      <div v-if="activeTab === 'transform'" class="transform-section">
        <div class="field-label">
          <BasicIcon icon="mdi:auto-fix" font-size="16px" class="sec-icon purple" />
          <span>出参格式化</span>
        </div>
        <div class="editor-wrap">
          <TransformationEditor
            :model-value="step.transformation || { script: 'return data;', type: 'raw' }"
            @update:model-value="(val: any) => updateStep('transformation', val)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import TransformationEditor from '../../sql/components/transformation-editor.vue';

const props = defineProps<{
  step: any;
  allSteps: any[];
}>();

const emit = defineEmits(['update:step', 'send']);

const activeTab = ref('behavior');

const tabs = [
  { id: 'behavior', name: '行为配置', icon: 'mdi:play-box-outline' },
  { id: 'condition', name: '执行控制/命中', icon: 'mdi:filter-variant' },
  { id: 'transform', name: '出参转换', icon: 'mdi:swap-horizontal-bold' }
];

const actionOptions = [
  { label: '发送数据包 (Send)', value: 'send' },
  { label: '等待接收报文 (Listen)', value: 'listen' }
];

const formatOptions = [
  { label: 'JSON', value: 'json' },
  { label: 'Plain Text', value: 'text' }
];

function updateStep(field: string, value: any) {
  emit('update:step', { ...props.step, [field]: value });
}

function insertTemplate() {
  const tpl = props.step.format === 'json' ? `{\n  "action": "subscribe",\n  "channel": "trades",\n  "symbol": "BTC-USDT"\n}` : `PING`;
  updateStep('payload', tpl);
}

onMounted(() => {
  if (!props.step.transformation) {
    updateStep('transformation', { type: 'raw', script: 'return data;' });
  }
});
</script>

<style lang="scss" scoped>
.ws-message-editor {
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
      
      &:hover { color: var(--theme-color-text-bold); }

      &.active {
        color: var(--ws-color-primary);
        opacity: 1;
        font-weight: 700;
        &:after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: -4px;
          right: -4px;
          height: 2px;
          background: var(--ws-color-primary);
        }
      }
    }
  }

  .tab-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .behavior-section {
    display: flex;
    flex-direction: column;
    height: 100%;

    .action-toolbar {
      flex: none;
      height: 48px;
      padding: 0 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--db-main-border-black);
      background: var(--db-main-color-left-bar-bg);

      .toolbar-left {
         display: flex;
         gap: 20px;
         .action-type-selector {
           display: flex;
           align-items: center;
           gap: 12px;
           .label { font-size: 12px; color: var(--theme-color-text-secondary); opacity: 0.6; }
           .select-wrap { width: 180px; }
         }
      }

      .toolbar-right {
        display: flex;
        gap: 16px;
        align-items: center;

        .tool-btn {
           display: flex;
           align-items: center;
           gap: 6px;
           font-size: 12px;
           color: var(--theme-color-text-secondary);
           cursor: pointer;
           padding: 4px 8px;
           border-radius: 6px;
           transition: all 0.2s;
           &:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
        }

        .exec-btn {
          background: var(--ws-color-primary) !important;
          border-color: var(--ws-color-primary) !important;
          color: #000;
          font-weight: 800;
          border-radius: 6px;
        }
      }
    }

    .editor-wrap {
      flex: 1;
      min-height: 0;
    }

    .listen-config-wrap {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 600px;
      
      .info-banner {
        padding: 12px 16px;
        background: var(--ws-color-accent-listen-light);
        border: 1px solid rgba(16, 185, 129, 0.1);
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;
        color: var(--theme-color-text-bold);
      }

      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;

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
          }

          .input-wrap {
            max-width: 200px;
          }
        }
      }
    }
  }

  .condition-section,
  .transform-section {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 900px;

    .field-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      .sec-icon { color: var(--ws-color-primary); &.purple { color: #818cf8; } }
      .tip { font-size: 11px; font-weight: 400; color: var(--theme-color-text-secondary); opacity: 0.6; margin-left: auto; }
    }

    .editor-wrap {
      height: 320px;
      border: 1px solid var(--theme-color-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .info-banner {
      padding: 12px 16px;
      background: var(--ws-color-primary-light);
      border: 1px solid rgba(245, 158, 11, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--theme-color-text-secondary);
      code { background: rgba(0,0,0,0.2); padding: 1px 4px; border-radius: 3px; }
    }
  }
}
</style>
