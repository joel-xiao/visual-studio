import type { IAIContext } from '../../hooks/core/use-ai-context';
import { updateChartOptionsBatch, updateChartOptions } from '../../utils/agent/apply-helpers';
import { safeParseJSON, safeStringifyJSON } from '../../utils/json-utils';

/// <reference types="../../../../types/node" />

/**
 * Chart Creator Agent 数据应用器
 * 直接使用通用工具函数，简化逻辑
 */
export function apply(context: IAIContext, data: unknown): void {
  if (!data) return;

  const dataObj = data as Record<string, unknown>;

  // 场景1: 批量更新图表配置（来自批量美化或工作流）
  if (dataObj.chartOptions && typeof dataObj.chartOptions === 'object') {
    updateChartOptionsBatch(context, dataObj.chartOptions as Record<string, unknown>);
    return;
  }

  // 场景2: 根据 applyMode 决定创建或更新
  const applyMode = dataObj.applyMode as 'create' | 'update' | undefined;

  // 如果指定了更新模式，且有 targetNodeId 或选中节点，则更新
  if (applyMode === 'update' || dataObj.targetNodeId) {
    const targetNodeId = dataObj.targetNodeId as string | undefined;
    const selectedNodes = context.nodeContext.getSelectedNodes();
    const selectedNodesValue = Array.isArray(selectedNodes)
      ? selectedNodes
      : (selectedNodes as { value?: INode[] })?.value || [];

    const nodeId = targetNodeId || selectedNodesValue[0]?.id;
    if (nodeId && dataObj.options) {
      const options = typeof dataObj.options === 'string'
        ? safeParseJSON(dataObj.options, {})
        : dataObj.options;
      updateChartOptions(context, nodeId, options);
      return;
    }
  }

  // 场景3: 创建新图表（包含完整的图表数据）
  if (dataObj.options || dataObj.component || dataObj.schema) {
    const { nodeContext, componentContext } = context;
    const component = (dataObj.component as string) || 'APACHE_ECHARTS_BAR_SIMPLE';
    const schema = (dataObj.schema as string) || component;
    const title = (dataObj.title || dataObj.name) as string || `AI Generated ${dataObj.chartType || 'Chart'}`;

    // 解析 options
    let options = dataObj.options;
    if (typeof options === 'string') {
      options = safeParseJSON(options, {});
    }

    // 获取默认属性并合并
    const defaultProps = componentContext.getComponentProps(schema);
    const optionsString = safeStringifyJSON(options);

    nodeContext.onAddNode(
      {
        name: title,
        schema,
        component,
        props: {
          ...defaultProps,
          code: {
            ...defaultProps?.code,
            options: optionsString
          }
        }
      },
      'root',
      { x: 500, y: 300 }
    );
    return;
  }

  // 场景3: 更新指定节点（包含 targetNodeId）
  if (dataObj.targetNodeId && typeof dataObj.targetNodeId === 'string') {
    const options = typeof dataObj.options === 'string'
      ? safeParseJSON(dataObj.options, {})
      : dataObj.options;
    if (options) {
      updateChartOptions(context, dataObj.targetNodeId as string, options);
    }
    return;
  }

  // 场景4: 更新选中图表（仅包含 options，自动选择第一个选中的节点）
  if (dataObj.options) {
    const selectedNodes = context.nodeContext.getSelectedNodes();
    const selectedNodesValue = Array.isArray(selectedNodes)
      ? selectedNodes
      : (selectedNodes as { value?: INode[] })?.value || [];

    const targetNode = selectedNodesValue[0];
    if (targetNode?.id) {
      const options = typeof dataObj.options === 'string'
        ? safeParseJSON(dataObj.options, {})
        : dataObj.options;
      updateChartOptions(context, targetNode.id, options);
    }
    return;
  }
}

