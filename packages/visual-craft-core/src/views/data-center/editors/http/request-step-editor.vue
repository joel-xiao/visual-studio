<template>
  <div>
    <!-- Method + URL + Send -->
    <div class="url-bar">
      <div class="url-input-group">
        <CSelect
          :model-value="step.method"
          :options="methodOptions"
          icon="mdi:api"
          class="method-select"
          @update:model-value="(val) => updateStep('method', val)"
        />
        <div class="url-divider"></div>
        <CInput
          :model-value="step.url"
          icon="mdi:link-variant"
          placeholder="请输入接口地址, 可以使用 {{results.stepId.data.id}} 引用上游结果"
          class="url-input"
          @update:model-value="(val: string) => updateStep('url', val)"
        />
      </div>
      <CButton primary class="send-button" @click="onSend">
        测试执行
      </CButton>
    </div>

    <!-- Tabs for Params/Auth/Header/Body -->
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

    <div class="tab-pane">
      <!-- 0. Variables (Cascading only) -->
      <div v-if="activeTab === 'variables' && isCascading" class="variables-section">
         <div class="field-label">
           <span>入参声明</span>
           <span class="tip">定义当前步骤所需的输入变量。在该接口被其他流程引用时，这些变量将变为可对接的“插槽”。</span>
         </div>
         <KVEditor
           :model-value="step.variables"
           label-key="变量名"
           label-value="测试默认值"
           label-desc="参数说明"
           @update:model-value="(val) => updateStep('variables', val)"
         />
         <div class="help-box">
            <p>使用指引:</p>
            <ul>
               <li><b>配置解耦</b>: 在 URL 或参数中使用 <code>&lbrace;&lbrace;variableName&rbrace;&rbrace;</code> 引用此处定义的变量。</li>
               <li><b>能力编排</b>: 声明的变量在“引用步骤”模式下会显式呈现在入参映射列表。</li>
            </ul>
         </div>
      </div>

      <!-- 1. Condition (Cascading only) -->
      <div v-if="activeTab === 'condition' && isCascading" class="condition-section">
        <div class="field-label">
          <span>执行条件判断</span>
           <span class="tip">使用 JavaScript 表达式控制该步骤是否执行 (返回 true 或 false)</span>
        </div>
        <div class="script-editor-wrap">
          <CCodeEditor
            :model-value="step.condition"
            language="javascript"
            placeholder="// 示例: login.token != null"
            @update:model-value="(val) => updateStep('condition', val)"
          />
        </div>
        <div class="help-box" v-pre>
          <p>可用对象:</p>
          <ul>
            <li><code>stepId</code>: 直接通过步骤 ID 访问其返回数据 (如 login.token)</li>
            <li><code>results.stepId.status</code>: 访问指定步骤的原始响应状态码</li>
          </ul>
        </div>
      </div>

      <!-- 2. Query Params -->
      <div v-if="activeTab === 'params'" class="params-section">
         <KVEditor
           :model-value="step.query"
           label-key="参数名"
           label-value="参数值"
           @update:model-value="(val) => updateStep('query', val)"
         />
      </div>

      <!-- 3. Authentication -->
      <div v-if="activeTab === 'auth'" class="auth-section">
        <AuthEditor
          :model-value="step.auth"
          :global-auth="globalConfig?.globalAuth"
          @update:model-value="(val) => updateStep('auth', val)"
        />
      </div>

      <!-- 4. Headers -->
      <div v-if="activeTab === 'headers'" class="kv-section">
        <div v-if="globalConfig?.globalHeaders?.length > 0" class="global-headers-preview">
           <div class="preview-title">已继承全局 Headers:</div>
           <div class="preview-tags">
              <span v-for="h in globalConfig.globalHeaders.filter((i:any) => i.enabled)" :key="h.key" class="header-tag">
                {{ h.key }}: {{ h.value }}
              </span>
           </div>
        </div>
        <KVEditor
          :model-value="step.headers"
          label-key="局部 Header"
          label-value="Value (将覆盖全局)"
          @update:model-value="(val) => updateStep('headers', val)"
        />
      </div>

      <!-- 5. Body -->
      <div v-if="activeTab === 'body'" class="body-section">
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
        <div v-if="step.bodyMode === 'json' || step.bodyMode === 'raw'" class="code-body-wrap">
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
           <BasicIcon icon="mdi:lightbulb-outline" />
           <span>提示：通过此流程预处理数据，可以极大简化后续链路的引用配置。</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import TransformationEditor from './components/transformation-editor.vue';
import KVEditor from './components/kv-editor.vue';
import AuthEditor from './components/auth-editor.vue';

const props = defineProps<{
  step: any;
  isCascading: boolean;
  globalConfig?: any;
}>();

const emit = defineEmits<{
  (e: 'update:step', step: any): void;
  (e: 'send'): void;
}>();

const activeTab = ref(props.isCascading ? 'params' : 'params');

const tabs = computed(() => {
  const base = [
    { label: 'Params', id: 'params' },
    { label: 'Auth', id: 'auth' },
    { label: 'Headers', id: 'headers' },
    { label: 'Body', id: 'body' },
    { label: '出参处理 (Output)', id: 'transform' }
  ];
  if (props.isCascading) {
    base.unshift(
      { label: '执行条件 (Condition)', id: 'condition' },
      { label: '入参定义 (Variables)', id: 'variables' }
    );
  }
  return base;
});

const bodyModes = ['none', 'form-data', 'x-www-form-urlencoded', 'json', 'raw'];
const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' }
];

function updateStep(field: string, value: any) {
  emit('update:step', { ...props.step, [field]: value });
}

function getCount(tabId: string) {
  if (tabId === 'variables') return props.step.variables?.filter((v: any) => v.key && v.enabled !== false).length || 0;
  if (tabId === 'headers') return props.step.headers?.filter((h: any) => h.key && h.enabled !== false).length || 0;
  if (tabId === 'params') return props.step.query?.filter((q: any) => q.key && q.enabled !== false).length || 0;
  if (tabId === 'body' && (props.step.bodyMode === 'json' || props.step.bodyMode === 'raw')) return props.step.body ? 1 : 0;
  if (tabId === 'body' && props.step.bodyMode !== 'none') return props.step.bodyParams?.filter((p: any) => p.key && p.enabled !== false).length || 0;
  if (tabId === 'transform') return (props.step.transformation?.script && props.step.transformation.script !== '// 输入 JavaScript 代码对结果进行处理\nreturn data;') ? 1 : 0;
  return 0;
}

function onSend() {
  emit('send');
}

onMounted(() => {
  // Ensure step has necessary objects
  if (!props.step.auth) updateStep('auth', { type: 'none', config: {} });
  if (!props.step.query) updateStep('query', [{ key: '', value: '', enabled: true }]);
  if (!props.step.headers) updateStep('headers', [{ key: '', value: '', enabled: true }]);
  if (!props.step.variables) updateStep('variables', [{ key: '', value: '', description: '', enabled: true }]);
  if (!props.step.transformation) {
    updateStep('transformation', {
      type: 'raw',
      script: '// 输入 JavaScript 代码对结果进行处理\nreturn data;'
    });
  }
});
</script>

<style lang="scss" scoped>
/* NOTE: Styles are copied from http-editor.vue and scoped here */
.url-bar {
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid var(--theme-color-border);
  background: var(--db-color-main);

  .url-input-group {
    flex: 1;
    min-width: 300px;
    display: flex;
    border-radius: 6px;
    overflow: hidden;
    column-gap: 4px;

    &:focus-within {
      border-color: var(--theme-color-blue-700);
    }

    .method-select {
      width: 110px !important;
      flex: none;
      :deep(.basic-box) {
        border: none;
        height: 36px;
        background: transparent;
        border-radius: 0;
        font-weight: 800;
        color: var(--theme-color-blue-700);
        font-size: 13px;
        width: 100%;
      }
    }

    .url-divider {
      width: 1px;
      height: 18px;
      background: var(--theme-color-border-bold);
      align-self: center;
      opacity: 0.3;
    }

    .url-input {
      flex: 1;
      min-width: 0;
      :deep(.basic-box) { border: none; height: 36px; border-radius: 0; background: transparent; font-family: 'Fira Code', monospace; font-size: 13px; }
    }
  }

  .send-button {
    padding: 0 24px;
    height: 38px;
    flex: none;
    font-weight: 700;
    background: var(--theme-color-blue-700);
    color: #fff;
    border-radius: 6px;
    letter-spacing: 0.5px;
    white-space: nowrap;
    &:hover { opacity: 0.9; transform: translateY(-1px); }
    &:active { transform: translateY(0); }
  }
}

.config-tabs {
  display: flex;
  background: var(--theme-color-gray-50);
  border-bottom: 1px solid var(--theme-color-border);
  padding: 0 16px;
  flex: none;
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
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;

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
      transform: translateY(-0.5px);
    }

    &:hover {
      color: var(--theme-color-text-bold);
    }

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
        bottom: 0px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--theme-color-blue-700);
        border-radius: 2px 2px 0 0;
      }
    }
  }
}

.tab-pane {
  padding: 16px;
  overflow-y: auto;
  background: var(--db-color-main);
  flex: 1;

  .condition-section,
  .transform-section,
  .variables-section,
  .auth-section,
  .kv-section {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .field-label {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      .tip { font-size: 11px; font-weight: 400; color: var(--theme-color-text-secondary); opacity: 0.7; }
    }

    .help-box {
      background: var(--theme-color-tran-4);
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 11px;
      line-height: 1.8;
      color: var(--theme-color-text-secondary);
      border: 1px dashed var(--theme-color-border);
      p { font-weight: 700; margin-bottom: 6px; color: var(--theme-color-text-bold); }
      ul { padding-left: 20px; margin: 0; }
      li { margin-bottom: 4px; }
      code { background: var(--theme-color-tran-10); padding: 1px 4px; border-radius: 4px; }
    }

    .script-editor-wrap {
      flex: 1;
      height: 260px;
      border: 1px solid var(--theme-color-border);
      border-radius: 6px;
      overflow: hidden;
    }
  }

  .body-options {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;
    padding: 0 4px 12px;
    border-bottom: 1px solid var(--theme-color-border);
    .mode-item {
       font-size: 12px;
       color: var(--theme-color-text-secondary);
       display: flex;
       align-items: center;
       gap: 6px;
       cursor: pointer;
       transition: color 0.2s;
       &:hover { color: var(--theme-color-text-bold); }
       &.active {
         color: var(--theme-color-text-bold);
         font-weight: 700;
         .radio { border-color: var(--theme-color-blue-700); border-width: 4px; background: #fff; }
       }
       .radio { width: 14px; height: 14px; border: 1px solid var(--theme-color-border); border-radius: 50%; background: transparent; transition: all 0.2s; }
    }
  }

  .code-body-wrap {
    height: 300px;
    border: 1px solid var(--theme-color-border);
    border-radius: 6px;
    overflow: hidden;
  }

  .global-headers-preview {
    background: var(--theme-color-gray-50);
    padding: 12px;
    border-radius: 6px;
    border: 1px dashed var(--theme-color-border);
    margin-bottom: 20px;
    .preview-title { font-size: 11px; color: var(--theme-color-text-secondary); margin-bottom: 8px; font-weight: 700; }
    .preview-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      .header-tag {
        font-size: 11px;
        background: var(--theme-color-gray-200);
        padding: 2px 8px;
        border-radius: 12px;
        color: var(--theme-color-text-secondary);
        border: 1px solid var(--theme-color-border);
      }
    }
  }
}
</style>
