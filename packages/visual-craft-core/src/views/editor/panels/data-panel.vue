<template>
  <div class="editor-data-panel">
    <template v-if="selectedNode">
      <div class="panel-inner">
        <!-- 头部信息 -->
        <div class="panel-header">
          <div class="component-info">
            <span class="name">{{ selectedNode.name }}</span>
            <span class="version">V1</span>
            <Icon src="mdi:identifier" class="id-icon" />
            <Icon src="mdi:help-circle-outline" class="help-icon" />
          </div>
        </div>

        <div class="panel-content">
          <!-- 数据模式选择 -->
          <div class="content-section">
            <div class="pattern-selector">
              <div 
                v-for="p in patterns" 
                :key="p.id" 
                class="pattern-item" 
                :class="{ active: currentPattern === p.id }"
                @click="currentPattern = p.id"
              >
                {{ p.name }}
              </div>
            </div>
          </div>

          <!-- 字段映射 -->
          <div class="content-section">
            <div class="section-title">字段映射</div>
            <FieldMapper :mappings="currentMappings" :pattern="currentPattern" />
          </div>

          <!-- 数据处理 (配置、更新、结果) -->
          <div class="content-section">
            <div class="section-title">数据配置</div>
            <div class="source-select-row">
               <n-select 
                 v-model:value="bindingConfig.sourceId" 
                 :options="dataSourceOptions" 
                 placeholder="选择已连接的数据源..." 
                 size="small"
               />
               <n-button quaternary size="small" type="primary" @click="showSourceSelect = true">
                 <template #icon><Icon src="mdi:database-plus" /></template>
               </n-button>
            </div>
            
            <DataProcessor 
              :config="bindingConfig" 
              @edit-static="showStaticEdit = true"
              @config-source="viewDataCenter"
              @refresh="refreshData"
            />
          </div>

          <!-- 响应结果预览 -->
          <div class="result-preview">
            <div class="preview-container">
              <pre class="json-content">{{ formattedResult }}</pre>
              <Icon src="mdi:fullscreen" class="expand-icon" />
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <div v-else class="no-selection">
       <div class="empty-state">
         <Icon src="mdi:cursor-default-click-outline" :font-size="40" />
         <p>请选择画布中的组件进行数据绑定</p>
       </div>
    </div>

    <!-- 静态数据编辑弹窗 -->
    <n-modal v-model:show="showStaticEdit" preset="card" title="编辑静态数据" style="width: 800px">
      <n-input
        v-model:value="bindingConfig.staticData"
        type="textarea"
        :autosize="{ minRows: 15 }"
        placeholder="请输入 JSON 格式数据..."
      />
      <template #footer>
        <n-space justify="end">
          <n-button @click="showStaticEdit = false">确认</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useNodeContext } from '../hooks/node-context';
import Icon from '@/components/icon/index.vue';
import FieldMapper from './data-binding/field-mapper.vue';
import DataProcessor from './data-binding/data-processor.vue';
import { NModal, NInput, NButton, NSpace, NSelect } from 'naive-ui';

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

const showStaticEdit = ref(false);
const showSourceSelect = ref(false);

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
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    .component-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;

    .content-section {
      margin-bottom: 24px;
      .section-title {
        font-size: 13px;
        color: var(--theme-color-tran-45);
        margin-bottom: 10px;
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

  .result-preview {
    background: #111;
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 4px;
    padding: 12px;
    .json-content {
      font-family: 'Fira Code', monospace;
      font-size: 12px;
      color: #ce9178;
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
