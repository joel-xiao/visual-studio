<template>
  <div class="redis-step-manager">
    <div class="manager-header">
      <div class="title">
        <BasicIcon icon="mdi:format-list-bulleted-type" font-size="16px" />
        <span>Redis 执行流</span>
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
          <div class="step-name">Redis 数据库配置</div>
          <div class="step-meta">实例地址与认证</div>
        </div>
        <div class="step-indicator"></div>
      </div>

      <div class="section-label">Redis 指令流水线</div>

      <div 
        v-for="(element, index) in steps" 
        :key="element.id" 
        class="step-item query-step-item"
        :class="[
          { active: modelValue === index },
          element.actionType || 'raw'
        ]"
        @click="$emit('update:modelValue', index)"
      >
        <div class="step-icon-box">
           <BasicIcon v-if="element.actionType === 'lua'" icon="mdi:script-text-outline" font-size="16px" />
           <BasicIcon v-else icon="mdi:console-line" font-size="16px" />
        </div>
        <div class="step-info">
          <div class="step-name-row">
            <span class="step-name ellipsis">{{ element.name || '未命名命令' }}</span>
            <span class="step-id copyable" @click.stop="copyId(element.id)">
              {{ element.id }}
            </span>
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
          <div class="add-btn raw" @click="addRawStep">
            <BasicIcon icon="mdi:console" font-size="18px" />
            <div class="btn-text">
              <span class="main">原生命令</span>
              <span class="sub">执行 Redis Command</span>
            </div>
          </div>
          <div class="add-btn lua" @click="addLuaStep">
            <BasicIcon icon="mdi:script-text-outline" font-size="18px" />
            <div class="btn-text">
              <span class="main">Lua 脚本</span>
              <span class="sub">执行复合事务逻辑</span>
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
          <div class="step-meta">最终数据输出处理</div>
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

function getStepMetaSummary(step: any): string {
  if (step.actionType === 'lua') return 'EVAL Lua Script';
  if (!step.command) return '待输入命令';
  return step.command.replace(/\s+/g, ' ').substring(0, 25) + (step.command.length > 25 ? '...' : '');
}

function addRawStep() {
  const newSteps = [...props.steps];
  const nextNumber = newSteps.length + 1;
  const newId = 'cmd_' + Math.random().toString(36).substr(2, 5);
  newSteps.push({
    id: newId,
    name: '命令 ' + nextNumber,
    actionType: 'raw',
    command: 'GET my_key',
    condition: '',
    variables: [{ key: '', value: '', description: '', enabled: true }],
    transformation: { script: 'return data;', type: 'raw' }
  });
  emit('change', newSteps);
  emit('update:modelValue', newSteps.length - 1);
}

function addLuaStep() {
  const newSteps = [...props.steps];
  const nextNumber = newSteps.length + 1;
  const newId = 'script_' + Math.random().toString(36).substr(2, 5);
  newSteps.push({
    id: newId,
    name: '脚本 ' + nextNumber,
    actionType: 'lua',
    command: 'return redis.call("GET", KEYS[1])',
    condition: '',
    variables: [{ key: '', value: '', description: '', enabled: true }],
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
.redis-step-manager {
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
      color: var(--redis-color-primary);
      flex: none;
      transition: all 0.2s;
      
      &.config { color: var(--theme-color-text-secondary); }
      &.transform { color: #f59e0b; }
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
      background: var(--redis-color-primary);
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
      border-color: var(--redis-color-primary-light);
      background: rgba(255, 255, 255, 0.02);
      .step-actions { opacity: 1; }
    }

    &.active {
      background: var(--redis-color-primary-light);
      border-color: var(--redis-color-primary);
      box-shadow: 0 0 0 1px var(--redis-color-primary), 0 4px 12px -4px rgba(239, 68, 68, 0.2);
      
      .step-indicator { width: 3px; }
      .step-icon-box { 
        background: var(--redis-color-primary); 
        color: #fff;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
      }
      .step-name { color: var(--theme-color-text-bold); font-weight: 700; }
      
      &.lua .step-icon-box { 
        background: var(--redis-color-accent-lua); 
        color: #000;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
      }
    }

    &.lua .step-icon-box { color: var(--redis-color-accent-lua); }
    &.lua:hover { border-color: var(--redis-color-accent-lua-light); }
    &.active.lua {
       background: var(--redis-color-accent-lua-light);
       border-color: var(--redis-color-accent-lua);
       box-shadow: 0 0 0 1px var(--redis-color-accent-lua), 0 4px 12px -4px rgba(245, 158, 11, 0.2);
       .step-indicator { background: var(--redis-color-accent-lua); }
    }
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
        background: var(--redis-color-primary-light);
        border-color: var(--redis-color-primary);
        transform: translateX(2px);
      }
      
      &.lua:hover {
        background: var(--redis-color-accent-lua-light);
        border-color: var(--redis-color-accent-lua);
      }
    }
  }

  .transformation-step {
    border-style: solid;
    margin-top: 4px;
    background: var(--db-main-color-left-bar-bg);
  }
}
</style>
