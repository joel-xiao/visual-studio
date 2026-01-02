import type { IAgentResponse, IChatImageAttachment } from '../../../types';
import type { StepWorkflowEngine } from '../../../workflow/core/step-engine';

export interface IHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  attachments?: IChatImageAttachment[];
}

export interface IStepExecutionState {
  engine: StepWorkflowEngine | null;
  currentStep: number;
  totalSteps: number;
  isWaitingForConfirmation: boolean;
  lastResponse: IAgentResponse | null;
  lastInput?: string;
  lastAttachments?: IChatImageAttachment[];
  workflowId?: string;
}

