import { ref, nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import type { IChatMessage, IChatImageAttachment, AgentRole, IAgentResponse } from '../../types';
import { useOrchestrator } from '../orchestrator/use-orchestrator';
import { useStepOrchestrator } from '../orchestrator/use-step-orchestrator';

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
  const pendingAttachments = ref<IChatImageAttachment[]>([]);
  const loading = ref(false);
  const messages = ref<IChatMessage[]>([WELCOME_MESSAGE]);
  const inputAreaHeight = ref(130);
  const orchestrator = useOrchestrator();
  const stepOrchestrator = useStepOrchestrator();

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
    const attachments = pendingAttachments.value.filter(a => a.status === 'ready' && !!a.url);
    if (!content || loading.value) return;

    inputValue.value = '';
    pendingAttachments.value = [];
    loading.value = true;
    addOrUpdateMessage('user', { content, attachments, type: 'text' });

    const assistantMsg = addOrUpdateMessage('assistant', {
      content: '正在思考...',
      agent: 'orchestrator',
      type: 'agent-thought'
    });

    try {
      const response = await stepOrchestrator.process(content, {
        attachments,
        onStream: (partial) => addOrUpdateMessage('assistant', { id: assistantMsg.id, ...partial })
      });
      addOrUpdateMessage('assistant', { id: assistantMsg.id, ...response });
    } catch (e: any) {
      addOrUpdateMessage('assistant', {
        id: assistantMsg.id,
        content: `出错啦: ${e.message}`,
        isError: true
      });
    } finally {
      loading.value = false;
    }
  };

  const handleContinueWorkflow = async (data: any) => {
    if (loading.value) return;

    loading.value = true;
    const assistantMsg = addOrUpdateMessage('assistant', {
      content: '正在继续执行...',
      agent: 'orchestrator',
      type: 'agent-thought'
    });

    try {
      const response = await stepOrchestrator.applyAndContinue(data, (partial) => {
        addOrUpdateMessage('assistant', { id: assistantMsg.id, ...partial });
      });

      if (response) {
        addOrUpdateMessage('assistant', { id: assistantMsg.id, ...response });
      } else {
        const msgIndex = messages.value.findIndex(m => m.id === assistantMsg.id);
        if (msgIndex !== -1) {
          messages.value.splice(msgIndex, 1);
        }
      }
    } catch (e: any) {
      addOrUpdateMessage('assistant', {
        id: assistantMsg.id,
        content: `继续执行出错: ${e.message}`,
        isError: true
      });
    } finally {
      loading.value = false;
    }
  };

  return { messages, inputValue, pendingAttachments, loading, inputAreaHeight, sendMessage, handleContinueWorkflow };
}
