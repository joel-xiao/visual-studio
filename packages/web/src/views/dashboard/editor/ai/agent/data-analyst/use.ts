import type { IAgent, IAgentResponse } from '../../types';
import dataAnalystSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';
import { updateChartOptionsBatch } from '../../utils/agent/apply-helpers';
import type { IAIContext } from '../../hooks/core/use-ai-context';

export function useDataAnalyst(): IAgent {
  const schema = dataAnalystSchema;
  const { processWithAI } = useBaseAgent(schema);

  const process = async (input: string, context?: any, onStream?: any): Promise<IAgentResponse> => {
    const chartNodes = (context?.previousAgentData?.nodes || []).filter((n: any) => n.component?.includes('ECHARTS'));
    const layoutContext = chartNodes.length > 0 ? `Charts to fill: ${JSON.stringify(chartNodes.map((n: any) => ({ id: n.id, name: n.name })))}` : '';

    return processWithAI(schema.prompts.generate(layoutContext), input, onStream, (json) => ({
      type: 'code',
      data: json.data || json
    }));
  };

  const apply = (context: IAIContext, data: any) => {
    if (data.chartOptions) updateChartOptionsBatch(context, data.chartOptions);
  };

  return { role: schema.role, name: schema.name, description: schema.description, process, apply };
}

