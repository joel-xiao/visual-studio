<template>
  <div class="wizard-editor">
    <!-- Left Stepper Sider (Screenshot 4/5) -->
    <div class="wizard-sider">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id" 
        class="step-item"
        :class="{ active: currentStepIndex >= index, current: currentStepIndex === index }"
        @click="currentStepIndex = index"
      >
        <div class="step-dot"></div>
        <div class="step-label" :data-text="step.label">{{ step.label }}</div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="wizard-main">
      <div class="wizard-header">
         <div class="info-link">
            使用文档: <a href="#">查看详情</a>
         </div>
      </div>

      <div class="wizard-content">
         <!-- Section: DIP Instance Config -->
         <div class="config-section">
            <div class="section-title">
               <span class="dot"></span>
               类型配置
            </div>
            <div class="form-row">
               <div class="label">选择配置 <span class="required">*</span></div>
               <div class="input-wrap">
                  <CSelect v-model="config.instanceType" :options="instanceOptions" />
               </div>
            </div>
         </div>

         <!-- Section: DIP Instance Details -->
         <div class="config-section">
            <div class="section-title">
               <span class="dot"></span>
               接口实例配置
            </div>
            <div class="form-row">
               <div class="label">名称 <span class="required">*</span></div>
               <div class="input-wrap">
                  <CInput v-model="config.name" placeholder="请输入名称" />
               </div>
            </div>
         </div>

         <!-- Section: IN Config (Screenshot 4) -->
         <div v-if="config.type !== 'script'" class="config-section">
            <div class="section-title">
               <span class="dot"></span>
               IN 配置
            </div>
            <div class="form-row">
               <div class="label">线程间隔 (秒) <span class="required">*</span></div>
               <div class="input-wrap">
                  <CInput v-model="config.interval" placeholder="2" suffix-icon="mdi:help-circle-outline" />
               </div>
            </div>
            <div class="form-row">
               <div class="label">失败重连次数 <span class="required">*</span></div>
               <div class="input-wrap">
                  <CInput v-model="config.retries" placeholder="1" suffix-icon="mdi:help-circle-outline" />
               </div>
            </div>
            <div class="form-row">
               <div class="label">URL 地址 <span class="required">*</span></div>
               <div class="input-wrap">
                  <CInput v-model="config.url" placeholder="http://0.0.0.0:10010/http" />
               </div>
            </div>
         </div>

         <!-- Section: Script Config (Screenshot 5) -->
         <div v-if="config.type === 'script'" class="config-section script-section">
            <div class="section-title">
               <span class="dot"></span>
               脚本配置
            </div>
            <div class="script-editor-container">
               <CCodeEditor v-model="config.script" language="javascript" class="script-editor" />
            </div>
         </div>

         <!-- Section: Capture Data (Screenshot 4) -->
         <div class="config-section">
            <div class="section-title">
               <span class="dot"></span>
               提取数据
            </div>
            <div class="data-table-wrap">
               <KVEditor v-model="config.dataFields" label-key="资产ID" label-value="指标" label-desc="值" />
            </div>
            <CButton quaternary size="small" class="add-btn" icon="mdi:plus">添加</CButton>
         </div>
      </div>

      <!-- Actions Bottom (Screenshot 4) -->
      <div class="wizard-footer">
         <CButton quaternary size="small" @click="$emit('cancel')">返回主页</CButton>
         <CButton quaternary size="small">上一步</CButton>
         <CButton primary size="small" class="save-btn" @click="submit">保存</CButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import KVEditor from '../components/kv-editor.vue';

const props = defineProps<{ initialData: any }>();
const emit = defineEmits(['save', 'cancel']);

const currentStepIndex = ref(0);
const docUrl = 'https://support.thingjs.com/book/dix-docs/6317837d65a76c00d910d18';

const steps = [
  { id: 'step', label: 'Step' },
  { id: 'steps', label: '步骤' },
  { id: 'dip-config', label: '接口实例配置' },
  { id: 'in-config', label: '接入配置' },
  { id: 'extract-data', label: '提取数据' }
];

const config = reactive({
  ...props.initialData,
  instanceType: 'DIX_SCHEDULED_TRANSMISSION',
  interval: '2',
  retries: '1',
  url: 'http://0.0.0.0:10010/http',
  script: 'function run() {\n  \n}',
  dataFields: [{ key: '车床01', value: '主轴', description: '[[20,100], [5,50, 50,50]]' }]
});

const instanceOptions = [
  { label: 'DIX_SCHEDULED_TRANSMISSION', value: 'DIX_SCHEDULED_TRANSMISSION' },
  { label: 'MQTT', value: 'MQTT' }
];

function submit() {
  emit('save', config);
}

defineExpose({ submit });
</script>

<style lang="scss" scoped>
.wizard-editor {
  display: flex;
  height: 100%;
  background: var(--db-color-main);

  .wizard-sider {
    width: 200px;
    background: var(--db-main-color-left-bar-bg);
    border-right: 1px solid var(--db-main-border-black);
    padding: 40px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .step-item {
      display: flex;
      align-items: center;
      padding: 10px 24px;
      gap: 12px;
      cursor: pointer;
      color: var(--theme-color-text-secondary);
      font-size: 13px;
      position: relative;
      
      .step-dot {
        width: 6px;
        height: 6px;
        background: var(--theme-color-gray-600);
        border-radius: 50%;
        transition: all 0.2s;
      }
      .step-label {
        transition: all 0.2s;
        display: inline-flex;
        flex-direction: column;
        &::before {
          content: attr(data-text);
          height: 0;
          visibility: hidden;
          overflow: hidden;
          user-select: none;
          font-weight: 700;
        }
      }

      &.active {
        color: var(--theme-color-text-bold);
        .step-dot { background: var(--db-main-color-post); box-shadow: 0 0 0 4px var(--theme-color-gray-50); }
      }
      &.current {
        background: var(--theme-color-gray-100);
        .step-label { font-weight: 700; }
        &:after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--db-main-color-post);
        }
      }
    }
  }

  .wizard-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--db-main-color-card-bg);
    margin: 20px;
    border-radius: var(--border-radius-4);
    border: 1px solid var(--db-main-border-black);

    .wizard-header {
      padding: 24px 40px;
      .info-link { font-size: 13px; color: var(--theme-color-blue-700); a { text-decoration: none; color: inherit; &:hover { text-decoration: underline; } } }
    }

    .wizard-content {
      flex: 1;
      padding: 0 40px 40px;
      overflow-y: auto;

      .config-section {
        margin-bottom: 40px;
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--db-main-color-post);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          .dot { width: 6px; height: 6px; background: var(--db-main-color-post); border-radius: 1px; transform: rotate(45deg); }
        }
        
        .form-row {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          .label { width: 140px; font-size: 13px; color: var(--theme-color-text-secondary); .required { color: #f5222d; } }
          .input-wrap { width: 400px; }
        }
      }

      .script-section {
        .script-editor-container {
          border: 1px solid var(--theme-color-border);
          height: 300px;
          border-radius: var(--border-radius-4);
          overflow: hidden;
        }
      }
      
      .data-table-wrap { width: 100%; }
      .add-btn { margin-top: 12px; color: var(--db-main-color-post); }
    }

    .wizard-footer {
      padding: 20px 40px;
      border-top: 1px solid var(--theme-color-border);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      .save-btn { background: var(--db-main-color-post); color: var(--theme-color-text-bold-white); width: 80px; &:hover { opacity: 0.9; } }
    }
  }
}
</style>
