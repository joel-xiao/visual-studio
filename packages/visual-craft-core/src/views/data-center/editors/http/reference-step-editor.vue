<template>
  <div class="reference-step-view">
    <div class="ref-banner">
      <BasicIcon icon="mdi:link-variant" font-size="32px" />
      <div class="text-group">
        <div class="title">引用接口步骤</div>
        <div class="subtitle">该步骤将自动调用已配置的外部接口：<b>{{ step.name }}</b></div>
      </div>
    </div>

    <div class="ref-config-card">
      <div class="card-item">
        <label>接口 ID</label>
        <span>{{ step.refId }}</span>
      </div>
      <div class="card-item">
        <label>请求方法</label>
        <span class="method-tag">{{ step.method }}</span>
      </div>
      <div class="card-item">
        <label>接口地址</label>
        <span>{{ step.url }}</span>
      </div>
    </div>

    <div class="transformation-section">
      <div class="form-title">结果数据转换 (JS Code)</div>
      <p class="tip">通过编写 JS 代码转换上一步的输出结果，可作为下一步的输入。使用 `data` 变量访问上一步结果。</p>
      <TransformationEditor :model-value="step.transformation" @update:model-value="onTransformChange" />
    </div>

    <div v-if="isCascading" class="condition-section">
      <div class="form-title">执行条件</div>
      <CCodeEditor :model-value="step.condition" @update:model-value="onConditionChange" placeholder="例如: results.step1.success === true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import TransformationEditor from '../../components/transformation-editor.vue';

const props = defineProps<{
  step: any;
  isCascading: boolean;
}>();

const emit = defineEmits(['update:step']);

function updateStep(field: string, value: any) {
  emit('update:step', { ...props.step, [field]: value });
}

function onTransformChange(transformation: any) {
  updateStep('transformation', transformation);
}

function onConditionChange(condition: string) {
  updateStep('condition', condition);
}
</script>

<style lang="scss" scoped>
.reference-step-view {
  padding: 32px;
  .ref-banner {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 32px;
    color: var(--theme-color-blue-700);
    .text-group {
      .title { font-size: 20px; font-weight: 700; color: var(--theme-color-text-bold); }
      .subtitle { font-size: 14px; color: var(--theme-color-text-secondary); margin-top: 4px; }
    }
  }
  .ref-config-card {
    background: var(--theme-color-gray-50);
    border: 1px solid var(--theme-color-border);
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
    .card-item {
      display: flex;
      align-items: center;
      label { width: 100px; font-size: 13px; color: var(--theme-color-text-secondary); }
      span { font-size: 14px; font-weight: 600; color: var(--theme-color-text-bold); word-break: break-all; }
      .method-tag { background: rgba(54, 98, 236, 0.1); color: var(--theme-color-blue-700); padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    }
  }
  .transformation-section {
    margin-top: 24px;
    margin-bottom: 24px;
    background: rgba(54, 98, 236, 0.05);
    padding: 16px;
    border-radius: 8px;
    border: 1px dashed var(--theme-color-blue-700);
    .form-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; color: var(--theme-color-blue-700); }
    .tip { font-size: 11px; color: var(--theme-color-text-secondary); margin-top: 6px; margin-bottom: 12px; }
  }
  .condition-section {
     margin-bottom: 24px;
     background: rgba(54, 98, 236, 0.05);
     padding: 16px;
     border-radius: 8px;
     border: 1px dashed var(--theme-color-blue-700);
     .form-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; color: var(--theme-color-blue-700); }
     .tip { font-size: 11px; color: var(--theme-color-text-secondary); margin-top: 6px; }
  }
}
</style>
