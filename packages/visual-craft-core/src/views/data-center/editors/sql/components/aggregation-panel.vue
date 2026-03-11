<template>
  <div class="aggregation-builder">
    <!-- Tab Navigation -->
    <div class="config-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <BasicIcon :icon="tab.icon" font-size="12px" />
        {{ tab.label }}
      </div>
    </div>

    <div class="tab-pane">
      <!-- Visual Aggregation Builder -->
      <div v-if="activeTab === 'visual'" class="visual-builder">
        <!-- Data Source -->
        <div class="builder-section">
          <div class="section-label"><BasicIcon icon="mdi:database-import-outline" font-size="14px" class="sec-icon" /> 数据来源</div>
          <div class="source-row">
            <CSelect 
              :model-value="aggConfig.sourceType" 
              :options="sourceTypeOptions" 
              icon="mdi:table-large"
              size="small"
              style="width: 110px"
              @update:model-value="(v: string) => updateConfig('sourceType', v)"
            />
            <CInput 
              v-if="aggConfig.sourceType === 'table'"
              :model-value="aggConfig.sourceTable" 
              icon="mdi:table-edit"
              placeholder="表名 (如: orders)" 
              size="small"
              class="source-input"
              @update:model-value="(v: string) => updateConfig('sourceTable', v)"
            />
            <CSelect 
              v-else
              :model-value="aggConfig.sourceTable"
              :options="stepRefOptions"
              placeholder="选择上游查询"
              size="small"
              class="source-input"
              icon="mdi:link-variant"
              @update:model-value="(v: string) => updateConfig('sourceTable', v)"
            />
          </div>
        </div>

        <!-- Aggregate Functions -->
        <div class="builder-section">
          <div class="section-label"><BasicIcon icon="mdi:function-variant" font-size="14px" class="sec-icon amber" /> 聚合指标 (Aggregate Functions)</div>
          <div class="functions-list">
            <div v-for="(fn, index) in aggConfig.functions" :key="index" class="function-row">
              <CSelect 
                :model-value="fn.func" 
                :options="aggregateFuncOptions" 
                size="small"
                class="func-select"
                @update:model-value="(v: string) => updateFunction(Number(index), 'func', v)"
              />

              <CInput 
                :model-value="fn.field" 
                placeholder="字段" 
                size="small"
                class="field-input"
                @update:model-value="(v: string) => updateFunction(Number(index), 'field', v)"
              >
              </CInput>

              <CInput 
                :model-value="fn.alias" 
                placeholder="别名" 
                size="small"
                class="alias-input"
                icon="mdi:tag-outline"
                @update:model-value="(v: string) => updateFunction(Number(index), 'alias', v)"
              >
                <template #prefix>
                  <span class="kw-as">AS</span>
                </template>
              </CInput>

              <BasicIcon 
                v-if="aggConfig.functions.length > 1" 
                icon="mdi:close-circle-outline" 
                class="remove-btn" 
                @click="removeFunction(Number(index))" 
              />
            </div>
            <div class="add-function" @click="addFunction">
              <BasicIcon icon="mdi:plus" />
              <span>添加聚合指标</span>
            </div>
          </div>
        </div>

        <!-- GROUP BY -->
        <div class="builder-section">
          <div class="section-label"><BasicIcon icon="mdi:group" font-size="14px" class="sec-icon amber" /> 分组字段 (GROUP BY)</div>
          <div class="group-by-section">
            <div class="tags-container">
              <div v-for="(field, index) in aggConfig.groupByFields" :key="index" class="group-tag">
                <span>{{ field }}</span>
                <BasicIcon icon="mdi:close" font-size="10px" class="tag-close" @click="removeGroupByField(Number(index))" />
              </div>
              <CInput 
                v-model="newGroupByField" 
                placeholder="输入字段名, 回车添加" 
                size="small"
                class="group-input"
                icon="mdi:format-columns"
                @keydown.enter="addGroupByField"
              />
            </div>
          </div>
        </div>

        <!-- HAVING -->
        <div class="builder-section">
          <div class="section-label"><BasicIcon icon="mdi:filter-check-outline" font-size="14px" class="sec-icon" /> 聚合过滤 (HAVING)</div>
          <CInput 
            :model-value="aggConfig.havingClause" 
            icon="mdi:filter-variant"
            placeholder="COUNT(*) > 10  或  SUM(amount) > 1000" 
            size="small"
            @update:model-value="(v: string) => updateConfig('havingClause', v)"
          />
        </div>

        <div class="builder-section">
          <div class="section-label"><BasicIcon icon="mdi:sort-variant" font-size="14px" class="sec-icon" /> 附加条件</div>
          <div class="clause-grid">
            <div class="clause-field">
              <div class="clause-label">ORDER BY</div>
              <CInput 
                :model-value="aggConfig.orderBy" 
                icon="mdi:sort-ascending"
                placeholder="total DESC" 
                size="small"
                @update:model-value="(v: string) => updateConfig('orderBy', v)"
              />
            </div>
            <div class="clause-field short">
              <div class="clause-label">LIMIT</div>
              <CInput 
                :model-value="String(aggConfig.limit || 100)" 
                icon="mdi:numeric"
                placeholder="100" 
                size="small"
                @update:model-value="(v: string) => updateConfig('limit', parseInt(v) || 100)"
              />
            </div>
          </div>
        </div>

        <!-- Generated SQL -->
        <div class="builder-section">
          <div class="section-label">
            <span>生成的 SQL 预览</span>
            <CButton quaternary size="small" icon="mdi:content-copy" @click="copySql">复制</CButton>
          </div>
          <div class="sql-preview">
            <code>{{ generatedSql }}</code>
          </div>
        </div>

        <!-- Execute -->
        <div class="action-bar">
          <CButton primary size="small" icon="mdi:play" class="exec-btn" @click="$emit('send')">
            运行聚合查询
          </CButton>
        </div>
      </div>

      <!-- Condition Tab -->
      <div v-if="activeTab === 'condition'" class="condition-section">
        <div class="field-label">
          <span>执行条件判断</span>
          <span class="tip">控制该聚合查询是否执行</span>
        </div>
        <div class="script-editor-wrap">
          <CCodeEditor
            :model-value="step.condition"
            language="javascript"
            @update:model-value="(val: string) => $emit('update:step', { ...step, condition: val })"
          />
        </div>
      </div>

      <!-- Transform Tab -->
      <div v-if="activeTab === 'transform'" class="transform-section">
        <div class="field-label">
          <BasicIcon icon="mdi:tray-arrow-up" font-size="16px" />
          <span>出参处理</span>
        </div>
        <div class="script-editor-wrap">
          <TransformationEditor
            :model-value="step.transformation || { script: 'return data;', type: 'raw' }"
            @update:model-value="(val: any) => $emit('update:step', { ...step, transformation: val })"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import TransformationEditor from './transformation-editor.vue';
import { copyToClipboard } from '@/assets/utils/index';

const props = defineProps<{
  step: any;
  allSteps?: any[];
}>();

const emit = defineEmits<{
  (e: 'update:step', step: any): void;
  (e: 'send'): void;
}>();

const activeTab = ref('visual');
const newGroupByField = ref('');

const tabs = [
  { label: '可视化构建', id: 'visual', icon: 'mdi:chart-box-outline' },
  { label: '执行条件', id: 'condition', icon: 'mdi:filter-outline' },
  { label: '出参处理', id: 'transform', icon: 'mdi:tray-arrow-up' }
];

const DEFAULT_AGG_CONFIG = {
  sourceTable: '',
  sourceType: 'table',
  groupByFields: [] as string[],
  functions: [{ func: 'COUNT', field: '*', alias: 'total' }],
  havingClause: '',
  orderBy: '',
  limit: 100
};

// Use a stable reactive copy to avoid infinite loops
const aggConfig = reactive(JSON.parse(JSON.stringify(props.step.aggregationConfig || DEFAULT_AGG_CONFIG)));

// Only sync from props when aggregationConfig reference changes
watch(() => props.step.aggregationConfig, (newCfg) => {
  if (newCfg) Object.assign(aggConfig, JSON.parse(JSON.stringify(newCfg)));
}, { deep: true });

const sourceTypeOptions = [
  { label: '数据表', value: 'table' },
  { label: '上游查询', value: 'ref' }
];

const aggregateFuncOptions = [
  { label: 'COUNT', value: 'COUNT' },
  { label: 'SUM', value: 'SUM' },
  { label: 'AVG', value: 'AVG' },
  { label: 'MAX', value: 'MAX' },
  { label: 'MIN', value: 'MIN' },
  { label: 'GROUP_CONCAT', value: 'GROUP_CONCAT' },
  { label: 'STDDEV', value: 'STDDEV' },
  { label: 'VARIANCE', value: 'VARIANCE' }
];

const stepRefOptions = computed(() => {
  if (!props.allSteps) return [];
  return props.allSteps
    .filter((s: any) => s.id !== props.step.id)
    .map((s: any) => ({ label: `${s.name} (${s.id})`, value: `{{results.${s.id}}}` }));
});

const generatedSql = computed(() => {
  const cfg = aggConfig;
  const source = cfg.sourceTable || 'table_name';

  // Build SELECT
  const selectParts: string[] = [];
  
  // Group by fields first
  if (cfg.groupByFields?.length > 0) {
    selectParts.push(...cfg.groupByFields);
  }

  // Aggregate functions
  if (cfg.functions?.length > 0) {
    cfg.functions.forEach((fn: any) => {
      const funcStr = `${fn.func}(${fn.field || '*'})`;
      selectParts.push(fn.alias ? `${funcStr} AS ${fn.alias}` : funcStr);
    });
  }

  if (selectParts.length === 0) selectParts.push('*');

  let sql = `SELECT ${selectParts.join(',\n       ')}\nFROM ${source}`;

  if (cfg.groupByFields?.length > 0) {
    sql += `\nGROUP BY ${cfg.groupByFields.join(', ')}`;
  }

  if (cfg.havingClause) {
    sql += `\nHAVING ${cfg.havingClause}`;
  }

  if (cfg.orderBy) {
    sql += `\nORDER BY ${cfg.orderBy}`;
  }

  if (cfg.limit) {
    sql += `\nLIMIT ${cfg.limit}`;
  }

  return sql;
});

function syncToParent() {
  emit('update:step', { 
    ...props.step, 
    aggregationConfig: JSON.parse(JSON.stringify(aggConfig)),
    sql: generatedSql.value 
  });
}

function updateConfig(key: string, value: any) {
  (aggConfig as any)[key] = value;
  syncToParent();
}

function updateFunction(index: number, key: string, value: any) {
  aggConfig.functions[index] = { ...aggConfig.functions[index], [key]: value };
  syncToParent();
}

function addFunction() {
  aggConfig.functions.push({ func: 'SUM', field: '', alias: '' });
  syncToParent();
}

function removeFunction(index: number) {
  aggConfig.functions.splice(index, 1);
  syncToParent();
}

function addGroupByField() {
  if (!newGroupByField.value.trim()) return;
  aggConfig.groupByFields.push(newGroupByField.value.trim());
  syncToParent();
  newGroupByField.value = '';
}

function removeGroupByField(index: number) {
  aggConfig.groupByFields.splice(index, 1);
  syncToParent();
}

async function copySql() {
  await copyToClipboard(generatedSql.value);
}
</script>

<style lang="scss" scoped>
.aggregation-builder {
  display: flex;
  flex-direction: column;
  height: 100%;
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

    &:hover { color: var(--theme-color-text-bold); }
    &.active {
      color: var(--sql-color-primary);
      font-weight: 700;
      &::after {
        content: '';
        position: absolute;
        bottom: 0px;
        left: -4px;
        right: -4px;
        height: 2px;
        background: var(--sql-color-primary);
        border-radius: 2px 2px 0 0;
      }
    }
  }
}

.tab-pane {
  flex: 1;
  overflow-y: auto;
  background: var(--db-color-main);
}

.visual-builder {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.builder-section {
  .section-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--theme-color-text-bold);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.sec-icon {
  color: var(--sql-color-primary);
  &.amber { color: var(--sql-color-accent-agg); }
}

.source-row {
  display: flex;
  gap: 8px;
  .source-input { flex: 1; }
}

.functions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .function-row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    gap: 8px;
    width: auto;
    max-width: 100%;
    margin-bottom: 4px;

    .func-select { width: 140px !important; flex-shrink: 0; }
    .field-input { flex: 1; min-width: 0; }
    .alias-input { width: 120px !important; flex-shrink: 0; }
    
    .remove-btn {
      flex-shrink: 0;
      width: 20px;
      color: var(--theme-color-text-secondary);
      cursor: pointer;
      opacity: 0.4;
      &:hover { opacity: 1; color: #f87171; }
    }

    .kw-symbol {
      font-size: 16px;
      font-weight: bold;
      color: var(--sql-color-primary);
      margin-right: 4px;
      opacity: 0.8;
    }

    .kw-symbol-suffix {
      font-size: 16px;
      font-weight: bold;
      color: var(--sql-color-primary);
      margin: 0 4px;
      opacity: 0.8;
      flex-shrink: 0;
    }

    .kw-as {
      font-size: 11px;
      font-weight: 800;
      color: var(--sql-color-primary);
      margin-right: 6px;
      opacity: 0.9;
    }
  }
}

.add-function {
  padding: 8px;
  border: 1px dashed var(--theme-color-border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  color: var(--theme-color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: var(--sql-color-primary); color: var(--sql-color-primary); }
}

.group-by-section {
  .tags-container {
    .group-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      background: var(--sql-color-primary-light);
      color: var(--sql-color-primary);
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;

      .tag-close {
        cursor: pointer;
        opacity: 0.6;
        &:hover { opacity: 1; }
      }
    }

    .group-input {
      flex: 1;
      min-width: 150px;
    }
  }
}

.clause-grid {
  display: grid;
  grid-template-columns: 1fr 100px;
  gap: 16px;

  .clause-field {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .clause-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--theme-color-text-secondary);
      opacity: 0.7;
      text-transform: uppercase;
    }
  }
}

.sql-preview {
  background: var(--db-main-color-left-bar-bg);
  padding: 16px;
  border: 1px solid var(--db-main-border-black);
  border-radius: 8px;
  overflow-x: auto;
  
  code {
    color: var(--sql-color-primary);
    font-size: 12px;
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    white-space: pre;
    line-height: 1.6;
  }
}

.action-bar {
  margin-top: 8px;
  .exec-btn {
    width: 100%;
    height: 48px;
    background: var(--sql-color-primary) !important;
    border-color: var(--sql-color-primary) !important;
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 1px;
    border-radius: 12px;
    box-shadow: 0 4px 12px var(--sql-color-primary-light);
    &:hover { opacity: 0.9; transform: translateY(-1px); }
  }
}

.condition-section,
.transform-section {
  padding: 16px;
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

  .script-editor-wrap {
    flex: 1;
    min-height: 260px;
    border: 1px solid var(--theme-color-border);
    border-radius: 6px;
    overflow: hidden;
  }
}
</style>
