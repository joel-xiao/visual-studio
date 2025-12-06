<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { aiApi } from '@/service/api/ai';
import { scenes, getScene } from './modules/scene-manager';
import type { IChatMessage, IScene, ISceneAction } from './modules/types';

const messages = ref<IChatMessage[]>([
  {
    id: 'welcome',
    role: 'assistant',
    content: '你好！我是你的 AI 助手。请选择一个场景开始，或直接输入指令。',
    type: 'action',
    actions: scenes.map(s => ({ label: s.label, value: s.value, disabled: s.disabled }))
  }
]);

const inputValue = ref('');
const loading = ref(false);
const chatContainerRef = ref<HTMLElement | null>(null);
const currentScene = ref<IScene | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
  }
};

const addMessage = (role: 'user' | 'assistant', content: string, type: 'text' | 'code' | 'action' = 'text', actions?: ISceneAction[], id?: string): string => {
  if (id) {
    const msg = messages.value.find(m => m.id === id);
    if (msg) {
      msg.content = content;
      if (type) msg.type = type;
      if (actions) msg.actions = actions;
      scrollToBottom();
      return id;
    }
  }

  // Deduplication check: prevent adding identical message to the end
  const lastMsg = messages.value[messages.value.length - 1];
  if (!id && lastMsg && lastMsg.role === role && lastMsg.content === content && lastMsg.type === type) {
    return lastMsg.id;
  }

  const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  messages.value.push({
    id: newId,
    role,
    content,
    type,
    actions
  });
  scrollToBottom();
  return newId;
};

const handleActionClick = async (value: string) => {
  if (loading.value) return;

  const [sceneId, ...rest] = value.split(':');
  const params = rest.join(':'); // Reconstruct the rest if there are multiple colons
  const scene = getScene(sceneId);

  if (scene && scene.run) {
    currentScene.value = scene;
    loading.value = true;
    try {
      await scene.run(
        addMessage,
        // Adapter for scene to call API - currently mapped to chat or mock
        async () => {
          // In the future, map sceneId to specific prompts/providers
          throw new Error('Direct API call from adapter not implemented');
        },
        params
      );
    } catch (e) {
      addMessage('assistant', '场景执行出错: ' + e);
    } finally {
      loading.value = false;
    }
  }
};

const handleSend = async () => {
  if (!inputValue.value.trim() || loading.value) return;

  const content = inputValue.value;
  inputValue.value = '';
  addMessage('user', content);

  loading.value = true;
  try {
    if (currentScene.value) {
      // Delegate to current scene
      await currentScene.value.run(
        addMessage,
        async () => {
            throw new Error('Direct API call from adapter not implemented');
        },
        content
      );
    } else {
      // Fallback to default chat if no scene selected
      const apiMessages = messages.value.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await aiApi.chat({
        provider: 'qwen', // Default to Qwen as per user request
        messages: apiMessages
      });

      addMessage('assistant', res.content, res.type, res.actions as ISceneAction[]);
    }
  } catch (error) {
    addMessage('assistant', '请求失败: ' + error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="ai-panel">
    <div class="chat-header">
      <h3>AI 助手</h3>
    </div>

    <div ref="chatContainerRef" class="chat-container">
      <div v-for="msg in messages" :key="msg.id" :class="['message-row', msg.role]">
        <div class="avatar">{{ msg.role === 'assistant' ? '🤖' : '👤' }}</div>
        <div class="message-content">
          <div v-if="msg.type === 'text'" class="text-bubble">{{ msg.content }}</div>

          <div v-else-if="msg.type === 'code'" class="code-block">
            <pre>{{ msg.content }}</pre>
          </div>

          <div v-else-if="msg.type === 'action'" class="action-bubble">
            <p>{{ msg.content }}</p>
            <div class="action-buttons">
              <button
                v-for="action in msg.actions"
                :key="action.value"
                :disabled="action.disabled || loading"
                class="action-btn"
                :class="{ disabled: action.disabled || loading }"
                @click="!action.disabled && !loading && handleActionClick(action.value)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="loading" class="message-row assistant">
        <div class="avatar">🤖</div>
        <div class="message-content">
          <div class="text-bubble loading">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <textarea
        v-model="inputValue"
        placeholder="输入指令..."
        @keydown.enter.prevent="handleSend"
      ></textarea>
      <button class="send-btn" :disabled="loading" @click="handleSend">
        <i class="iconfont icon-send"></i> 发送
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-panel {
  display: flex;
  flex-direction: column;
  position: absolute;
  // Position aligned with Right Panel
  right: 0;
  top: var(--db-editor-nav-bar-height);
  bottom: 0;
  width: var(--db-editor-right-menu-width);
  border-left: 1px solid var(--db-editor-color-canvas);
  background-color: var(--db-editor-color-panel-bg);
  z-index: 100;
  color: var(--theme-color-text);

  .chat-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--db-border-color, #333);
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .message-row {
      display: flex;
      gap: 8px;
      max-width: 100%;

      &.user {
        flex-direction: row-reverse;
        .message-content {
          align-items: flex-end;
        }
        .text-bubble {
          background-color: var(--db-color-button-primary-bg, #1890ff);
          color: white;
          border-radius: 8px 0 8px 8px;
        }
      }

      &.assistant {
        .text-bubble {
          background-color: var(--db-color-input-background, #2c2c2c);
          border: 1px solid var(--db-border-color, #333);
          border-radius: 0 8px 8px 8px;
        }
      }

      .avatar {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--db-color-input-background, #333);
        border-radius: 50%;
        font-size: 16px;
      }

      .message-content {
        display: flex;
        flex-direction: column;
        max-width: 85%;
        gap: 8px;

        .text-bubble {
          padding: 8px 12px;
          font-size: 13px;
          line-height: 1.5;
          word-break: break-word;
          white-space: pre-wrap;

          &.loading {
            span {
              animation: blink 1.4s infinite both;
            }
            span:nth-child(2) { animation-delay: 0.2s; }
            span:nth-child(3) { animation-delay: 0.4s; }
          }
        }

        .code-block {
          background-color: #1e1e1e;
          border-radius: 4px;
          padding: 12px;
          width: 100%;
          overflow-x: auto;
          pre {
            margin: 0;
            font-family: 'Menlo', 'Monaco', monospace;
            font-size: 12px;
            color: #d4d4d4;
          }
        }

        .action-bubble {
          background-color: var(--db-color-input-background, #2c2c2c);
          border: 1px solid var(--db-border-color, #333);
          border-radius: 0 8px 8px 8px;
          padding: 12px;

          p {
            margin: 0 0 12px 0;
            font-size: 13px;
          }

          .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .action-btn {
              padding: 6px 12px;
              background-color: var(--db-color-button-background, #333);
              border: 1px solid var(--db-border-color, #444);
              color: var(--theme-color-text);
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              transition: all 0.2s;
              text-align: left;

              &:hover:not(.disabled) {
                background-color: var(--db-color-button-bg-hover, #444);
                border-color: var(--db-color-button-primary-bg, #1890ff);
              }

              &.disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }
            }
          }
        }
      }
    }
  }

  .input-area {
    padding: 12px;
    border-top: 1px solid var(--db-border-color, #333);
    background-color: var(--db-editor-color-panel-bg);
    display: flex;
    flex-direction: column;
    gap: 8px;

    textarea {
      width: 100%;
      height: 60px;
      background-color: var(--db-color-input-background, #1f1f1f);
      border: 1px solid var(--db-border-color, #333);
      color: var(--theme-color-text);
      border-radius: 4px;
      padding: 8px;
      resize: none;
      font-family: inherit;
      font-size: 12px;
      outline: none;

      &:focus {
        border-color: var(--db-color-button-primary-bg, #1890ff);
      }
    }

    .send-btn {
      align-self: flex-end;
      padding: 4px 12px;
      background-color: var(--db-color-button-primary-bg, #1890ff);
      color: white;
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;

      &:hover:not(:disabled) {
        opacity: 0.9;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

@keyframes blink {
  0% { opacity: 0.2; }
  20% { opacity: 1; }
  100% { opacity: 0.2; }
}
</style>
