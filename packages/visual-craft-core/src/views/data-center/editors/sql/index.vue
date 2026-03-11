<template>
  <div class="sql-database-editor">
    <div class="editor-main-layout">
      <!-- Left Step Sidebar -->
      <div class="steps-sider">
        <SqlStepManager
          :steps="config.steps"
          v-model="currentStepIndex"
          @change="onStepsChange"
        />
      </div>

      <div class="editor-body-container">
        <!-- Header Bar -->
        <SqlEditorHeader
          v-if="currentStepIndex >= -2"
          :current-step="currentStep"
          :current-step-index="currentStepIndex"
          :db-type="config.connection.dbType"
          :connection-status="connectionStatus"
        />

        <div class="editor-content editor-content-grid">
          <!-- Panel: Final Output Transformation (-1) -->
          <div v-if="currentStepIndex === -1" class="final-output-panel">
            <div class="section-title">结果数据转换 (Final Output)</div>
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
                全局查询变量
              </div>
              <KVEditor v-model="config.variables" label-key="变量名" label-value="初始值" label-desc="说明" />
            </div>
          </div>

          <!-- Panel: Query Steps -->
          <template v-else>
            <div class="request-panel">
              <div class="tab-pane">
                <component
                  :is="stepEditorComponent"
                  :step="currentStep"
                  :all-steps="config.steps"
                  @update:step="onStepUpdate"
                  @send="onExecuteQuery"
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

// All local components — fully decoupled from HTTP module
import SqlStepManager from './components/sql-step-manager.vue';
import SqlEditorHeader from './components/sql-editor-header.vue';
import ConnectionConfig from './components/connection-config.vue';
import QueryStepEditor from './components/query-step-editor.vue';
import JoinBuilder from './components/join-builder.vue';
import AggregationPanel from './components/aggregation-panel.vue';
import TransformationEditor from './components/transformation-editor.vue';
import ResultTablePanel from './components/result-table-panel.vue';
import KVEditor from './components/kv-editor.vue';

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
  name: props.initialData?.name || '新建数据库查询',
  type: 'sql',
  connection: props.initialData?.connection || {
    dbType: 'mysql',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    timeout: '30',
    charset: 'utf8mb4',
    ssl: false
  },
  variables: props.initialData?.variables || [{ key: '', value: '', description: '', enabled: true }],
  steps: props.initialData?.steps && props.initialData.steps.length > 0 ? [...props.initialData.steps] : [
    {
      id: 'query1',
      name: '查询 1',
      queryType: 'raw',
      sql: 'SELECT * FROM table_name LIMIT 100',
      condition: '',
      variables: [{ key: '', value: '', description: '', enabled: true }],
      transformation: { script: 'return data;', type: 'raw' }
    }
  ],
  transformation: props.initialData?.transformation || {
    script: 'return results.query1;',
    type: 'raw'
  }
});

const currentStep = computed(() => {
  if (currentStepIndex.value === -1) return { name: '结果数据处理', queryType: 'script', type: 'script' };
  if (currentStepIndex.value === -2) return { name: '连接与全局配置', queryType: 'config', type: 'config' };
  if (!config.steps || !config.steps[currentStepIndex.value]) {
    return { name: '未知步骤', queryType: 'raw', type: 'error' };
  }
  return config.steps[currentStepIndex.value];
});

const stepEditorComponent = computed(() => {
  const queryType = currentStep.value.queryType || 'raw';
  switch (queryType) {
    case 'join':
      return JoinBuilder;
    case 'aggregation':
      return AggregationPanel;
    case 'raw':
    default:
      return QueryStepEditor;
  }
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
  connectionStatus.value = 'connected'; // Mock: would actually test connection
  emit('test', { type: 'connection', connection: config.connection });
}

function onExecuteQuery() {
  emit('test', {
    type: 'query',
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
.sql-database-editor {
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

    &.editor-content-grid {
      display: flex;
    }

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
            background: var(--sql-color-primary);
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
          background: var(--sql-color-primary);
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
  /* Unified SQL Module Theme */
  --sql-color-primary: #10b981;
  --sql-color-primary-hover: #059669;
  --sql-color-primary-light: rgba(16, 185, 129, 0.12);
  
  --sql-color-accent-join: #818cf8;
  --sql-color-accent-join-light: rgba(129, 140, 248, 0.1);
  
  --sql-color-accent-agg: #f59e0b;
  --sql-color-accent-agg-light: rgba(245, 158, 11, 0.1);
  
  /* Standardizing component overrides */
  --db-editor-color-primary: var(--sql-color-primary);
  --theme-color-blue-700: var(--sql-color-primary);
  --theme-color-blue-800: var(--sql-color-primary-hover);
}
</style>
