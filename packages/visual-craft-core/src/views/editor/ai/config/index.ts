export { createDashScope } from './provider';
export {
  useAIConfig,
  useAISuggestionsConfig,
  initAIConfig,
  initAISuggestionsConfig,
  initAIRuntime,
  getAIRuntimeConfig,
  getAIRuntimeVersion,
  DEFAULT_AI_CONFIG
} from './defaults';

export type {
  AIBuiltinOpenAIConfig,
  AIInitConfig,
  AIExternalChatRequest,
  AIExternalChatResult,
  AIExternalAdapter,
  AIRuntimeMode,
  AIRuntimeConfig
} from './defaults';
