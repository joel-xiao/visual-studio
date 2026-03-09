<template>
  <div class="script-step-editor">
    <div class="header-tip">
      <BasicIcon icon="mdi:script-text-outline" />
      <div class="text-content">
        <div class="title">逻辑加工步骤 (Logic Step)</div>
        <div class="desc">在这里编写 JavaScript 代码进行数据拼接、解析或状态暂存。返回的对象将存入 <code>results.{{ step.id }}</code>。</div>
      </div>
    </div>

    <div class="editor-main">
      <div class="field-label">
        <span>脚本逻辑</span>
        <span class="tip">支持访问 <code>results</code> 全局上下文</span>
      </div>
      <div class="code-editor-wrap">
        <CCodeEditor
          :model-value="step.script"
          language="javascript"
          placeholder="// 示例: \nconst token = results.login.data.token;\nreturn { \n  authHeader: 'Bearer ' + token, \n  ts: Date.now() \n};"
          @update:model-value="(val) => $emit('update:step', { ...step, script: val })"
        />
      </div>

      <div class="help-box">
        <p>常用场景:</p>
        <ul>
          <li><b>数据解析</b>: 将上一步返回的复杂字符串转换为 JSON。</li>
          <li><b>参数拼接</b>: 将多个步骤的数据组合成下一个接口所需的完整 Body。</li>
          <li><b>格式转换</b>: 统一不同接口的数据结构。</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';

defineProps<{
  step: any;
}>();

defineEmits(['update:step']);
</script>

<style lang="scss" scoped>
.script-step-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-color-main);
  padding: 24px;
  gap: 20px;

  .header-tip {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(54, 98, 236, 0.05);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid rgba(54, 98, 236, 0.1);

    :deep(.basic-icon) {
      font-size: 32px;
      color: var(--theme-color-blue-700);
    }

    .text-content {
      .title { font-size: 14px; font-weight: 700; color: var(--theme-color-text-bold); }
      .desc { font-size: 12px; color: var(--theme-color-text-secondary); margin-top: 4px; }
      code { background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 4px; }
    }
  }

  .editor-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .field-label {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      .tip { font-size: 11px; font-weight: 400; color: var(--theme-color-text-secondary); opacity: 0.7; }
    }

    .code-editor-wrap {
      flex: 1;
      border: 1px solid var(--theme-color-border);
      border-radius: 6px;
      overflow: hidden;
      min-height: 300px;
    }

    .help-box {
      background: var(--theme-color-gray-50);
      padding: 12px;
      border-radius: 6px;
      font-size: 11px;
      border: 1px dashed var(--theme-color-border);
      p { font-weight: 700; margin-bottom: 4px; color: var(--theme-color-text-bold); }
      ul { padding-left: 16px; margin: 0; color: var(--theme-color-text-secondary); }
    }
  }
}
</style>
