import { createDashScope } from '../../config/provider';

const openai = createDashScope({
  apiKey: 'sk-f6428df10fa843488f78fe715f403ab0',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

const defaultModel = openai.chat('qwen-max');

/**
 * AI Config Hook
 * 提供 AI 配置和模型
 */
export function useAIConfig() {
  return {
    defaultModel,
    openai
  };
}

