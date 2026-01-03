<template>
  <div class="message-wrapper" :class="[message.role, { 'full-width': agentSchema?.uiHints?.fullWidth }]">
    <div v-if="message.role === 'assistant'" class="avatar-column">
      <div
        class="agent-avatar"
        :style="agentSchema?.color ? { background: agentSchema.color } : {}"
      >
        <CIcon :icon="agentSchema?.icon || 'mdi:robot-outline'" />
      </div>
    </div>

    <div class="message-body">
      <div v-if="message.role === 'assistant' && message.agent" class="agent-name">
        {{ agentSchema?.displayName || 'AI助手' }}
      </div>

      <div class="message-bubble">
        <template v-if="message.type === 'agent-thought'">
          <div v-if="isStreamingCode" class="streaming-code">
            <div class="streaming-header">
              <div class="streaming-title">
                <span class="thinking-dots" aria-hidden="true"><span></span><span></span><span></span></span>
                <span class="streaming-text">正在输出中</span>
              </div>
            </div>
            <CCodeEditor
              :model-value="streamingCode"
              label="输出预览"
              :language="streamingLanguage"
              :read-only="true"
            />
          </div>
          <div v-else class="thought-content">
            <span class="thinking-dots" aria-hidden="true"><span></span><span></span><span></span></span>
            <span class="thought-text">{{ message.content }}</span>
          </div>
        </template>

        <!-- 专业 Agent 响应卡片（无专用组件时使用只读 JSON 预览兜底） -->
        <AgentResponseCard
          v-else-if="message.agent && message.data"
          :role="message.agent"
          :title="messageTitle"
          :has-secondary-action="showSecondaryAction"
          :secondary-action-text="secondaryActionText"
          :primary-action-text="getPrimaryActionText()"
          :workflow-control="workflowControl"
          :enable-workflow-actions="!shouldHideWorkflowControls"
          :hide-primary-action="shouldHideWorkflowControls"
          :hide-secondary-action="shouldHideWorkflowControls"
          :handled="shouldHideWorkflowControls"
          @apply="handleApply"
          @secondary="handleSecondary"
          @apply-only="handleApplyOnly"
        >
          <component
            :is="agentComponent"
            v-if="agentComponent"
            :data="message.data"
            @apply="handleApply"
          />
          <CCodeEditor
            v-else
            :model-value="fallbackCode"
            label="JSON 预览"
            language="json"
            :read-only="true"
          />
        </AgentResponseCard>

        <!-- 基础文本 -->
        <div v-else-if="message.type === 'text'" class="text-content markdown-body">
          <TextMessageContent :content="message.content" />
        </div>

        <!-- 代码/JSON 预览 (兜底) -->
        <div v-else-if="message.data" class="code-content">
          <CCodeEditor
            :model-value="fallbackCode"
            label="JSON 预览"
            language="json"
            :read-only="true"
          />
        </div>

        <div v-if="imageAttachments.length" class="attachments">
          <img
            v-for="img in imageAttachments"
            :key="img.id"
            class="attachment-image"
            :src="img.url"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, unref, h, defineComponent } from 'vue';
import type { IChatMessage } from '../types';
import type { JsonValue } from '../../../../@types/utils';
import CIcon from '../../../ui/controls/c-icon/index.vue';
import AgentResponseCard from './AgentResponseCard.vue';
import CCodeEditor from '../../../ui/controls/c-code-editor/index.vue';
import { useAIContext } from '../hooks/core/use-ai-context';
import { applyAgentData, getAgentSchema, getAgentComponent } from '../agent/registry';
import { asRecord, safeStringifyJSON } from '../utils/json-utils';
import { getStreamingCodePresentation } from '../utils';

const messageTitle = computed(() => {
  const obj = asRecord(props.message.data);
  if (!obj) return '';
  const title = typeof obj.title === 'string' ? obj.title : undefined;
  const name = typeof obj.name === 'string' ? obj.name : undefined;
  return title || name || '';
});

const props = defineProps<{
  message: IChatMessage;
  onContinueWorkflow?: (data: unknown) => void;
  onMarkActionHandled?: (messageId: string, key: string) => void;
}>();

const TextMessageContent = defineComponent({
  props: {
    content: {
      type: String,
      required: true
    }
  },
  setup(p) {
    const renderInline = (text: string) => {
      const parts: Array<string | ReturnType<typeof h>> = [];
      const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
      let lastIndex = 0;
      for (;;) {
        const match = re.exec(text);
        if (!match) break;
        const idx = match.index;
        if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));
        const token = match[0];
        if (token.startsWith('**')) {
          parts.push(h('strong', token.slice(2, -2)));
        } else {
          parts.push(h('code', token.slice(1, -1)));
        }
        lastIndex = idx + token.length;
      }
      if (lastIndex < text.length) parts.push(text.slice(lastIndex));
      return parts;
    };

    return () => {
      const lines = p.content.split('\n');
      const children: Array<string | ReturnType<typeof h>> = [];

      let i = 0;
      while (i < lines.length) {
        const line = lines[i] ?? '';
        const isBullet = line.trimStart().startsWith('- ');
        if (isBullet) {
          const items: Array<ReturnType<typeof h>> = [];
          while (i < lines.length && (lines[i] ?? '').trimStart().startsWith('- ')) {
            const raw = (lines[i] ?? '').trimStart().slice(2);
            items.push(h('li', renderInline(raw)));
            i++;
          }
          children.push(h('ul', items));
          if (i < lines.length) children.push(h('br'));
          continue;
        }

        children.push(...renderInline(line));
        if (i < lines.length - 1) children.push(h('br'));
        i++;
      }

      return h('span', children);
    };
  }
});

const aiContext = useAIContext();
const agentSchema = computed(() => props.message.agent ? getAgentSchema(props.message.agent) : null);
const agentComponent = computed(() => props.message.agent ? getAgentComponent(props.message.agent) : null);
const hasSelection = computed(() => {
  const selected = unref(aiContext.nodeContext.getSelectedNodes());
  return Array.isArray(selected) ? selected.length > 0 : !!selected;
});

const workflowControl = computed(() => props.message.workflowControl);
const isMultiStepWorkflow = computed(() => !!workflowControl.value?.isMultiStep);
const hasNextStep = computed(() => !!(workflowControl.value?.isMultiStep && workflowControl.value?.hasNext));
const imageAttachments = computed(() => (props.message.attachments || []).filter(a => a.kind === 'image' && !!a.url));
const fallbackCode = computed(() => safeStringifyJSON((props.message.data ?? {}) as JsonValue, 2));
const actionStatus = computed(() => props.message.actionStatus || {});
const streaming = computed(() => getStreamingCodePresentation(props.message));
const isStreamingCode = computed(() => streaming.value.isStreamingCode);
const streamingLanguage = computed(() => streaming.value.language);
const streamingCode = computed(() => streaming.value.code);
const workflowHandledKey = computed(() => {
  if (!isMultiStepWorkflow.value || !hasNextStep.value) return '';
  const control = workflowControl.value;
  const workflowId = control?.workflowId || 'workflow';
  const nodeId = control?.currentNodeId || props.message.id;
  return `workflow:${workflowId}:${nodeId}:handled`;
});
const workflowHandled = computed(() => !!(workflowHandledKey.value && actionStatus.value[workflowHandledKey.value]));
const shouldHideWorkflowControls = computed(() => isMultiStepWorkflow.value && hasNextStep.value && workflowHandled.value);

const showSecondaryAction = computed(() => {
  if (isMultiStepWorkflow.value) return !!workflowControl.value?.secondaryAction;
  return !!agentSchema.value?.uiHints?.secondaryActionText && hasSelection.value;
});

const secondaryActionText = computed(() =>
  isMultiStepWorkflow.value
    ? (workflowControl.value?.secondaryAction?.label || '')
    : agentSchema.value?.uiHints?.secondaryActionText
);

const resolveApplyMode = (mode?: 'create' | 'update') => {
  if (mode) return mode;
  return hasSelection.value ? 'update' : 'create';
};

const handleApply = (data?: unknown, mode?: 'create' | 'update') => {
  if (!props.message.agent) return;
  const applyMode = resolveApplyMode(mode);
  const payload: Record<string, JsonValue> = asRecord(data) ?? asRecord(props.message.data) ?? {};
  const nextPayload: Record<string, JsonValue> = { ...payload, applyMode };

  if (isMultiStepWorkflow.value && hasNextStep.value && props.onContinueWorkflow) {
    if (workflowHandled.value) return;
    if (workflowHandledKey.value) {
      props.onMarkActionHandled?.(props.message.id, workflowHandledKey.value);
    }
    props.onContinueWorkflow(nextPayload);
    return;
  }

  applyAgentData(props.message.agent, aiContext, nextPayload);
};

const handleSecondary = (data?: unknown) => {
  if (!props.message.agent) return;
  const payload: Record<string, JsonValue> = asRecord(data) ?? asRecord(props.message.data) ?? {};

  if (isMultiStepWorkflow.value && props.onContinueWorkflow) {
    const action = workflowControl.value?.secondaryAction;
    if (!action) return;
    const workflowAction: Record<string, JsonValue> = {
      kind: action.kind,
      label: action.label,
      ...(action.targetNodeId ? { targetNodeId: action.targetNodeId } : {})
    };
    if (hasNextStep.value) {
      if (workflowHandled.value) return;
      if (workflowHandledKey.value) {
        props.onMarkActionHandled?.(props.message.id, workflowHandledKey.value);
      }
    }
    props.onContinueWorkflow({ ...payload, applyMode: resolveApplyMode(), workflowAction });
    return;
  }

  applyAgentData(props.message.agent, aiContext, { ...payload, applyMode: 'update' });
};

const handleApplyOnly = (data?: unknown, mode?: 'create' | 'update') => {
  if (!props.message.agent) return;
  const payload: Record<string, JsonValue> = asRecord(data) ?? asRecord(props.message.data) ?? {};
  const applyMode = resolveApplyMode(mode);
  applyAgentData(props.message.agent, aiContext, { ...payload, applyMode });
};

const getPrimaryActionText = () => {
  if (!isMultiStepWorkflow.value) {
    return hasSelection.value ? (agentSchema.value?.uiHints?.primaryActionText || '解析并应用') : '应用到画布';
  }

  const control = workflowControl.value;
  if (control?.hasNext) {
    return `继续 (${control.currentStep}/${control.totalSteps})`;
  }
  return '应用';
};
</script>


<style scoped lang="scss">
.message-wrapper {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  max-width: 90%;
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &.user {
    align-self: flex-end;
    flex-direction: row-reverse;

    .message-body {
      align-items: flex-end;

      .message-bubble {
        background: linear-gradient(135deg,
          var(--db-color-button-primary-bg) 0%,
          rgba(64, 158, 255, 0.9) 100%
        );
        color: white;
        border-radius: 16px 16px 4px 16px;
        box-shadow:
          0 3px 12px rgba(64, 158, 255, 0.2),
          0 2px 6px rgba(64, 158, 255, 0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 9px 13px;

        &:hover {
          box-shadow:
            0 6px 20px rgba(64, 158, 255, 0.3),
            0 4px 12px rgba(64, 158, 255, 0.2);
          transform: translateY(-1px);
        }

        .text-content {
          color: white;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }
      }
    }
  }

  &.assistant {
    align-self: flex-start;
    max-width: 100%;
    width: 100%;

    .message-body {
      align-items: flex-start;

      .agent-name {
        font-size: 12px;
        font-weight: 600;
        color: var(--theme-color-text-secondary);
        margin-bottom: 3px;
        margin-left: 0;
        text-transform: uppercase;
        letter-spacing: 0.25px;
        opacity: 0.6;
      }

      .message-bubble {
        background: transparent;
        border: none;
        border-radius: 0;
        color: var(--theme-color-text);
        box-shadow: none;
        padding: 0;
        transition: none;

        &:hover {
          border: none;
          box-shadow: none;
          transform: none;
        }
      }
    }
  }

  &.full-width {
    max-width: 100%;
    width: 100%;

    .message-body {
      width: 100%;
      max-width: 100%;
    }

    .message-bubble {
      width: 100%;
      max-width: 100%;
    }
  }

  .avatar-column {
    flex-shrink: 0;
    padding-top: 0;

    .agent-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        padding: 2px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover {
        transform: scale(1.08) translateY(-2px);

        &::before {
          opacity: 1;
        }
      }

      :deep(.c-icon) {
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }

      // 样式通过内联 style 动态设置，不再硬编码
    }
  }

  .message-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;

    .message-bubble {
      padding: 0;
      font-size: 12.5px;
      line-height: 1.45;
      position: relative;
      word-break: break-word;
      width: 100%;
      min-width: 0;

      .text-content {
        white-space: pre-wrap;

        :deep(p) {
          margin: 0 0 5px 0;
          &:last-child { margin-bottom: 0; }
        }
        :deep(strong) {
          font-weight: 600;
          color: inherit;
        }
        :deep(ul), :deep(ol) {
          padding-left: 17px;
          margin: 2.5px 0;
        }
        :deep(li) {
          margin: 1px 0;
        }
        :deep(code) {
          background: rgba(0, 0, 0, 0.2);
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 0.9em;
        }
      }

      .attachments {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }

      .attachment-image {
        width: 132px;
        height: 132px;
        border-radius: 10px;
        object-fit: cover;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.02);
      }

      .thought-content {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--theme-color-text-secondary);
        font-style: normal;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);

        .thought-text {
          flex: 1;
          min-width: 0;
        }

        .thought-text::after {
          content: '▍';
          margin-left: 3px;
          color: var(--db-color-button-primary-bg);
          opacity: 0.8;
          animation: cursorBlink 1s steps(2, end) infinite;
        }
      }

      .streaming-code {
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(255, 255, 255, 0.02);
      }

      .streaming-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        color: var(--theme-color-text-secondary);
        font-size: 12px;
      }

      .streaming-title {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .streaming-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .thinking-dots {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .thinking-dots > span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--db-color-button-primary-bg);
        opacity: 0.35;
        animation: dotPulse 1.2s infinite ease-in-out;
      }

      .thinking-dots > span:nth-child(2) { animation-delay: 0.15s; }
      .thinking-dots > span:nth-child(3) { animation-delay: 0.3s; }

      .code-content {
         background: linear-gradient(135deg,
           rgba(0, 0, 0, 0.3) 0%,
           rgba(0, 0, 0, 0.2) 100%
         );
         border-radius: 10px;
         overflow: hidden;
         margin-top: 10px;
         border: 1px solid rgba(255, 255, 255, 0.05);

         .insight-box {
           padding: 10px 14px;
           background: linear-gradient(135deg,
             rgba(230, 162, 60, 0.15) 0%,
             rgba(230, 162, 60, 0.1) 100%
           );
           border-bottom: 1px solid rgba(230, 162, 60, 0.2);
           display: flex;
           align-items: flex-start;
           gap: 10px;
           color: #e6a23c;
           font-size: 12px;
           font-weight: 500;
         }

         .code-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           padding: 8px 14px;
           background: rgba(255, 255, 255, 0.03);
           font-size: 11px;
           color: var(--theme-color-text-secondary);
           font-weight: 600;
           text-transform: uppercase;
           letter-spacing: 0.5px;

           :deep(.c-icon) {
             cursor: pointer;
             transition: transform 0.2s;

             &:hover {
               transform: scale(1.1);
               color: var(--db-color-button-primary-bg);
             }
           }
         }

         pre {
           margin: 0;
           padding: 14px;
           font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
           font-size: 12px;
           line-height: 1.6;
           color: #a6e22e;
           overflow-x: auto;

           code {
             background: transparent;
             padding: 0;
           }
         }
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes dotPulse {
  0%, 100% { transform: translateY(0); opacity: 0.35; }
  50% { transform: translateY(-2px); opacity: 0.9; }
}

@keyframes cursorBlink {
  0%, 49% { opacity: 0; }
  50%, 100% { opacity: 0.85; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
