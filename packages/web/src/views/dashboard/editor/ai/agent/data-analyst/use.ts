import type { IAgent, IAgentResponse } from '../../types';
import dataAnalystSchema from './schema';
import { createAgent } from '../../utils/agent/agent-factory';
import { processAgentWithAI } from '../../utils/agent/base-agent';
import { getSchemaMessage } from '../../utils/agent/schema-helpers';
import { useAIConfig } from '../../hooks/core/use-ai-config';

interface IContext {
  previousAgentData?: {
    nodes?: Array<{ id: string; name: string; component?: string }>;
  };
}

/**
 * Data Analyst Agent
 * 使用通用工具函数简化实现
 */
export function useDataAnalyst(): IAgent {
  const { defaultModel } = useAIConfig();
  const schema = dataAnalystSchema;

  const process = async (
    input: string,
    context?: IContext,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    const previousData = context?.previousAgentData;
    const chartNodes = previousData?.nodes?.filter((n) => n.component?.includes('APACHE_ECHARTS')) || [];

    const layoutContext = chartNodes.length > 0
      ? `\nCharts to fill: ${JSON.stringify(chartNodes.map((n) => ({ id: n.id, name: n.name })))}`
      : '';

    return processAgentWithAI(
      { defaultModel, schema, onStream },
      schema.prompts.generate(layoutContext),
      input,
      (result) => {
    if (result) {
      return {
        content: result.content || getSchemaMessage(schema, 'completed'),
        type: 'code',
        data: result.data
      };
    }
        return null;
      }
    );
  };

  return createAgent(schema, process);
}
