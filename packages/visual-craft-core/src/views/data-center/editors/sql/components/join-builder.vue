<template>
  <div class="join-builder">
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
      <!-- Visual JOIN Builder -->
      <div v-if="activeTab === 'visual'" class="visual-builder">
        <!-- Tables Section -->
        <div class="builder-section">
          <div class="section-label"><BasicIcon icon="mdi:table" font-size="14px" class="sec-icon" /> 数据来源 (Tables)</div>
          <div class="tables-list">
            <div v-for="(table, index) in joinConfig.tables" :key="index" class="table-row">
              <CSelect 
                :model-value="table.sourceType" 
                :options="sourceTypeOptions"
                size="small"
                class="type-select"
                @update:model-value="(v: string) => updateTable(Number(index), 'sourceType', v)"
              >
                <template #prefix>
                  <div class="alias-badge-inline">{{ table.alias }}</div>
                </template>
              </CSelect>

              <div class="source-group">
                <CInput 
                  v-if="table.sourceType === 'table'" 
                  :model-value="table.source" 
                  icon="mdi:table-edit"
                  placeholder="物理表名/视图" 
                  size="small"
                  class="source-input"
                  @update:model-value="(v: string) => updateTable(Number(index), 'source', v)"
                />
                <CSelect 
                  v-else
                  :model-value="table.source"
                  :options="stepRefOptions"
                  placeholder="上游查询"
                  size="small"
                  class="source-input"
                  icon="mdi:source-branch"
                  @update:model-value="(v: string) => updateTable(Number(index), 'source', v)"
                />
              </div>
              
              <CInput 
                v-model="table.alias" 
                placeholder="别名" 
                size="small" 
                class="alias-input" 
                @update:model-value="(v: string) => updateTable(Number(index), 'alias', v)" 
              >
                <template #prefix>
                  <span class="kw-as">AS</span>
                </template>
              </CInput>

              <BasicIcon 
                v-if="joinConfig.tables.length > 2" 
                icon="mdi:close-circle-outline" 
                class="remove-btn" 
                @click="removeTable(Number(index))"
              />
            </div>
            <div class="add-table" @click="addTable">
              <BasicIcon icon="mdi:plus" />
              <span>添加数据表</span>
            </div>
          </div>
        </div>

        <!-- JOIN Type -->
        <div class="builder-section">
          <div class="section-label"><BasicIcon icon="mdi:set-merge" font-size="14px" class="sec-icon purple" /> 连接方式 (Join Type)</div>
          <div class="join-type-grid">
            <div class="join-type-cards">
              <div 
                v-for="jt in joinTypes" 
                :key="jt.value" 
                class="join-type-card"
                :class="{ active: joinConfig.joinType === jt.value }"
                @click="updateConfig('joinType', jt.value)"
              >
                <div class="jt-icon">
                  <div class="venn" :class="jt.venn"></div>
                </div>
                <div class="jt-label">{{ jt.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ON Conditions -->
        <div class="builder-section">
          <div class="section-label"><BasicIcon icon="mdi:link-variant" font-size="14px" class="sec-icon purple" /> 关联条件 (ON Clause)</div>
          <div class="on-conditions">
            <div v-for="(cond, idx) in joinConfig.onConditions" :key="idx" class="condition-row">
              <div class="on-group">
                <CInput 
                  :model-value="cond.leftField" 
                  icon="mdi:table-column"
                  :placeholder="`${joinConfig.tables[0]?.alias || 'a'}.column`" 
                  size="small"
                  class="field-input"
                  @update:model-value="(v: string) => updateCondition(Number(idx), 'leftField', v)"
                />
                <CSelect 
                  :model-value="cond.operator" 
                  :options="operatorOptions" 
                  size="small" 
                  class="operator-select"
                  @update:model-value="(v: string) => updateCondition(Number(idx), 'operator', v)"
                />
                <CInput 
                  :model-value="cond.rightField" 
                  icon="mdi:table-column"
                  :placeholder="`${joinConfig.tables[1]?.alias || 'b'}.column`" 
                  size="small"
                  class="field-input"
                  @update:model-value="(v: string) => updateCondition(Number(idx), 'rightField', v)"
                />
              </div>
              <BasicIcon 
                v-if="joinConfig.onConditions.length > 1" 
                icon="mdi:close-circle-outline" 
                class="remove-cond" 
                @click="removeCondition(Number(idx))"
              />
            </div>
            <div class="add-condition" @click="addCondition">
              <BasicIcon icon="mdi:plus" />
              <span>AND 条件</span>
            </div>
          </div>
        </div>

        <!-- Select Fields -->
        <div class="builder-section">
          <div class="section-label"><BasicIcon icon="mdi:format-columns" font-size="14px" class="sec-icon" /> 选取字段 (SELECT)</div>
          <div class="select-fields">
            <CInput 
              :model-value="joinConfig.selectFields?.join(', ') || ''" 
              icon="mdi:select-group"
              placeholder="* (默认全部)  或  a.id, a.name, b.total" 
              size="small"
              @update:model-value="(v: string) => updateConfig('selectFields', v.split(',').map((s: string) => s.trim()).filter(Boolean))"
            />
          </div>
        </div>

        <div class="builder-section">
          <div class="section-label"><BasicIcon icon="mdi:filter-outline" font-size="14px" class="sec-icon" /> 附加条件</div>
          <div class="clause-grid">
            <div class="clause-field">
              <div class="clause-label">WHERE 过滤</div>
              <CInput 
                :model-value="joinConfig.whereClause" 
                icon="mdi:filter-variant"
                placeholder="a.status = 'active'" 
                size="small"
                @update:model-value="(v: string) => updateConfig('whereClause', v)"
              />
            </div>
            <div class="clause-field">
              <div class="clause-label">ORDER BY 排序</div>
              <CInput 
                :model-value="joinConfig.orderBy" 
                icon="mdi:sort-ascending"
                placeholder="a.created_at DESC" 
                size="small"
                @update:model-value="(v: string) => updateConfig('orderBy', v)"
              />
            </div>
            <div class="clause-field short">
              <div class="clause-label">LIMIT</div>
              <CInput 
                :model-value="String(joinConfig.limit || 100)" 
                icon="mdi:numeric"
                placeholder="100" 
                size="small"
                @update:model-value="(v: string) => updateConfig('limit', parseInt(v) || 100)"
              />
            </div>
          </div>
        </div>

        <!-- Generated SQL Preview -->
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
            运行连接查询
          </CButton>
        </div>
      </div>

      <!-- Condition Tab -->
      <div v-if="activeTab === 'condition'" class="condition-section">
        <div class="field-label">
          <span>执行条件判断</span>
          <span class="tip">控制该 JOIN 查询是否执行</span>
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
import { ref, reactive, computed, watch, onMounted } from 'vue';
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

const tabs = [
  { label: '可视化构建', id: 'visual', icon: 'mdi:set-merge' },
  { label: '执行条件', id: 'condition', icon: 'mdi:filter-outline' },
  { label: '出参处理', id: 'transform', icon: 'mdi:tray-arrow-up' }
];

const DEFAULT_JOIN_CONFIG = {
  tables: [
    { alias: 'a', source: '', sourceType: 'table' },
    { alias: 'b', source: '', sourceType: 'table' }
  ],
  joinType: 'INNER JOIN',
  onConditions: [{ leftField: '', rightField: '', operator: '=' }],
  selectFields: [] as string[],
  whereClause: '',
  orderBy: '',
  limit: 100
};

// Use a stable reactive copy to avoid infinite loops
const joinConfig = reactive(JSON.parse(JSON.stringify(props.step.joinConfig || DEFAULT_JOIN_CONFIG)));

// Only sync from props when joinConfig reference changes (not sql)
watch(() => props.step.joinConfig, (newCfg) => {
  if (newCfg) Object.assign(joinConfig, JSON.parse(JSON.stringify(newCfg)));
}, { deep: true });

const sourceTypeOptions = [
  { label: '数据表', value: 'table' },
  { label: '上游查询', value: 'ref' }
];

const operatorOptions = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' }
];

const joinTypes = [
  { value: 'INNER JOIN', label: 'INNER', venn: 'inner' },
  { value: 'LEFT JOIN', label: 'LEFT', venn: 'left' },
  { value: 'RIGHT JOIN', label: 'RIGHT', venn: 'right' },
  { value: 'FULL JOIN', label: 'FULL', venn: 'full' },
  { value: 'CROSS JOIN', label: 'CROSS', venn: 'cross' }
];

const stepRefOptions = computed(() => {
  if (!props.allSteps) return [];
  return props.allSteps
    .filter((s: any) => s.id !== props.step.id)
    .map((s: any) => ({ label: `${s.name} (${s.id})`, value: `{{results.${s.id}}}` }));
});

const generatedSql = computed(() => {
  const cfg = joinConfig;
  const select = cfg.selectFields?.length > 0 ? cfg.selectFields.join(', ') : '*';
  const tables = cfg.tables || [];
  
  if (tables.length < 2) return '-- 请至少配置两个数据表';
  
  const fromTable = tables[0].sourceType === 'ref' ? `(${tables[0].source}) ${tables[0].alias}` : `${tables[0].source || 'table1'} ${tables[0].alias}`;
  
  let sql = `SELECT ${select}\nFROM ${fromTable}`;
  
  for (let i = 1; i < tables.length; i++) {
    const t = tables[i];
    const src = t.sourceType === 'ref' ? `(${t.source}) ${t.alias}` : `${t.source || 'table' + (i + 1)} ${t.alias}`;
    sql += `\n${cfg.joinType} ${src}`;
  }
  
  if (cfg.onConditions?.length > 0) {
    const onParts = cfg.onConditions
      .filter((c: any) => c.leftField && c.rightField)
      .map((c: any) => `${c.leftField} ${c.operator} ${c.rightField}`);
    if (onParts.length > 0) {
      sql += `\n  ON ${onParts.join('\n  AND ')}`;
    }
  }
  
  if (cfg.whereClause) sql += `\nWHERE ${cfg.whereClause}`;
  if (cfg.orderBy) sql += `\nORDER BY ${cfg.orderBy}`;
  if (cfg.limit) sql += `\nLIMIT ${cfg.limit}`;
  
  return sql;
});

function syncToParent() {
  emit('update:step', { 
    ...props.step, 
    joinConfig: JSON.parse(JSON.stringify(joinConfig)),
    sql: generatedSql.value 
  });
}

function updateConfig(key: string, value: any) {
  (joinConfig as any)[key] = value;
  syncToParent();
}

function updateTable(index: number, key: string, value: any) {
  joinConfig.tables[index] = { ...joinConfig.tables[index], [key]: value };
  syncToParent();
}

function addTable() {
  const alias = String.fromCharCode(97 + joinConfig.tables.length); // a, b, c, d ...
  joinConfig.tables.push({ alias, source: '', sourceType: 'table' });
  syncToParent();
}

function removeTable(index: number) {
  joinConfig.tables.splice(index, 1);
  syncToParent();
}

function updateCondition(index: number, key: string, value: any) {
  joinConfig.onConditions[index] = { ...joinConfig.onConditions[index], [key]: value };
  syncToParent();
}

function addCondition() {
  joinConfig.onConditions.push({ leftField: '', rightField: '', operator: '=' });
  syncToParent();
}

function removeCondition(index: number) {
  joinConfig.onConditions.splice(index, 1);
  syncToParent();
}

async function copySql() {
  await copyToClipboard(generatedSql.value);
}
</script>

<style lang="scss" scoped>
.join-builder {
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
  &.purple { color: var(--sql-color-accent-join); }
}

.tables-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .table-row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    gap: 8px; /* Reduced gap */
    width: auto; /* Remove 100% to prevent overflow */
    max-width: 100%;
    margin-bottom: 4px;

    .type-select { width: 120px !important; flex-shrink: 0; }
    .source-group { flex: 1; min-width: 0; }
    .alias-input { width: 120px !important; flex-shrink: 0; }
    .remove-btn { 
      cursor: pointer; 
      opacity: 0.5; 
      flex-shrink: 0;
      width: 20px;
      color: var(--theme-color-text-secondary);
      &:hover { opacity: 1; color: #f87171; }
    }

    .alias-badge-inline {
      width: 18px;
      height: 18px;
      background: var(--sql-color-primary);
      color: #fff;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      margin-right: 6px;
    }

    .kw-as {
      font-size: 11px;
      font-weight: 800;
      color: var(--sql-color-primary);
      opacity: 0.9;
      margin-right: 6px;
    }
  }
}

.add-table {
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

.join-type-grid {
  display: flex; /* Changed from grid to flex to accommodate the single child row */
  gap: 16px;
  align-items: center;

  .join-type-cards {
    display: flex;
    gap: 8px;
    flex: 1;
  }

  .join-type-card {
    flex: 1;
    padding: 10px 4px;
    border: 1px solid var(--theme-color-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 56px;

    .jt-icon {
      margin-bottom: 4px;
      display: flex;
      justify-content: center;

      .venn {
        width: 32px;
        height: 20px;
        position: relative;
        &::before, &::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1.5px solid var(--theme-color-text-secondary);
          top: 1px;
        }
        &::before { left: 2px; }
        &::after { left: 10px; }

        &.inner::before, &.inner::after { border-color: var(--sql-color-accent-join); }
        &.left::before { background: var(--sql-color-accent-join-light); border-color: var(--sql-color-accent-join); }
        &.right::after { background: var(--sql-color-accent-join-light); border-color: var(--sql-color-accent-join); }
        &.full::before, &.full::after { background: var(--sql-color-accent-join-light); border-color: var(--sql-color-accent-join); }
        &.cross::before, &.cross::after { border-style: dashed; border-color: var(--sql-color-accent-join); }
      }
    }

    .jt-label {
      font-size: 9px;
      font-weight: 700;
      color: var(--theme-color-text-secondary);
    }

    &:hover { border-color: var(--sql-color-primary); }
    &.active {
      border-color: var(--sql-color-primary);
      background: var(--sql-color-primary-light);
      box-shadow: 0 0 0 3px var(--sql-color-primary-light);
      .jt-label { color: var(--sql-color-primary); }
    }
  }
}

.on-conditions {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .condition-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 2px 0;

    .on-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      .field-input { flex: 1; }
      .operator-select { width: 70px; flex: none; }
    }

    .remove-cond {
      color: var(--theme-color-text-secondary);
      cursor: pointer;
      opacity: 0.4;
      transition: all 0.2s;
      &:hover { opacity: 1; color: #f87171; }
    }
  }

  .add-condition {
    padding: 6px;
    border: 1px dashed var(--theme-color-border);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 11px;
    color: var(--theme-color-text-secondary);
    cursor: pointer;
    &:hover { border-color: var(--sql-color-primary); color: var(--sql-color-primary); }
  }
}

.clause-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
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
