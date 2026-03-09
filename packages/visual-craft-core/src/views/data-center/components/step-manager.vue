<template>
  <div class="step-manager">
    <div class="steps-list">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id" 
        class="step-item"
        :class="{ active: modelValue === index }"
        @click="$emit('update:modelValue', index)"
      >
        <div class="step-num">{{ index + 1 }}</div>
        <div class="step-info">
          <div class="step-name-row">
            <span class="step-name" v-hint="step.name">{{ step.name || '未命名步骤' }}</span>
            <span class="step-id copyable" @click.stop="copyId(step.id)">
              {{ step.id }}
              <BasicIcon icon="mdi:content-copy" font-size="9px" class="copy-icon" />
            </span>
          </div>
          <div class="step-meta" v-hint="step.url">{{ step.method }} {{ step.url || '未填写地址' }}</div>
        </div>
        <div class="step-actions">
           <div class="order-btns">
             <BasicIcon icon="mdi:chevron-up" @click.stop="moveStep(index, -1)" :class="{ disabled: index === 0 }" />
             <BasicIcon icon="mdi:chevron-down" @click.stop="moveStep(index, 1)" :class="{ disabled: index === steps.length - 1 }" />
           </div>
           <BasicIcon icon="mdi:delete-outline" class="del-btn" @click.stop="removeStep(index)" />
        </div>
      </div>
      <div class="step-actions-footer">
        <div class="add-step" @click="addStep">
          <BasicIcon icon="mdi:plus" />
          <span>新建请求</span>
        </div>
        <div class="add-step ref-step" @click="$emit('add-ref')">
          <BasicIcon icon="mdi:link-variant" />
          <span>引用接口</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Special Transformation Step -->
      <div 
        class="step-item transformation-step"
        :class="{ active: modelValue === -1 }"
        @click="$emit('update:modelValue', -1)"
      >
        <div class="step-num"><BasicIcon icon="mdi:function-variant" font-size="14px" /></div>
        <div class="step-info">
          <div class="step-name">结果数据转换</div>
          <div class="step-meta">JavaScript 脚本封装</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { hintDirective } from '../../../directives/hint';
export default {
  directives: {
    hint: hintDirective
  }
};
</script>

<script setup lang="ts">
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import { getUuid, copyToClipboard } from '@/assets/utils/index';

const props = defineProps<{
  steps: any[];
  modelValue: number;
}>();

const emit = defineEmits(['update:modelValue', 'change', 'add-ref']);

const copyId = async (id: string) => {
  const success = await copyToClipboard(id);
  // Ideally, show a toast or message. For now, simple console log or hint change.
}

function addStep() {
  const nextNumber = props.steps.length + 1;
  const newStep = {
    id: 'step' + nextNumber,
    name: '步骤 ' + nextNumber,
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '', enabled: true }],
    bodyMode: 'none',
    bodyParams: [{ key: '', value: '', enabled: true }]
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
    emit('update:modelValue', newSteps.length - 1);
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
.step-manager {
  height: 100%;
  background: var(--db-editor-color-panel-bg);
  border-right: 1px solid var(--db-main-border-black);
  display: flex;
  flex-direction: column;
  
  .steps-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .step-item {
    padding: 12px;
    background: var(--db-main-color-card-bg);
    border: 1px solid var(--theme-color-border);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s;
    position: relative;
    
    .step-num {
      width: 24px;
      height: 24px;
      background: var(--theme-color-gray-100);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--theme-color-text-secondary);
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
        font-weight: 600; 
        color: var(--theme-color-text-bold); 
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .step-id { 
        font-size: 10px; 
        color: var(--theme-color-text-secondary); 
        background: var(--theme-color-gray-100);
        padding: 0 6px;
        padding-right: 0px;
        border-radius: 4px;
        opacity: 0.8;
        flex: none;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s;
        
        &.copyable {
          .copy-icon { opacity: 1; transform: scale(0.7); }
          &:hover {
             background: var(--theme-color-blue-100);
             color: var(--theme-color-blue-700);
          }
        }
      }
      .step-meta { font-size: 11px; color: var(--theme-color-text-secondary); opacity: 0.6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }
    
    .step-actions {
      opacity: 0;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
      gap: 4px;
      
      .order-btns {
        display: flex;
        flex-direction: column;
        color: var(--theme-color-text-secondary);
        .basic-icon {
          font-size: 12px;
          &:hover:not(.disabled) { color: var(--theme-color-blue-700); }
          &.disabled { opacity: 0.2; cursor: not-allowed; }
        }
      }
      
      .del-btn {
        color: var(--theme-color-text-secondary);
        &:hover { color: var(--db-main-color-post); }
      }
    }
    
    &:hover {
      border-color: var(--theme-color-blue-700);
      .step-actions { opacity: 1; }
    }
    
    &.active {
      border-color: var(--theme-color-blue-700);
      background: rgba(54, 98, 236, 0.08);
      color: var(--theme-color-blue-700);
      .step-num { background: var(--theme-color-blue-700); color: #fff; }
    }
  }

  .step-actions-footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .add-step {
    padding: 10px;
    border: 1px dashed var(--theme-color-border);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--theme-color-text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { border-color: var(--theme-color-blue-700); color: var(--theme-color-blue-700); background: var(--theme-color-gray-50); }
    
    &.ref-step {
       border-style: solid;
       background: var(--theme-color-gray-50);
       &:hover { background: var(--theme-color-gray-100); }
    }
  }

  .divider {
    height: 1px;
    background: var(--db-main-border-black);
    margin: 8px 0;
  }

  .transformation-step {
    border-style: solid;
    background: var(--db-main-color-left-bar-bg);
    .step-num { 
      background: var(--theme-color-blue-100); 
      color: var(--theme-color-blue-700); 
      .basic-icon { font-size: 12px; }
    }
    &.active {
      background: rgba(var(--theme-color-blue-700-rgb), 0.05);
      .step-num { background: var(--theme-color-blue-700); color: #fff; }
    }
  }
}
</style>
