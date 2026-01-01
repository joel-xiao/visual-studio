<template>
  <transition name="slide-up">
    <div v-if="suggestions.length > 0 && !loading" class="suggestions-container" :class="`display-${displayMode}`">
      <div class="suggestions-content">
        <div class="suggestions-header">
          <div
            class="ai-toggle-btn"
            :class="{ active: aiSuggestionsEnabled }"
            title="切换AI智能建议"
            @click="$emit('toggle-ai-suggestions')"
          >
            <CIcon icon="mdi:robot-outline" />
          </div>
          <span class="suggestions-label">快速操作</span>
          <div class="toggle-btn" :title="isCompact ? '展开建议' : '收起建议'" @click="toggleDisplayMode">
            <CIcon :icon="isCompact ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
          </div>
        </div>

        <div v-if="isCompact" class="suggestions-compact">
          <div
            v-for="(suggestion, index) in suggestions.slice(0, 3)"
            :key="index"
            class="suggestion-pill"
            :style="getSuggestionStyle(suggestion.color)"
            @click="$emit('suggestion-click', suggestion)"
          >
            <CIcon v-if="suggestion.icon" :icon="suggestion.icon" :style="getIconStyle(suggestion.color)" />
            <span>{{ suggestion.label }}</span>
          </div>
          <div
            v-if="suggestions.length > 3"
            class="more-btn"
            title="显示更多建议"
            @click="toggleDisplayMode"
          >
            <span class="more-text">更多</span>
          </div>
        </div>

        <div v-else class="suggestions-grid">
          <div
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="suggestion-item"
            :style="getSuggestionStyle(suggestion.color)"
            @click="$emit('suggestion-click', suggestion)"
          >
            <CIcon v-if="suggestion.icon" :icon="suggestion.icon" :style="getIconStyle(suggestion.color)" />
            <span>{{ suggestion.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { IPromptSuggestion } from '../hooks/chat/use-chat-context';
import CIcon from '../../../ui/controls/c-icon/index.vue';

interface Props {
  suggestions: IPromptSuggestion[];
  loading: boolean;
  aiSuggestionsEnabled: boolean;
}

defineProps<Props>();

defineEmits<{
  'suggestion-click': [suggestion: IPromptSuggestion];
  'toggle-ai-suggestions': [];
}>();

// 建议显示模式：compact(紧凑) -> full(完整)
const displayMode = ref<'compact' | 'full'>('compact');
const isCompact = computed(() => displayMode.value === 'compact');

const toggleDisplayMode = () => {
  if (displayMode.value === 'compact') {
    displayMode.value = 'full';
  } else {
    displayMode.value = 'compact';
  }
};

// 检查是否为十六进制颜色
const isHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// 获取建议项样式
const getSuggestionStyle = (color?: string) => {
  if (!color) {
    return {};
  }

  // 如果是十六进制颜色，生成相应的样式
  if (isHexColor(color)) {
    return {
      background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
      borderColor: `${color}25`
    };
  }

  // 对于其他颜色格式，直接应用
  return {
    background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
    borderColor: `${color}25`
  };
};

// 获取图标样式
const getIconStyle = (color?: string) => {
  if (!color) {
    return {};
  }

  // 如果是十六进制颜色，直接应用
  if (isHexColor(color)) {
    return {
      color
    };
  }

  // 对于其他颜色格式，直接应用
  return {
    color
  };
};
</script>

<style scoped lang="scss">
.suggestions-container {
  .suggestions-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }

  .suggestions-header {
    display: flex;
    align-items: center;
    gap: 8px;

    .toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);

      :deep(.c-icon) {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08);

        :deep(.c-icon) {
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }

    .suggestions-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
      flex: 1;
    }
  }

  // 紧凑模式：显示前3个 + 更多按钮
  &.display-compact {
    .suggestions-content {
      gap: 6px;
      padding: 7px 10px;
      border-radius: 6px;
    }

    .suggestions-compact {
      display: flex;
      align-items: center;
      gap: 5px;
      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }

      .suggestion-pill {
        display: flex;
        align-items: center;
        gap: 5px;
        height: 24px;
        padding: 0 10px;
        border-radius: 4px;
        font-size: 11px;
        color: var(--theme-color-text);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);

        :deep(.c-icon) {
          font-size: 12px;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
          opacity: 0.9;
        }
      }

      .more-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 24px;
        padding: 0 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        flex-shrink: 0;

        .more-text {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          .more-text {
            color: rgba(255, 255, 255, 0.9);
          }
        }
      }
    }
  }

  // 完整模式：显示所有建议
  &.display-full {
    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 6px;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 400;
      color: var(--theme-color-text);
      cursor: pointer;
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      min-height: 32px;

      :deep(.c-icon) {
        font-size: 14px;
        opacity: 0.8;
        flex-shrink: 0;
      }

      span {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12);
        transform: translateY(-1px);
        opacity: 0.9;
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  // AI开关按钮（所有模式共用）
  .ai-toggle-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    opacity: 0.6;

    :deep(.c-icon) {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }

    &:hover {
      opacity: 0.8;
      background: rgba(255, 255, 255, 0.08);
    }

    &.active {
      opacity: 1;
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.08) 100%);
      border-color: rgba(103, 194, 58, 0.3);

      :deep(.c-icon) {
        color: #67c23a;
      }

      &:hover {
        background: linear-gradient(135deg, rgba(103, 194, 58, 0.25) 0%, rgba(103, 194, 58, 0.15) 100%);
        box-shadow: 0 2px 6px rgba(103, 194, 58, 0.2);
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
</style>
