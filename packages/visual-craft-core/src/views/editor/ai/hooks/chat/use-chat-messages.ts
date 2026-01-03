import { shallowRef, triggerRef } from 'vue';
import type { ChatMessagePatch, IChatMessage } from '../../types';

export function useChatMessages(initialMessages: IChatMessage[] = []) {
  const messages = shallowRef<IChatMessage[]>([...initialMessages]);

  const addOrUpdateMessage = (
    role: 'user' | 'assistant',
    partial: ChatMessagePatch
  ): IChatMessage => {
    const id = partial.id;
    if (id) {
      for (const msg of messages.value) {
        if (msg.id !== id) continue;
        if (partial.type !== undefined) msg.type = partial.type;
        if (partial.content !== undefined) msg.content = partial.content;
        if (partial.data !== undefined) (msg as unknown as { data?: unknown }).data = partial.data;
        if (partial.attachments !== undefined) msg.attachments = partial.attachments;
        if (partial.actions !== undefined) msg.actions = partial.actions;
        if (partial.isError !== undefined) msg.isError = partial.isError;
        if (partial.agent !== undefined) msg.agent = partial.agent;
        if (partial.workflowControl !== undefined) msg.workflowControl = partial.workflowControl;
        if (partial.actionStatus !== undefined) msg.actionStatus = partial.actionStatus;
        triggerRef(messages);
        return msg;
      }
    }
    const newId = id || Date.now().toString() + Math.random().toString(36).slice(2, 9);
    const next: IChatMessage = { id: newId, role, content: partial.content ?? '' };
    if (partial.type !== undefined) next.type = partial.type;
    if (partial.data !== undefined) (next as unknown as { data?: unknown }).data = partial.data;
    if (partial.attachments !== undefined) next.attachments = partial.attachments;
    if (partial.actions !== undefined) next.actions = partial.actions;
    if (partial.isError !== undefined) next.isError = partial.isError;
    if (partial.agent !== undefined) next.agent = partial.agent;
    if (partial.workflowControl !== undefined) next.workflowControl = partial.workflowControl;
    if (partial.actionStatus !== undefined) next.actionStatus = partial.actionStatus;
    messages.value.push(next);
    triggerRef(messages);
    return messages.value[messages.value.length - 1];
  };

  const removeMessage = (id: string) => {
    for (let i = 0; i < messages.value.length; i++) {
      if (messages.value[i]?.id !== id) continue;
      messages.value.splice(i, 1);
      triggerRef(messages);
      break;
    }
  };

  const resetMessages = (nextMessages: IChatMessage[] = []) => {
    messages.value = [...nextMessages];
    triggerRef(messages);
  };

  return { messages, addOrUpdateMessage, removeMessage, resetMessages };
}
