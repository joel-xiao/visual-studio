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
      for (let i = 0; i < messages.value.length; i++) {
        const prev = messages.value[i];
        if (!prev || prev.id !== id) continue;

        const next = { ...prev } as IChatMessage;
        if (partial.type !== undefined) next.type = partial.type;
        if (partial.content !== undefined) next.content = partial.content;
        if (partial.data !== undefined) (next as unknown as { data?: unknown }).data = partial.data;
        if (partial.attachments !== undefined) next.attachments = partial.attachments;
        if (partial.actions !== undefined) next.actions = partial.actions;
        if (partial.isError !== undefined) next.isError = partial.isError;
        if (partial.agent !== undefined) next.agent = partial.agent;
        if (partial.workflowControl !== undefined) next.workflowControl = partial.workflowControl;
        if (partial.actionStatus !== undefined) next.actionStatus = partial.actionStatus;

        const nextMessages = messages.value.slice();
        nextMessages[i] = next;
        messages.value = nextMessages;
        triggerRef(messages);
        return next;
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
    messages.value = [...messages.value, next];
    triggerRef(messages);
    return next;
  };

  const removeMessage = (id: string) => {
    const nextMessages = messages.value.filter(m => m.id !== id);
    if (nextMessages.length === messages.value.length) return;
    messages.value = nextMessages;
    triggerRef(messages);
  };

  const resetMessages = (nextMessages: IChatMessage[] = []) => {
    messages.value = [...nextMessages];
    triggerRef(messages);
  };

  return { messages, addOrUpdateMessage, removeMessage, resetMessages };
}
