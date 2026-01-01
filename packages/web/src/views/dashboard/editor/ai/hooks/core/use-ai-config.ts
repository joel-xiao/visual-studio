import { createDashScope } from '../../config/provider';

let cached:
  | {
      defaultModel: any;
      visionModel: any;
      openai: any;
    }
  | null = null;

/**
 * AI Config Hook
 * 提供 AI 配置和模型
 */
export function useAIConfig() {
  if (cached) return cached;

  const openai = createDashScope({
    apiKey: 'sk-f6428df10fa843488f78fe715f403ab0',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  });
  cached = {
    openai,
    defaultModel: openai.chat('qwen-max'),
    visionModel: openai.chat('qwen-vl-max')
  };

  return cached;
}
