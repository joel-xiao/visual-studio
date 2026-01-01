<template>
  <div class="input-area-container">
    <SuggestionsPanel
      :suggestions="suggestions"
      :loading="loading"
      :ai-suggestions-enabled="aiSuggestionsEnabled"
      @suggestion-click="$emit('suggestion-click', $event)"
      @toggle-ai-suggestions="$emit('toggle-ai-suggestions')"
    />

    <transition name="fade">
      <ContextIndicator
        v-if="showModeIndicator"
        :target-name="targetName"
        @clear="$emit('clear-selection')"
      />
    </transition>

    <div style="position: relative; width: 100%; padding: 0;">
      <CTextarea
        ref="inputRef"
        :model-value="modelValue"
        :placeholder="placeholder"
        :disabled="loading"
        :rows="3"
        :max-height="120"
        style="width: 100%; padding-right: 42px;"
        @update:model-value="$emit('update:modelValue', $event)"
      />
      <CButton
        icon="mdi:send"
        :loading="loading"
        primary
        :disabled="loading || !modelValue.trim()"
        style="position: absolute; right: 6px; bottom: 6px; width: 26px; height: 26px; min-width: 26px; min-height: 26px; max-width: 26px; max-height: 26px; padding: 0; margin: 0; z-index: 10;"
        @click="$emit('send')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { IPromptSuggestion } from '../hooks/chat/use-chat-context';
import CTextarea from '../../../ui/controls/c-textarea/index.vue';
import CButton from '../../../ui/controls/c-button/index.vue';
import ContextIndicator from './ContextIndicator.vue';
import SuggestionsPanel from './SuggestionsPanel.vue';

interface Props {
  modelValue: string;
  placeholder: string;
  suggestions: IPromptSuggestion[];
  loading: boolean;
  showModeIndicator: boolean;
  targetName: string;
  aiSuggestionsEnabled: boolean;
}

defineProps<Props>();
defineEmits<{
  'update:modelValue': [value: string];
  'send': [];
  'suggestion-click': [suggestion: IPromptSuggestion];
  'clear-selection': [];
  'toggle-ai-suggestions': [];
}>();

const inputRef = ref<InstanceType<typeof CTextarea> | null>(null);
defineExpose({ inputRef });
</script>

<style scoped lang="scss">
.input-area-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 9px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
