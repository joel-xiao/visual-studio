import type { IAgent, IAgentResponse, AgentContext } from '../../types';
import layoutArchitectSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';
import { asRecord, pickString } from '../../utils/json-utils';

export function useLayoutArchitect(): IAgent {
  const schema = layoutArchitectSchema;
  const { processWithAI } = useBaseAgent(schema);

  const process = async (
    input: string,
    context?: AgentContext,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    const ctx = asRecord(context) ?? {};
    const history = Array.isArray(ctx.history) ? ctx.history : [];

    const historyStr = history
      .map(h => {
        const obj = asRecord(h) ?? {};
        const role = pickString(obj, 'role') || 'assistant';
        const content = pickString(obj, 'content') || '';
        const attachments = Array.isArray(obj.attachments) ? obj.attachments : [];
        const count = attachments.length;
        return `${role}: ${content}${count ? ` [图片${count}]` : ''}`;
      })
      .join('\n');

    const availableComponents = Array.isArray(ctx.availableComponents) ? ctx.availableComponents : [];
    const componentList = availableComponents
      .map(c => {
        const obj = asRecord(c) ?? {};
        const name = pickString(obj, 'name') || '';
        const type = pickString(obj, 'type') || '';
        return `- ${name} (type: ${type})`;
      })
      .filter(Boolean)
      .join('\n');

    return processWithAI(schema.prompts.generate(componentList, historyStr), input, onStream, (json) => {
      const obj = asRecord(json) ?? {};
      const data = asRecord(obj.data);
      if (!data?.nodes) throw new Error('返回布局数据格式错误');
      return { data: obj.data };
    }, ctx.attachments);
  };

  return { role: schema.role, name: schema.name, description: schema.description, process };
}
