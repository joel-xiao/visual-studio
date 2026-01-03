import { merge } from 'lodash';
import { unref } from 'vue';
import type { IAIContext } from '../../hooks/core/use-ai-context';
import { asRecord, safeParseJSON, safeStringifyJSON } from '../../utils/json-utils';
import type { JsonValue } from '../../../../../@types/utils';

/**
 * 更新图表选项的通用函数
 */
export function updateChartOptions(
  context: IAIContext,
  nodeId: string,
  options: Record<string, JsonValue>
): void {
  const { nodeContext } = context;
  const nodesValue = unref(nodeContext.getNodes());
  const currentNode = nodesValue.find(n => n.id === nodeId);

  if (!currentNode) return;

  const code = currentNode.props?.code;
  const optionsStr = typeof code?.options === 'string' ? code.options : undefined;
  const currentOpts = safeParseJSON<Record<string, JsonValue>>(optionsStr, {} as Record<string, JsonValue>);
  const merged = merge({}, currentOpts, options) as Record<string, JsonValue>;

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
  chartOptions: Record<string, Record<string, JsonValue>>
): void {
  Object.keys(chartOptions).forEach(nodeId => {
    updateChartOptions(context, nodeId, chartOptions[nodeId]);
  });
}

/**
 * 合并节点属性中的 JSON 选项
 */
export function mergeNodeOptions(node: INode, updateData: Record<string, JsonValue>): INode {
  const nodeCopy: INode = { ...node };

  const chartDataMap = asRecord(updateData.chartDataMap);
  const chartDataPatch = chartDataMap ? asRecord(chartDataMap[nodeCopy.id]) : undefined;
  if (chartDataPatch) {
    nodeCopy.props = nodeCopy.props || {};
    nodeCopy.props.code = nodeCopy.props.code || {};
    const optionsStr = typeof nodeCopy.props.code.options === 'string' ? nodeCopy.props.code.options : undefined;
    const existingOptions = safeParseJSON<Record<string, JsonValue>>(optionsStr, {} as Record<string, JsonValue>);
    const merged = merge({}, existingOptions, chartDataPatch) as Record<string, JsonValue>;
    nodeCopy.props.code.options = safeStringifyJSON(merged);
  }

  const chartOptions = asRecord(updateData.chartOptions);
  const chartOptionsPatch = chartOptions ? asRecord(chartOptions[nodeCopy.id]) : undefined;
  if (chartOptionsPatch) {
    nodeCopy.props = nodeCopy.props || {};
    nodeCopy.props.code = nodeCopy.props.code || {};
    const optionsStr = typeof nodeCopy.props.code.options === 'string' ? nodeCopy.props.code.options : undefined;
    const existingOptions = safeParseJSON<Record<string, JsonValue>>(optionsStr, {} as Record<string, JsonValue>);
    const merged = merge({}, existingOptions, chartOptionsPatch) as Record<string, JsonValue>;
    nodeCopy.props.code.options = safeStringifyJSON(merged);
  }

  return nodeCopy;
}
