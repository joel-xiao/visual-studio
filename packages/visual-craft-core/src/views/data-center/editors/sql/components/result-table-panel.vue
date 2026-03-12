<template>
  <div class="result-table-panel">
    <div class="panel-header">
      <div class="tabs">
        <div 
          v-for="t in tabs" 
          :key="t.id" 
          class="tab-item" 
          :class="{ active: activeTab === t.id }"
          @click="activeTab = t.id"
        >
          <span :data-text="t.name">{{ t.name }}</span>
        </div>
      </div>

      <div class="header-spacer"></div>

      <div v-if="response" class="resp-meta-actions">
        <div class="resp-meta">
           <span class="status" :class="{ success: !response.error }">
             {{ response.error ? '执行成功' : '执行失败' }}
           </span>
           <span class="rows" v-if="!response.error">{{ response.rows?.length || 0 }} rows</span>
           <span class="time">{{ response.time || 0 }}ms</span>
        </div>
        
        <div class="action-divider" v-if="!response.error && response.rows?.length"></div>

        <div class="actions" v-if="!response.error && response.rows?.length">
          <CButton quaternary size="small" icon="mdi:download-outline" @click="exportCsv">导出 CSV</CButton>
        </div>
      </div>
    </div>

    <div class="panel-content" v-if="response">
      <!-- Table View -->
      <div v-if="activeTab === 'table'" class="table-view">
        <div class="table-wrapper" v-if="response.rows?.length > 0">
          <table>
            <thead>
              <tr>
                <th class="row-num">#</th>
                <th v-for="col in columns" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in response.rows" :key="index">
                <td class="row-num">{{ Number(index) + 1 }}</td>
                <td v-for="col in columns" :key="col" :class="{ null: row[col] === null }">
                  {{ row[col] === null ? 'NULL' : row[col] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="no-data">
          <BasicIcon icon="mdi:table-off" font-size="32px" />
          <span>查询未返回数据行</span>
        </div>
      </div>

      <!-- JSON View -->
      <div v-else-if="activeTab === 'json'" class="json-view">
        <CCodeEditor 
          v-model="formattedJson" 
          language="json" 
          read-only 
          style="height: 100%" 
        />
      </div>

      <!-- SQL Log View -->
      <div v-else-if="activeTab === 'log'" class="log-view">
        <div v-if="response.executedSql" class="log-entry">
          <div class="log-label">执行的 SQL:</div>
          <pre class="log-sql">{{ response.executedSql }}</pre>
        </div>
        <div v-if="response.error" class="log-entry error">
          <div class="log-label">错误信息:</div>
          <pre class="log-error">{{ response.error }}</pre>
        </div>
        <div class="log-entry">
          <div class="log-label">执行耗时:</div>
          <span>{{ response.time || 0 }}ms</span>
        </div>
        <div class="log-entry">
          <div class="log-label">影响行数:</div>
          <span>{{ response.affectedRows ?? response.rows?.length ?? 0 }}</span>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
       <div class="empty-icon">
          <BasicIcon icon="mdi:database-search-outline" font-size="48px" />
       </div>
       <div class="text">执行查询以查看结果</div>
       <div class="tip">支持 SELECT / INSERT / UPDATE / DELETE 等 SQL 语句</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';

const props = defineProps<{
  response: any;
}>();

const activeTab = ref('table');
const tabs = [
  { name: '数据表格', id: 'table' },
  { name: 'JSON 视图', id: 'json' },
  { name: '执行日志', id: 'log' }
];

const columns = computed(() => {
  if (!props.response?.rows?.length) return [];
  return Object.keys(props.response.rows[0]);
});

const formattedJson = computed(() => {
  if (!props.response) return '';
  try {
    const data = props.response.rows || props.response;
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return String(props.response);
  }
});

function exportCsv() {
  if (!props.response?.rows?.length) return;
  const cols = columns.value;
  const header = cols.join(',');
  const rows = props.response.rows.map((row: any) => 
    cols.map((col: string) => {
      const val = row[col];
      if (val === null) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'query_result.csv';
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style lang="scss" scoped>
.result-table-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-color-main);
  color: var(--theme-color-text);
  overflow: hidden;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px;
    height: 41px;
    background: var(--db-main-color-left-bar-bg);
    border-bottom: 1px solid var(--db-main-border-black);
    flex: none;
    
    .tabs {
      display: flex;
      height: 100%;
      gap: 20px;
      .tab-item {
        padding: 0 4px;
        height: 100%;
        display: flex;
        align-items: center;
        font-size: 13px;
        cursor: pointer;
        color: var(--theme-color-text-secondary);
        transition: all 0.2s;
        position: relative;

        &:hover { color: var(--theme-color-text); }
        
        span {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          &::before {
            content: attr(data-text);
            height: 0;
            visibility: hidden;
            overflow: hidden;
            user-select: none;
            font-weight: 600;
          }
        }
        
        &.active {
          color: var(--theme-color-text-bold);
          span { font-weight: 600; }
          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--db-editor-color-primary, #34D399);
          }
        }
      }
    }
    
    .header-spacer { flex: 1; }
    
    .resp-meta-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      height: 100%;
    }

    .resp-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 11px;
      color: var(--theme-color-text-secondary);

      .status { 
        font-weight: 700; 
        padding: 1px 6px;
        border-radius: 4px;
        background: rgba(248, 113, 113, 0.1);
        color: #f87171; 
        &.success { 
          background: var(--db-editor-color-primary-light, rgba(52, 211, 153, 0.1));
          color: var(--db-editor-color-primary, #34D399); 
        }
      }
      .rows { font-weight: 500; }
      .time { opacity: 0.7; }
    }

    .action-divider {
      width: 1px;
      height: 16px;
      background: var(--db-main-border-black);
      opacity: 0.5;
    }

    .actions {
      display: flex;
      align-items: center;
      :deep(.c-button) {
        font-weight: 600;
        letter-spacing: 0.5px;
        color: var(--sql-color-primary);
        &:hover { background: var(--sql-color-primary-light); }
      }
    }
  }

  .panel-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    
    .table-view {
      flex: 1;
      overflow: auto;

      .table-wrapper {
        min-width: 100%;

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;

          th {
            position: sticky;
            top: 0;
            z-index: 1;
            background: var(--db-main-color-left-bar-bg);
            padding: 8px 12px;
            text-align: left;
            font-weight: 700;
            color: var(--theme-color-text-bold);
            border-bottom: 2px solid var(--theme-color-border);
            white-space: nowrap;

            &.row-num {
              width: 48px;
              text-align: center;
              color: var(--theme-color-text-secondary);
            }
          }

          td {
            padding: 6px 12px;
            border-bottom: 1px solid var(--theme-color-border);
            white-space: nowrap;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--theme-color-text);

            &.row-num {
              text-align: center;
              color: var(--theme-color-text-secondary);
              opacity: 0.5;
              font-size: 10px;
            }

            &.null {
              color: var(--theme-color-text-secondary);
              opacity: 0.4;
              font-style: italic;
            }
          }

          tr:hover td {
            background: var(--theme-color-gray-50);
          }
        }
      }

      .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--theme-color-text-secondary);
        gap: 12px;
        opacity: 0.5;
      }
    }

    .json-view {
      flex: 1;
      overflow: hidden;
    }

    .log-view {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .log-entry {
        .log-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--theme-color-text-secondary);
          margin-bottom: 6px;
        }

        .log-sql {
          background: #0d1117;
          color: #34D399;
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
          font-family: 'Fira Code', monospace;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .log-error {
          background: rgba(248, 113, 113, 0.08);
          color: #f87171;
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
          border: 1px solid rgba(248, 113, 113, 0.2);
        }

        &.error .log-label { color: #f87171; }
      }
    }
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--theme-color-text-secondary);
    opacity: 0.6;
    gap: 12px;

    .empty-icon {
      color: var(--theme-color-gray-400);
      margin-bottom: 8px;
    }
    .text {
      font-size: 14px;
      font-weight: 600;
    }
    .tip {
      font-size: 12px;
    }
  }
}
</style>
