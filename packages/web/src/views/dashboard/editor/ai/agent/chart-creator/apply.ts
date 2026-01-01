import { unref } from 'vue';
import type { IAIContext } from '../../hooks/core/use-ai-context';
import { updateChartOptionsBatch, updateChartOptions } from '../../utils/agent/apply-helpers';
import { safeStringifyJSON } from '../../utils/json-utils';
import chartCreatorSchema from './schema';

/**
 * Chart Creator 数据应用逻辑
 * 负责将 AI 建议的图表配置应用到编辑器画布
 */
export function apply(context: IAIContext, data: any) {
  const defaults = (chartCreatorSchema.config as any)?.defaults as any;
  const defaultComponent = typeof defaults?.component === 'string' ? defaults.component : 'APACHE_ECHARTS_BAR_SIMPLE';
  const defaultName = typeof defaults?.createName === 'string' ? defaults.createName : '新图表';
  const defaultPosition = defaults?.createPosition && typeof defaults.createPosition === 'object'
    ? defaults.createPosition
    : { x: 500, y: 300 };
  const createPosition = {
    x: typeof defaultPosition.x === 'number' ? defaultPosition.x : 500,
    y: typeof defaultPosition.y === 'number' ? defaultPosition.y : 300
  };

  // 场景 1: 批量更新 (来自 Workflow)
  if (data.chartOptions) {
    return updateChartOptionsBatch(context, data.chartOptions);
  }

  // 场景 2: 单个更新/创建
  const { options, component, targetNodeId, applyMode } = data;
  const resolvedComponent = typeof component === 'string' ? component : defaultComponent;

  // 显式指定了应用模式或尝试查找当前选中节点
  const selectedNodes = unref(context.nodeContext.getSelectedNodes());
  const selectedId = Array.isArray(selectedNodes) ? selectedNodes[0]?.id : (selectedNodes as any)?.id;
  const nodeId = targetNodeId || selectedId;

  if (applyMode === 'update' || (nodeId && options && applyMode !== 'create')) {
    // 执行更新逻辑
    updateChartOptions(context, nodeId, options);
  } else if (options) {
    // 执行新建逻辑
    const defaultProps = context.componentContext.getComponentProps(resolvedComponent);
    const node = context.nodeContext.onAddNode({
      name: data.title || data.name || defaultName,
      component: resolvedComponent,
      schema: resolvedComponent,
      props: {
        ...defaultProps,
        code: { ...defaultProps?.code, options: safeStringifyJSON(options) }
      }
    }, 'root', createPosition);
    if (node?.id) {
      context.nodeContext.onSelectNode(node.id);
    }
  }
}
