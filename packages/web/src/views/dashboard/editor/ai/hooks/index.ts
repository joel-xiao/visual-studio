export { initAIContextExplicit, useAIContext, useAIContextOptional } from './core/use-ai-context';
export type { IAIContext } from './core/use-ai-context';
export { useAIConfig } from './core/use-ai-config';

export { useChat } from './chat/use-chat';
export type { IUseChatOptions } from './chat/use-chat';
export { useChatContext } from './chat/use-chat-context';
export type { IPromptSuggestion } from './chat/use-chat-context';

export { useOrchestrator } from './orchestrator/use-orchestrator';
export type { IOrchestratorOptions, IHistoryItem } from './orchestrator/use-orchestrator';
export { useWorkflow } from './orchestrator/use-workflow';

export {
  registerAgents,
  getAgentSchemas,
  getAgentSchema,
  getAgentInfo,
  applyAgentData,
  getAgentComponent,
  getAgentComponentByMessageType
} from '../agent/registry';
export type { IAgentSchema } from '../agent/types';
export * from '../agent/chart-creator/use';
export * from '../agent/data-analyst/use';
export * from '../agent/layout-architect/use';
export * from '../agent/theme-engine/use';
