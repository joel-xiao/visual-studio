import type { JsonValue } from '../../../../@types/utils';
import type { IAIContext } from '../hooks/core/use-ai-context';

export interface IAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

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

export const BUILTIN_CHAT_MESSAGE_TYPES = [
  'text',
  'image',
  'code',
  'action',
  'chart',
  'theme-selection',
  'scene-selection',
  'agent-thought'
] as const;

export type ChatMessageType = (typeof BUILTIN_CHAT_MESSAGE_TYPES)[number] | (string & {});

export type AgentContext = Record<string, JsonValue>;

export interface IChatMessage extends IAIMessage {
  id: string;
  type?: ChatMessageType;
  attachments?: IChatImageAttachment[];
  actions?: ISceneAction[];
  isError?: boolean;
  data?: JsonValue; // For holding chart options, layout config, or other structured data
  agent?: AgentRole; // The agent who generated this message
  workflowControl?: IWorkflowControl;
  actionStatus?: Record<string, boolean>;
}

export type ChatMessagePatch = {
  id?: string;
  type?: IChatMessage['type'];
  content?: IChatMessage['content'];
  data?: unknown;
  attachments?: IChatMessage['attachments'];
  actions?: IChatMessage['actions'];
  isError?: IChatMessage['isError'];
  agent?: IChatMessage['agent'];
  workflowControl?: IChatMessage['workflowControl'];
  actionStatus?: IChatMessage['actionStatus'];
};

export interface IAgent {
  role: AgentRole;
  name: string;
  description: string;
  process(
    input: string,
    context?: AgentContext,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse>;
  apply?(context: IAIContext, data: JsonValue): void;
}

export interface IWorkflowControl {
  isMultiStep: boolean;
  currentStep: number;
  totalSteps: number;
  hasNext: boolean;
  currentNodeId?: string;
  nextNodeId?: string;
  nextAgent?: AgentRole;
  workflowId?: string;
  secondaryAction?: {
    label: string;
    kind: 'skip';
    targetNodeId?: string;
  };
}

export interface IAgentResponse {
  content: string;
  type: ChatMessageType;
  data?: JsonValue;
  actions?: ISceneAction[];
  isError?: boolean;
  agent?: AgentRole;
  workflowControl?: IWorkflowControl;
}
