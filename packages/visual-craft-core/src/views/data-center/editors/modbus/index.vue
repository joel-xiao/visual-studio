<template>
  <div class="modbus-editor modbus-database-editor">
    <div class="editor-main-layout">
      <!-- Left Step Sidebar -->
      <div class="steps-sider">
        <ModbusStepManager
          :steps="config.steps"
          v-model="currentStepIndex"
          @change="onStepsChange"
        />
      </div>

      <div class="editor-body-container">
        <!-- Header Bar -->
        <ModbusEditorHeader
          v-if="currentStepIndex >= -2"
          :current-step="currentStep"
          :current-step-index="currentStepIndex"
          :connection-status="'disconnected'"
        />

        <div class="editor-content editor-content-grid">
          <!-- Panel: Final Output Transformation (-1) -->
          <div v-if="currentStepIndex === -1" class="final-output-panel">
            <div class="section-title">最终出参数据清洗 (Final Output)</div>
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
            <div class="config-section mt-10">
              <div class="section-title">
                <span class="dot"></span>
                挂载全局上下文变量
              </div>
              <KVEditor v-model="config.variables" label-key="变量名" label-value="初始值" label-desc="说明" />
            </div>
          </div>

          <!-- Panel: Modbus Query Steps -->
          <template v-else>
            <div class="request-panel">
              <div class="tab-pane">
                <CommandEditor
                  :step="currentStep"
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

// Local Modbus Components
import ModbusStepManager from './components/modbus-step-manager.vue';
import ModbusEditorHeader from './components/modbus-editor-header.vue';
import ConnectionConfig from './components/connection-config.vue';
import CommandEditor from './components/command-editor.vue';

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

const config = reactive({
  id: props.initialData?.id || '',
  name: props.initialData?.name || '新建 Modbus 终端',
  type: 'modbus',
  connection: props.initialData?.connection || {
    host: '127.0.0.1',
    port: 502,
    unitId: 1, // Device ID (Slave ID)
    timeout: 3000
  },
  variables: props.initialData?.variables || [{ key: '', value: '', description: '', enabled: true }],
  steps: props.initialData?.steps && props.initialData.steps.length > 0 ? [...props.initialData.steps] : [
    {
      id: 'mb1',
      name: '读取保持寄存器',
      functionCode: 3, // Read Holding Registers
      address: 0,
      quantity: 10,
      condition: '',
      transformation: { script: 'return data;', type: 'raw' }
    }
  ],
  transformation: props.initialData?.transformation || { script: 'return results.mb1;', type: 'raw' }
});

const currentStep = computed(() => {
  if (currentStepIndex.value === -1) return { name: '数据流转换', type: 'script' };
  if (currentStepIndex.value === -2) return { name: 'Modbus TCP 连接配置', type: 'config' };
  if (!config.steps || !config.steps[currentStepIndex.value]) return { name: '未知步骤', type: 'error' };
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
  emit('test', { type: 'connection', connection: config.connection });
}

function onExecuteCommand() {
  emit('test', {
    type: 'modbus_action',
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
.modbus-editor {
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
    width: 280px;
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
  }

  .editor-content {
    flex: 1;
    display: flex;
    overflow: hidden;

    .global-config-panel {
      flex: 1;
      overflow-y: auto;
      background: var(--db-editor-color-panel-bg);

      .config-section {
        padding: 0 40px 40px;
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--theme-color-text-bold);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          .dot {
            width: 4px;
            height: 16px;
            background: var(--modbus-color-primary);
            border-radius: 2px;
          }
        }
      }
      .mt-10 { margin-top: 10px; }
    }

    .request-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
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
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        &:before {
          content: '';
          width: 4px;
          height: 16px;
          background: var(--modbus-color-primary);
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
/* Modbus Scoped Theme Variables */
:is(#visual-craft-core, #visual-craft-core-project) {
  .modbus-database-editor {
    /* Modbus TCP Theme Color (Purple/Violet) */
    --modbus-color-primary: #a855f7;
    --modbus-color-primary-hover: #9333ea;
    --modbus-color-primary-light: rgba(168, 85, 247, 0.12);
    
    --modbus-color-accent-write: #f43f5e;
    --modbus-color-accent-write-light: rgba(244, 63, 94, 0.1);

    --theme-color-blue-700: var(--modbus-color-primary);
    --theme-color-blue-800: var(--modbus-color-primary-hover);
    
    --db-editor-color-primary: var(--modbus-color-primary);
    --db-editor-color-primary-light: var(--modbus-color-primary-light);
    
    /* Input Highlights */
    .c-input :deep(.basic-icon),
    .c-select :deep(.basic-icon) {
      color: var(--modbus-color-primary);
      opacity: 0.8;
    }
  }
}
</style>
