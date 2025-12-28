import { merge } from 'lodash';
import type { IAIContext } from '../../hooks/core/use-ai-context';
import { mergeNodeOptions } from '../../utils/agent/apply-helpers';

/// <reference types="../../../../types/node" />

interface ILayoutData {
  nodes?: INode[];
  [key: string]: unknown;
}

/**
 * Layout Architect Agent Apply
 * 处理布局数据的应用逻辑
 */
export function apply(context: IAIContext, data: unknown): void {
  const { nodeContext, componentContext } = context;
  const { getComponentProps } = componentContext;

  const dataObj = data as ILayoutData;
  if (!dataObj?.nodes || !Array.isArray(dataObj.nodes)) return;

  const validNodes = dataObj.nodes.filter(
    (node): node is INode => node && typeof node === 'object' && !Array.isArray(node) && 'id' in node
  );

  if (validNodes.length > 0) {
    const hydratedNodes = validNodes.map((node) => {
      let nodeCopy = { ...node };

      // 合并默认属性
      if (nodeCopy.schema) {
        const defaultProps = getComponentProps(nodeCopy.schema);
        nodeCopy.props = merge({}, defaultProps, nodeCopy.props);
      }

      // 使用通用函数合并节点选项
      nodeCopy = mergeNodeOptions(nodeCopy, dataObj);

      return nodeCopy;
    });

    // 构造完整的编辑器数据
    const currentData: IEditorData = {
      name: dataObj.name as string || '',
      id: dataObj.id as string || '',
      type: dataObj.type as string || '',
      nodes: hydratedNodes
    };

    nodeContext.update(currentData);
  }
}

