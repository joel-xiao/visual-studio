<template>
  <CDrawer v-model="show" title="配置数据源" width="380px" @close="$emit('close')">
    <div class="data-source-config">
      <!-- 标签页切换 -->
      <div class="tabs-header">
        <div class="tabs-group">
          <div 
            v-for="tab in tabs" 
            :key="tab.value" 
            class="tab-item" 
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </div>
        </div>
      </div>

      <div class="config-content">
        <!-- 静态数据 -->
        <div v-if="activeTab === 'static'" class="tab-pane static-pane">
          <div class="editor-container">
            <CCodeEditor 
              v-model="config.staticData" 
              language="json" 
              height="calc(100vh - 220px)" 
            />
          </div>
        </div>

        <!-- RestAPI -->
        <div v-if="activeTab === 'api'" class="tab-pane api-pane">
          <div class="form-item horizontal">
            <div class="form-label">请求类型</div>
            <div class="form-ctrl">
              <CSelect v-model="config.api.method" :options="methodOptions" size="small" />
            </div>
          </div>
          <div class="form-item horizontal">
            <div class="form-label">请求地址</div>
            <div class="form-ctrl">
              <CInput v-model="config.api.url" placeholder="http://" size="small" />
            </div>
          </div>
          <div class="form-item vertical">
            <div class="form-label">请求头</div>
            <div class="editor-wrapper compact">
              <CCodeEditor v-model="config.api.headers" language="json" height="200px" />
            </div>
          </div>
          <div class="form-item horizontal">
            <div class="form-label">数据层级</div>
            <div class="form-ctrl">
              <CInput v-model="config.api.layer" placeholder="data.list" size="small" />
            </div>
          </div>
          <div class="form-item vertical">
            <div class="form-label header-with-actions">
              <span>请求条件</span>
              <div class="actions">
                <CIcon 
                  icon="mdi:filter-variant" 
                  size="small" 
                  :class="{ active: conditionMode === 'visual' }"
                  @click="conditionMode = 'visual'" 
                />
                <CIcon 
                  icon="mdi:code-tags" 
                  size="small" 
                  :class="{ active: conditionMode === 'code' }"
                  @click="conditionMode = 'code'" 
                />
              </div>
            </div>
            <!-- 可视化模式 -->
            <div v-if="conditionMode === 'visual'" class="visual-input-wrapper">
              <CTextarea v-model="config.api.visualParams" placeholder="在这里输入过滤条件..." :rows="4" />
            </div>
            
            <!-- 代码模式 -->
            <div v-else class="editor-wrapper compact">
              <CCodeEditor v-model="config.api.params" language="javascript" height="200px" />
            </div>
          </div>
        </div>

        <!-- 订阅数据 (数据源中心) -->
        <div v-if="activeTab === 'subscribe'" class="tab-pane subscribe-pane">
          <div class="form-tip">来自数据源中心已定义的订阅源</div>
          <div class="form-item horizontal">
            <div class="form-label">订阅编号 <span class="required">*</span></div>
            <div class="form-ctrl">
              <CSelect 
                v-model="config.subscribe.sourceId" 
                :options="globalSourceOptions" 
                placeholder="点击下拉框选择" 
                size="small" 
              />
            </div>
          </div>
          <div class="form-item horizontal">
            <div class="form-label">订阅层级</div>
            <div class="form-ctrl">
              <CInput v-model="config.subscribe.layer" placeholder="data.list" size="small" />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="config-footer">
        <CButton primary @click="handleSave">保存</CButton>
      </div>
    </div>
  </CDrawer>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import CDrawer from '@/views/ui/controls/c-drawer/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CTextarea from '@/views/ui/controls/c-textarea/index.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import CIcon from '@/views/ui/controls/c-icon/index.vue';

const props = defineProps<{
  modelValue: boolean;
  initialConfig?: any;
}>();

const emit = defineEmits(['update:modelValue', 'save', 'close']);

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const activeTab = ref('static');
const conditionMode = ref('code'); // 'visual' | 'code'
const tabs = [
  { label: '静态数据', value: 'static' },
  { label: 'RestAPI', value: 'api' },
  { label: '订阅数据', value: 'subscribe' }
];

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' }
];

// Mock 数据源中心的数据
const globalSourceOptions = ref([
  { label: '实时销量订阅 (MQTT)', value: 'mq_1' },
  { label: '设备告警流 (WebSocket)', value: 'ws_1' },
  { label: '生产线状态 (OPC-UA)', value: 'opc_1' }
]);

const config = reactive({
  staticData: JSON.stringify([
    { x: '1月', y: 48, s: '系列一', colorField: 100 },
    { x: '2月', y: 40, s: '系列一' },
    { x: '3月', y: 24, s: '系列一' },
    { x: '4月', y: 48, s: '系列一' },
    { x: '5月', y: 49, s: '系列一', colorField: 200 },
    { x: '6月', y: 58, s: '系列一', colorField: 200 }
  ], null, 2),
  api: {
    method: 'POST',
    url: '',
    headers: '',
    layer: '',
    params: '',
    visualParams: ''
  },
  subscribe: {
    sourceId: '',
    layer: ''
  }
});

function handleSave() {
  emit('save', { ...config, type: activeTab.value });
  show.value = false;
}
</script>

<style lang="scss" scoped>
.data-source-config {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-editor-panel-bg, #1e1e1e);

  .tabs-header {
    padding-bottom: 16px;
    display: flex;
    justify-content: center;

    .tabs-group {
      display: flex;
      background: rgba(255, 255, 255, 0.05);
      padding: 3px;
      border-radius: 6px;
      width: 100%;

      .tab-item {
        flex: 1;
        text-align: center;
        padding: 6px 0;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
        color: var(--theme-color-tran-70);

        &:hover { color: #fff; }
        &.active {
          background: var(--theme-color-primary, #3662ec);
          color: #fff;
          box-shadow: 0 2px 8px rgba(54, 98, 236, 0.3);
        }
      }
    }
  }

  .config-content {
    flex: 1;
    overflow-y: auto;
    
    .tab-pane {
      display: flex;
      flex-direction: column;
      gap: 6px;
      animation: fadeIn 0.3s ease;
    }

    .form-item {
      display: flex;
      gap: 10px;

      &.horizontal {
        flex-direction: row;
        align-items: center;
        
        .form-label {
          width: 60px;
          flex-shrink: 0;
          margin-bottom: 0;
        }
        
        .form-ctrl {
          flex: 1;
          min-width: 0;
        }

        .form-tip {
          position: absolute;
          left: 100px;
          bottom: -14px;
        }
      }

      &.vertical {
        flex-direction: column;
        gap: 8px;
        margin-bottom: 8px;
        
        .form-label {
          width: 100%;
        }
      }

      position: relative;
      padding: 6px 0;

      .form-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--theme-color-tran-70);
        display: flex;
        align-items: center;
        gap: 4px;

        &.header-with-actions {
          justify-content: space-between;
          .actions {
            display: flex;
            gap: 12px;
            
            .c-icon {
              cursor: pointer;
              opacity: 0.4;
              transition: all 0.2s;
              &:hover { opacity: 0.8; }
              &.active {
                opacity: 1;
                color: var(--theme-color-primary);
              }
            }
          }
        }

        .required {
          color: var(--theme-color-error, #ff4d4f);
        }
      }

      .form-tip {
        font-size: 11px;
        color: var(--theme-color-tran-45);
        margin-top: -4px;
      }
    }

    .static-pane {
      .editor-container {
        border: 1px solid var(--theme-color-real-gray-700);
        border-radius: 6px;
        overflow: hidden;
      }
    }

    .editor-wrapper.compact {
      border: 1px solid var(--theme-color-real-gray-700);
      border-radius: 4px;
      overflow: hidden;
      background: var(--db-color-code-background, #0a0a0a);
      
      :deep(.c-code-editor-content) {
        border: none;
        background: transparent;
      }
    }
  }

  .config-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--theme-color-real-gray-700);
    display: flex;
    justify-content: flex-end;
    background: var(--db-editor-panel-bg);

    .c-button {
      padding: 0 24px;
      height: 32px;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
