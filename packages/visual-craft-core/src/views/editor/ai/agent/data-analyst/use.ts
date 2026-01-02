import type { IAgent, IAgentResponse } from '../../types';
import dataAnalystSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';

export function useDataAnalyst(): IAgent {
  const schema = dataAnalystSchema;
  const { processWithAI } = useBaseAgent(schema);

  const process = async (input: string, context?: any, onStream?: any): Promise<IAgentResponse> => {
    const selectedNodes = Array.isArray(context?.selectedNodes) ? context.selectedNodes : [];
    const selectedCharts = selectedNodes.filter((n: any) => n?.component?.includes('ECHARTS'));

    const prevNodes = Array.isArray(context?.previousAgentData?.nodes) ? context.previousAgentData.nodes : [];
    const prevCharts = prevNodes.filter((n: any) => n?.component?.includes('ECHARTS'));

    const canvasNodes = Array.isArray(context?.nodes) ? context.nodes : [];
    const canvasCharts = canvasNodes.filter((n: any) => n?.component?.includes('ECHARTS'));

    const chartNodes = selectedCharts.length ? selectedCharts : (prevCharts.length ? prevCharts : canvasCharts);
    const layoutContext = chartNodes.length > 0 ? `Charts to fill: ${JSON.stringify(chartNodes.map((n: any) => ({ id: n.id, name: n.name })))}` : '';

    return processWithAI(schema.prompts.generate(layoutContext), input, onStream, (json) => ({
      type: 'code',
      data: json.data || json
    }), context?.attachments);
  };

  return { role: schema.role as any, name: schema.name, description: schema.description, process };
}
