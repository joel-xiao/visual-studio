<script setup lang="ts">
import { ref } from 'vue';
import type { IPromptSuggestion } from './hooks/chat/use-chat-context';
import Messages from './components/Messages.vue';
import InputArea from './components/InputArea.vue';
import { useChat } from './hooks/chat/use-chat';
import { useChatContext, useAISuggestionsConfig } from './hooks/chat/use-chat-context';
import { initAIContextExplicit } from './hooks/core/use-ai-context';

initAIContextExplicit();

const inputAreaWrapperRef = ref<HTMLElement | null>(null);

const { messages, sendMessage, inputValue, pendingAttachments, loading, inputAreaHeight, handleContinueWorkflow, markActionHandled } = useChat({
  inputAreaWrapperRef
});

const {
  currentSelectionName,
  suggestions,
  chatMode,
  placeholderText,
  clearSelection,
  refreshSuggestions,
  aiSuggestionsEnabled
} = useChatContext();

const { toggle: toggleAISuggestions } = useAISuggestionsConfig();

const handleSuggestionClick = (suggestion: IPromptSuggestion) => {
  const value = (suggestion.value || '').trim();
  if (!value) {
    return;
  }

  const current = inputValue.value || '';
  if (!current.trim()) {
    inputValue.value = value;
    return;
  }

  inputValue.value = `${current}${current.endsWith('\n') ? '' : '\n'}${value}`;
};

const chatContainerRef = ref<HTMLElement | null>(null);
</script>

<template>
  <div ref="chatContainerRef" class="chat-container">
    <Messages
      :messages="messages"
      :input-area-height="inputAreaHeight"
      :on-continue-workflow="handleContinueWorkflow"
      :on-mark-action-handled="markActionHandled"
    />

    <div ref="inputAreaWrapperRef" class="input-area-wrapper">
      <InputArea
        v-model="inputValue"
        v-model:attachments="pendingAttachments"
        :placeholder="placeholderText"
        :suggestions="suggestions"
        :loading="loading"
        :show-mode-indicator="chatMode === 'context'"
        :target-name="currentSelectionName"
        :ai-suggestions-enabled="aiSuggestionsEnabled"
        @send="sendMessage"
        @suggestion-click="handleSuggestionClick"
        @clear-selection="clearSelection"
        @toggle-ai-suggestions="toggleAISuggestions"
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
