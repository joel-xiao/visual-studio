import type { IAgent, IAgentResponse } from '../../types';
import chartCreatorSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';

export function useChartCreator(): IAgent {
  const schema = chartCreatorSchema;
  const { processWithAI } = useBaseAgent(schema);

  const process = async (input: string, context?: any, onStream?: any): Promise<IAgentResponse> => {
    const selected = Array.isArray(context?.selectedNodes) ? context.selectedNodes[0] : undefined;
    const selectedIsChart = !!selected && typeof selected === 'object' && (selected as any)?.component?.includes('ECHARTS');

    const workflowChartNodesSource =
      context?.workflowData?.nodes ||
      context?.previousAgentData?.nodes ||
      context?.nodes ||
      [];
    const chartNodes = Array.isArray(workflowChartNodesSource)
      ? workflowChartNodesSource.filter((n: any) => n?.component?.includes('ECHARTS'))
      : [];

    const shouldBatchBeautify =
      !selectedIsChart &&
      chartNodes.length > 0 &&
      (typeof context?.workflowNodeId === 'string' ||
        /全部|所有|批量/.test(String(input || '')));

    // 场景1: 批量美化 (工作流后续步骤)
    if (shouldBatchBeautify) {
      const chartOptions: Record<string, any> = {};
      for (const node of chartNodes) {
        const res = await processWithAI(schema.prompts.beautify(node.component), `优化图表: ${node.name}`, onStream, undefined, context?.attachments);
        const payload = res.data && typeof res.data === 'object' ? res.data as Record<string, any> : {};
        const options = payload.options && typeof payload.options === 'object' ? payload.options : payload;
        if (options && typeof options === 'object') chartOptions[node.id] = options;
      }
      return { content: '图表已美化', type: 'text', data: { chartOptions } };
    }

    // 场景2: 单图表创建/更新
    const target = selectedIsChart ? selected : undefined;
    const targetCtx = target ? `Target: ${target.name} (${target.id})` : 'New Chart';

    return processWithAI(schema.prompts.create(targetCtx), input, onStream, (json) => {
      const root = json && typeof json === 'object' ? json as Record<string, any> : {};
      const dataObj = root.data && typeof root.data === 'object' ? root.data as Record<string, any> : root;
      const normalized = dataObj.options ? dataObj : { options: dataObj };

      return {
        type: 'chart',
        data: normalized
      };
    }, context?.attachments);
  };

  return { role: schema.role, name: schema.name, description: schema.description, process };
}
