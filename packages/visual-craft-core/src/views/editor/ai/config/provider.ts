import { createOpenAI } from '@ai-sdk/openai';
import { asRecord, isString, pickString } from '../utils/json-utils';

/**
 * Creates a configured OpenAI provider instance specifically for Alibaba Cloud DashScope (Qwen).
 */
export const createDashScope = (config: { apiKey: string; baseURL: string }) => {
  const baseProvider = createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    fetch: async (url, options) => {
      if (!config.apiKey) {
        throw new Error('未配置 DashScope API Key');
      }

      if (options && options.body && isString(options.body)) {
        try {
          const body = JSON.parse(options.body);

          // Fix the role: DashScope rejects 'developer' role
          if (body.messages && Array.isArray(body.messages)) {
            body.messages.forEach((msg: unknown) => {
              const obj = asRecord(msg);
              if (!obj) return;
              if (pickString(obj, 'role') === 'developer') obj.role = 'system';
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
          let errorText = '';
          try {
            errorText = await response.clone().text();
          } catch (_) {
            errorText = '';
          }
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
