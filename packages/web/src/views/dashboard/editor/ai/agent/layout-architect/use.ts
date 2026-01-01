import type { IAgent, IAgentResponse } from '../../types';
import layoutArchitectSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';
import { merge } from 'lodash';
import { mergeNodeOptions } from '../../utils/agent/apply-helpers';
import type { IAIContext } from '../../hooks/core/use-ai-context';

export function useLayoutArchitect(): IAgent {
  const schema = layoutArchitectSchema;
  const { processWithAI } = useBaseAgent(schema);

  const process = async (input: string, context?: any, onStream?: any): Promise<IAgentResponse> => {
    const historyStr = context?.history?.map((h: any) => `${h.role}: ${h.content}`).join('\n') || '';
    const componentList = context?.availableComponents?.map((c: any) => `- ${c.name} (type: ${c.type})`).join('\n') || '';

    return processWithAI(schema.prompts.generate(componentList, historyStr), input, onStream, (json) => {
      if (!json.data?.nodes) throw new Error('返回布局数据格式错误');
      return { data: json.data };
    });
  };

  const apply = (context: IAIContext, data: any) => {
    if (!data?.nodes || !Array.isArray(data.nodes)) return;
    const { nodeContext, componentContext } = context;

    const hydratedNodes = data.nodes.map((node: any) => {
      let nodeCopy = { ...node };
      if (nodeCopy.schema) {
        nodeCopy.props = merge({}, componentContext.getComponentProps(nodeCopy.schema), nodeCopy.props);
      }
      return mergeNodeOptions(nodeCopy, data);
    });

    nodeContext.update({
      name: data.name || '',
      id: data.id || '',
      type: data.type || '',
      nodes: hydratedNodes
    });
  };

  return { role: schema.role, name: schema.name, description: schema.description, process, apply };
}

