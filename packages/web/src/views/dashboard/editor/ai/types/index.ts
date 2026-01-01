import type { IAIMessage } from '@/service/api/ai';

export interface ISceneAction {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface IChatImageAttachment {
  id: string;
  kind: 'image';
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
  status?: 'uploading' | 'ready' | 'error';
}

// 允许扩展的 Agent Role
export type AgentRole = 'layout-architect' | 'chart-creator' | 'data-analyst' | 'theme-engine' | 'suggestion-generator' | 'orchestrator' | (string & {});

export interface IChatMessage extends IAIMessage {
  id: string;
  type?: 'text' | 'image' | 'code' | 'action' | 'chart' | 'theme-selection' | 'scene-selection' | 'agent-thought';
  attachments?: IChatImageAttachment[];
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

export interface IWorkflowControl {
  isMultiStep: boolean;
  currentStep: number;
  totalSteps: number;
  hasNext: boolean;
  nextNodeId?: string;
}

export interface IAgentResponse {
  content: string;
  type: IChatMessage['type'];
  data?: any;
  actions?: ISceneAction[];
  isError?: boolean;
  agent?: AgentRole;
  workflowControl?: IWorkflowControl;
}
