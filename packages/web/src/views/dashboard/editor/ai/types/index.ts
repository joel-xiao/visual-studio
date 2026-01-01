import type { IAIMessage } from '@/service/api/ai';

export interface ISceneAction {
  label: string;
  value: string;
  disabled?: boolean;
}

// 允许扩展的 Agent Role
export type AgentRole = 'layout-architect' | 'chart-creator' | 'data-analyst' | 'theme-engine' | 'orchestrator' | (string & {});

export interface IChatMessage extends IAIMessage {
  id: string;
  type?: 'text' | 'code' | 'action' | 'chart' | 'theme-selection' | 'scene-selection' | 'agent-thought';
  actions?: ISceneAction[];
  isError?: boolean;
  data?: any; // For holding chart options, layout config, or other structured data
  agent?: AgentRole; // The agent who generated this message
}

export interface IAgent {
  role: AgentRole;
  name: string;
  description: string;
  process(input: string, context?: any, onStream?: (partial: Partial<IAgentResponse>) => void): Promise<IAgentResponse>;
  apply?(context: any, data: any): void;
}

export interface IAgentResponse {
  content: string;
  type: IChatMessage['type'];
  data?: any;
  actions?: ISceneAction[];
  isError?: boolean;
  agent?: AgentRole;
}

