import type { IAgentSchema } from '../../agent/types';
import type { AgentContext } from '../../types';

export function createRoutingPrompt(schema: IAgentSchema): (agentList: string, context: AgentContext) => string {
  return (agentList: string, context: AgentContext) => {
    void agentList;
    const selectedNodes = Array.isArray(context.selectedNodes) ? context.selectedNodes : [];
    const { displayName, role, description, routing } = schema;
    let prompt = `**${displayName}** (${role}): ${description}\n\n`;

    if (selectedNodes.length > 0) {
      prompt += routing.priorityRules.withSelection || '';
    } else {
      prompt += routing.priorityRules.withoutSelection || '';
    }

    return prompt;
  };
}
