<template>
  <div class="input-area-container">
    <transition name="slide-up">
      <div v-if="suggestions.length > 0 && !loading" class="suggestions-container">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          :class="['suggestion-pill', suggestion.color ? `color-${suggestion.color}` : '']"
          @click="$emit('suggestion-click', suggestion)"
        >
          <CIcon v-if="suggestion.icon" :icon="suggestion.icon" />
          <span>{{ suggestion.label }}</span>
        </div>
      </div>
    </transition>

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
        @keydown.enter.prevent="$emit('send')"
        @update:model-value="$emit('update:modelValue', $event)"
      />
      <CButton
        :icon="loading ? 'mdi:loading' : 'mdi:send'"
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
import { type IPromptSuggestion } from '../modules/prompt/suggestions';
import CIcon from '../../../ui/controls/c-icon/index.vue';
import CTextarea from '../../../ui/controls/c-textarea/index.vue';
import CButton from '../../../ui/controls/c-button/index.vue';
import ContextIndicator from './ContextIndicator.vue';

interface Props {
  modelValue: string;
  placeholder: string;
  suggestions: IPromptSuggestion[];
  loading: boolean;
  showModeIndicator: boolean;
  targetName: string;
}

defineProps<Props>();
defineEmits<{
  'update:modelValue': [value: string];
  'send': [];
  'suggestion-click': [suggestion: IPromptSuggestion];
  'clear-selection': [];
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

.suggestions-container {
  display: flex;
  gap: 4px;
  padding-bottom: 0;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;

  &::-webkit-scrollbar {
    height: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  .suggestion-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: 400;
    color: var(--theme-color-text);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    flex-shrink: 0;
    height: 26px;
    position: relative;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
    }

    :deep(.c-icon) {
      font-size: 13px;
      opacity: 0.8;
    }

    &:active {
      opacity: 0.8;
    }

    &.color-blue {
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
      border-color: rgba(64, 158, 255, 0.2);
      &::before {
        background: linear-gradient(90deg, transparent 0%, rgba(64, 158, 255, 0.4) 50%, transparent 100%);
      }
      :deep(.c-icon) {
        color: #409eff;
      }
      &:hover {
        background: linear-gradient(135deg, rgba(64, 158, 255, 0.18) 0%, rgba(64, 158, 255, 0.12) 100%);
        border-color: rgba(64, 158, 255, 0.35);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
        color: #409eff;
      }
    }

    &.color-purple {
      background: linear-gradient(135deg, rgba(144, 147, 255, 0.1) 0%, rgba(144, 147, 255, 0.05) 100%);
      border-color: rgba(144, 147, 255, 0.2);
      &::before {
        background: linear-gradient(90deg, transparent 0%, rgba(144, 147, 255, 0.4) 50%, transparent 100%);
      }
      :deep(.c-icon) {
        color: #9093ff;
      }
      &:hover {
        background: linear-gradient(135deg, rgba(144, 147, 255, 0.18) 0%, rgba(144, 147, 255, 0.12) 100%);
        border-color: rgba(144, 147, 255, 0.35);
        box-shadow: 0 2px 8px rgba(144, 147, 255, 0.25);
        color: #9093ff;
      }
    }

    &.color-green {
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(103, 194, 58, 0.05) 100%);
      border-color: rgba(103, 194, 58, 0.2);
      &::before {
        background: linear-gradient(90deg, transparent 0%, rgba(103, 194, 58, 0.4) 50%, transparent 100%);
      }
      :deep(.c-icon) {
        color: #67c23a;
      }
      &:hover {
        background: linear-gradient(135deg, rgba(103, 194, 58, 0.18) 0%, rgba(103, 194, 58, 0.12) 100%);
        border-color: rgba(103, 194, 58, 0.35);
        box-shadow: 0 2px 8px rgba(103, 194, 58, 0.25);
        color: #67c23a;
      }
    }

    &.color-orange {
      background: linear-gradient(135deg, rgba(230, 162, 60, 0.1) 0%, rgba(230, 162, 60, 0.05) 100%);
      border-color: rgba(230, 162, 60, 0.2);
      &::before {
        background: linear-gradient(90deg, transparent 0%, rgba(230, 162, 60, 0.4) 50%, transparent 100%);
      }
      :deep(.c-icon) {
        color: #e6a23c;
      }
      &:hover {
        background: linear-gradient(135deg, rgba(230, 162, 60, 0.18) 0%, rgba(230, 162, 60, 0.12) 100%);
        border-color: rgba(230, 162, 60, 0.35);
        box-shadow: 0 2px 8px rgba(230, 162, 60, 0.25);
        color: #e6a23c;
      }
    }

    &.color-pink {
      background: linear-gradient(135deg, rgba(245, 108, 108, 0.1) 0%, rgba(245, 108, 108, 0.05) 100%);
      border-color: rgba(245, 108, 108, 0.2);
      &::before {
        background: linear-gradient(90deg, transparent 0%, rgba(245, 108, 108, 0.4) 50%, transparent 100%);
      }
      :deep(.c-icon) {
        color: #f56c6c;
      }
      &:hover {
        background: linear-gradient(135deg, rgba(245, 108, 108, 0.18) 0%, rgba(245, 108, 108, 0.12) 100%);
        border-color: rgba(245, 108, 108, 0.35);
        box-shadow: 0 2px 8px rgba(245, 108, 108, 0.25);
        color: #f56c6c;
      }
    }

    &.color-cyan {
      background: linear-gradient(135deg, rgba(64, 201, 255, 0.1) 0%, rgba(64, 201, 255, 0.05) 100%);
      border-color: rgba(64, 201, 255, 0.2);
      &::before {
        background: linear-gradient(90deg, transparent 0%, rgba(64, 201, 255, 0.4) 50%, transparent 100%);
      }
      :deep(.c-icon) {
        color: #40c9ff;
      }
      &:hover {
        background: linear-gradient(135deg, rgba(64, 201, 255, 0.18) 0%, rgba(64, 201, 255, 0.12) 100%);
        border-color: rgba(64, 201, 255, 0.35);
        box-shadow: 0 2px 8px rgba(64, 201, 255, 0.25);
        color: #40c9ff;
      }
    }
  }
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

