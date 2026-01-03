import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { getAIRuntimeConfig, getAIRuntimeVersion } from '../../config';

type OpenAIClient = ReturnType<typeof createOpenAI>;
type OpenAIChatModel = ReturnType<OpenAIClient['chat']>;
type StreamTextMessages = NonNullable<Parameters<typeof streamText>[0]['messages']>;

let cached:
  | {
      defaultModel: OpenAIChatModel;
      visionModel: OpenAIChatModel;
      openai: OpenAIClient;
    }
  | null = null;

let cachedVersion = -1;

/**
 * AI Config Hook
 * 提供 AI 配置和模型
 */
export function useAIConfig() {
  const version = getAIRuntimeVersion();
  if (cached && cachedVersion === version) return cached;
  cachedVersion = version;

  const config = getAIRuntimeConfig();
  if (config.mode !== 'builtin') {
    throw new Error('当前 AI 使用外部接管模式，内置模型不可用');
  }

  const { apiKey, baseURL, model, visionModel } = config.builtin;
  const openai = createOpenAI({ apiKey, baseURL });
  cached = {
    openai,
    defaultModel: openai.chat(model),
    visionModel: openai.chat(visionModel)
  };

  return cached;
}

export async function generateTextCompat(args: { system: string; prompt: string; onStream?: (delta: string) => void }): Promise<string> {
  const config = getAIRuntimeConfig();
  if (config.mode === 'external') {
    if (!config.external) throw new Error('未配置外部 AI 适配器');
    const res = await config.external.chat({
      system: args.system,
      prompt: args.prompt,
      onStream: args.onStream
    });
    return res.text;
  }

  const { defaultModel } = useAIConfig();
  if (args.onStream) {
    let acc = '';
    const messages = [
      { role: 'system' as const, content: args.system },
      { role: 'user' as const, content: args.prompt }
    ];
    const result = await streamText({
      model: defaultModel,
      messages: messages as unknown as StreamTextMessages
    });
    for await (const delta of result.textStream) {
      acc += delta;
      args.onStream(delta);
    }
    return acc;
  }

  const { text } = await generateText({ model: defaultModel, system: args.system, prompt: args.prompt });
  return text;
}
