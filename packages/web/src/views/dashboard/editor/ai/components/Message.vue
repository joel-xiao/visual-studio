<template>
  <div class="message-wrapper" :class="[message.role, { 'full-width': message.type === 'chart' }]">
    <div v-if="message.role === 'assistant'" class="avatar-column">
      <div
        class="agent-avatar"
        :style="agentSchema?.color ? {
          background: `linear-gradient(135deg, ${agentSchema.color} 0%, ${agentSchema.color}dd 100%)`,
          boxShadow: `0 4px 12px ${agentSchema.color}66, 0 2px 6px ${agentSchema.color}4d, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
        } : {}"
      >
        <CIcon :icon="agentSchema?.icon || 'mdi:robot-outline'" size="large" />
      </div>
    </div>

    <div class="message-body">
      <div v-if="message.role === 'assistant' && message.agent" class="agent-name">
        {{ agentSchema?.displayName || 'AI助手' }}
      </div>

      <div class="message-bubble">
        <div v-if="message.type === 'agent-thought'" class="thought-content">
          <CIcon icon="mdi:loading" class="spin" />
          <span>{{ message.content }}</span>
        </div>

        <div v-else-if="message.type === 'text'" class="text-content markdown-body" v-html="message.content"></div>

        <div v-else-if="message.type === 'code'" class="code-content">
          <div v-if="message.data && message.data.insight" class="insight-box">
            <CIcon icon="mdi:lightbulb-on-outline" />
            <span>{{ message.data.insight }}</span>
          </div>
          <div class="code-header">
            <span>JSON Preview</span>
            <CIcon icon="mdi:content-copy" />
          </div>
          <pre><code>{{ typeof message.data === 'object' ? JSON.stringify(message.data, null, 2) : message.content }}</code></pre>
        </div>

        <!-- 自动渲染 agent 组件 -->
        <div v-else-if="agentComponent" class="agent-content">
          <div v-if="message.content" class="text-content mb-3">{{ message.content }}</div>
          <component
            :is="agentComponent"
            v-if="message.data"
            :data="message.data"
            @apply="handleAgentApply"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IChatMessage, AgentRole } from '../types';
import CIcon from '../../../ui/controls/c-icon/index.vue';
import { useAIContext } from '../hooks/core/use-ai-context';
import { applyAgentData, getAgentSchema, getAgentComponentByMessageType } from '../agent/registry';

interface Props {
  message: IChatMessage;
}

const props = defineProps<Props>();

// 获取 context（用于 applyAgentData）
const aiContext = useAIContext();

// 根据 message type 自动获取对应的组件
const agentComponent = computed(() => {
  const messageType = props.message.type;
  return getAgentComponentByMessageType(messageType || '');
});

// 从 schema 获取 agent 信息（统一获取，避免重复计算）
const agentSchema = computed(() => {
  if (!props.message.agent) return null;
  return getAgentSchema(props.message.agent);
});

// 统一处理所有 agent 组件的 apply 事件
const handleAgentApply = (data: unknown) => {
  // 直接使用 message.agent，不需要判断
  if (props.message.agent) {
    applyAgentData(props.message.agent, aiContext, data);
  }
};
</script>

<style scoped lang="scss">
.message-wrapper {
  display: flex;
  gap: 9px;
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

      .thought-content {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--theme-color-text-secondary);
        font-style: italic;

        :deep(.c-icon) {
          animation: spin 1s linear infinite;
          color: var(--db-color-button-primary-bg);
        }
      }

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

