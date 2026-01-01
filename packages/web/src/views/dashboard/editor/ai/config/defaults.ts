import { ref } from 'vue';

/**
 * AI功能默认配置
 */
export interface AIConfig {
  // AI建议生成配置
  suggestions: {
    enabled: boolean;           // 是否启用AI建议生成
    maxAISuggestions: number;   // 最大AI建议数量
    maxPresetSuggestions: number; // 最大预设建议数量
  };
  
  // 其他AI功能配置可以在这里扩展
  // workflow: {
  //   autoExecute: boolean;
  // };
}

// 默认配置
export const DEFAULT_AI_CONFIG: AIConfig = {
  suggestions: {
    enabled: false,        // 默认关闭AI建议，避免浪费token
    maxAISuggestions: 2,   // 最多2个AI建议
    maxPresetSuggestions: 6 // 最多6个预设建议
  }
};

// 全局配置状态
const aiConfig = ref<AIConfig>({ ...DEFAULT_AI_CONFIG });

/**
 * 获取AI配置
 */
export function useAIConfig() {
  return {
    config: aiConfig,
    
    // AI建议配置
    suggestions: {
      enabled: aiConfig.value.suggestions.enabled,
      toggle: () => {
        aiConfig.value.suggestions.enabled = !aiConfig.value.suggestions.enabled;
      },
      enable: () => {
        aiConfig.value.suggestions.enabled = true;
      },
      disable: () => {
        aiConfig.value.suggestions.enabled = false;
      },
      getMaxAISuggestions: () => aiConfig.value.suggestions.maxAISuggestions,
      getMaxPresetSuggestions: () => aiConfig.value.suggestions.maxPresetSuggestions
    },
    
    // 重置配置
    reset: () => {
      aiConfig.value = { ...DEFAULT_AI_CONFIG };
    },
    
    // 更新配置
    update: (newConfig: Partial<AIConfig>) => {
      aiConfig.value = { ...aiConfig.value, ...newConfig };
    }
  };
}

/**
 * 获取AI建议配置的便捷函数
 */
export function useAISuggestionsConfig() {
  const { suggestions } = useAIConfig();
  return suggestions;
}