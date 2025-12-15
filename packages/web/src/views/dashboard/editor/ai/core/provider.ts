import { createOpenAI } from '@ai-sdk/openai';

/**
 * Creates a configured OpenAI provider instance specifically for Alibaba Cloud DashScope (Qwen).
 */
export const createDashScope = (config: { apiKey: string; baseURL?: string }) => {
  const baseProvider = createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    fetch: async (url, options) => {
      if (options && options.body && typeof options.body === 'string') {
        try {
          const body = JSON.parse(options.body);

          // Fix the role: DashScope rejects 'developer' role
          if (body.messages && Array.isArray(body.messages)) {
            body.messages.forEach((msg: any) => {
              if (msg.role === 'developer') {
                msg.role = 'system';
              }
            });
          }

          options.body = JSON.stringify(body);
        } catch (e) {
          console.error('[DashScope] Body parse error:', e);
        }
      }

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[DashScope] API Error:', response.status, response.statusText, errorText);
        }

        return response;
      } catch (fetchError) {
        console.error('[DashScope] Fetch error:', fetchError);
        throw fetchError;
      }
    }
  });

  return baseProvider;
};
