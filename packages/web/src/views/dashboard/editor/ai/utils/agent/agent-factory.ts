import type { IAgent, IAgentResponse } from '../../types';
import type { IAgentSchema } from '../../agent/types';
import { useAIConfig } from '../../hooks/core/use-ai-config';
import { getSchemaMessage } from './schema-helpers';

/**
 * Agent 工厂函数
 * 创建统一的 Agent 实例，减少重复代码
 */
export function createAgent(
  schema: IAgentSchema,
  processFn: (input: string, context?: any, onStream?: (partial: Partial<IAgentResponse>) => void) => Promise<IAgentResponse>
): IAgent {
  return {
    role: schema.role,
    name: schema.name,
    description: schema.description,
    process: processFn
  };
}

/**
 * 创建带有处理消息的 Agent 工厂函数
 * 自动处理 onStream 回调中的 processing 消息
 */
export function createAgentWithProcessing(
  schema: IAgentSchema,
  processFn: (
    input: string,
    context: any,
    onStream: ((partial: Partial<IAgentResponse>) => void) | undefined,
    config: { defaultModel: any }
  ) => Promise<IAgentResponse>
): IAgent {
  const { defaultModel } = useAIConfig();

  const process = async (
    input: string,
    context?: any,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    if (onStream) {
      onStream({
        content: getSchemaMessage(schema, 'processing'),
        type: 'text'
      });
    }

    return processFn(input, context || {}, onStream, { defaultModel });
  };

  return createAgent(schema, process);
}

