<template>
  <div class="ws-editor ws-database-editor">
    <div class="editor-main-layout">
      <!-- Left Step Sidebar -->
      <div class="steps-sider">
        <WsStepManager
          :steps="config.steps"
          v-model="currentStepIndex"
          @change="onStepsChange"
        />
      </div>

      <div class="editor-body-container">
        <!-- Header Bar -->
        <WsEditorHeader
          v-if="currentStepIndex >= -2"
          :current-step="currentStep"
          :current-step-index="currentStepIndex"
          :connection-status="connectionStatus"
        />

        <div class="editor-content editor-content-grid">
          <!-- Panel: Final Output Transformation (-1) -->
          <div v-if="currentStepIndex === -1" class="final-output-panel">
            <div class="section-title">最终数据转换 (Final Output)</div>
            <div class="transformation-editor-container">
              <TransformationEditor v-model="config.transformation" />
            </div>
          </div>

          <!-- Panel: Global Connection Config (-2) -->
          <div v-else-if="currentStepIndex === -2" class="global-config-panel">
            <ConnectionConfig 
              v-model="config.connection" 
              @test-connection="onTestConnection"
            />

            <!-- Global Variables -->
            <div class="config-section mt-30">
              <div class="section-title">
                <span class="dot"></span>
                全局引用变量
              </div>
              <KVEditor v-model="config.variables" label-key="变量名" label-value="初始值" label-desc="说明" />
            </div>
          </div>

          <!-- Panel: WS Steps -->
          <template v-else>
            <div class="request-panel">
              <div class="tab-pane">
                <MessageEditor
                  :step="currentStep"
                  :all-steps="config.steps"
                  @update:step="onStepUpdate"
                  @send="onExecuteCommand"
                />
              </div>
            </div>

            <!-- Right Panel: Results -->
            <ResultTablePanel :response="response" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

// Local WS Components
import WsStepManager from './components/ws-step-manager.vue';
import WsEditorHeader from './components/ws-editor-header.vue';
import ConnectionConfig from './components/connection-config.vue';
import MessageEditor from './components/message-editor.vue';

// Shared Components
import TransformationEditor from '../sql/components/transformation-editor.vue';
import ResultTablePanel from '../sql/components/result-table-panel.vue';
import KVEditor from '../sql/components/kv-editor.vue';

const props = defineProps<{
  initialData?: any;
  response?: any;
}>();

const emit = defineEmits<{
  (e: 'save', data: any): void;
  (e: 'test', data: any): void;
}>();

const currentStepIndex = ref(0);
const connectionStatus = ref('disconnected');

const config = reactive({
  id: props.initialData?.id,
  name: props.initialData?.name || '新建 WebSocket 操作',
  type: 'websocket',
  connection: props.initialData?.connection || {
    url: 'ws://127.0.0.1:8080',
    protocols: '',
    headers: []
  },
  variables: props.initialData?.variables || [{ key: '', value: '', description: '', enabled: true }],
  steps: props.initialData?.steps && props.initialData.steps.length > 0 ? [...props.initialData.steps] : [
    {
      id: 'ws1',
      name: '发送载荷',
      action: 'send', // 'send' | 'listen'
      format: 'json',
      payload: '{\n  "event": "ping"\n}',
      condition: '',
      transformation: { script: 'return data;', type: 'raw' }
    }
  ],
  transformation: props.initialData?.transformation || {
    script: 'return results.ws1;',
    type: 'raw'
  }
});

const currentStep = computed(() => {
  if (currentStepIndex.value === -1) return { name: '数据流转换', type: 'script' };
  if (currentStepIndex.value === -2) return { name: 'WebSocket 连接配置', type: 'config' };
  if (!config.steps || !config.steps[currentStepIndex.value]) {
    return { name: '未知步骤', type: 'error' };
  }
  return config.steps[currentStepIndex.value];
});

const response = computed(() => props.response);

function onStepsChange(newSteps: any[]) {
  config.steps = newSteps;
}

function onStepUpdate(newStep: any) {
  const stepIndex = config.steps.findIndex((s: any) => s.id === newStep.id);
  if (stepIndex !== -1) {
    config.steps[stepIndex] = newStep;
  }
}

function onTestConnection() {
  connectionStatus.value = 'connecting';
  emit('test', { type: 'connection', connection: config.connection });
}

function onExecuteCommand() {
  emit('test', {
    type: 'websocket_action',
    connection: config.connection,
    step: currentStep.value,
    variables: config.variables
  });
}

function submit() {
  emit('save', config);
}

defineExpose({ submit });
</script>

<style lang="scss" scoped>
.ws-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-color-main);
  color: var(--theme-color-text);
  position: relative;

  .editor-main-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .steps-sider {
    width: 260px;
    flex: none;
    height: 100%;
    background: var(--db-main-color-left-bar-bg);
    border-right: 1px solid var(--db-main-border-black);
  }

  .editor-body-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--db-color-main);
    position: relative;
  }

  .editor-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    background: var(--db-color-main);

    .global-config-panel {
      flex: 1;
      overflow-y: auto;
      background: var(--db-editor-color-panel-bg);

      .config-section {
        padding: 0 32px 32px;
        
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--theme-color-text-bold);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          
          .dot {
            width: 3px;
            height: 14px;
            background: var(--ws-color-primary);
            border-radius: 2px;
          }
        }
      }
      .mt-30 { margin-top: 6px; }
    }

    .request-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
      border-right: 1px solid var(--db-main-border-black);
    }

    .final-output-panel {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
      background: var(--db-editor-color-panel-bg);
      .section-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--theme-color-text-bold);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        &:before {
          content: '';
          width: 3px;
          height: 14px;
          background: var(--ws-color-primary);
          border-radius: 2px;
        }
      }
      .transformation-editor-container {
        border: 1px solid var(--theme-color-border);
        border-radius: 8px;
        overflow: hidden;
      }
    }
  }
}
</style>

<style lang="scss">
:is(#visual-craft-core, #visual-craft-core-project) {
  .ws-database-editor {
    /* Dedicated WebSocket Identity (Vibrant Yellow/Amber) */
    --ws-color-primary: #f59e0b;
    --ws-color-primary-hover: #d97706;
    --ws-color-primary-light: rgba(245, 158, 11, 0.12);

    --ws-color-accent-listen: #10b981;
    --ws-color-accent-listen-light: rgba(16, 185, 129, 0.1);

    /* Local system-blue overrides — only affects components INSIDE this editor */
    --theme-color-blue-700: var(--ws-color-primary);
    --theme-color-blue-800: var(--ws-color-primary-hover);
    --db-editor-color-primary: var(--ws-color-primary);
    --db-editor-color-primary-light: var(--ws-color-primary-light);
    
    /* Theme icons in inputs and selects */
    .c-input :deep(.basic-icon),
    .c-select :deep(.basic-icon) {
      color: var(--ws-color-primary);
      opacity: 0.8;
    }
  }
}
</style>
