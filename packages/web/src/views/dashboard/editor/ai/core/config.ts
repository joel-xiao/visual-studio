import { createDashScope } from './provider';

// Initialize the DashScope (Qwen) provider
// Note: In a real app, you should not expose API keys on the client side.
export const openai = createDashScope({
  apiKey: 'sk-f6428df10fa843488f78fe715f403ab0',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

// No local imports expected in sdk-config usually.
// Let's view it first to be sure.ovider which handles all compatibility issues internally.
export const defaultModel = openai.chat('qwen-max');
