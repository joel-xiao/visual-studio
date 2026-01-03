import { merge } from 'lodash';
import type { IAIContext } from '../../hooks/core/use-ai-context';
import { mergeNodeOptions } from '../../utils/agent/apply-helpers';
import { asRecord, pickString } from '../../utils/json-utils';

/**
 * Layout Architect 数据应用逻辑
 * 负责将 AI 建议的布局配置应用到编辑器画布
 */
export function apply(context: IAIContext, data: unknown) {
    const d = asRecord(data);
    const nodesRaw = d?.nodes;
    if (!Array.isArray(nodesRaw)) return;

    const { nodeContext, componentContext } = context;

    const nodes = nodesRaw.filter((n): n is INode => !!asRecord(n));

    const hydratedNodes = nodes.map((node) => {
        const nodeCopy: INode = { ...node };
        if (nodeCopy.schema) {
            nodeCopy.props = merge({}, componentContext.getComponentProps(nodeCopy.schema), nodeCopy.props);
        }
        return mergeNodeOptions(nodeCopy, d ?? {});
    });

    // 更新编辑器整体布局
    nodeContext.update({
        name: pickString(d, 'name') || '',
        id: pickString(d, 'id') || '',
        type: pickString(d, 'type') || '',
        nodes: hydratedNodes
    });
}
