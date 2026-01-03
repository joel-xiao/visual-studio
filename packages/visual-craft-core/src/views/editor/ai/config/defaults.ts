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

export type AIBuiltinOpenAIConfig = {
  apiKey: string;
  baseURL: string;
  model: string;
  visionModel: string;
};

export type AIExternalChatRequest = {
  system: string;
  prompt: string;
  model?: string;
  attachments?: { url: string; kind?: string }[];
  onStream?: (delta: string) => void;
};

export type AIExternalChatResult = { text: string };

export type AIExternalAdapter = {
  chat: (req: AIExternalChatRequest) => Promise<AIExternalChatResult>;
};

export type AIRuntimeMode = 'builtin' | 'external';

export type AIRuntimeConfig = {
  mode: AIRuntimeMode;
  builtin: AIBuiltinOpenAIConfig;
  external: AIExternalAdapter | null;
};

export type AIInitRuntimeConfig = {
  mode?: AIRuntimeMode | string;
  external?: AIExternalAdapter | null;
  builtin?: Partial<AIBuiltinOpenAIConfig>;
};

export type AIInitConfig = {
  runtime?: AIInitRuntimeConfig;
  suggestions?: Partial<AIConfig>;
};

const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

let runtimeConfig: AIRuntimeConfig = {
  mode: 'builtin',
  builtin: {
    apiKey: '',
    baseURL: DEFAULT_BASE_URL,
    model: 'qwen-max',
    visionModel: 'qwen-vl-max'
  },
  external: null
};

let runtimeVersion = 0;

export function initAIRuntime(config: AIInitRuntimeConfig) {
  let mode: AIRuntimeMode = runtimeConfig.mode;
  if (config.mode !== undefined) {
    if (config.mode === 'builtin' || config.mode === 'external') {
      mode = config.mode;
    } else {
      throw new Error(`[AI] invalid runtime mode: ${String(config.mode)}`);
    }
  }

  runtimeConfig = {
    ...runtimeConfig,
    mode,
    builtin: { ...runtimeConfig.builtin, ...(config.builtin || {}) },
    external: config.external === undefined ? runtimeConfig.external : config.external
  };
  runtimeVersion += 1;
}

export function initAIConfig(config?: AIInitConfig) {
  if (!config) {
    initAISuggestionsConfig();
    return;
  }
  if (config.runtime) initAIRuntime(config.runtime);
  if (config.suggestions !== undefined) initAISuggestionsConfig(config.suggestions);
}

export function getAIRuntimeConfig(): AIRuntimeConfig {
  return runtimeConfig;
}

export function getAIRuntimeVersion(): number {
  return runtimeVersion;
}

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

export function initAISuggestionsConfig(config?: Partial<AIConfig>) {
  aiConfig.value = {
    ...DEFAULT_AI_CONFIG,
    ...config,
    suggestions: { ...DEFAULT_AI_CONFIG.suggestions, ...(config?.suggestions || {}) }
  };
}
