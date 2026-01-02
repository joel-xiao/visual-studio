import { merge } from 'lodash';
import type { IAIContext } from '../../hooks/core/use-ai-context';
import { mergeNodeOptions } from '../../utils/agent/apply-helpers';

/**
 * Layout Architect 数据应用逻辑
 * 负责将 AI 建议的布局配置应用到编辑器画布
 */
export function apply(context: IAIContext, data: any) {
    if (!data?.nodes || !Array.isArray(data.nodes)) return;

    const { nodeContext, componentContext } = context;

    const hydratedNodes = data.nodes.map((node: any) => {
        let nodeCopy = { ...node };
        if (nodeCopy.schema) {
            // 填充默认 Props
            nodeCopy.props = merge({}, componentContext.getComponentProps(nodeCopy.schema), nodeCopy.props);
        }
        return mergeNodeOptions(nodeCopy, data);
    });

    // 更新编辑器整体布局
    nodeContext.update({
        name: data.name || '',
        id: data.id || '',
        type: data.type || '',
        nodes: hydratedNodes
    });
}
