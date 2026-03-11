<template>
  <div class="mqtt-step-manager">
    <div class="sider-section main-config">
      <div 
        class="config-item" 
        :class="{ active: modelValue === -2 }"
        @click="$emit('update:modelValue', -2)"
      >
        <BasicIcon icon="mdi:server-network" font-size="16px" class="icon" />
        <div class="info">
           <div class="name">Broker 连接配置</div>
           <div class="sub">服务器地址与认证</div>
        </div>
      </div>
      <div 
        class="config-item" 
        :class="{ active: modelValue === -1 }"
        @click="$emit('update:modelValue', -1)"
      >
        <BasicIcon icon="mdi:tray-arrow-up" font-size="16px" class="icon" />
        <div class="info">
           <div class="name">数据输出转换</div>
           <div class="sub">最终处理逻辑</div>
        </div>
      </div>
    </div>

    <div class="sider-divider">
       <span>发布与订阅步骤</span>
       <BasicIcon 
         icon="mdi:plus-circle-outline" 
         class="add-icon" 
         font-size="14px"
         @click="addStep"
       />
    </div>

    <div class="steps-list">
      <div 
        v-for="(element, index) in steps" 
        :key="element.id" 
        class="step-item"
        :class="{ active: modelValue === index }"
        @click="$emit('update:modelValue', index)"
      >
        <div class="step-num">{{ index + 1 }}</div>
        <div class="step-info">
           <div class="step-name ellipsis">{{ element.name }}</div>
           <div class="step-meta">
             <span class="topic-preview ellipsis">{{ element.topic || '未配置主题' }}</span>
           </div>
        </div>
        <div class="step-actions">
           <div class="order-btns">
              <BasicIcon 
                icon="mdi:chevron-up" 
                font-size="14px" 
                :class="{ disabled: index === 0 }" 
                @click.stop="moveStep(index, -1)" 
              />
              <BasicIcon 
                icon="mdi:chevron-down" 
                font-size="14px" 
                :class="{ disabled: index === steps.length - 1 }" 
                @click.stop="moveStep(index, 1)" 
              />
           </div>
           <BasicIcon 
             icon="mdi:close" 
             class="del-btn" 
             font-size="12px" 
             @click.stop="removeStep(index)" 
           />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BasicIcon from '@/views/ui/base/basic-icon.vue';

const props = defineProps<{
  steps: any[];
  modelValue: number;
}>();

const emit = defineEmits(['update:modelValue', 'change']);

function addStep() {
  const newSteps = [...props.steps];
  const newId = 'step_' + Math.random().toString(36).substr(2, 5);
  newSteps.push({
    id: newId,
    name: '新步骤 ' + (newSteps.length + 1),
    action: 'publish',
    topic: '',
    qos: 1,
    retain: false,
    payload: '{}',
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
.mqtt-step-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 0;

  .sider-section {
    padding: 0 12px;
    margin-bottom: 24px;
  }

  .config-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 8px;
    border: 1px solid transparent;

    .icon { color: var(--theme-color-text-secondary); opacity: 0.7; }
    .name { font-size: 13px; font-weight: 600; color: var(--theme-color-text-bold); }
    .sub { font-size: 11px; color: var(--theme-color-text-secondary); opacity: 0.6; margin-top: 2px; }

    &:hover { background: var(--theme-color-gray-100); }
    &.active {
      background: rgba(129, 140, 248, 0.08);
      border-color: rgba(129, 140, 248, 0.2);
      .icon { color: #818cf8; opacity: 1; }
      .name { color: #818cf8; }
    }
  }

  .sider-divider {
    padding: 0 20px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 700;
    color: var(--theme-color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.6;
    
    .add-icon {
      cursor: pointer;
      &:hover { color: #818cf8; opacity: 1; }
    }
  }

  .steps-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .step-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: var(--db-main-color-left-bar-bg);
    border: 1px solid var(--db-main-border-black);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: var(--theme-color-border);
      .step-actions .del-btn { opacity: 0.6; }
    }

    &.active {
      background: rgba(129, 140, 248, 0.05);
      border-color: #818cf8;
      box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.2);
      .step-num { background: #818cf8; color: #fff; }
      .step-name { color: var(--theme-color-text-bold); font-weight: 700; }
    }

    .step-num {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--theme-color-gray-200);
      color: var(--theme-color-text-secondary);
      border-radius: 4px;
      font-size: 10px;
      font-weight: 800;
      flex-shrink: 0;
    }

    .step-info {
       flex: 1;
       min-width: 0;
       .step-name { font-size: 12px; font-weight: 600; color: var(--theme-color-text-secondary); margin-bottom: 2px; }
       .step-meta {
         display: flex;
         align-items: center;
         gap: 6px;
         .type-tag {
           font-size: 9px;
           text-transform: uppercase;
           font-weight: 800;
           padding: 0px 4px;
           border-radius: 3px;
           &.publish { color: #818cf8; background: rgba(129, 140, 248, 0.1); }
           &.subscribe { color: #10b981; background: rgba(16, 185, 129, 0.1); }
         }
         .topic-preview { font-size: 10px; color: var(--theme-color-text-secondary); opacity: 0.5; }
       }
    }

    .step-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      .more-icon { opacity: 0.3; }
      .del-btn {
        opacity: 0;
        transition: all 0.2s;
        &:hover { color: #f87171; }
      }
    }
  }

  .ghost-step {
    opacity: 0.3;
    background: #818cf8;
  }
}
</style>
