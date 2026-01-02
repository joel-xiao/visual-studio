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
  const { baseURL, apiKey, model } = getRuntimeConfig();
  const url = `${baseURL}/chat/completions`;
  const isStream = !!request.onStream;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: request.model || model,
      messages: request.messages,
      stream: isStream,
      ...request.options
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({} as any));
    throw new Error(errorData.message || `AI API error: ${response.status}`);
  }

  if (isStream) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let buffer = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith('data: ')) continue;
          const jsonStr = trimmedLine.slice(6);
          if (jsonStr === '[DONE]') continue;
          try {
            const json = JSON.parse(jsonStr);
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              request.onStream?.(content);
            }
          } catch (_) {
            continue;
          }
        }
      }
    }

    return { role: 'assistant', content: fullContent, type: 'text', actions: [] };
  }

  const data = await response.json().catch(() => ({} as any));
  if (data.choices && data.choices.length > 0) {
    return {
      role: 'assistant',
      content: data.choices[0].message.content,
      type: 'text',
      actions: []
    };
  }
  throw new Error('No response from AI');
}

export const aiApi = {
  chat(request: IChatRequest): Promise<IAIResponse> {
    return chatOpenAICompatible(request);
  }
};
