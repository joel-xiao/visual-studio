import type { IAgentResponse } from '../../types';
import type { IAgentSchema } from '../../agent/types';
import { generateText, streamText, type CoreMessage, type UserContent } from 'ai';
import { useAIConfig } from '../../hooks/core/use-ai-config';
import { extractJSON } from '../json-utils';
import { getSchemaMessage } from './schema-helpers';

/**
 * 抽象 Agent 基础逻辑
 */
export function useBaseAgent(schema: IAgentSchema) {
  const { defaultModel, visionModel } = useAIConfig();

  const processWithAI = async (
    systemPrompt: string,
    userPrompt: string,
    onStream?: (partial: Partial<IAgentResponse>) => void,
    extractResponse?: (json: any) => Partial<IAgentResponse>,
    attachments?: { url: string; kind?: string }[]
  ): Promise<IAgentResponse> => {
    onStream?.({ content: getSchemaMessage(schema, 'processing') });

    const usableAttachments = (attachments || []).filter(a => (a.kind || 'image') === 'image' && !!a.url);
    const finalUserPrompt = usableAttachments.length
      ? `用户提供了图片作为参考。请根据图片内容生成/修改大屏相关的结构化配置与代码（例如布局、组件、图表、主题等），不要尝试生成图片或返回图片链接。输出仍需严格符合当前系统/Agent 要求的 JSON 格式。\n\n${userPrompt}`
      : userPrompt;

    const userContent: UserContent = usableAttachments.length
      ? [
          { type: 'text', text: finalUserPrompt || '请根据我发送的图片生成大屏相关的结构化结果。' },
          ...usableAttachments.map(a => ({ type: 'image' as const, image: a.url }))
        ]
      : (finalUserPrompt || '');

    const messages: CoreMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ];

    const model = usableAttachments.length ? (visionModel || defaultModel) : defaultModel;
    let rawText = '';
    if (onStream) {
      const result = await streamText({ model, messages });
      for await (const delta of result.textStream) {
        rawText += delta;
        onStream({ content: rawText });
      }
    } else {
      rawText = (await generateText({ model, messages })).text;
    }

    let json = extractJSON(rawText);
    if (!json) {
      const retryMessages: CoreMessage[] = [
        ...messages,
        { role: 'assistant', content: rawText.slice(0, 4000) },
        {
          role: 'user',
          content: '你上一条回复无法被解析为 JSON。请重新输出：只返回一个合法 JSON 对象，不要 Markdown，不要解释性文字，字段结构需严格满足 system 约束。'
        }
      ];
      rawText = (await generateText({ model, messages: retryMessages })).text;
      json = extractJSON(rawText);
    }
    if (!json) throw new Error('AI 返回数据格式错误');

    const response = extractResponse ? extractResponse(json) : json;

    return {
      content: response.content || json.content || getSchemaMessage(schema, 'completed'),
      type: response.type || 'text',
      data: response.data || json.data || json,
      ...response
    } as IAgentResponse;
  };

  return { processWithAI };
}
