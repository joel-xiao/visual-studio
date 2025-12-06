<script setup lang="ts">
import { ref, nextTick, unref } from 'vue';
import { aiApi } from '@/service/api/ai';
import { scenes, getScene } from './scene-manager';
import type { IChatMessage, IScene, ISceneAction } from './types';
import SceneSelector from './components/SceneSelector.vue';
import ThemeSelector from './components/ThemeSelector.vue';
import ChartMessage from './components/ChartMessage.vue';
import { useChartThemesContext } from '../hooks/chart-themes-context';

const { setTheme } = useChartThemesContext();

const messages = ref<IChatMessage[]>([
  {
    id: 'welcome',
    role: 'assistant',
    content: '你好！我是你的 AI 助手。请选择一个场景开始，或直接输入指令。',
    type: 'scene-selection',
    actions: []
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

const addMessage = (role: 'user' | 'assistant', content: string, type: 'text' | 'code' | 'action' | 'chart' | 'theme-selection' | 'scene-selection' = 'text', actions?: ISceneAction[], id?: string, data?: any): string => {
  if (id) {
    const msg = messages.value.find(m => m.id === id);
    if (msg) {
      msg.content = content;
      if (type) msg.type = type;
      if (actions) msg.actions = actions;
      if (data) msg.data = data;
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
    actions,
    data
  });
  scrollToBottom();
  return newId;
};

const handleSceneSelect = async (scene: IScene) => {
  if (loading.value) return;
  if (scene.disabled) return;

  // Add user selection message
  addMessage('user', `选择场景：${scene.label}`);

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
        ''
      );
    } catch (e) {
      addMessage('assistant', '场景执行出错: ' + e);
    } finally {
      loading.value = false;
    }
  }
};

const handleThemeSelect = (themeName: string) => {
  setTheme(themeName);
  addMessage('user', `已切换主题：${themeName}`);
  addMessage('assistant', `🎨 主题 **${themeName}** 已应用。`);
};

const handleActionClick = async (value: string) => {
  if (loading.value) return;

  const [sceneId, ...rest] = value.split(':');
  const params = rest.join(':');
  const scene = getScene(sceneId);

  if (scene && scene.run) {
    currentScene.value = scene;
    loading.value = true;
    try {
      await scene.run(
        addMessage,
        async () => { throw new Error('Not implemented'); },
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
          return await aiApi.chat({
             provider: 'qwen',
             messages: [{ role: 'user', content }],
             options: { stream: true }
          });
        },
        content
      );
    } else {
       addMessage('assistant', '请先选择一个场景开始对话。', 'scene-selection');
    }
  } catch (e) {
    addMessage('assistant', '出错啦: ' + e, 'text', undefined, undefined, { isError: true });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="chat-container" ref="chatContainerRef">
      <div v-for="msg in messages" :key="msg.id" class="message-wrapper" :class="[msg.role, { 'full-width': msg.type === 'chart' }]">
        <div class="message-content">
          <!-- Text Message -->
          <div v-if="msg.type === 'text'" class="text-content markdown-body" v-html="msg.content"></div>

          <!-- Code Message -->
          <div v-else-if="msg.type === 'code'" class="code-content">
             <div class="code-header">
               <span>JSON</span>
               <i class="iconfont icon-copy"></i>
             </div>
             <pre><code>{{ msg.content }}</code></pre>
          </div>

          <!-- Scene Selection -->
          <div v-else-if="msg.type === 'scene-selection'" class="scene-selection-content">
             <div class="text-content mb-3">{{ msg.content }}</div>
             <SceneSelector :scenes="scenes" @select="handleSceneSelect" />
          </div>

          <!-- Theme Selection -->
          <div v-else-if="msg.type === 'theme-selection'" class="theme-selection-content">
             <div class="text-content mb-3">{{ msg.content }}</div>
             <ThemeSelector @select="handleThemeSelect" />
          </div>

           <!-- Chart Message -->
          <div v-else-if="msg.type === 'chart'" class="chart-content">
             <div class="text-content mb-3">{{ msg.content }}</div>
             <ChartMessage :data="msg.data" />
          </div>

          <!-- Action Buttons (Legacy/Generic) -->
          <div v-else-if="msg.type === 'action'" class="action-content">
             <div class="text-content mb-2">{{ msg.content }}</div>
             <div class="actions-list">
               <button
                 v-for="action in msg.actions"
                 :key="action.value"
                 class="action-btn"
                 :disabled="action.disabled"
                 @click="handleActionClick(action.value)"
               >
                 {{ action.label }}
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>

    <div class="input-wrapper">
      <div class="input-container">
        <textarea
          v-model="inputValue"
          placeholder="输入您的需求，例如：'帮我生成一个柱状图'..."
          @keydown.enter.prevent="handleSend"
          :disabled="loading"
          rows="1"
        ></textarea>
        <button class="send-btn" @click="handleSend" :disabled="loading || !inputValue.trim()">
          <i class="iconfont icon-send"></i>
        </button>
      </div>
    </div>
</template>

<style scoped lang="scss">
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: var(--db-editor-color-panel-bg);

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--theme-color-gray-600);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  .message-wrapper {
    display: flex;
    max-width: 95%;

    &.full-width {
      width: 100%;
      max-width: 100%;

      .message-content {
        width: 100%;
      }
    }

    &.user {
      align-self: flex-end;

      .message-content {
        background: var(--db-color-button-primary-bg, #409eff);
        color: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .text-content {
          color: white;
        }
      }
    }

    &.assistant {
      align-self: flex-start;

      .message-content {
        background-color: transparent;
        border: none;
        box-shadow: none;
        color: var(--theme-color-text);
      }
    }

    .message-content {
      padding: 8px 12px;
      font-size: 13px;
      line-height: 1.5;
      overflow-x: hidden;
      position: relative;
      min-width: 60px;

      .text-content {
        white-space: pre-wrap;
        word-break: break-word;
      }

      .mb-3 {
          margin-bottom: 8px;
      }
      .mb-2 {
          margin-bottom: 6px;
      }

      .code-content {
        background-color: var(--db-color-bg-dark);
        border-radius: 8px;
        overflow: hidden;
        margin-top: 8px;
        border: 1px solid var(--theme-color-gray-700);

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 10px;
          background-color: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid var(--theme-color-gray-700);

          span {
            font-size: 11px;
            font-weight: 600;
            color: var(--theme-color-text-secondary);
          }

          .iconfont {
            font-size: 14px;
            color: var(--theme-color-text-secondary);
            cursor: pointer;
            &:hover { color: var(--theme-color-text); }
          }
        }

        pre {
          margin: 0;
          padding: 10px;
          white-space: pre-wrap;
          word-break: break-all;
          color: var(--db-main-color-get, #4caf50);
          font-family: 'Fira Code', monospace;
          font-size: 12px;
          max-height: 240px;
          overflow-y: auto;

          &::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          &::-webkit-scrollbar-thumb {
            background: var(--theme-color-gray-600);
            border-radius: 2px;
          }
        }
      }

      .actions-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;

        .action-btn {
          padding: 4px 10px;
          border-radius: 12px;
          border: 1px solid var(--db-color-button-primary-bg, #409eff);
          background-color: var(--db-editor-color-select-light);
          color: var(--db-color-button-primary-bg, #409eff);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;

          &:hover:not(:disabled) {
            background-color: var(--db-color-button-primary-bg, #409eff);
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(64, 158, 255, 0.3);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            border-color: var(--theme-color-gray-500);
            color: var(--theme-color-gray-500);
            box-shadow: none;
            transform: none;
          }
        }
      }
    }
  }
}

.input-wrapper {
  padding: 12px;
  background-color: var(--db-editor-color-panel-bg);
  border-top: 1px solid var(--theme-color-gray-600, #444);

  .input-container {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background-color: var(--db-color-input-background);
    border: 1px solid var(--theme-color-gray-600);
    border-radius: 20px;
    padding: 6px 6px 6px 12px;
    transition: all 0.2s;

    &:focus-within {
      border-color: var(--db-color-button-primary-bg);
      background-color: var(--db-editor-color-panel-bg-lighter, #262626);
      box-shadow: 0 0 0 2px var(--db-editor-color-select-light);
    }

    textarea {
      flex: 1;
      max-height: 100px;
      min-height: 24px;
      resize: none;
      background: transparent;
      border: none;
      padding: 4px 0;
      color: var(--theme-color-text);
      font-family: inherit;
      font-size: 13px;
      line-height: 1.5;

      &:focus {
        outline: none;
      }

      &::placeholder {
        color: var(--theme-color-text-disabled);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .send-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: var(--db-color-button-primary-bg, #409eff);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        transform: scale(1.05);
        background-color: var(--db-color-button-primary-bg-hover);
      }

      &:active:not(:disabled) {
        transform: scale(0.95);
      }

      &:disabled {
        background-color: var(--theme-color-gray-600);
        color: var(--theme-color-text-disabled);
        cursor: not-allowed;
      }

      .iconfont {
        font-size: 14px;
        margin-left: -1px; /* Visual correction */
      }
    }
  }
}
</style>
