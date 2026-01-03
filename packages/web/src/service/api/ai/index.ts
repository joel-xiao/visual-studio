import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

export type AIProviderType = 'custom' | 'openai' | 'anthropic' | 'qwen';

export interface IAIOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  [key: string]: unknown;
}

export interface IAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface IAIResponse {
  role: 'assistant';
  content: string;
  type?: 'text' | 'code' | 'action';
  actions?: unknown[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface IChatRequest {
  provider: AIProviderType;
  model?: string;
  messages: IAIMessage[];
  options?: IAIOptions;
  onStream?: (content: string) => void;
}

const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export type WebAIClientConfig = {
  apiKey?: string;
  baseURL?: string;
  model?: string;
};

let runtimeConfig: Required<WebAIClientConfig> = {
  apiKey: '',
  baseURL: DEFAULT_BASE_URL,
  model: 'qwen-plus'
};

export function initWebAIClient(config: WebAIClientConfig) {
  runtimeConfig = {
    ...runtimeConfig,
    ...config,
    apiKey: config.apiKey === undefined ? runtimeConfig.apiKey : config.apiKey,
    baseURL: config.baseURL === undefined ? runtimeConfig.baseURL : config.baseURL,
    model: config.model === undefined ? runtimeConfig.model : config.model
  };
}

function getRuntimeConfig() {
  return runtimeConfig;
}

async function chatOpenAICompatible(request: IChatRequest): Promise<IAIResponse> {
  if (request.provider === 'anthropic') {
    throw new Error('Provider "anthropic" is not supported in web client yet.');
  }

  const { baseURL, apiKey, model } = getRuntimeConfig();
  const provider = createOpenAI({
    apiKey,
    baseURL,
    name: request.provider === 'qwen' ? 'qwen' : request.provider === 'custom' ? 'custom' : 'openai'
  });

  const options = request.options;
  const callSettings = {
    temperature: typeof options?.temperature === 'number' ? options.temperature : undefined,
    maxOutputTokens:
      typeof options?.maxTokens === 'number'
        ? options.maxTokens
        : typeof (options as { maxOutputTokens?: unknown } | undefined)?.maxOutputTokens === 'number'
          ? (options as { maxOutputTokens?: number }).maxOutputTokens
          : undefined
  };

  const messages = request.messages.map(m => ({ role: m.role, content: m.content }));
  const chatModel = provider.chat(request.model || model);

  if (request.onStream) {
    const result = streamText({
      model: chatModel,
      messages,
      ...callSettings
    });

    let fullContent = '';
    for await (const delta of result.textStream) {
      if (delta) {
        fullContent += delta;
        request.onStream(delta);
      }
    }

    return { role: 'assistant', content: fullContent, type: 'text', actions: [] };
  }

  const result = await generateText({
    model: chatModel,
    messages,
    ...callSettings
  });

  return { role: 'assistant', content: result.text, type: 'text', actions: [] };
}

export const aiApi = {
  chat(request: IChatRequest): Promise<IAIResponse> {
    return chatOpenAICompatible(request);
  }
};
