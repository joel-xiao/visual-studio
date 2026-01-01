import type { IStepExecutionState } from './types';

export const createInitialExecutionState = (): IStepExecutionState => ({
  engine: null,
  currentStep: 0,
  totalSteps: 0,
  isWaitingForConfirmation: false,
  lastResponse: null,
  lastInput: '',
  lastAttachments: [],
  workflowId: ''
});

