<template>
  <div class="sql-step-manager">
    <div class="manager-header">
      <div class="title">
        <BasicIcon icon="mdi:format-list-bulleted-type" font-size="16px" />
        <span>查询步骤流</span>
      </div>
      <div class="badge">{{ steps.length }}</div>
    </div>

    <div class="steps-list">
      <!-- Global Connection Config -->
      <div 
        class="step-item global-config-step"
        :class="{ active: modelValue === -2 }"
        @click="$emit('update:modelValue', -2)"
      >
        <div class="step-icon-box config">
           <BasicIcon icon="mdi:database-cog-outline" font-size="16px" />
        </div>
        <div class="step-info">
          <div class="step-name">连接与全局配置</div>
          <div class="step-meta">数据库连接 / 共享变量</div>
        </div>
        <div class="step-indicator"></div>
      </div>

      <div class="section-label">SQL 执行流水线</div>

      <div 
        v-for="(step, index) in steps" 
        :key="step.id" 
        class="step-item query-step-item"
        :class="[
          { active: modelValue === index },
          step.queryType || 'raw'
        ]"
        @click="$emit('update:modelValue', index)"
      >
        <div class="step-icon-box">
           <BasicIcon v-if="step.queryType === 'join'" icon="mdi:set-merge" font-size="16px" />
           <BasicIcon v-else-if="step.queryType === 'aggregation'" icon="mdi:chart-box-outline" font-size="16px" />
           <BasicIcon v-else icon="mdi:code-tags" font-size="16px" />
        </div>
        <div class="step-info">
          <div class="step-name-row">
            <span class="step-name" v-hint="step.name">{{ step.name || '未命名查询' }}</span>
            <span class="step-id copyable" @click.stop="copyId(step.id)">
              {{ step.id }}
            </span>
          </div>
          <div class="step-meta" v-hint="getStepMeta(step)">
            {{ getStepMetaSummary(step) }}
          </div>
        </div>
        <div class="step-actions">
           <div class="order-btns">
             <BasicIcon icon="mdi:chevron-up" @click.stop="moveStep(index, -1)" :class="{ disabled: index === 0 }" />
             <BasicIcon icon="mdi:chevron-down" @click.stop="moveStep(index, 1)" :class="{ disabled: index === steps.length - 1 }" />
           </div>
           <BasicIcon icon="mdi:delete-outline" class="del-btn" @click.stop="removeStep(index)" />
        </div>
        <div class="step-indicator"></div>
      </div>

      <div class="manager-footer">
        <div class="add-actions-grid">
          <div class="add-btn raw" @click="addQueryStep">
            <BasicIcon icon="mdi:plus-box-outline" font-size="18px" />
            <div class="btn-text">
              <span class="main">SQL 查询</span>
              <span class="sub">原生语句</span>
            </div>
          </div>
          <div class="add-btn join" @click="addJoinStep">
            <BasicIcon icon="mdi:set-merge" font-size="18px" />
            <div class="btn-text">
              <span class="main">并表查询</span>
              <span class="sub">可视化构建</span>
            </div>
          </div>
          <div class="add-btn agg" @click="addAggregationStep">
            <BasicIcon icon="mdi:chart-box-outline" font-size="18px" />
            <div class="btn-text">
              <span class="main">数据聚合</span>
              <span class="sub">统计分析</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-label" style="margin-top: 20px">后序数据处理</div>

      <!-- Final Transformation Step -->
      <div 
        class="step-item transformation-step"
        :class="{ active: modelValue === -1 }"
        @click="$emit('update:modelValue', -1)"
      >
        <div class="step-icon-box transform">
          <BasicIcon icon="mdi:function-variant" font-size="16px" />
        </div>
        <div class="step-info">
          <div class="step-name">结果清洗与转换</div>
          <div class="step-meta">JavaScript 数据处理</div>
        </div>
        <div class="step-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import { copyToClipboard } from '@/assets/utils/index';

const props = defineProps<{
  steps: any[];
  modelValue: number;
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const copyId = async (id: string) => {
  await copyToClipboard(id);
};

function getStepMeta(step: any): string {
  if (step.queryType === 'join') return `并表: ${step.joinConfig?.tables?.length || 0} 张表`;
  if (step.queryType === 'aggregation') return `聚合: ${step.aggregationConfig?.functions?.length || 0} 个指标`;
  return step.sql || '未编写 SQL';
}

function getStepMetaSummary(step: any): string {
  if (step.queryType === 'join') return `JOIN 构建器 (${step.joinConfig?.joinType || 'INNER'})`;
  if (step.queryType === 'aggregation') return `聚合分析 (${step.aggregationConfig?.functions?.[0]?.func || 'COUNT'})`;
  if (!step.sql) return '待输入 SQL 语句';
  return step.sql.replace(/\s+/g, ' ').substring(0, 25) + (step.sql.length > 25 ? '...' : '');
}

function addQueryStep() {
  const nextNumber = props.steps.length + 1;
  const newStep = {
    id: 'query' + nextNumber,
    name: '查询 ' + nextNumber,
    queryType: 'raw',
    sql: 'SELECT * FROM table_name LIMIT 100',
    condition: '',
    transformation: { script: 'return data;', type: 'raw' }
  };
  const newSteps = [...props.steps, newStep];
  emit('change', newSteps);
  emit('update:modelValue', newSteps.length - 1);
}

function addJoinStep() {
  const nextNumber = props.steps.length + 1;
  const newStep = {
    id: 'join' + nextNumber,
    name: '并表 ' + nextNumber,
    queryType: 'join',
    joinConfig: {
      tables: [
        { alias: 'a', source: '', sourceType: 'table' },
        { alias: 'b', source: '', sourceType: 'table' }
      ],
      joinType: 'INNER JOIN',
      onConditions: [{ leftField: '', rightField: '', operator: '=' }],
      selectFields: [],
      whereClause: '',
      orderBy: '',
      limit: 100
    },
    sql: '',
    condition: '',
    transformation: { script: 'return data;', type: 'raw' }
  };
  const newSteps = [...props.steps, newStep];
  emit('change', newSteps);
  emit('update:modelValue', newSteps.length - 1);
}

function addAggregationStep() {
  const nextNumber = props.steps.length + 1;
  const newStep = {
    id: 'agg' + nextNumber,
    name: '聚合 ' + nextNumber,
    queryType: 'aggregation',
    aggregationConfig: {
      sourceTable: '',
      sourceType: 'table',
      groupByFields: [],
      functions: [{ func: 'COUNT', field: '*', alias: 'total' }],
      havingClause: '',
      orderBy: '',
      limit: 100
    },
    sql: '',
    condition: '',
    transformation: { script: 'return data;', type: 'raw' }
  };
  const newSteps = [...props.steps, newStep];
  emit('change', newSteps);
  emit('update:modelValue', newSteps.length - 1);
}

function removeStep(index: number) {
  if (props.steps.length <= 1) return;
  const newSteps = [...props.steps];
  newSteps.splice(index, 1);
  emit('change', newSteps);
  if (props.modelValue >= newSteps.length) {
    emit('update:modelValue', Math.max(0, newSteps.length - 1));
  }
}

function moveStep(index: number, direction: number) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= props.steps.length) return;
  const newSteps = [...props.steps];
  const item = newSteps.splice(index, 1)[0];
  newSteps.splice(newIndex, 0, item);
  emit('change', newSteps);
  if (props.modelValue === index) {
    emit('update:modelValue', newIndex);
  } else if (props.modelValue === newIndex) {
    emit('update:modelValue', index);
  }
}
</script>

<style lang="scss" scoped>
.sql-step-manager {
  height: 100%;
  background: var(--db-editor-color-panel-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .manager-header {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--db-main-border-black);
    background: var(--db-main-color-left-bar-bg);
    
    .title {
      font-size: 13px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .badge {
      background: var(--db-main-border-black);
      padding: 0 8px;
      height: 18px;
      border-radius: 9px;
      font-size: 10px;
      font-weight: 800;
      color: #34D399;
      display: flex;
      align-items: center;
    }
  }

  .steps-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 2px; }
  }

  .section-label {
    font-size: 10px;
    font-weight: 800;
    color: var(--theme-color-text-secondary);
    opacity: 0.5;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 12px;
    margin-bottom: 4px;
    padding-left: 4px;
    flex: none;
  }

  .step-item {
    padding: 12px;
    background: var(--db-main-color-left-bar-bg);
    border: 1px solid var(--theme-color-border);
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;

    .step-icon-box {
      width: 32px;
      height: 32px;
      background: var(--db-main-border-black);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sql-color-primary);
      flex: none;
      transition: all 0.2s;
      
      &.config { color: var(--theme-color-text-secondary); }
      &.transform { color: var(--sql-color-accent-agg); }
    }
    
    .step-info {
      flex: 1;
      min-width: 0;

      .step-name-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 2px;
      }
      .step-name { 
        font-size: 13px; 
        font-weight: 700; 
        color: var(--theme-color-text-bold); 
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .step-id { 
        font-size: 9px; 
        color: var(--theme-color-text-secondary); 
        background: rgba(0, 0, 0, 0.2);
        padding: 1px 6px;
        border-radius: 4px;
        opacity: 0.6;
        flex: none;
      }
      .step-meta { 
        font-size: 10px; 
        color: var(--theme-color-text-secondary); 
        opacity: 0.5; 
        overflow: hidden; 
        text-overflow: ellipsis; 
        white-space: nowrap; 
      }
    }

    .step-indicator {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0;
      background: var(--sql-color-primary);
      transition: width 0.2s;
    }

    .step-actions {
      opacity: 0;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: opacity 0.2s;
      
      .order-btns {
         display: flex;
         flex-direction: column;
         .basic-icon {
            font-size: 14px;
            color: var(--theme-color-text-secondary);
            &:hover:not(.disabled) { color: #fff; }
            &.disabled { opacity: 0.2; cursor: not-allowed; }
         }
      }
      .del-btn {
        color: var(--theme-color-text-secondary);
        &:hover { color: #ef4444; }
      }
    }

    // Interactive States
    &:hover {
      border-color: var(--sql-color-primary-light);
      background: rgba(255, 255, 255, 0.02);
      .step-actions { opacity: 1; }
    }

    &.active {
      background: var(--sql-color-primary-light);
      border-color: var(--sql-color-primary);
      .step-indicator { width: 3px; }
      .step-icon-box { background: var(--sql-color-primary); color: #fff; }
      
      &.join .step-icon-box { background: var(--sql-color-accent-join); }
      &.aggregation .step-icon-box { background: var(--sql-color-accent-agg); color: #000; }
      &.transformation-step .step-icon-box { background: var(--sql-color-accent-agg); color: #000; }
    }

    // Colors for icons by type
    &.join .step-icon-box { color: var(--sql-color-accent-join); }
    &.aggregation .step-icon-box { color: var(--sql-color-accent-agg); }
    &.join:hover { border-color: var(--sql-color-accent-join-light); }
    &.aggregation:hover { border-color: var(--sql-color-accent-agg-light); }
  }

  .manager-footer {
    padding: 4px;
    margin-top: 10px;
    flex: none;

    .add-actions-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .add-btn {
      padding: 10px 12px;
      background: var(--db-main-color-left-bar-bg);
      border: 1px dashed var(--theme-color-border);
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
      
      .btn-text {
        display: flex;
        flex-direction: column;
        .main { font-size: 12px; font-weight: 700; color: var(--theme-color-text-bold); }
        .sub { font-size: 9px; color: var(--theme-color-text-secondary); opacity: 0.6; }
      }

      &:hover {
        background: var(--sql-color-primary-light);
        border-color: var(--sql-color-primary);
        transform: translateX(2px);
      }

      &.join:hover { border-color: var(--sql-color-accent-join); background: var(--sql-color-accent-join-light); }
      &.agg:hover { border-color: var(--sql-color-accent-agg); background: var(--sql-color-accent-agg-light); }
    }
  }

  .transformation-step {
    border-style: solid;
    margin-top: 4px;
    background: var(--db-main-color-left-bar-bg);
  }
}
</style>
