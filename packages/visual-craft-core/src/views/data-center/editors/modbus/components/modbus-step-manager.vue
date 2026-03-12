<template>
  <div class="modbus-step-manager">
    <div class="manager-header">
      <div class="title">
        <BasicIcon icon="mdi:timeline-text-outline" font-size="16px" />
        <span>指令采集控制流</span>
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
           <BasicIcon icon="mdi:cog-box" font-size="16px" />
        </div>
        <div class="step-info">
          <div class="step-name">Modbus TCP 连接</div>
          <div class="step-meta">网关地址与从站 ID</div>
        </div>
        <div class="step-indicator"></div>
      </div>

      <div class="section-label">指令列表 (Registers/Coils)</div>

      <div 
        v-for="(element, index) in steps" 
        :key="element.id" 
        class="step-item step-drag-item"
        :class="[
          { active: modelValue === index },
          isWriteFunc(element.functionCode) ? 'write' : 'read'
        ]"
        @click="$emit('update:modelValue', index)"
      >
        <div class="step-icon-box">
           <BasicIcon v-if="isWriteFunc(element.functionCode)" icon="mdi:pencil" font-size="16px" />
           <BasicIcon v-else icon="mdi:eye-outline" font-size="16px" />
           <span class="fc-badge">F{{ element.functionCode }}</span>
        </div>
        <div class="step-info">
          <div class="step-name-row">
            <span class="step-name ellipsis">{{ element.name || '未命名指令' }}</span>
            <span class="step-id copyable" @click.stop="copyId(element.id)">{{ element.id }}</span>
          </div>
          <div class="step-meta">
            {{ getStepMetaSummary(element) }}
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
          <div class="add-btn read" @click="addReadStep">
            <BasicIcon icon="mdi:plus-circle-outline" font-size="18px" />
            <div class="btn-text">
              <span class="main">添加读取指令</span>
              <span class="sub">读取线圈或寄存器数据</span>
            </div>
          </div>
          <div class="add-btn write" @click="addWriteStep">
            <BasicIcon icon="mdi:pencil-plus-outline" font-size="18px" />
            <div class="btn-text">
              <span class="main">添加写入指令</span>
              <span class="sub">向设备状态进行写入控制</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-label mt-20">组装输出处理</div>

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
          <div class="step-meta">多寄存器数据对齐输出</div>
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

function isWriteFunc(code: number) {
  return [5, 6, 15, 16].includes(code);
}

function getStepMetaSummary(step: any): string {
  const addrStr = `Addr: ${step.address || 0}`;
  if (isWriteFunc(step.functionCode)) {
    return `${addrStr} | Val: ${JSON.stringify(step.value ?? 0)}`;
  }
  return `${addrStr} | Qty: ${step.quantity || 1}`;
}

function generateNewId(prefix: string) {
  return prefix + Math.random().toString(36).substr(2, 5);
}

function addReadStep() {
  const newSteps = [...props.steps];
  newSteps.push({
    id: generateNewId('mbr_'),
    name: '读取寄存器 ' + (newSteps.length + 1),
    functionCode: 3,
    address: 0,
    quantity: 1,
    condition: '',
    transformation: { script: 'return data;', type: 'raw' }
  });
  emit('change', newSteps);
  emit('update:modelValue', newSteps.length - 1);
}

function addWriteStep() {
  const newSteps = [...props.steps];
  newSteps.push({
    id: generateNewId('mbw_'),
    name: '写入寄存器 ' + (newSteps.length + 1),
    functionCode: 6,
    address: 0,
    value: 0,
    condition: '',
    transformation: { script: 'return data;', type: 'raw' }
  });
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
.modbus-step-manager {
  height: 100%;
  background: var(--db-editor-color-panel-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .manager-header {
    height: 52px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--db-main-border-black);
    background: var(--db-main-color-left-bar-bg);
    
    .title {
      font-size: 14px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .badge {
      background: var(--db-main-border-black);
      padding: 0 10px;
      height: 20px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 800;
      color: var(--modbus-color-primary);
      display: flex;
      align-items: center;
    }
  }

  .mt-20 { margin-top: 24px; }

  .steps-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 2px; }
  }

  .section-label {
    font-size: 11px;
    font-weight: 800;
    color: var(--theme-color-text-secondary);
    opacity: 0.5;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 16px;
    margin-bottom: 6px;
    padding-left: 6px;
    flex: none;
  }

  .step-item {
    padding: 14px 16px;
    background: var(--db-main-color-left-bar-bg);
    border: 1px solid var(--theme-color-border);
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    .step-icon-box {
      width: 36px;
      height: 36px;
      background: var(--db-main-border-black);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--modbus-color-primary);
      flex: none;
      transition: all 0.2s;
      position: relative;
      
      .fc-badge {
         font-size: 8px;
         font-weight: 800;
         margin-top: -2px;
         opacity: 0.8;
      }

      &.config { color: var(--theme-color-text-secondary); .fc-badge { display: none; } }
      &.transform { color: #f59e0b; .fc-badge { display: none; } }
    }
    
    .step-info {
      flex: 1;
      min-width: 0;

      .step-name-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .step-name { 
        font-size: 13px; 
        font-weight: 700; 
        color: var(--theme-color-text-bold); 
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .step-id { 
        font-size: 10px; 
        color: var(--theme-color-text-secondary); 
        background: rgba(0, 0, 0, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
        opacity: 0.6;
        flex: none;
      }
      .step-meta { 
        font-size: 11px; 
        color: var(--theme-color-text-secondary); 
        opacity: 0.6; 
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
      background: var(--modbus-color-primary);
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

    &:hover {
      border-color: var(--modbus-color-primary-light);
      background: rgba(255, 255, 255, 0.02);
      .step-actions { opacity: 1; }
    }

    &.active {
      background: var(--modbus-color-primary-light);
      border-color: var(--modbus-color-primary);
      box-shadow: 0 0 0 1px var(--modbus-color-primary), 0 4px 12px -4px rgba(168, 85, 247, 0.2);
      
      .step-indicator { width: 4px; }
      .step-icon-box { 
        background: var(--modbus-color-primary); 
        color: #fff;
        box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);
      }
      .step-name { color: var(--theme-color-text-bold); }
      
      &.write .step-icon-box { 
        background: var(--modbus-color-accent-write); 
        box-shadow: 0 2px 8px rgba(244, 63, 94, 0.3);
      }
    }

    &.write .step-icon-box { color: var(--modbus-color-accent-write); }
    &.write:hover { border-color: var(--modbus-color-accent-write-light); }
    &.active.write {
       background: var(--modbus-color-accent-write-light);
       border-color: var(--modbus-color-accent-write);
       box-shadow: 0 0 0 1px var(--modbus-color-accent-write), 0 4px 12px -4px rgba(244, 63, 94, 0.2);
       .step-indicator { background: var(--modbus-color-accent-write); }
    }
  }

  .manager-footer {
    margin-top: 16px;
    flex: none;

    .add-actions-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .add-btn {
      padding: 14px 16px;
      background: var(--db-main-color-left-bar-bg);
      border: 1px dashed var(--theme-color-border);
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      transition: all 0.2s;
      
      .btn-text {
        display: flex;
        flex-direction: column;
        .main { font-size: 13px; font-weight: 700; color: var(--theme-color-text-bold); }
        .sub { font-size: 11px; color: var(--theme-color-text-secondary); opacity: 0.6; margin-top: 4px; }
      }

      &:hover {
        background: var(--modbus-color-primary-light);
        border-color: var(--modbus-color-primary);
        transform: translateY(-2px);
      }
      
      &.write:hover {
        background: var(--modbus-color-accent-write-light);
        border-color: var(--modbus-color-accent-write);
      }
    }
  }

  .transformation-step {
    border-style: solid;
    background: var(--db-main-color-left-bar-bg);
  }
}
</style>
