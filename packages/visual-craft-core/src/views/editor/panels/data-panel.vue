<template>
  <div class="editor-data-panel">
    <template v-if="selectedNode">
      <div class="panel-inner">
        <!-- 头部信息 -->
        <div class="panel-header">
          <div class="component-info">
            <span class="name">{{ selectedNode.name }}</span>
            <span class="version">V1</span>
            <CIcon icon="mdi:identifier" class="id-icon" />
            <CIcon icon="mdi:help-circle-outline" class="help-icon" />
          </div>
        </div>

        <div class="panel-content">


          <!-- 字段映射 -->
          <div class="content-section">
            <div class="section-title">字段映射</div>
            <FieldMapper :mappings="currentMappings" :pattern="currentPattern" />
          </div>

          <!-- 数据处理 (配置、更新、结果) -->
          <div class="content-section">
            <DataProcessor 
              :config="bindingConfig" 
              @edit-static="showDataSourceConfig = true"
              @config-source="showDataSourceConfig = true"
              @config-filter="showFilterConfig = true"
              @refresh="refreshData"
            />
          </div>

          <!-- 响应结果预览 -->
              <CCodeEditor 
                :model-value="formattedResult" 
                read-only 
                language="json"
                height="240px"
              />
        </div>
      </div>
    </template>
    
    <div v-else class="no-selection">
       <div class="empty-state">
         <CIcon icon="mdi:cursor-default-click-outline" :size="'large'" />
         <p>请选择画布中的组件进行数据绑定</p>
       </div>
    </div>

    <!-- 数据源配置抽屉 -->
    <DataSourceConfig v-model="showDataSourceConfig" />

    <!-- 过滤器配置抽屉 -->
    <FilterConfig v-model="showFilterConfig" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useNodeContext } from '../hooks/node-context';
import FieldMapper from './data-binding/field-mapper.vue';
import DataProcessor from './data-binding/data-processor.vue';
import FilterConfig from './data-binding/filter-config.vue';
import DataSourceConfig from './data-binding/data-source-config.vue';
import CModal from '@/views/ui/controls/c-modal/index.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CIcon from '@/views/ui/controls/c-icon/index.vue';

const nodeContext = useNodeContext();
const selectedNodes = nodeContext.getSelectedNodes();
const selectedNode = computed(() => selectedNodes.value[0]);

const patterns = [
  { name: '汇总', id: 'summary' },
  { name: '数组', id: 'array' },
  { name: '时序', id: 'timeseries' }
];
const currentPattern = ref('array');

// Mock 绑定配置
const bindingConfig = ref({
  sourceId: null,
  autoUpdate: false,
  interval: 10,
  staticData: JSON.stringify([
    { x: '1月', y: 48, s: '系列一', colorField: 100 },
    { x: '2月', y: 40, s: '系列一' },
    { x: '3月', y: 24, s: '系列一' }
  ], null, 2)
});

const dataSourceOptions = [
  { label: '大屏销量统计 (API)', value: '1' },
  { label: '车间温湿度 (MQTT)', value: '2' },
  { label: '自定义静态数据', value: 'static' }
];

const currentMappings = ref([
  { field: 'y', mapping: 'y', status: 'success' },
  { field: 's', mapping: 's', status: 'success' },
  { field: 'colorField', mapping: 'colorFields', status: 'error' }
]);

const showDataSourceConfig = ref(false);
const showFilterConfig = ref(false);

const formattedResult = computed(() => {
  return bindingConfig.value.staticData;
});

function refreshData() {
  console.log('Refreshing data');
}

function viewDataCenter() {
  // Logic to switch to Data Center view or emit to parent
  console.log('Navigate to Data Center');
}

watch(() => selectedNode.value?.id, () => {
    // Logic to update mappings based on selection
});
</script>

<style lang="scss">
.editor-data-panel {
  height: 100%;
  background: #1e1e1e;
  color: #fff;
  display: flex;
  flex-direction: column;

  .panel-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    .component-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
    }
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;

    .content-section {
      margin-bottom: 16px;
      .section-title {
        font-size: 12px;
        color: var(--theme-color-tran-45);
        margin-bottom: 8px;
        font-weight: 500;
      }

      .source-select-row {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
    }
  }

  .pattern-selector {
    display: flex;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px;
    border-radius: 4px;
    
    .pattern-item {
      flex: 1;
      text-align: center;
      padding: 6px 0;
      font-size: 12px;
      cursor: pointer;
      border-radius: 3px;
      transition: all 0.2s;
      color: var(--theme-color-tran-70);

      &:hover { color: #fff; }
      &.active {
        background: #3662ec;
        color: #fff;
        font-weight: 600;
      }
    }
  }

  .no-selection {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .empty-state { text-align: center; opacity: 0.4; }
  }
}
</style>
