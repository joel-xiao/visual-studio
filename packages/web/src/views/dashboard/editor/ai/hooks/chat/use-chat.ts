import { ref, nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import type { IChatMessage, AgentRole, IAgentResponse } from '../../types';
import { useOrchestrator } from '../orchestrator/use-orchestrator';

const WELCOME_MESSAGE: IChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '你好！我是你的 AI 大屏设计团队。\n我可以帮你：\n- 🏗️ **生成布局**\n- 📊 **创建图表**\n- 🧠 **分析数据**\n- 🎨 **设计主题**\n\n请直接告诉我你的需求，例如："帮我做一个销售监控大屏"。',
  type: 'text',
  agent: 'orchestrator'
};

export function useChat(options: { inputAreaWrapperRef?: Ref<HTMLElement | null> } = {}) {
  const { inputAreaWrapperRef } = options;
  const inputValue = ref('');
  const loading = ref(false);
  const messages = ref<IChatMessage[]>([WELCOME_MESSAGE]);
  const inputAreaHeight = ref(130);
  const orchestrator = useOrchestrator();

  let resizeObserver: ResizeObserver | null = null;
  onMounted(async () => {
    await nextTick();
    if (inputAreaWrapperRef?.value) {
      inputAreaHeight.value = inputAreaWrapperRef.value.offsetHeight + 20;
      resizeObserver = new ResizeObserver(entities => {
        inputAreaHeight.value = entities[0].contentRect.height + 20;
      });
      resizeObserver.observe(inputAreaWrapperRef.value);
    }
  });
  onUnmounted(() => resizeObserver?.disconnect());

  const addOrUpdateMessage = (role: 'user' | 'assistant', partial: Partial<IChatMessage> & { id?: string }) => {
    const { id, ...data } = partial;
    if (id) {
      const msg = messages.value.find(m => m.id === id);
      if (msg) return Object.assign(msg, data);
    }
    const newId = id || Date.now().toString() + Math.random().toString(36).slice(2, 9);
    messages.value.push({ id: newId, role, content: '', ...data } as IChatMessage);
    return messages.value[messages.value.length - 1];
  };

  const sendMessage = async () => {
    const content = inputValue.value.trim();
    if (!content || loading.value) return;

    inputValue.value = '';
    loading.value = true;
    addOrUpdateMessage('user', { content });

    const assistantMsg = addOrUpdateMessage('assistant', { content: 'Thinking...', agent: 'orchestrator' });

    try {
      const response = await orchestrator.process(content, (partial) => {
        addOrUpdateMessage('assistant', { id: assistantMsg.id, ...partial });
      });
      addOrUpdateMessage('assistant', { id: assistantMsg.id, ...response });
    } catch (e: any) {
      addOrUpdateMessage('assistant', { id: assistantMsg.id, content: `出错啦: ${e.message}`, isError: true });
    } finally {
      loading.value = false;
    }
  };

  return { messages, inputValue, loading, inputAreaHeight, sendMessage };
}
