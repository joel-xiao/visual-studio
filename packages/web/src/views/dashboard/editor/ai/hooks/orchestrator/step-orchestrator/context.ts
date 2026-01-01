import { unref } from 'vue';
import type { IChatImageAttachment } from '../../../types';
import type { IAIContext } from '../../core/use-ai-context';
import type { IHistoryItem } from './types';

export const buildChatContext = (params: {
  input?: string;
  attachments?: IChatImageAttachment[];
  aiContext: IAIContext;
  history: IHistoryItem[];
}) => {
  const { input, attachments, aiContext, history } = params;
  return {
    input,
    attachments: attachments || [],
    nodes: unref(aiContext.nodeContext.getNodes()),
    selectedNodes: unref(aiContext.nodeContext.getSelectedNodes()),
    availableComponents: aiContext.componentContext.getAvailableComponents(),
    history: history.map(h => ({ role: h.role, content: h.content, attachments: h.attachments || [] }))
  };
};

