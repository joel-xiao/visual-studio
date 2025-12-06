import http from '../http';

// Types for AI Service
export type AIProviderType = 'custom' | 'openai' | 'anthropic' | 'qwen';

export interface IAIOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  [key: string]: any;
}

export interface IAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface IAIResponse {
  role: 'assistant';
  content: string;
  type?: 'text' | 'code' | 'action';
  actions?: any[];
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

/**
 * AI API Service
 * Responsible for dispatching requests to different AI vendors/models
 */
export const aiApi = {
  /**
   * Generic chat completion interface
   */
  chat(request: IChatRequest): Promise<IAIResponse> {
    let url = '/ai/chat';

    // Dispatch to specific endpoints based on provider
    switch (request.provider) {
      case 'qwen':
        return this.chatQwen(request);
      case 'openai':
        url = '/ai/openai/chat';
        break;
      case 'anthropic':
        url = '/ai/anthropic/chat';
        break;
      case 'custom':
      default:
        url = '/ai/chat';
        break;
    }

    return http.post<IAIResponse>(url, request).then(res => {
      if (res.code === 200 && res.data) {
        return {
          ...res.data,
          // Default type to text if missing
          type: res.data.type || 'text',
          // Default actions to empty if missing
          actions: res.data.actions || []
        };
      }
      throw new Error(res.msg || 'AI Request failed');
    });
  },

  /**
   * Specific method for direct OpenAI calls (if client-side key is used - optional)
   */
  async chatOpenAI(messages: IAIMessage[], model = 'gpt-3.5-turbo'): Promise<IAIResponse> {
    // This is a placeholder for direct client-side calls if ever needed
    // Usually better to go through backend proxy (aiApi.chat) to hide keys
    return this.chat({
      provider: 'openai',
      model,
      messages
    });
  },

  /**
   * Direct call to Alibaba Cloud Qwen (Tongyi Qianwen)
   */
  async chatQwen(request: IChatRequest): Promise<IAIResponse> {
    const apiKey = 'sk-f6428df10fa843488f78fe715f403ab0';
    const url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

    try {
      const isStream = !!request.onStream;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: request.model || 'qwen-plus',
          messages: request.messages,
          stream: isStream,
          ...request.options
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Qwen API error: ${response.status}`);
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

            // Keep the last potentially incomplete line in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('data: ')) {
                const jsonStr = trimmedLine.slice(6);
                if (jsonStr === '[DONE]') continue;
                try {
                  const json = JSON.parse(jsonStr);
                  const content = json.choices[0]?.delta?.content || '';
                  if (content) {
                    fullContent += content;
                    request.onStream?.(content);
                  }
                } catch (e) {
                  console.warn('Error parsing stream chunk', e);
                }
              }
            }
          }
        }
        return {
          role: 'assistant',
          content: fullContent,
          type: 'text',
          actions: []
        };
      } else {
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          return {
            role: 'assistant',
            content: data.choices[0].message.content,
            type: 'text', // We will parse this later in the scene
            actions: []
          };
        } else {
          throw new Error('No response from Qwen');
        }
      }
    } catch (e: any) {
      console.error('Qwen API Call Failed:', e);
      throw new Error(e.message || 'Qwen API Request failed');
    }
  }
};
