<template>
  <div class="redis-command-editor">
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
      <!-- Command Tab -->
      <div v-if="activeTab === 'command'" class="command-section">
        <div class="action-toolbar">
          <div class="toolbar-left">
             <div class="tool-btn" :class="{ active: showHint }" @click="showHint = !showHint">
               <BasicIcon icon="mdi:lightbulb-on-outline" font-size="16px" />
               <span>变量引用提示</span>
             </div>
             <div class="tool-btn" @click="insertTemplate">
               <BasicIcon icon="mdi:file-code-outline" font-size="16px" />
               <span>插入模板</span>
             </div>
          </div>
          <div class="toolbar-right">
             <CButton 
               primary 
               size="small" 
               icon="mdi:play" 
               class="exec-btn" 
               @click="$emit('send')"
             >
               {{ step.actionType === 'lua' ? '执行脚本 (Ctrl+Enter)' : '执行指令 (Ctrl+Enter)' }}
             </CButton>
          </div>
        </div>

        <div v-if="showHint" class="table-hint-box">
          <div class="hint-header">
            <div class="title">
              <BasicIcon icon="mdi:help-circle-outline" font-size="14px" />
              快速引用指南
            </div>
            <BasicIcon icon="mdi:close" class="close" @click="showHint = false" />
          </div>
          <div class="hint-content">
            <div class="hint-grid">
              <div class="hint-card" v-pre>
                <div class="card-label">引用参数及全局变量</div>
                <code>GET user:{{vars.userId}}</code>
              </div>
              <div class="hint-card" v-pre>
                <div class="card-label">Lua 脚本传参模式</div>
                <code>redis.call('SET', KEYS[1], ARGV[1])</code>
              </div>
            </div>
          </div>
        </div>

        <div class="editor-wrap">
           <CCodeEditor 
             :model-value="step.command" 
             :language="step.actionType === 'lua' ? 'lua' : 'sql'" 
             class="redis-code-editor"
             @update:model-value="(val: string) => updateStep('command', val)"
           />
        </div>
      </div>

      <!-- Condition Tab -->
      <div v-if="activeTab === 'condition'" class="condition-section">
         <div class="field-label">
            <BasicIcon icon="mdi:filter-check-outline" font-size="16px" class="sec-icon" />
            <span>执行控制条件</span>
            <span class="tip">控制此 Redis 步骤的触发逻辑</span>
         </div>
         <div class="editor-wrap">
           <CCodeEditor
             :model-value="step.condition"
             language="javascript"
             placeholder="// 示例: results.cmd1.status === 'OK'"
             @update:model-value="(val: string) => updateStep('condition', val)"
           />
         </div>
         <div class="info-banner">
            <BasicIcon icon="mdi:information-outline" font-size="16px" />
            <span>支持 JS 表达式。可使用 <code>results.xxx</code> 引用上一步或 <code>vars.xxx</code> 引用参数。</span>
         </div>
      </div>

      <!-- Variables Tab -->
      <div v-if="activeTab === 'variables'" class="variables-section">
        <div class="field-label">
          <BasicIcon icon="mdi:variable" font-size="16px" class="sec-icon amber" />
          <span>局部参数定义</span>
          <span class="tip">定义的参数可在命令中通过 <code v-pre>{{key}}</code> 引用</span>
        </div>
        <div class="kv-container">
          <KVEditor
            :model-value="step.variables || []"
            label-key="参数名"
            label-value="测试默认值"
            label-desc="说明"
            @update:model-value="(val: any) => updateStep('variables', val)"
          />
        </div>
      </div>

      <!-- Transform Tab -->
      <div v-if="activeTab === 'transform'" class="transform-section">
        <div class="field-label">
          <BasicIcon icon="mdi:auto-fix" font-size="16px" class="sec-icon purple" />
          <span>出参格式化</span>
          <span class="tip">对 Redis 返回的数据格式化为标准 JSON 或提取字段</span>
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
import { ref, onMounted } from 'vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import KVEditor from '../../sql/components/kv-editor.vue';
import TransformationEditor from '../../sql/components/transformation-editor.vue';

const props = defineProps<{
  step: any;
  allSteps: any[];
}>();

const emit = defineEmits(['update:step', 'send']);

const activeTab = ref('command');
const showHint = ref(false);

const tabs = [
  { id: 'command', name: '执行代码', icon: 'mdi:console' },
  { id: 'condition', name: '执行控制', icon: 'mdi:play-pause' },
  { id: 'variables', name: '局部参数', icon: 'mdi:toy-brick-plus-outline' },
  { id: 'transform', name: '出参转换', icon: 'mdi:swap-horizontal-bold' }
];

function updateStep(field: string, value: any) {
  emit('update:step', { ...props.step, [field]: value });
}

function insertTemplate() {
  const isLua = props.step.actionType === 'lua';
  const templates = isLua 
    ? [
        `-- Lua script to get and set value atomically\nlocal val = redis.call('GET', KEYS[1])\nif val then\n  redis.call('SET', KEYS[1], ARGV[1])\nend\nreturn val`,
        `-- Rate Limiter script\nlocal current = redis.call('INCR', KEYS[1])\nif tonumber(current) == 1 then\n  redis.call('EXPIRE', KEYS[1], ARGV[1])\nend\nreturn current`
      ]
    : [
        `GET my_key`,
        `SET my_key "{{vars.my_value}}" EX 3600`,
        `HSET user:{{vars.id}} name "{{vars.name}}" age {{vars.age}}`,
        `SADD active_users {{vars.id}}`
      ];

  const template = templates[Math.floor(Math.random() * templates.length)];
  const current = props.step.command || '';
  updateStep('command', current ? current + '\n\n' + template : template);
}

onMounted(() => {
  if (!props.step.variables) updateStep('variables', [{ key: '', value: '', description: '', enabled: true }]);
  if (!props.step.transformation) {
    updateStep('transformation', { type: 'raw', script: 'return data;' });
  }
});
</script>

<style lang="scss" scoped>
.redis-command-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-editor-color-panel-bg);

  .config-tabs {
    flex: none;
    height: 42px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 24px;
    border-bottom: 1px solid var(--db-main-border-black);
    background: var(--db-main-color-left-bar-bg);

    .tab-item {
      font-size: 13px;
      color: var(--theme-color-text-secondary);
      opacity: 0.6;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      height: 100%;
      position: relative;
      transition: all 0.2s;
      
      &:hover { color: var(--theme-color-text-bold); }

      &.active {
        color: var(--redis-color-primary);
        opacity: 1;
        font-weight: 700;
        &:after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: -4px;
          right: -4px;
          height: 2px;
          background: var(--redis-color-primary);
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

  .command-section {
    display: flex;
    flex-direction: column;
    height: 100%;

    .action-toolbar {
      flex: none;
      height: 48px;
      padding: 0 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--db-main-border-black);
      background: var(--db-main-color-left-bar-bg);

      .toolbar-left {
         display: flex;
         gap: 16px;
         .tool-btn {
           display: flex;
           align-items: center;
           gap: 6px;
           font-size: 12px;
           color: var(--theme-color-text-secondary);
           cursor: pointer;
           padding: 4px 8px;
           border-radius: 6px;
           transition: all 0.2s;
           &:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
           &.active { color: var(--redis-color-primary); background: var(--redis-color-primary-light); }
         }
      }

      .exec-btn {
        background: var(--redis-color-primary) !important;
        border-color: var(--redis-color-primary) !important;
        color: #fff;
        font-weight: 800;
        border-radius: 6px;
      }
    }

    .table-hint-box {
      margin: 12px;
      background: var(--db-main-color-card-bg);
      border: 1px solid var(--theme-color-border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

      .hint-header {
        padding: 8px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid var(--theme-color-border);
        .title { font-size: 12px; font-weight: 700; color: var(--redis-color-primary); display: flex; align-items: center; gap: 6px; }
        .close { cursor: pointer; opacity: 0.4; &:hover { opacity: 1; } }
      }

      .hint-content {
        padding: 16px;
        .hint-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .hint-card {
          .card-label { font-size: 11px; color: var(--theme-color-text-secondary); margin-bottom: 6px; }
          code {
            display: block;
            padding: 8px 12px;
            background: #000;
            color: var(--redis-color-primary);
            font-family: 'Fira Code', monospace;
            font-size: 11px;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.05);
          }
        }
      }
    }

    .editor-wrap {
      flex: 1;
      min-height: 0;
    }
  }

  .condition-section,
  .variables-section,
  .transform-section {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 900px;

    .field-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      .sec-icon { color: var(--redis-color-primary); &.amber { color: #f59e0b; } &.purple { color: #818cf8; } }
      .tip { font-size: 11px; font-weight: 400; color: var(--theme-color-text-secondary); opacity: 0.6; margin-left: auto; }
    }

    .editor-wrap {
      height: 320px;
      border: 1px solid var(--theme-color-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .info-banner {
      padding: 12px 16px;
      background: var(--redis-color-primary-light);
      border: 1px solid rgba(239, 68, 68, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--theme-color-text-secondary);
      code { background: rgba(0,0,0,0.2); padding: 1px 4px; border-radius: 3px; }
    }
  }
}
</style>
