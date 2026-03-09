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
        <!-- Top Nav Header (More Breadcrumb/Info Style) -->
        <div class="editor-tabs">
          <div class="header-left">
            <div v-if="currentStepIndex !== -1" class="active-step-info">
               <div class="method-badge" :class="currentStep.method.toLowerCase()">{{ currentStep.method }}</div>
               <input v-model="currentStep.name" class="header-step-name" placeholder="步骤名称" />
               <div class="header-id-badge">
                 <span class="label">ID:</span>
                 <input v-model="currentStep.id" class="badge-id-input" placeholder="stepId" />
                 <BasicIcon icon="mdi:content-copy" font-size="10px" class="copy-icon" @click="copyId(currentStep.id)" />
               </div>
            </div>
            <div v-else class="active-step-info transformation">
               <BasicIcon icon="mdi:auto-fix" font-size="14px" />
               <span class="header-step-name">结果数据转换 (Final Output)</span>
            </div>
          </div>

          <div class="header-right">
            <div class="cascading-toggle" :class="{ active: isCascading }" @click="isCascading = !isCascading; toggleCascading()">
               <span class="toggle-track">
                 <span class="toggle-thumb"></span>
               </span>
               <label>多接口联动模式</label>
            </div>
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
import { copyToClipboard } from '@/assets/utils/index';
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

const copyId = async (id: string) => {
  await copyToClipboard(id);
}
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
    height: 48px;
    background: var(--db-editor-color-panel-bg);
    border-bottom: 1px solid var(--theme-color-border);
    justify-content: space-between;
    align-items: center;
    flex: none;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;

      .active-step-info {
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--db-color-main);
        padding: 4px 12px;
        border-radius: 6px;
        border: 1px solid var(--theme-color-border);
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);

        .method-badge {
          font-size: 10px;
          font-weight: 800;
          color: var(--theme-color-blue-700);
          background: rgba(54, 98, 236, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          
          &.get { color: var(--db-main-color-get); background: rgba(14, 165, 233, 0.1); }
          &.post { color: var(--db-main-color-post); background: rgba(52, 211, 153, 0.1); }
          &.put { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
          &.delete { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        }

        .header-step-name {
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          color: var(--theme-color-text-bold);
          width: 200px;
          height: 24px;
          padding: 0;
          &:focus { outline: none; }
        }

        .header-id-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--theme-color-gray-50);
          padding: 2px 8px;
          padding-right: 0px;
          border-radius: 4px;
          border: 1px solid var(--theme-color-border);
          .label { font-size: 10px; font-weight: 700; color: var(--theme-color-text-secondary); opacity: 0.7; }
          .badge-id-input {
            border: none;
            background: transparent;
            font-size: 11px;
            font-family: monospace;
            color: var(--theme-color-blue-700);
            width: 80px;
            padding: 0;
            &:focus { outline: none; }
          }
          .copy-icon {
             cursor: pointer;
             opacity: 0.4;
             transition: all 0.2s;
             transform: scale(0.8);
             &:hover { opacity: 1; color: var(--theme-color-blue-700); }
          }
        }

        &.transformation {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
          color: #3b82f6;
          box-shadow: none;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .cascading-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
        
        &:hover { background: var(--theme-color-gray-50); }

        .toggle-track {
          width: 28px;
          height: 16px;
          background: var(--theme-color-gray-300);
          border-radius: 10px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

        label {
          font-size: 12px;
          color: var(--theme-color-text-secondary);
          font-weight: 500;
          cursor: pointer;
        }

        &.active {
          .toggle-track { background: var(--theme-color-blue-700); }
          .toggle-thumb { left: 14px; }
          label { color: var(--theme-color-text-bold); font-weight: 600; }
        }
      }
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
