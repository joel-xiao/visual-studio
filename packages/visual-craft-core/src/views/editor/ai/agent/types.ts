import type { JsonValue } from '../../../../@types/utils';
import type { AgentContext, AgentRole, IAgentResponse } from '../types';

export type AgentMessageValue = string | ((...args: JsonValue[]) => string);

export const DEFAULT_AGENT_MESSAGES = {
  processing: '正在处理...',
  applying: '正在应用...',
  completed: '已完成'
} as const;

export type AgentMessageKey = keyof typeof DEFAULT_AGENT_MESSAGES;

export interface IRoutingRules {
  hints: string[]; // 关键词线索，作为语义分析的补充参考
  tags: string[]; // 语义标签，用于意图打标
  intent: string; // 核心职能描述
  priorityRules: {
    withSelection?: string;
    withoutSelection?: string;
  };
  routingPrompt: (agentList: string, context: AgentContext) => string;
}

export interface IAgentSchema {
  id: string;
  role: AgentRole;
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  color?: string;
  routing: IRoutingRules;
  uiHints?: {
    fullWidth?: boolean;
    primaryActionText?: string;
    secondaryActionText?: string;
    applyStrategy?: 'manual' | 'auto';
  };
  prompts: Record<string, (...args: string[]) => string>;
  messages?: Record<string, AgentMessageValue>;
  config?: Record<string, JsonValue>;
}

export function defineAgentSchema<const T extends IAgentSchema>(schema: T): T {
  return schema;
}

export interface IAgentModule {
  schema: IAgentSchema;
  process: (
    input: string,
    context?: AgentContext,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ) => Promise<IAgentResponse>;
}
