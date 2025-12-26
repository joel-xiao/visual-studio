<script setup lang="ts">
import { ref } from 'vue';
import type { IPromptSuggestion } from './modules/prompt/suggestions';
import Messages from './components/Messages.vue';
import InputArea from './components/InputArea.vue';
import { useChatMessages } from './hooks/use-chat-messages';
import { useChatSelection } from './hooks/use-chat-selection';
import { useChatInput } from './hooks/use-chat-input';
import { useInputAreaHeight } from './hooks/use-input-area-height';
import { useChatOrchestrator } from './hooks/use-chat-orchestrator';

// 消息管理
const { messages, addMessage } = useChatMessages();

// 选择相关逻辑
const {
  currentSelectionName,
  suggestions,
  chatMode,
  placeholderText,
  clearSelection
} = useChatSelection();

// 输入状态管理
const { inputValue, loading } = useChatInput();

// 输入区域高度监听
const inputAreaWrapperRef = ref<HTMLElement | null>(null);
const { inputAreaHeight } = useInputAreaHeight(inputAreaWrapperRef);

// Orchestrator 和消息发送
const { handleThemeSelect, sendMessage } = useChatOrchestrator(
  messages,
  addMessage,
  inputValue,
  loading
);

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
      @theme-select="handleThemeSelect"
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
