import type { IAgentSchema } from '../../agent/types';

export function createRoutingPrompt(schema: IAgentSchema): (agentList: string, context: any) => string {
  return (agentList: string, context: any) => {
    const selectedNodes = context?.selectedNodes || [];
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

