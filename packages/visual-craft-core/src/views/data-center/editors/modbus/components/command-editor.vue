<template>
  <div class="modbus-command-editor">
    <!-- Tab Navigation -->
    <div class="config-tabs">
      <div 
        v-for="t in tabs" 
        :key="t.id"
        class="tab-item"
        :class="{ active: activeTab === t.id }"
        @click="activeTab = t.id"
      >
        <BasicIcon :icon="t.icon" font-size="14px" />
        {{ t.name }}
      </div>
    </div>

    <div class="tab-pane">
      <!-- Command Params Tab -->
      <div v-if="activeTab === 'behavior'" class="behavior-section">
        <div class="action-toolbar">
          <div class="toolbar-left">
            <div class="param-group">
              <span class="label"><BasicIcon icon="mdi:function" font-size="13px" /> 指令类型 (Function Code)</span>
              <div class="select-wrap" style="width: 280px">
                <CSelect 
                  icon="mdi:swap-vertical-variant"
                  v-model="step.functionCode" 
                  :options="functionOptions" 
                  size="small" 
                  @update:model-value="(v: number) => updateStep('functionCode', v)" 
                />
              </div>
            </div>
            <div class="param-group">
               <span class="label"><BasicIcon icon="mdi:ray-start-arrow" font-size="13px" /> 起始地址 (Offset)</span>
               <div class="input-wrap" style="width: 120px">
                  <CInput :model-value="String(step.address || 0)" @update:model-value="(v: string) => updateStep('address', Number(v) || 0)" />
               </div>
            </div>
          </div>
          <div class="toolbar-right">
             <CButton 
               :class="['exec-btn', isWrite ? 'write' : '']"
               size="small" 
               icon="mdi:play" 
               @click="$emit('send')"
             >
               立即执行 (Mock)
             </CButton>
          </div>
        </div>

        <div class="form-body">
           <!-- Read Parameters -->
           <div v-if="!isWrite" class="read-params-wrap">
              <div class="form-row">
                 <div class="label"><BasicIcon icon="mdi:counter" font-size="14px" /> 读取数量 (Quantity)</div>
                 <div class="input-wrap" style="max-width: 200px">
                    <CInput 
                      :model-value="String(step.quantity || 1)" 
                      suffix="位数/寄存器"
                      @update:model-value="(v: string) => updateStep('quantity', Number(v) || 1)" 
                    />
                 </div>
                 <div class="field-hint">一次性连续读取的最大长度 (通常 1-125 之间)。</div>
              </div>
           </div>

           <!-- Write Parameters -->
           <div v-else class="write-params-wrap">
              <div class="form-row">
                 <div class="label"><BasicIcon icon="mdi:pencil-circle" font-size="14px" /> 分发载荷值 (Value to Write)</div>
                 <div class="editor-wrap">
                    <CCodeEditor 
                      :model-value="typeof step.value === 'object' ? JSON.stringify(step.value, null, 2) : String(step.value ?? '')" 
                      language="json" 
                      placeholder="单一寄存器请填入数字，例如：256\n多寄存器或线圈请填入数组，例如：[10, 20, 30] 或 [true, false]"
                      @update:model-value="(val: string) => {
                         try {
                           const parsed = JSON.parse(val);
                           updateStep('value', parsed);
                         } catch(e) {
                           const num = Number(val);
                           if (!isNaN(num)) updateStep('value', num);
                         }
                      }"
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <!-- Condition Tab -->
      <div v-if="activeTab === 'condition'" class="condition-section">
         <div class="field-label">
            <BasicIcon icon="mdi:filter-check-outline" font-size="16px" class="sec-icon" />
            <span>执行前置条件控制</span>
            <span class="tip">仅当前置条件成立时，才会发起真实 Modbus 通信操作</span>
         </div>
         <div class="editor-wrap">
           <CCodeEditor
             :model-value="step.condition"
             language="javascript"
             placeholder="// 例如，只在上一步读取的数据大于 100 时，才执行此写入操作：\n// return results.mbr_1 > 100;"
             @update:model-value="(val: string) => updateStep('condition', val)"
           />
         </div>
      </div>

      <!-- Transform Tab -->
      <div v-if="activeTab === 'transform'" class="transform-section">
        <div class="field-label">
          <BasicIcon icon="mdi:auto-fix" font-size="16px" class="sec-icon purple" />
          <span>采集数据结构清洗</span>
          <span class="tip">将长串大/小端 Uint16 或 boolean 数组组装成具体业务数据</span>
        </div>
        <div class="editor-wrap">
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
import { ref, computed, onMounted } from 'vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import TransformationEditor from '../../sql/components/transformation-editor.vue';

const props = defineProps<{
  step: any;
}>();

const emit = defineEmits(['update:step', 'send']);

const activeTab = ref('behavior');

const tabs = [
  { id: 'behavior', name: '指令行为与参数', icon: 'mdi:play-box-outline' },
  { id: 'condition', name: '前置执行判断', icon: 'mdi:filter-variant' },
  { id: 'transform', name: '数据清洗', icon: 'mdi:swap-horizontal-bold' }
];

const functionOptions = [
  { label: '01 - 读取线圈状态 (Read Coils)', value: 1 },
  { label: '02 - 读取离散输入状态 (Read Discrete)', value: 2 },
  { label: '03 - 读取保持寄存器 (Read Holding)', value: 3 },
  { label: '04 - 读取输入寄存器 (Read Input)', value: 4 },
  { label: '05 - 写入单个线圈 (Write Single Coil)', value: 5 },
  { label: '06 - 写入单个寄存器 (Write Single Register)', value: 6 },
  { label: '15 - 写入多个线圈 (Write Multiple Coils)', value: 15 },
  { label: '16 - 写入多个寄存器 (Write Multiple Registers)', value: 16 }
];

const isWrite = computed(() => [5, 6, 15, 16].includes(props.step.functionCode));

function updateStep(field: string, value: any) {
  emit('update:step', { ...props.step, [field]: value });
}

onMounted(() => {
  if (!props.step.transformation) {
    updateStep('transformation', { type: 'raw', script: 'return data;' });
  }
});
</script>

<style lang="scss" scoped>
.modbus-command-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-editor-color-panel-bg);

  .config-tabs {
    flex: none;
    height: 46px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 32px;
    border-bottom: 1px solid var(--db-main-border-black);
    background: var(--db-main-color-left-bar-bg);

    .tab-item {
      font-size: 13px;
      color: var(--theme-color-text-secondary);
      opacity: 0.6;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      height: 100%;
      position: relative;
      transition: all 0.2s;
      
      &:hover { color: var(--theme-color-text-bold); }

      &.active {
        color: var(--modbus-color-primary);
        opacity: 1;
        font-weight: 700;
        &:after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: -4px;
          right: -4px;
          height: 3px;
          background: var(--modbus-color-primary);
          border-radius: 3px 3px 0 0;
        }
      }
    }
  }

  .tab-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .behavior-section {
    display: flex;
    flex-direction: column;
    height: 100%;

    .action-toolbar {
      flex: none;
      height: 54px;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--db-main-border-black);
      background: var(--db-main-color-left-bar-bg);

      .toolbar-left {
         display: flex;
         gap: 24px;
         .param-group {
           display: flex;
           align-items: center;
           gap: 12px;
           .label { font-size: 12px; font-weight: 700; color: var(--theme-color-text-secondary); }
         }
      }

      .toolbar-right {
        .exec-btn {
          background: var(--modbus-color-primary) !important;
          border-color: var(--modbus-color-primary) !important;
          color: #fff;
          font-weight: 600;
          border-radius: 6px;
          padding: 0 16px;
          &:hover { opacity: 0.9; box-shadow: 0 2px 8px var(--modbus-color-primary-light); }
          
          &.write {
             background: var(--modbus-color-accent-write) !important;
             border-color: var(--modbus-color-accent-write) !important;
             &:hover { box-shadow: 0 2px 8px var(--modbus-color-accent-write-light); }
          }
        }
      }
    }

    .form-body {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
    }

    .read-params-wrap, .write-params-wrap {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 800px;
      
      .form-row {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .label {
          font-size: 13px;
          font-weight: 700;
          color: var(--theme-color-text-bold);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .field-hint {
          font-size: 11px;
          color: var(--theme-color-text-secondary);
          opacity: 0.7;
        }

        .editor-wrap {
          height: 180px;
          border: 1px solid var(--theme-color-border);
          border-radius: 8px;
          overflow: hidden;
        }
      }
    }
  }

  .condition-section,
  .transform-section {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 900px;

    .field-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      .sec-icon { color: var(--modbus-color-primary); &.purple { color: #f59e0b; } }
      .tip { font-size: 12px; font-weight: 400; color: var(--theme-color-text-secondary); opacity: 0.6; margin-left: auto; }
    }

    .editor-wrap {
      height: 400px;
      border: 1px solid var(--theme-color-border);
      border-radius: 8px;
      overflow: hidden;
    }
  }
}
</style>
