import type { IAgent, IAgentResponse } from '../../types';
import type { IAgentSchema } from '../../agent/types';
import { generateText } from 'ai';
import { useAIConfig } from '../../hooks/core/use-ai-config';
import { extractJSON } from '../json-utils';
import { getSchemaMessage } from './schema-helpers';

/**
 * 抽象 Agent 基础逻辑
 */
export function useBaseAgent(schema: IAgentSchema) {
  const { defaultModel } = useAIConfig();

  const processWithAI = async (
    systemPrompt: string,
    userPrompt: string,
    onStream?: (partial: Partial<IAgentResponse>) => void,
    extractResponse?: (json: any) => Partial<IAgentResponse>
  ): Promise<IAgentResponse> => {
    onStream?.({ content: getSchemaMessage(schema, 'processing'), type: 'text' });

    const { text } = await generateText({
      model: defaultModel,
      system: systemPrompt,
      prompt: userPrompt
    });

    const json = extractJSON(text);
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


