import type { IAgent, IAgentResponse } from '../../types';
import layoutArchitectSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';

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

  return { role: schema.role as any, name: schema.name, description: schema.description, process };
}
