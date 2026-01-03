import { unref } from 'vue';
import type { IAIContext } from '../../hooks/core/use-ai-context';
import { updateChartOptionsBatch, updateChartOptions } from '../../utils/agent/apply-helpers';
import { asRecord, pickNumber, pickString, safeStringifyJSON } from '../../utils/json-utils';
import chartCreatorSchema from './schema';
import type { JsonValue } from '../../../../../@types/utils';

/**
 * Chart Creator 数据应用逻辑
 * 负责将 AI 建议的图表配置应用到编辑器画布
 */
export function apply(context: IAIContext, data: unknown) {
  const defaults = asRecord(chartCreatorSchema.config?.defaults);
  const defaultComponent = pickString(defaults, 'component') || 'APACHE_ECHARTS_BAR_SIMPLE';
  const defaultName = pickString(defaults, 'createName') || '新图表';
  const defaultPosition = asRecord(defaults?.createPosition);
  const createPosition = {
    x: pickNumber(defaultPosition, 'x') ?? 500,
    y: pickNumber(defaultPosition, 'y') ?? 300
  };

  const d = asRecord(data) ?? {};

  // 场景 1: 批量更新 (来自 Workflow)
  const chartOptionsRaw = asRecord(d.chartOptions);
  if (chartOptionsRaw) {
    const chartOptions: Record<string, Record<string, JsonValue>> = {};
    for (const [nodeId, opts] of Object.entries(chartOptionsRaw)) {
      const obj = asRecord(opts);
      if (obj) chartOptions[nodeId] = obj;
    }
    return updateChartOptionsBatch(context, chartOptions);
  }

  // 场景 2: 单个更新/创建
  const options = asRecord(d.options);
  const resolvedComponent = pickString(d, 'component') || defaultComponent;
  const targetNodeId = pickString(d, 'targetNodeId');
  const applyMode = pickString(d, 'applyMode');

  // 显式指定了应用模式或尝试查找当前选中节点
  const selectedNodes = unref(context.nodeContext.getSelectedNodes());
  const selectedId = Array.isArray(selectedNodes)
    ? pickString(selectedNodes[0], 'id')
    : pickString(selectedNodes, 'id');
  const nodeId = targetNodeId || selectedId;

  if (nodeId && options && (applyMode === 'update' || applyMode !== 'create')) {
    // 执行更新逻辑
    updateChartOptions(context, nodeId, options);
  } else if (options) {
    // 执行新建逻辑
    const defaultProps = context.componentContext.getComponentProps(resolvedComponent);
    const node = context.nodeContext.onAddNode({
      name: pickString(d, 'title') || pickString(d, 'name') || defaultName,
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
