import type { IAgent, IAgentResponse } from '../../types';
import type { IAgentSchema } from '../../agent/types';
import { generateText } from 'ai';
import { useAIConfig } from '../../hooks/core/use-ai-config';
import { extractJSON } from '../json-utils';
import { getSchemaMessage } from './schema-helpers';

/**
 * Agent 基础处理配置
 */
export interface IAgentProcessConfig {
  defaultModel: any;
  schema: IAgentSchema;
  onStream?: (partial: Partial<IAgentResponse>) => void;
}

/**
 * 基础的 Agent 处理函数
 * 处理通用的 AI 生成和 JSON 提取逻辑
 */
export async function processAgentWithAI(
  config: IAgentProcessConfig,
  systemPrompt: string,
  userPrompt: string,
  extractResult: (result: any) => IAgentResponse | null
): Promise<IAgentResponse> {
  const { defaultModel, schema, onStream } = config;

  // 发送处理中消息
  if (onStream) {
    onStream({ 
      content: getSchemaMessage(schema, 'processing'), 
      type: 'text' 
    });
  }

  // 生成文本
  const { text } = await generateText({
    model: defaultModel,
    system: systemPrompt,
    prompt: userPrompt
  });

  // 提取 JSON
  const result = extractJSON(text);
  if (!result) {
    throw new Error('Failed to extract JSON from AI response');
  }

  // 使用自定义提取函数处理结果
  const response = extractResult(result);
  if (!response) {
    throw new Error('Failed to process AI response');
  }

  return response;
}

/**
 * 创建简单的 Agent 处理函数（标准模式）
 * 适用于大多数简单的 agent（如 data-analyst, theme-engine）
 */
export function createSimpleAgentProcess(
  schema: IAgentSchema,
  getSystemPrompt: (context: any) => string,
  extractResponse: (result: any, schema: IAgentSchema) => IAgentResponse
) {
  return async (
    input: string,
    context?: any,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    const { defaultModel } = useAIConfig();
    
    return processAgentWithAI(
      { defaultModel, schema, onStream },
      getSystemPrompt(context || {}),
      input,
      (result) => extractResponse(result, schema)
    );
  };
}

