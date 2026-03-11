<template>
  <div class="query-step-editor">
    <!-- Tab Navigation -->
    <div class="config-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <BasicIcon :icon="tab.icon" font-size="14px" />
        {{ tab.label }}
      </div>
    </div>

    <div class="tab-pane">
      <!-- SQL Editor Tab -->
      <div v-if="activeTab === 'sql'" class="sql-editor-section">
        <div class="sql-toolbar">
          <div class="toolbar-left">
            <div class="tool-btn" :class="{ active: showTableHint }" @click="showTableHint = !showTableHint">
              <BasicIcon icon="mdi:lightbulb-on-outline" font-size="16px" />
              <span>智能提示</span>
            </div>
            <div class="tool-btn" @click="insertTemplate">
              <BasicIcon icon="mdi:file-code-outline" font-size="16px" />
              <span>快速模板</span>
            </div>
          </div>
          <div class="toolbar-right">
            <CButton primary size="small" icon="mdi:play" class="exec-btn" @click="$emit('send')">
              执行查询 (Ctrl+Enter)
            </CButton>
          </div>
        </div>

        <div v-if="showTableHint" class="table-hint-box">
          <div class="hint-header">
            <div class="title">
              <BasicIcon icon="mdi:help-circle-outline" font-size="14px" />
              快速引用指南
            </div>
            <BasicIcon icon="mdi:close" class="close" @click="showTableHint = false" />
          </div>
          <div class="hint-content">
            <div class="hint-grid">
              <div class="hint-card" v-pre>
                <div class="card-label">引用上游结果</div>
                <code>SELECT * FROM {{results.query1}}</code>
              </div>
              <div class="hint-card" v-pre>
                <div class="card-label">引用全局变量</div>
                <code>WHERE region = '{{vars.region}}'</code>
              </div>
            </div>
          </div>
        </div>

        <div class="code-editor-container">
          <CCodeEditor
            :model-value="step.sql"
            language="sql"
            class="sql-code-editor"
            @update:model-value="(val: string) => updateStep('sql', val)"
          />
        </div>
      </div>

      <!-- Condition Tab -->
      <div v-if="activeTab === 'condition'" class="condition-section">
        <div class="field-label">
          <BasicIcon icon="mdi:filter-check-outline" font-size="16px" class="sec-icon" />
          <span>执行条件</span>
          <span class="tip">控制该 SQL 步骤是否执行</span>
        </div>
        <div class="script-editor-wrap">
          <CCodeEditor
            :model-value="step.condition"
            language="javascript"
            placeholder="// 示例: vars.isSyncEnabled === true"
            @update:model-value="(val: string) => updateStep('condition', val)"
          />
        </div>
        <div class="info-banner">
          <BasicIcon icon="mdi:information-outline" font-size="16px" />
          <span>支持 JS 表达式。可以使用 <code>vars.xxx</code> 访问全局变量或 <code>results.xxx</code> 访问上游结果。</span>
        </div>
      </div>

      <!-- Variables Tab -->
      <div v-if="activeTab === 'variables'" class="variables-section">
        <div class="field-label">
          <BasicIcon icon="mdi:variable" font-size="16px" class="sec-icon amber" />
          <span>查询参数配置</span>
          <span class="tip">定义的参数可在 SQL 中通过 <code v-pre>{{key}}</code> 引用</span>
        </div>
        <div class="kv-container">
          <KVEditor
            :model-value="step.variables || []"
            label-key="参数名"
            label-value="测试默认值"
            label-desc="说明"
            @update:model-value="(val: any) => updateStep('variables', val)"
          />
        </div>
      </div>

      <!-- Transform Tab -->
      <div v-if="activeTab === 'transform'" class="transform-section">
        <div class="field-label">
          <BasicIcon icon="mdi:auto-fix" font-size="16px" class="sec-icon purple" />
          <span>出参格式化</span>
          <span class="tip">对查询返回的数据进行二次加工</span>
        </div>
        <div class="script-editor-wrap">
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
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import KVEditor from './kv-editor.vue';
import TransformationEditor from './transformation-editor.vue';

const props = defineProps<{
  step: any;
  isCascading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:step', step: any): void;
  (e: 'send'): void;
}>();

const activeTab = ref('sql');
const showTableHint = ref(false);

const tabs = [
  { label: 'SQL 编辑器', id: 'sql', icon: 'mdi:code-braces' },
  { label: '执行控制', id: 'condition', icon: 'mdi:play-pause' },
  { label: '入参定义', id: 'variables', icon: 'mdi:toy-brick-plus-outline' },
  { label: '出参转换', id: 'transform', icon: 'mdi:swap-horizontal-bold' }
];

function updateStep(field: string, value: any) {
  emit('update:step', { ...props.step, [field]: value });
}

function insertTemplate() {
  const templates = [
    'SELECT * FROM table_name WHERE id = {{id}} LIMIT 100;',
    'SELECT a.*, b.* FROM table_a a JOIN table_b b ON a.id = b.id;',
    'INSERT INTO table (col1, col2) VALUES (\'{{val1}}\', {{val2}});',
    'UPDATE table SET status = \'active\' WHERE id = {{id}};'
  ];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const current = props.step.sql || '';
  updateStep('sql', current ? current + '\n\n' + template : template);
}

onMounted(() => {
  if (!props.step.variables) updateStep('variables', [{ key: '', value: '', description: '', enabled: true }]);
  if (!props.step.transformation) {
    updateStep('transformation', { type: 'raw', script: 'return data;' });
  }
});
</script>

<style lang="scss" scoped>
.query-step-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-color-main);
}

.config-tabs {
  display: flex;
  height: 42px;
  background: var(--db-main-color-left-bar-bg);
  border-bottom: 1px solid var(--db-main-border-black);
  padding: 0 16px;
  gap: 24px;
  flex: none;

  .tab-item {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 100%;
    font-size: 13px;
    font-weight: 500;
    color: var(--theme-color-text-secondary);
    cursor: pointer;
    position: relative;
    transition: all 0.2s;

    &:hover { color: var(--theme-color-text-bold); }
    
    &.active {
      color: var(--sql-color-primary);
      font-weight: 700;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: -4px;
        right: -4px;
        height: 2px;
        background: var(--sql-color-primary);
      }
    }
  }
}

.tab-pane {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sql-editor-section {
  display: flex;
  flex-direction: column;
  height: 100%;

  .sql-toolbar {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--db-main-color-left-bar-bg);
    border-bottom: 1px solid var(--db-main-border-black);

    .toolbar-left {
      display: flex;
      gap: 16px;

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
        &.active { color: var(--sql-color-primary); background: var(--sql-color-primary-light); }
      }
    }

    .exec-btn {
      background: var(--sql-color-primary) !important;
      border-color: var(--sql-color-primary) !important;
      color: #000;
      font-weight: 800;
      border-radius: 6px;
    }
  }

  .table-hint-box {
    margin: 12px;
    background: var(--db-main-color-card-bg);
    border: 1px solid var(--theme-color-border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

    .hint-header {
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid var(--theme-color-border);
      .title { font-size: 12px; font-weight: 700; color: var(--sql-color-primary); display: flex; align-items: center; gap: 6px; }
      .close { cursor: pointer; opacity: 0.4; &:hover { opacity: 1; } }
    }

    .hint-content {
      padding: 16px;
      .hint-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .hint-card {
        .card-label { font-size: 11px; color: var(--theme-color-text-secondary); margin-bottom: 6px; }
        code {
          display: block;
          padding: 8px 12px;
          background: #000;
          color: var(--sql-color-primary);
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.05);
        }
      }
    }
  }

  .code-editor-container {
    flex: 1;
  }
}

.condition-section,
.variables-section,
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
    .sec-icon { color: var(--sql-color-primary); &.amber { color: var(--sql-color-agg); } &.purple { color: var(--sql-color-join); } }
    .tip { font-size: 11px; font-weight: 400; color: var(--theme-color-text-secondary); opacity: 0.6; margin-left: auto; }
  }

  .script-editor-wrap {
    height: 320px;
    border: 1px solid var(--theme-color-border);
    border-radius: 8px;
    overflow: hidden;
  }

  .info-banner {
    padding: 12px 16px;
    background: var(--sql-color-primary-light);
    border: 1px solid rgba(52, 211, 153, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: var(--theme-color-text-secondary);
    code { background: rgba(0,0,0,0.2); padding: 1px 4px; border-radius: 3px; }
  }
}
</style>
