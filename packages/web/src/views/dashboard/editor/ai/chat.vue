<script setup lang="ts">
import { ref } from 'vue';
import type { IPromptSuggestion } from './hooks/chat/use-chat-context';
import Messages from './components/Messages.vue';
import InputArea from './components/InputArea.vue';
import { useChat } from './hooks/chat/use-chat';
import { useChatContext } from './hooks/chat/use-chat-context';
import { initAIContextExplicit } from './hooks/core/use-ai-context';

// 初始化 AI Context（单例模式）
initAIContextExplicit();

// 输入区域引用
const inputAreaWrapperRef = ref<HTMLElement | null>(null);

// 统一的聊天 Hook（整合消息管理 + 输入状态 + 高度监听）
const { messages, sendMessage, inputValue, loading, inputAreaHeight } = useChat({
  inputAreaWrapperRef
});

// 聊天上下文（选择、建议等）
const {
  currentSelectionName,
  suggestions,
  chatMode,
  placeholderText,
  clearSelection
} = useChatContext();

// 建议点击处理
const handleSuggestionClick = (suggestion: IPromptSuggestion) => {
  inputValue.value = suggestion.value;
  sendMessage();
};

const chatContainerRef = ref<HTMLElement | null>(null);
</script>

<template>
  <div ref="chatContainerRef" class="chat-container">
    <Messages
      :messages="messages"
      :input-area-height="inputAreaHeight"
    />

    <div ref="inputAreaWrapperRef" class="input-area-wrapper">
      <InputArea
        v-model="inputValue"
        :placeholder="placeholderText"
        :suggestions="suggestions"
        :loading="loading"
        :show-mode-indicator="chatMode === 'context'"
        :target-name="currentSelectionName"
        @send="sendMessage"
        @suggestion-click="handleSuggestionClick"
        @clear-selection="clearSelection"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg,
    var(--db-editor-color-panel-bg) 0%,
    rgba(var(--db-editor-color-panel-bg-rgb, 38, 38, 38), 0.98) 100%
  );
  position: relative;
  overflow: hidden;

  .input-area-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10px 14px 14px 14px;
    background: linear-gradient(to top,
      var(--db-editor-color-panel-bg) 92%,
      rgba(var(--db-editor-color-panel-bg-rgb, 38, 38, 38), 0.96) 98%,
      transparent 100%
    );
    z-index: 10;
  }
}
</style>
