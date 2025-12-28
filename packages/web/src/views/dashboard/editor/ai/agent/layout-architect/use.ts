import type { IAgent, IAgentResponse } from '../../types';
import layoutArchitectSchema from './schema';
import { createAgent } from '../../utils/agent/agent-factory';
import { processAgentWithAI } from '../../utils/agent/base-agent';
import { getSchemaMessage } from '../../utils/agent/schema-helpers';
import { useAIConfig } from '../../hooks/core/use-ai-config';

interface IContext {
  history?: Array<{ role: string; content: string }>;
  availableComponents?: Array<{ name: string; type: string }>;
}

/**
 * Layout Architect Agent
 * 使用通用工具函数简化实现
 */
export function useLayoutArchitect(): IAgent {
  const { defaultModel } = useAIConfig();
  const schema = layoutArchitectSchema;

  const process = async (
    input: string,
    context?: IContext,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    const history = context?.history || [];
    const historyStr = history.length > 0
      ? `\n### Conversation History:\n${history.map((h) => `${h.role}: ${h.content}`).join('\n')}`
      : '';

    const availableComponents = context?.availableComponents || [];
    const componentList = availableComponents.map((c) => `- ${c.name} (type: ${c.type}, schema: ${c.type})`).join('\n');

    const response = await processAgentWithAI(
      { defaultModel, schema, onStream },
      schema.prompts.generate(componentList, historyStr),
      input,
      (result) => {
    if (!result.data?.nodes || !Array.isArray(result.data.nodes)) {
      throw new Error('Invalid response structure');
    }

    if (onStream) {
      onStream({
        content: getSchemaMessage(schema, 'applying'),
        type: 'text',
        data: result.data
      });
    }

    return {
      content: result.content || getSchemaMessage(schema, 'completed'),
      type: 'text',
      data: result.data
    };
      }
    );

    return response;
  };

  return createAgent(schema, process);
}
