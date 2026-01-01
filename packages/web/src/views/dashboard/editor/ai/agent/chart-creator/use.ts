import { unref } from 'vue';
import type { IAgent, IAgentResponse } from '../../types';
import chartCreatorSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';
import { updateChartOptionsBatch, updateChartOptions } from '../../utils/agent/apply-helpers';
import { safeParseJSON, safeStringifyJSON } from '../../utils/json-utils';
import type { IAIContext } from '../../hooks/core/use-ai-context';

export function useChartCreator(): IAgent {
  const schema = chartCreatorSchema;
  const { processWithAI } = useBaseAgent(schema);

  const process = async (input: string, context?: any, onStream?: any): Promise<IAgentResponse> => {
    const chartNodes = (context?.previousAgentData?.nodes || []).filter((n: any) => n.component?.includes('ECHARTS'));

    // 场景1: 批量美化 (工作流后续步骤)
    if (chartNodes.length > 0) {
      const chartOptions: Record<string, any> = {};
      for (const node of chartNodes) {
        const res = await processWithAI(schema.prompts.beautify(node.component), `优化图表: ${node.name}`, onStream);
        if (res.data?.options) chartOptions[node.id] = res.data.options;
      }
      return { content: '图表已美化', type: 'text', data: { chartOptions } };
    }

    // 场景2: 单图表创建/更新
    const target = context?.selectedNodes?.[0];
    const targetCtx = target ? `Target: ${target.name} (${target.id})` : 'New Chart';

    return processWithAI(schema.prompts.create(targetCtx), input, onStream, (json) => ({
      type: 'chart',
      data: json.data || json.options || json
    }));
  };

  const apply = (context: IAIContext, data: any) => {
    if (data.chartOptions) return updateChartOptionsBatch(context, data.chartOptions);

    const { options, component = 'APACHE_ECHARTS_BAR_SIMPLE', targetNodeId } = data;
    const selected = unref(context.nodeContext.getSelectedNodes());
    const nodeId = targetNodeId || (selected && selected[0]?.id);

    if (nodeId && options) {
      updateChartOptions(context, nodeId, options);
    } else if (options) {
      const defaultProps = context.componentContext.getComponentProps(component);
      context.nodeContext.onAddNode({
        name: data.title || '新图表',
        component,
        schema: component,
        props: { ...defaultProps, code: { ...defaultProps?.code, options: safeStringifyJSON(options) } }
      }, 'root', { x: 500, y: 300 });
    }
  };

  return { role: schema.role, name: schema.name, description: schema.description, process, apply };
}

