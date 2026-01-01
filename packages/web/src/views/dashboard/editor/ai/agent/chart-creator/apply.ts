import { unref } from 'vue';
import type { IAIContext } from '../../hooks/core/use-ai-context';
import { updateChartOptionsBatch, updateChartOptions } from '../../utils/agent/apply-helpers';
import { safeStringifyJSON } from '../../utils/json-utils';

/**
 * Chart Creator 数据应用逻辑
 * 负责将 AI 建议的图表配置应用到编辑器画布
 */
export function apply(context: IAIContext, data: any) {
  // 场景 1: 批量更新 (来自 Workflow)
  if (data.chartOptions) {
    return updateChartOptionsBatch(context, data.chartOptions);
  }

  // 场景 2: 单个更新/创建
  const { options, component = 'APACHE_ECHARTS_BAR_SIMPLE', targetNodeId, applyMode } = data;

  // 显式指定了应用模式或尝试查找当前选中节点
  const selectedNodes = unref(context.nodeContext.getSelectedNodes());
  const selectedId = Array.isArray(selectedNodes) ? selectedNodes[0]?.id : (selectedNodes as any)?.id;
  const nodeId = targetNodeId || selectedId;

  if (applyMode === 'update' || (nodeId && options && applyMode !== 'create')) {
    // 执行更新逻辑
    updateChartOptions(context, nodeId, options);
  } else if (options) {
    // 执行新建逻辑
    const defaultProps = context.componentContext.getComponentProps(component);
    context.nodeContext.onAddNode({
      name: data.title || data.name || '新图表',
      component,
      schema: component,
      props: {
        ...defaultProps,
        code: { ...defaultProps?.code, options: safeStringifyJSON(options) }
      }
    }, 'root', { x: 500, y: 300 });
  }
}
