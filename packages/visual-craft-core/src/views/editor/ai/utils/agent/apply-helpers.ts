import { merge } from 'lodash';
import type { IAIContext } from '../../hooks/core/use-ai-context';
import { safeParseJSON, safeStringifyJSON } from '../../utils/json-utils';

/**
 * 更新图表选项的通用函数
 */
export function updateChartOptions(
  context: IAIContext,
  nodeId: string,
  options: any
): void {
  const { nodeContext } = context;
  const nodes = nodeContext.getNodes();
  const nodesValue = Array.isArray(nodes) ? nodes : (nodes as any).value || [];
  const currentNode = nodesValue.find((n: any) => n.id === nodeId);

  if (!currentNode) return;

  const currentOpts = safeParseJSON(currentNode.props?.code?.options);
  const merged = merge({}, currentOpts, options);

  nodeContext.updateNodeProps(nodeId, {
    key: 'code.options',
    value: safeStringifyJSON(merged)
  }, false);
}

/**
 * 批量更新图表选项
 */
export function updateChartOptionsBatch(
  context: IAIContext,
  chartOptions: Record<string, any>
): void {
  Object.keys(chartOptions).forEach(nodeId => {
    updateChartOptions(context, nodeId, chartOptions[nodeId]);
  });
}

/**
 * 合并节点属性中的 JSON 选项
 */
export function mergeNodeOptions(node: any, updateData: any): any {
  const nodeCopy = { ...node };

  if (updateData.chartDataMap && updateData.chartDataMap[nodeCopy.id]) {
    nodeCopy.props = nodeCopy.props || {};
    nodeCopy.props.code = nodeCopy.props.code || {};
    const existingOptions = safeParseJSON(nodeCopy.props.code.options);
    const merged = merge({}, existingOptions, updateData.chartDataMap[nodeCopy.id]);
    nodeCopy.props.code.options = safeStringifyJSON(merged);
  }

  if (updateData.chartOptions && updateData.chartOptions[nodeCopy.id]) {
    nodeCopy.props = nodeCopy.props || {};
    nodeCopy.props.code = nodeCopy.props.code || {};
    const existingOptions = safeParseJSON(nodeCopy.props.code.options);
    const merged = merge({}, existingOptions, updateData.chartOptions[nodeCopy.id]);
    nodeCopy.props.code.options = safeStringifyJSON(merged);
  }

  return nodeCopy;
}
