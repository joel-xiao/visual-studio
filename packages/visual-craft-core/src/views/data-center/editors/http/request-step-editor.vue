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
          @update:model-value="(val) => updateStep('auth', val)" 
        />
      </div>

      <!-- 4. Headers -->
      <div v-if="activeTab === 'headers'" class="kv-section">
        <KVEditor 
          :model-value="step.headers" 
          label-key="Header Name" 
          label-value="Value" 
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

      <!-- 6. Transform (New) -->
      <div v-if="activeTab === 'transform'" class="transform-section">
        <div class="field-label">
          <span>结果脱敏与转换</span>
           <span class="tip">使用 JavaScript 处理该步骤的原始返回内容 (res.data)</span>
        </div>
        <div class="script-editor-wrap">
           <CCodeEditor
             :model-value="step.transformResponse"
             language="javascript"
             placeholder="// 示例: return { token: data.access_token }"
             @update:model-value="(val) => updateStep('transformResponse', val)"
           />
        </div>
        <div class="help-box">
          <p>可用对象:</p>
          <ul>
            <li><code>res</code>: 完整响应对象 (含 status)</li>
            <li><code>data</code>: 响应体内容 (简写)</li>
            <li><code>results</code>: 上游步骤的所有结果</li>
          </ul>
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
import KVEditor from '../../components/kv-editor.vue';
import AuthEditor from '../../components/auth-editor.vue';

const props = defineProps<{
  step: any;
  isCascading: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:step', step: any): void;
  (e: 'send'): void;
}>();

const activeTab = ref('params');

const tabs = computed(() => {
  const base = [
    { label: 'Params', id: 'params' },
    { label: 'Auth', id: 'auth' },
    { label: 'Headers', id: 'headers' },
    { label: 'Body', id: 'body' },
    { label: 'Transform', id: 'transform' }
  ];
  if (props.isCascading) {
    base.unshift({ label: 'Condition', id: 'condition' });
  }
  return base;
});

const bodyModes = ['none', 'form-data', 'x-www-form-urlencoded', 'json', 'raw'];

function updateStep(field: string, value: any) {
  emit('update:step', { ...props.step, [field]: value });
}

function getCount(tabId: string) {
  if (tabId === 'headers') return props.step.headers?.filter(h => h.key && h.enabled !== false).length || 0;
  if (tabId === 'params') return props.step.query?.filter(q => q.key && q.enabled !== false).length || 0;
  if (tabId === 'body' && (props.step.bodyMode === 'json' || props.step.bodyMode === 'raw')) return props.step.body ? 1 : 0;
  if (tabId === 'body' && props.step.bodyMode !== 'none') return props.step.bodyParams?.filter(p => p.key && p.enabled !== false).length || 0;
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
  gap: 4px;

  .tab-item {
    padding: 10px 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--theme-color-text-secondary);
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;

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

    &:hover { 
      color: var(--theme-color-text-bold); 
      background: var(--theme-color-gray-100);
    }

    &.active {
      color: var(--theme-color-blue-700);
      font-weight: 700;
      .count-badge {
        background: rgba(54, 98, 236, 0.1);
        color: var(--theme-color-blue-700);
      }
      &:after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--theme-color-blue-700);
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
  .transform-section {
    display: flex;
    flex-direction: column;
    height: 100%;

    .field-label {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      .tip { font-size: 11px; font-weight: 400; color: var(--theme-color-text-secondary); opacity: 0.7; }
    }

    .script-editor-wrap {
      flex: 1;
      height: 260px;
      margin-bottom: 16px;
      border: 1px solid var(--theme-color-border);
      border-radius: 6px;
      overflow: hidden;
    }

    .help-box {
      background: var(--theme-color-gray-50);
      padding: 12px;
      border-radius: 6px;
      font-size: 11px;
      line-height: 1.6;
      color: var(--theme-color-text-secondary);
      border: 1px dashed var(--theme-color-border);
      p { font-weight: 700; margin-bottom: 4px; color: var(--theme-color-text-bold); }
      ul { padding-left: 16px; margin: 0; }
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
}
</style>
