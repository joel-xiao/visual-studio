import { ref, nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import type { IChatMessage, IChatImageAttachment } from '../../types';
import { useStepOrchestrator } from '../orchestrator/use-step-orchestrator';
import { useChatMessages } from './use-chat-messages';

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
  const { messages, addOrUpdateMessage, removeMessage } = useChatMessages([WELCOME_MESSAGE]);
  const inputAreaHeight = ref(130);
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
        removeMessage(assistantMsg.id);
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

  const markActionHandled = (messageId: string, key: string) => {
    const msg = messages.value.find(m => m.id === messageId);
    const nextStatus = { ...(msg?.actionStatus || {}), [key]: true };
    addOrUpdateMessage('assistant', { id: messageId, actionStatus: nextStatus });
  };

  return { messages, inputValue, pendingAttachments, loading, inputAreaHeight, sendMessage, handleContinueWorkflow, markActionHandled };
}
