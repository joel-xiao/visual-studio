<template>
  <div class="http-request-editor">
    <div class="editor-main-layout">
      <!-- Left Step Sidebar -->
      <div v-if="isCascading" class="steps-sider">
        <StepManager
          :steps="config.steps"
          v-model="currentStepIndex"
          @change="onStepsChange"
          @add-ref="isSelectingRef = true"
        />
      </div>

      <div class="editor-body-container">
        <!-- New Header Component -->
        <HttpEditorHeader
          :current-step="currentStep"
          :current-step-index="currentStepIndex"
          v-model:is-cascading="isCascading"
        />

        <div class="editor-content editor-content-grid">
          <TransformationEditor
            v-if="currentStepIndex === -1"
            v-model="config.transformation"
          />

          <template v-else>
            <div class="request-panel">
              <div class="tab-pane">
                <ReferenceStepEditor
                  v-if="currentStep.type === 'reference'"
                  :step="currentStep"
                  :is-cascading="isCascading"
                  @update:step="onStepUpdate"
                />
                <RequestStepEditor
                  v-else
                  :step="currentStep"
                  :is-cascading="isCascading"
                  @update:step="onStepUpdate"
                  @send="onSend"
                />
              </div>
            </div>

            <!-- Right Panel: Response -->
            <ResponsePanel :response="response" />
          </template>
        </div>
      </div>
    </div>

    <!-- Extraction: Reference Selector Modal -->
    <ReferenceSelector
      v-model="isSelectingRef"
      @select="addReferenceStep"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import RequestStepEditor from './request-step-editor.vue';
import ReferenceStepEditor from './reference-step-editor.vue';
import { useDataCenterContext } from '../../hooks/data-center-context';

// Local Components
import HttpEditorHeader from './components/http-editor-header.vue';
import StepManager from './components/step-manager.vue';
import TransformationEditor from './components/transformation-editor.vue';
import ResponsePanel from './components/response-panel.vue';
import ReferenceSelector from './components/reference-selector.vue';

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
const isSelectingRef = ref(false);

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

function onStepsChange(newSteps: any[]) {
  config.steps = newSteps;
}

function onStepUpdate(newStep: any) {
  const stepIndex = config.steps.findIndex((s: any) => s.id === newStep.id);
  if (stepIndex !== -1) {
    config.steps[stepIndex] = newStep;
  }
}

// Duplicate filteredRefs removed

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



  .editor-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    background: var(--db-color-main);

    &.editor-content-grid {
      display: flex;
    }

    .request-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
      border-right: 1px solid var(--db-main-border-black);
    }
  }
}
</style>
