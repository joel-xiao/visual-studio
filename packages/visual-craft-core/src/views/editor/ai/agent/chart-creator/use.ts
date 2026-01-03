import type { IAgent, IAgentResponse } from '../../types';
import chartCreatorSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';
import { asRecord, pickString } from '../../utils/json-utils';
import type { JsonValue } from '../../../../../@types/utils';

export function useChartCreator(): IAgent {
  const schema = chartCreatorSchema;
  const { processWithAI } = useBaseAgent(schema);

  const process = async (
    input: string,
    context?: unknown,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    const ctx = asRecord(context) ?? {};
    const selected = Array.isArray(ctx.selectedNodes) ? ctx.selectedNodes[0] : undefined;
    const selectedIsChart = !!pickString(selected, 'component')?.includes('ECHARTS');

    const workflowChartNodesSource =
      asRecord(ctx.workflowData)?.nodes ||
      asRecord(ctx.previousAgentData)?.nodes ||
      ctx.nodes ||
      [];
    const chartNodes = Array.isArray(workflowChartNodesSource)
      ? workflowChartNodesSource.filter((n: unknown) => !!pickString(n, 'component')?.includes('ECHARTS'))
      : [];

    const shouldBatchBeautify =
      !selectedIsChart &&
      chartNodes.length > 0 &&
      (pickString(ctx, 'workflowNodeId') ||
        /全部|所有|批量/.test(String(input || '')));

    // 场景1: 批量美化 (工作流后续步骤)
    if (shouldBatchBeautify) {
      const chartOptions: Record<string, Record<string, JsonValue>> = {};
      for (const node of chartNodes) {
        const nodeObj = asRecord(node) ?? {};
        const nodeId = pickString(nodeObj, 'id');
        const component = pickString(nodeObj, 'component') || '';
        const name = pickString(nodeObj, 'name') || '';

        const attachments = Array.isArray(ctx.attachments)
          ? ctx.attachments
              .map(a => asRecord(a) ?? {})
              .filter(a => typeof a.url === 'string')
              .map(a => ({ url: String(a.url), kind: typeof a.kind === 'string' ? a.kind : null }))
          : undefined;

        const res = await processWithAI(
          schema.prompts.beautify(component),
          `优化图表: ${name}`,
          onStream,
          undefined,
          attachments
        );

        const payload = asRecord(res.data) ?? {};
        const optionsObj = asRecord(payload.options) ?? payload;
        if (nodeId && optionsObj) chartOptions[nodeId] = optionsObj;
      }
      return { content: '图表已美化', type: 'text', data: { chartOptions } };
    }

    // 场景2: 单图表创建/更新
    const target = selectedIsChart ? selected : undefined;
    const targetObj = asRecord(target);
    const targetName = pickString(targetObj, 'name');
    const targetId = pickString(targetObj, 'id');
    const targetCtx = targetName && targetId ? `Target: ${targetName} (${targetId})` : 'New Chart';

    return processWithAI(schema.prompts.create(targetCtx), input, onStream, (json) => {
      const root = asRecord(json) ?? {};
      const dataObj = asRecord(root.data) ?? root;
      const normalized = dataObj.options ? dataObj : { options: dataObj };

      return {
        type: 'chart',
        data: normalized
      };
    }, Array.isArray(ctx.attachments)
      ? ctx.attachments
          .map(a => asRecord(a) ?? {})
          .filter(a => typeof a.url === 'string')
          .map(a => ({ url: String(a.url), kind: typeof a.kind === 'string' ? a.kind : null }))
      : undefined);
  };

  return { role: schema.role, name: schema.name, description: schema.description, process };
}
