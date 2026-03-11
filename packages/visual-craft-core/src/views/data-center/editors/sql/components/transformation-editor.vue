<template>
  <div class="transformation-editor">
    <div class="editor-header">
       <div class="title-group">
          <BasicIcon icon="mdi:script-text-outline" font-size="18px" />
          <span class="title">数据转换脚本</span>
       </div>
       <div class="format-presets">
          <label>结果格式:</label>
          <div
            v-for="type in types"
            :key="type.id"
            class="preset-item"
            :class="{ active: modelValue.type === type.id }"
            @click="updateType(type.id)"
          >
            {{ type.label }}
          </div>
       </div>
    </div>

    <div class="script-container">
       <div class="script-header">
          <span class="desc">使用 JavaScript 对全链路结果 (results) 进行清洗和封装</span>
          <CButton quaternary size="small" icon="mdi:help-circle-outline" @click="showHelp = !showHelp">使用帮助</CButton>
       </div>

       <div v-if="showHelp" class="help-box">
          <p>可用变量与函数:</p>
          <ul>
            <li><code>results</code>: 包含全链路执行结果的对象。如 <code>results.step1.data</code></li>
            <li v-pre><code>set(key, val)</code>: <b>核心！</b> 将数据存入流程全局变量。后续步骤可通过 <code>{{key}}</code> 直接引用。</li>
            <li><code>data / res</code>: 当前步骤的响应内容。</li>
          </ul>
          <p>示例脚本:</p>
          <pre><code>set('token', data.accessToken); \nreturn data.list;</code></pre>
       </div>

       <div class="code-editor-wrap">
          <CCodeEditor
            :model-value="modelValue.script"
            @update:model-value="onScriptChange"
            language="javascript"
            class="script-editor"
          />
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';

const props = defineProps<{
  modelValue: {
    script: string;
    type: string;
  }
}>();

const emit = defineEmits(['update:modelValue']);

const showHelp = ref(false);

const types = [
  { id: 'raw', label: '原始结果' },
  { id: 'array', label: '标准数组' },
  { id: 'timeseries', label: '时序序列' },
  { id: 'summary', label: '统计汇总' }
];

function updateType(typeId: string) {
  emit('update:modelValue', { ...props.modelValue, type: typeId });
}

function onScriptChange(val: string) {
  emit('update:modelValue', { ...props.modelValue, script: val });
}
</script>

<style lang="scss" scoped>
.transformation-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  background: var(--db-color-main);

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .title-group {
      display: flex;
      align-items: center;
      gap: 8px;
      .title { font-size: 16px; font-weight: 700; color: var(--theme-color-text-bold); }
    }

    .format-presets {
      display: flex;
      align-items: center;
      gap: 8px;
      label { font-size: 12px; color: var(--theme-color-text-secondary); margin-right: 8px; }
      .preset-item {
        padding: 4px 12px;
        font-size: 12px;
        background: var(--theme-color-gray-100);
        border: 1px solid var(--theme-color-border);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        &:hover { border-color: var(--sql-color-primary); }
        &.active { background: var(--sql-color-primary); color: #fff; border-color: var(--sql-color-primary); }
      }
    }
  }

  .script-container {
    flex: 1;
    display: flex;
    flex-direction: column;

    .script-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      .desc { font-size: 13px; color: var(--theme-color-text-secondary); }
    }

    .help-box {
      background: var(--theme-color-gray-50);
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 16px;
      border: 1px solid var(--theme-color-border);
      font-size: 12px;
      line-height: 1.6;
      ul { padding-left: 20px; margin: 8px 0; }
      pre { background: #000; color: #fff; padding: 8px; border-radius: 4px; margin-top: 8px; }
    }

    .code-editor-wrap {
      flex: 1;
      border: 1px solid var(--theme-color-border);
      border-radius: 6px;
      overflow: hidden;

      .script-editor {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
