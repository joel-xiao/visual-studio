import { ref } from 'vue';
import type { IChatMessage } from '../../types';

export function useChatMessages(initialMessages: IChatMessage[] = []) {
  const messages = ref<IChatMessage[]>([...initialMessages]);

  const addOrUpdateMessage = (
    role: 'user' | 'assistant',
    partial: Partial<IChatMessage> & { id?: string }
  ) => {
    const { id, ...data } = partial;
    if (id) {
      const msg = messages.value.find(m => m.id === id);
      if (msg) return Object.assign(msg, data);
    }
    const newId = id || Date.now().toString() + Math.random().toString(36).slice(2, 9);
    messages.value.push({ id: newId, role, content: '', ...data } as IChatMessage);
    return messages.value[messages.value.length - 1];
  };

  const removeMessage = (id: string) => {
    const index = messages.value.findIndex(m => m.id === id);
    if (index !== -1) messages.value.splice(index, 1);
  };

  const resetMessages = (nextMessages: IChatMessage[] = []) => {
    messages.value = [...nextMessages];
  };

  return { messages, addOrUpdateMessage, removeMessage, resetMessages };
}

