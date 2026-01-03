import type { IAgentResponse } from '../../types';
import type { IAgentSchema } from '../../agent/types';
import { generateText, streamText } from 'ai';
import type { JsonValue } from '../../../../../@types/utils';
import { getAIRuntimeConfig } from '../../config';
import { useAIConfig } from '../../hooks/core/use-ai-config';
import { asRecord, extractJSON, pickString } from '../json-utils';
import { getSchemaMessage } from './schema-helpers';

type StreamTextMessages = NonNullable<Parameters<typeof streamText>[0]['messages']>;
type GenerateTextMessages = NonNullable<Parameters<typeof generateText>[0]['messages']>;

function normalizeAttachments(value: JsonValue | undefined): Array<{ url: string; kind?: string }> {
  if (!Array.isArray(value)) return [];
  const res: Array<{ url: string; kind?: string }> = [];
  for (const item of value) {
    const obj = asRecord(item);
    const url = obj ? pickString(obj, 'url') : undefined;
    if (!url) continue;
    const kind = obj ? pickString(obj, 'kind') : undefined;
    res.push({ url, kind: kind || undefined });
  }
  return res;
}

/**
 * 抽象 Agent 基础逻辑
 */
export function useBaseAgent(schema: IAgentSchema) {
  const processWithAI = async (
    systemPrompt: string,
    userPrompt: string,
    onStream?: (partial: Partial<IAgentResponse>) => void,
    extractResponse?: (json: JsonValue) => Partial<IAgentResponse>,
    attachments?: JsonValue
  ): Promise<IAgentResponse> => {
    onStream?.({ content: getSchemaMessage(schema, 'processing') });

    const normalized = normalizeAttachments(attachments);
    const usableAttachments = normalized.filter(a => (a.kind || 'image') === 'image' && !!a.url);
    const finalUserPrompt = usableAttachments.length
      ? `用户提供了图片作为参考。请根据图片内容生成/修改大屏相关的结构化配置与代码（例如布局、组件、图表、主题等），不要尝试生成图片或返回图片链接。输出仍需严格符合当前系统/Agent 要求的 JSON 格式。\n\n${userPrompt}`
      : userPrompt;

    const runtime = getAIRuntimeConfig();
    if (runtime.mode === 'external') {
      if (!runtime.external) throw new Error('未配置外部 AI 适配器');
      let rawText = '';
      const res = await runtime.external.chat({
        system: systemPrompt,
        prompt: finalUserPrompt || '',
        attachments: usableAttachments,
        onStream: (delta) => {
          rawText += delta;
          onStream?.({ content: rawText });
        }
      });
      rawText = rawText || res.text;

      let json = extractJSON(rawText);
      if (!json) {
        const retryRes = await runtime.external.chat({
          system: systemPrompt,
          prompt:
            `${finalUserPrompt}\n\n` +
            `你上一条回复无法被解析为 JSON。请重新输出：只返回一个合法 JSON 对象，不要 Markdown，不要解释性文字，字段结构需严格满足 system 约束。\n\n` +
            `上一条输出(截断):\n${rawText.slice(0, 4000)}`,
          attachments: usableAttachments
        });
        rawText = retryRes.text;
        json = extractJSON(rawText);
      }
      if (!json) throw new Error('AI 返回数据格式错误');

      const jsonObj = asRecord(json);
      const response = extractResponse?.(json) ?? {};
      const dataFromJson = jsonObj ? (jsonObj as Record<string, JsonValue>).data : undefined;
      return {
        ...response,
        content: response.content ?? pickString(jsonObj, 'content') ?? getSchemaMessage(schema, 'completed'),
        type: response.type ?? 'text',
        data: response.data ?? (dataFromJson ?? json)
      };
    }

    const { defaultModel, visionModel } = useAIConfig();

    const userContent = usableAttachments.length
      ? [
          { type: 'text' as const, text: finalUserPrompt || '请根据我发送的图片生成大屏相关的结构化结果。' },
          ...usableAttachments.map(a => ({ type: 'image' as const, image: a.url }))
        ]
      : (finalUserPrompt || '');

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userContent }
    ];

    const model = usableAttachments.length ? (visionModel || defaultModel) : defaultModel;
    let rawText = '';
    if (onStream) {
      const result = await streamText({
        model,
        messages: messages as unknown as StreamTextMessages
      });
      for await (const delta of result.textStream) {
        rawText += delta;
        onStream({ content: rawText });
      }
    } else {
      rawText = (await generateText({ model, messages: messages as unknown as GenerateTextMessages })).text;
    }

    let json = extractJSON(rawText);
    if (!json) {
      const retryMessages = [
        ...messages,
        { role: 'assistant' as const, content: rawText.slice(0, 4000) },
        {
          role: 'user' as const,
          content: '你上一条回复无法被解析为 JSON。请重新输出：只返回一个合法 JSON 对象，不要 Markdown，不要解释性文字，字段结构需严格满足 system 约束。'
        }
      ];
      rawText = (await generateText({ model, messages: retryMessages as unknown as GenerateTextMessages })).text;
      json = extractJSON(rawText);
    }
    if (!json) throw new Error('AI 返回数据格式错误');

    const jsonObj = asRecord(json);
    const response = extractResponse?.(json) ?? {};
    const dataFromJson = jsonObj ? (jsonObj as Record<string, JsonValue>).data : undefined;
    return {
      ...response,
      content: response.content ?? pickString(jsonObj, 'content') ?? getSchemaMessage(schema, 'completed'),
      type: response.type ?? 'text',
      data: response.data ?? (dataFromJson ?? json)
    };
  };

  return { processWithAI };
}
