<template>
  <div class="http-request-editor">
    <div class="editor-main-layout">
      <!-- Left Step Sidebar for Cascading Requests -->
      <div v-if="isCascading" class="steps-sider">
         <StepManager
           :steps="config.steps"
           v-model="currentStepIndex"
           @change="onStepsChange"
           @add-ref="isSelectingRef = true"
         />
      </div>

      <div class="editor-body-container">
        <!-- Top Nav Tabs (Postman style) -->
        <div class="editor-tabs">
          <div v-if="currentStepIndex !== -1" class="tab-item active">
             <BasicIcon icon="mdi:api" font-size="14px" class="api-icon" />
             <div class="step-name-box">
                <input v-model="currentStep.name" class="step-name-input" placeholder="步骤名称" />
                <div class="step-id-edit">
                   <span class="prefix">ID:</span>
                   <input v-model="currentStep.id" class="id-input" placeholder="stepId" />
                </div>
             </div>
          </div>
          <div v-else class="tab-item active transformation-tab">
             <BasicIcon icon="mdi:function-variant" font-size="14px" class="api-icon" />
             <span class="tab-label">结果数据转换 (Final Output)</span>
          </div>
          <div class="mode-toggle">
             <label>连带请求模式</label>
             <input type="checkbox" v-model="isCascading" @change="toggleCascading" />
          </div>
        </div>

        <div class="editor-content editor-content-grid">
          <!-- Transformation View -->
          <TransformationEditor
            v-if="currentStepIndex === -1"
            v-model="config.transformation"
          />

          <!-- Regular Request View -->
          <template v-else>
            <!-- Left Panel: Request Configuration -->
            <div class="request-panel">
                <div class="tab-pane">
               <ReferenceStepEditor
                 v-if="currentStep.type === 'reference'"
                 :step="currentStep"
                 :is-cascading="isCascading"
                 @update:step="onStepUpdate"
               />

               <!-- Regular Step View -->
               <template v-else>
                  <RequestStepEditor
                    :step="currentStep"
                    :is-cascading="isCascading"
                    @update:step="onStepUpdate"
                    @send="onSend"
                  />
               </template>
                </div>
            </div>

            <!-- Right Panel: Response -->
            <ResponsePanel :response="response" />
          </template>
        </div>

      </div>
    </div>

    <!-- Reference Selection Overlay -->
    <div v-if="isSelectingRef" class="ref-selector-overlay">
       <div class="ref-modal">
          <div class="modal-header">
             <span>引用现有数据接口</span>
             <BasicIcon icon="mdi:close" class="close-btn" @click="isSelectingRef = false" />
          </div>
          <div class="search-box">
             <CInput v-model="refSearch" placeholder="搜索已存在的接口名称或 URL..." icon="mdi:magnify" />
          </div>
          <div class="interface-list">
             <div
               v-for="item in filteredRefs"
               :key="item.id"
               class="interface-item"
               @click="addReferenceStep(item)"
             >
                <div class="type-icon" :class="item.type">
                   <BasicIcon :icon="item.type === 'api' ? 'mdi:api' : 'mdi:database'" font-size="20px" />
                </div>
                <div class="info">
                   <div class="name">{{ item.name }}</div>
                   <div class="url">{{ item.url }}</div>
                </div>
                <div class="add-btn">
                   <BasicIcon icon="mdi:plus" font-size="18px" />
                </div>
             </div>
             <div v-if="filteredRefs.length === 0" class="empty">暂无可引用的接口</div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import RequestStepEditor from './request-step-editor.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import KVEditor from '../../components/kv-editor.vue';
import StepManager from '../../components/step-manager.vue';
import TransformationEditor from '../../components/transformation-editor.vue';
import ResponsePanel from '../../components/response-panel.vue';
import ReferenceStepEditor from './reference-step-editor.vue';
import { useDataCenterContext } from '../../hooks/data-center-context';

const props = defineProps<{
    initialData: any;
    response?: any;
}>();

const emit = defineEmits<{
  (e: 'save', data: any): void;
  (e: 'test', data: any): void;
}>();

const isCascading = ref(!!props.initialData?.steps?.length);
const currentStepIndex = ref(0);
const { dataSourceList } = useDataCenterContext();
const isSelectingRef = ref(false);
const refSearch = ref('');

const config = reactive({
  id: props.initialData?.id,
  name: props.initialData?.name || '新建 API 接口',
  type: 'api',
  steps: props.initialData?.steps && props.initialData.steps.length > 0 ? [...props.initialData.steps] : [
    {
      id: 'main',
      name: '请求 1',
      method: props.initialData?.method || 'GET',
      url: props.initialData?.url || '',
      headers: props.initialData?.headers || [{ key: '', value: '', enabled: true }],
      bodyMode: props.initialData?.bodyMode || 'none',
      bodyParams: props.initialData?.bodyParams || [{ key: '', value: '', enabled: true }],
      condition: ''
    }
  ],
  transformation: props.initialData?.transformation || {
    script: 'return results.main.data',
    type: 'raw'
  }
});

const currentStep = computed(() => {
  if (currentStepIndex.value === -1) return { name: '数据转换', method: 'SCRIPT', url: '', type: 'script' };
  if (!config.steps || !config.steps[currentStepIndex.value]) {
    return { name: '未知步骤', method: 'GET', url: '', type: 'error' };
  }
  return config.steps[currentStepIndex.value];
});

const activeTab = ref('body');

const tabs = computed(() => {
  const base = [
    { label: '认证 (Auth)', id: 'auth' },
    { label: '请求头 (Headers)', id: 'headers' },
    { label: '请求体 (Body)', id: 'body' }
  ];
  if (isCascading.value) {
    base.unshift({ label: '前置条件', id: 'condition' });
  }
  return base;
});


const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' }
];

const authOptions = [
  { label: 'No Auth', value: 'none' },
  { label: 'Bearer Token', value: 'bearer' },
  { label: 'Basic Auth', value: 'basic' }
];

const bodyModes = ['none', 'form-data', 'x-www-form-urlencoded', 'raw', 'binary'];

function onStepsChange(newSteps: any[]) {
  config.steps = newSteps;
}

function onStepUpdate(newStep: any) {
  const stepIndex = config.steps.findIndex(s => s.id === newStep.id);
  if (stepIndex !== -1) {
    config.steps[stepIndex] = newStep;
  }
}

const filteredRefs = computed(() => {
  const q = refSearch.value.toLowerCase();
  return dataSourceList.value.filter(d =>
    d.id !== config.id &&
    (d.name.toLowerCase().includes(q) || d.url?.toLowerCase().includes(q))
  );
});

function addReferenceStep(item: any) {
  const newStep = {
    id: 'ref_' + Math.random().toString(36).substr(2, 6),
    name: `引用: ${item.name}`,
    type: 'reference',
    refId: item.id,
    method: item.method || 'GET',
    url: item.url || '',
    condition: '',
    transformation: {
      script: 'return data;',
      type: 'script'
    }
  };
  config.steps.push(newStep);
  isCascading.value = true;
  isSelectingRef.value = false;
  currentStepIndex.value = config.steps.length - 1;
}

function toggleCascading() {
  if (isCascading.value && config.steps.length === 1) {
    // Already has 1 step, just enabled
  } else if (!isCascading.value) {
     // Down to simple mode - maybe keep first?
  }
}

async function onSend() {
  emit('test', config);
}

function submit() {
  emit('save', config);
}

defineExpose({ submit });
</script>

<style lang="scss" scoped>
.http-request-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-color-main);
  color: var(--theme-color-text);
  position: relative; // For absolute overlay

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
    position: relative; // Fix overlay position
  }

  .editor-tabs {
    display: flex;
    padding: 0 16px;
    gap: 2px;
    height: 40px;
    background: var(--db-editor-color-panel-bg);
    border-bottom: 1px solid var(--theme-color-border);
    justify-content: space-between;
    align-items: center;
    flex: none;

    .tab-item {
      padding: 0 20px;
      height: 100%;
      font-size: 13px;
      color: var(--theme-color-text-secondary);
      cursor: default;
      display: flex;
      align-items: center;
      gap: 8px;
      border-right: 1px solid var(--theme-color-border);
      background: var(--db-color-main);

      .api-icon { color: var(--db-main-color-get); }
      
      .step-name-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        .step-name-input {
          border: none;
          background: transparent;
          font-size: 13px;
          color: inherit;
          font-weight: 600;
          width: 140px;
          height: 18px;
          &:focus { outline: none; }
        }
        .step-id-edit {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          opacity: 0.5;
          .prefix { font-weight: 700; color: var(--theme-color-blue-700); }
          .id-input {
            border: none;
            background: transparent;
            font-size: 10px;
            color: inherit;
            width: 100px;
            padding: 0;
            &:focus { outline: none; color: var(--theme-color-blue-700); }
          }
        }
      }
            &.active {
        color: var(--theme-color-text-bold);
        background: var(--db-color-main);
        border-bottom: 2px solid var(--theme-color-blue-700);
        margin-bottom: -1px;
        .api-icon { color: var(--theme-color-blue-700); }
      }

      .api-icon { color: var(--theme-color-text-secondary); transition: color 0.2s; }

      &.transformation-tab.active {
        border-bottom-color: #3b82f6;
        .api-icon { color: #3b82f6; }
      }
    }

    .mode-toggle {
       display: flex;
       align-items: center;
       gap: 10px;
       font-size: 12px;
       color: var(--theme-color-text-secondary);
       padding: 0 12px;
       cursor: pointer;
       border-radius: 4px;
       height: 28px;
       &:hover { background: var(--theme-color-gray-100); }
       input { cursor: pointer; accent-color: var(--theme-color-blue-700); }
    }
  }

  .editor-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    background: var(--db-color-main);

    &.editor-content-grid {
      display: flex;
    }

    .request-panel,
    .response-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .request-panel {
      border-right: 1px solid var(--db-main-border-black);
    }
  }

  .ref-selector-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;

    .ref-modal {
      width: 600px;
      max-width: 90%;
      background: var(--db-editor-color-panel-bg);
      border: 1px solid var(--db-main-border-black);
      border-radius: 12px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      max-height: 85vh;
      overflow: hidden;
      animation: modalScaleIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);

      .modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid var(--db-main-border-black);
        display: flex;
        justify-content: space-between;
        align-items: center;
        span { font-size: 16px; font-weight: 700; color: var(--theme-color-text-bold); }
        .close-btn { cursor: pointer; opacity: 0.5; transition: opacity 0.2s; &:hover { opacity: 1; } }
      }

      .search-box {
        padding: 20px 24px;
        background: var(--db-color-main);
      }

      .interface-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        .interface-item {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 4px;
          border: 1px solid transparent;

          &:hover {
            background: var(--theme-color-gray-100);
            border-color: var(--theme-color-blue-700);
            .add-btn { background: var(--theme-color-blue-700); color: #fff; transform: scale(1.1); }
          }

          .type-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: var(--theme-color-gray-50);
            color: var(--theme-color-blue-700);
            &.api { color: var(--theme-color-blue-700); background: rgba(54, 98, 236, 0.1); }
          }

          .info {
            flex: 1;
            min-width: 0;
            .name { font-size: 14px; font-weight: 600; color: var(--theme-color-text-bold); margin-bottom: 2px; }
            .url { font-size: 11px; color: var(--theme-color-text-secondary); opacity: 0.6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          }

          .add-btn {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: var(--theme-color-text-secondary);
            transition: all 0.2s;
          }
        }
        .empty { padding: 60px; text-align: center; color: var(--theme-color-text-secondary); font-size: 13px; font-style: italic; }
      }
    }
  }
}

@keyframes modalScaleIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
