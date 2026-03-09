<template>
  <div class="reference-step-editor">
    <!-- Top Bar: Static info about the reference -->
    <div class="url-bar">
      <div class="url-input-group readonly">
        <div class="method-badge" :class="step.method?.toLowerCase()">{{ step.method || 'GET' }}</div>
        <div class="url-divider"></div>
        <div class="url-text">{{ step.url }}</div>
        <div class="id-badge">Ref ID: {{ step.refId }}</div>
      </div>
      <div class="ref-label">引用步骤</div>
    </div>

    <!-- Configuration Tabs -->
    <div class="config-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span v-if="getCount(tab.id)" class="count-badge">{{ getCount(tab.id) }}</span>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-pane">
      <!-- 0. Condition -->
      <div v-if="activeTab === 'condition'" class="condition-section">
        <div class="field-label">
          <span>执行条件判断</span>
          <span class="tip">返回 false 时跳过此步骤</span>
        </div>
        <div class="script-editor-wrap">
          <CCodeEditor
            :model-value="step.condition"
            language="javascript"
            placeholder="// 示例: results.main.data.success === true"
            @update:model-value="onConditionChange"
          />
        </div>
      </div>

      <!-- 1. Variables Binding (Inputs) -->
      <div v-if="activeTab === 'inputs'" class="inputs-section">
        <div class="field-label">
          <BasicIcon icon="mdi:tray-arrow-down" font-size="16px" />
          <span>入参配置 (Input Bindings)</span>
          <span v-pre class="tip">将上下文数据串联进来。支持 <code>{{results.step1.data.id}}</code> 表达式。</span>
        </div>

        <div v-if="step.variables && step.variables.length > 0" class="mapping-container">
           <KVEditor
            :model-value="step.variables"
            label-key="变量名"
            label-value="绑定值 / 表达式"
            label-desc="说明"
            @update:model-value="(val) => updateStep('variables', val)"
          />
        </div>
        <div v-else class="help-box info">
           <BasicIcon icon="mdi:information-outline" />
           <span>被引用的接口尚未定义可配置的入参 (变量)。</span>
        </div>
      </div>

      <!-- 2. Overrides (Merged Params/Headers/Body) -->
      <div v-if="activeTab === 'overrides'" class="overrides-section">
        <div class="override-group">
          <div class="field-label">
            <span>Query 参数覆盖</span>
          </div>
          <KVEditor
            :model-value="step.query"
            label-key="参数名"
            label-value="覆盖值"
            @update:model-value="(val) => updateStep('query', val)"
          />
        </div>

        <div class="override-group">
          <div class="field-label">
            <span>请求头覆盖</span>
          </div>
          <KVEditor
            :model-value="step.headers"
            label-key="Header"
            label-value="Value"
            @update:model-value="(val) => updateStep('headers', val)"
          />
        </div>

        <div class="override-group">
          <div class="field-label">
            <span>请求体覆盖</span>
          </div>
          <div class="body-options">
            <div
              v-for="mode in bodyModes"
              :key="mode"
              class="mode-item"
              :class="{ active: step.bodyMode === mode }"
              @click="updateStep('bodyMode', mode)"
            >
              <span class="radio"></span>
              {{ mode }}
            </div>
          </div>
          <div v-if="step.bodyMode === 'json' || step.bodyMode === 'raw'" class="code-body-wrap mini">
             <CCodeEditor
               :model-value="step.body"
               language="json"
               @update:model-value="(val) => updateStep('body', val)"
             />
          </div>
          <div v-else-if="step.bodyMode !== 'none'" class="kv-section">
            <KVEditor :model-value="step.bodyParams" @update:model-value="(val) => updateStep('bodyParams', val)" />
          </div>
        </div>
      </div>

      <!-- 6. Transform (Output Handle) -->
      <div v-if="activeTab === 'transform'" class="transform-section">
        <div class="field-label">
           <BasicIcon icon="mdi:tray-arrow-up" font-size="16px" />
           <span>出参处理 (Output Handle)</span>
           <span class="tip">在此解析并清洗返回数据，转换后的对象将存入缓存供后续步骤使用。</span>
        </div>
        <div class="script-editor-wrap">
          <TransformationEditor
            :model-value="step.transformation"
            @update:model-value="(val) => updateStep('transformation', val)"
          />
        </div>
        <div class="help-box">
           <span>提示：通过此流程预处理数据，可以极大简化后续链路的引用配置。</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import TransformationEditor from './components/transformation-editor.vue';
import KVEditor from './components/kv-editor.vue';

const props = defineProps<{
  step: any;
  isCascading: boolean;
}>();

const emit = defineEmits(['update:step']);

const activeTab = ref(props.isCascading ? 'condition' : 'inputs');

const tabs = computed(() => {
  const list = [];
  if (props.isCascading) {
    list.push({ label: 'Condition', id: 'condition' });
  }
  list.push(
    { label: '入参配置 (Inputs)', id: 'inputs' },
    { label: '参数覆盖 (Overrides)', id: 'overrides' },
    { label: '结果处理 (Output)', id: 'transform' }
  );
  return list;
});

const bodyModes = ['none', 'json', 'form-data', 'x-www-form-urlencoded'];

function updateStep(field: string, value: any) {
  emit('update:step', { ...props.step, [field]: value });
}

function onTransformChange(transformation: any) {
  updateStep('transformation', transformation);
}

function onConditionChange(condition: string) {
  updateStep('condition', condition);
}

function getCount(tabId: string) {
  if (tabId === 'inputs') return props.step.variables?.filter((v: any) => v.key && v.enabled !== false).length || 0;
  if (tabId === 'overrides') {
    const h = props.step.headers?.filter((h: any) => h.key && h.enabled !== false).length || 0;
    const q = props.step.query?.filter((q: any) => q.key && q.enabled !== false).length || 0;
    const b = props.step.bodyMode === 'json' ? (props.step.body ? 1 : 0) : (props.step.bodyParams?.filter((p: any) => p.key && p.enabled !== false).length || 0);
    return h + q + b;
  }
  return 0;
}

onMounted(() => {
  if (!props.step.query) updateStep('query', [{ key: '', value: '', enabled: true }]);
  if (!props.step.headers) updateStep('headers', [{ key: '', value: '', enabled: true }]);
  if (!props.step.bodyMode) updateStep('bodyMode', 'none');
  // Note: variables are usually passed from addReferenceStep or already exist in the step object
});
</script>

<style lang="scss" scoped>
.reference-step-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-color-main);

  .url-bar {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--theme-color-border);
    background: var(--db-color-main);

    .url-input-group {
      flex: 1;
      display: flex;
      align-items: center;
      background: var(--theme-color-gray-50);
      border: 1px solid var(--theme-color-border);
      border-radius: 6px;
      height: 38px;
      padding: 0 12px;
      gap: 12px;

      &.readonly { opacity: 0.8; }

      .method-badge {
        font-size: 10px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        &.get { color: var(--db-main-color-get); background: rgba(14, 165, 233, 0.1); }
        &.post { color: var(--db-main-color-post); background: rgba(52, 211, 153, 0.1); }
      }

      .url-divider { width: 1px; height: 16px; background: var(--theme-color-border); opacity: 0.5; }
      .url-text { flex: 1; font-size: 13px; color: var(--theme-color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: monospace; }
      .id-badge { font-size: 11px; color: var(--theme-color-text-secondary); opacity: 0.5; padding: 2px 8px; background: var(--theme-color-gray-100); border-radius: 4px; }
    }

    .ref-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--theme-color-blue-700);
      background: rgba(54, 98, 236, 0.1);
      padding: 4px 12px;
      border-radius: 20px;
    }
  }

  .config-tabs {
    display: flex;
    background: var(--theme-color-gray-50);
    border-bottom: 1px solid var(--theme-color-border);
    padding: 0 16px;
    gap: 8px;
    height: 40px;

    .tab-item {
      height: 100%;
      padding: 0 4px;
      font-size: 12px;
      font-weight: 500;
      color: var(--theme-color-text-secondary);
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;

      .count-badge {
        font-size: 10px;
        background: var(--theme-color-gray-200);
        color: var(--theme-color-text-secondary);
        padding: 0 5px;
        border-radius: 10px;
        min-width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      &:hover { color: var(--theme-color-text-bold); }
      &.active {
        color: var(--theme-color-blue-700);
        font-weight: 700;
        .count-badge {
          background: var(--theme-color-blue-700);
          color: #fff;
        }
        &:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--theme-color-blue-700);
        }
      }
    }
  }

  .tab-pane {
    padding: 24px;
    flex: 1;
    overflow-y: auto;

    .condition-section, .transform-section, .params-section, .kv-section, .body-section, .inputs-section, .overrides-section {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .override-group {
        padding: 16px;
        border: 1px solid var(--theme-color-border);
        border-radius: 8px;
        background: var(--theme-color-gray-50);

        .field-label {
          margin-bottom: 12px;
        }

        &:not(:last-child) {
          margin-bottom: 16px; // Replaced mt-20 with margin-bottom for spacing
        }
      }

      .field-label {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
        font-weight: 700;
        color: var(--theme-color-text-bold);
        .tip { font-size: 11px; font-weight: 400; color: var(--theme-color-text-secondary); opacity: 0.7; }
        code { background: var(--theme-color-gray-100); padding: 2px 4px; border-radius: 4px; color: var(--theme-color-blue-700); }
      }

      .script-editor-wrap, .code-body-wrap {
        border: 1px solid var(--theme-color-border);
        border-radius: 6px;
        overflow: hidden;
        &.mini { height: 180px; }
        :deep(.transformation-editor) { border: none; }
      }

      .help-box {
        background: var(--theme-color-gray-50);
        padding: 12px;
        border-radius: 6px;
        font-size: 11px;
        border: 1px dashed var(--theme-color-border);
        p { font-weight: 700; margin-bottom: 4px; color: var(--theme-color-text-bold); }
        ul { padding-left: 16px; margin: 0; color: var(--theme-color-text-secondary); }
      }

      .body-options {
        display: flex;
        gap: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--theme-color-border);
        .mode-item {
          font-size: 12px;
          color: var(--theme-color-text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          &.active {
            color: var(--theme-color-text-bold);
            font-weight: 700;
            .radio { border-color: var(--theme-color-blue-700); border-width: 4px; background: #fff; }
          }
          .radio { width: 14px; height: 14px; border: 1px solid var(--theme-color-border); border-radius: 50%; transition: all 0.2s; }
        }
      }

      .no-vars-tip {
        padding: 40px;
        background: var(--theme-color-gray-50);
        border: 1px dashed var(--theme-color-border);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: var(--theme-color-text-secondary);
        font-size: 13px;
        :deep(.basic-icon) { font-size: 32px; opacity: 0.5; }
      }
    }
  }
}
</style>


