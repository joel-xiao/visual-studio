import type { IAgent, IAgentResponse } from '../../types';
import dataAnalystSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';
import { asRecord, pickString } from '../../utils/json-utils';

export function useDataAnalyst(): IAgent {
  const schema = dataAnalystSchema;
  const { processWithAI } = useBaseAgent(schema);

  const process = async (
    input: string,
    context?: unknown,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    const ctx = asRecord(context) ?? {};
    const selectedNodes = Array.isArray(ctx.selectedNodes) ? ctx.selectedNodes : [];
    const selectedCharts = selectedNodes.filter((n: unknown) => {
      const component = pickString(asRecord(n), 'component') || '';
      return component.includes('ECHARTS');
    });

    const prevNodesSource = asRecord(ctx.previousAgentData)?.nodes;
    const prevNodes = Array.isArray(prevNodesSource) ? prevNodesSource : [];
    const prevCharts = prevNodes.filter((n: unknown) => {
      const component = pickString(asRecord(n), 'component') || '';
      return component.includes('ECHARTS');
    });

    const canvasNodes = Array.isArray(ctx.nodes) ? ctx.nodes : [];
    const canvasCharts = canvasNodes.filter((n: unknown) => {
      const component = pickString(asRecord(n), 'component') || '';
      return component.includes('ECHARTS');
    });

    const chartNodes = selectedCharts.length ? selectedCharts : (prevCharts.length ? prevCharts : canvasCharts);
    const layoutContext = chartNodes.length > 0
      ? `Charts to fill: ${JSON.stringify(chartNodes.map((n: unknown) => {
        const obj = asRecord(n) ?? {};
        return { id: pickString(obj, 'id') || '', name: pickString(obj, 'name') || '' };
      }))}`
      : '';

    return processWithAI(schema.prompts.generate(layoutContext), input, onStream, (json) => ({
      type: 'code',
      data: asRecord(json)?.data || json
    }), Array.isArray(ctx.attachments)
      ? ctx.attachments
          .map(a => asRecord(a) ?? {})
          .filter(a => typeof a.url === 'string')
          .map(a => ({ url: String(a.url), kind: typeof a.kind === 'string' ? a.kind : null }))
      : undefined);
  };

  return { role: schema.role, name: schema.name, description: schema.description, process };
}
