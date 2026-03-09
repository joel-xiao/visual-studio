<template>
  <div class="sql-request-editor">
    <div class="editor-header">
      <div class="db-info-row">
        <CSelect v-model="internalStep.dbType" :options="dbOptions" size="small" style="width: 120px" />
        <CInput v-model="internalStep.connectionString" size="small" placeholder="Host:Port / Connection String" class="conn-input" />
        <CButton primary size="small" icon="mdi:play" @click="$emit('send')">执行查询</CButton>
      </div>
    </div>

    <div class="sql-content">
      <div class="label">SQL 查询语句</div>
      <div class="code-container">
        <CCodeEditor 
          v-model="internalStep.sql" 
          language="sql" 
          style="height: 300px" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';

const props = defineProps<{
  step: any;
}>();

const emit = defineEmits(['update:step', 'send']);

const internalStep = reactive({
  dbType: 'mysql',
  connectionString: '',
  sql: 'SELECT * FROM table LIMIT 10',
  ...props.step
});

watch(() => props.step, (newStep) => {
  Object.assign(internalStep, newStep);
}, { deep: true });

watch(internalStep, (newVal) => {
  emit('update:step', newVal);
}, { deep: true });

const dbOptions = [
  { label: 'MySQL', value: 'mysql' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'Oracle', value: 'oracle' },
  { label: 'SQL Server', value: 'sqlserver' }
];
</script>

<style lang="scss">
#visual-craft-core {
  .sql-request-editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    color: var(--theme-color-text);

    .db-info-row {
      display: flex;
      gap: 8px;
      .conn-input { flex: 1; }
    }

    .sql-content {
      .label {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--theme-color-text-secondary);
      }
      .code-container {
        border: 1px solid var(--theme-color-border);
        border-radius: 6px;
        overflow: hidden;
        background: var(--db-main-color-card-bg);
      }
    }
  }
}
</style>
