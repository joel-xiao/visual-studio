import { ref, nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import type { IChatMessage, AgentRole, IAgentResponse } from '../../types';
import { useOrchestrator } from '../orchestrator/use-orchestrator';

/**
 * 欢迎消息
 */
const WELCOME_MESSAGE: IChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '你好！我是你的 AI 大屏设计团队。\n我可以帮你：\n- 🏗️ **生成布局**\n- 📊 **创建图表**\n- 🧠 **分析数据**\n- 🎨 **设计主题**\n\n请直接告诉我你的需求，例如："帮我做一个销售监控大屏"。',
  type: 'text',
  actions: [],
  agent: 'orchestrator'
};

/**
 * 聊天 Hook 选项
 */
export interface IUseChatOptions {
  inputAreaWrapperRef?: Ref<HTMLElement | null>;
}

/**
 * 统一的聊天 Hook
 * 整合：消息管理 + 输入状态 + 输入区域高度监听
 */
export function useChat(options: IUseChatOptions = {}) {
  const { inputAreaWrapperRef } = options;

  // 输入状态（合并自 use-chat-input-area）
  const inputValue = ref('');
  const loading = ref(false);

  // 输入区域高度（合并自 use-chat-input-area）
  const inputAreaHeight = ref(130);

  // 消息管理
  const messages = ref<IChatMessage[]>([WELCOME_MESSAGE]);

  // 输入区域高度监听
  let resizeObserver: ResizeObserver | null = null;

  if (inputAreaWrapperRef) {
    onMounted(async () => {
      await nextTick();
      if (inputAreaWrapperRef.value) {
        inputAreaHeight.value = inputAreaWrapperRef.value.offsetHeight + 20;

        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            inputAreaHeight.value = entry.contentRect.height + 20;
          }
        });
        resizeObserver.observe(inputAreaWrapperRef.value);
      }
    });

    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });
  }

  // 执行器
  const orchestrator = useOrchestrator({ mode: 'workflow' });

  /**
   * 添加消息
   */
  const addMessage = (
    role: 'user' | 'assistant',
    content: string,
    type: IChatMessage['type'] = 'text',
    actions?: IChatMessage['actions'],
    id?: string,
    data?: unknown,
    agent?: AgentRole
  ): string => {
    if (id) {
      const msg = messages.value.find(m => m.id === id);
      if (msg) {
        msg.content = content;
        if (type) msg.type = type;
        if (actions) msg.actions = actions;
        if (data) msg.data = data;
        if (agent) msg.agent = agent;
        return id;
      }
    }

    const lastMsg = messages.value[messages.value.length - 1];
    if (!id && lastMsg && 'role' in lastMsg && lastMsg.role === role && 'content' in lastMsg && lastMsg.content === content && lastMsg.type === type) {
      return lastMsg.id;
    }

    const newId = Date.now().toString() + Math.random().toString(36).slice(2, 11);
    messages.value.push({
      id: newId,
      role,
      content,
      type,
      actions,
      data,
      agent
    });
    return newId;
  };

  /**
   * 发送消息
   */
  const sendMessage = async () => {
    if (!inputValue.value.trim() || loading.value) return;

    const content = inputValue.value;
    inputValue.value = '';
    addMessage('user', content);

    loading.value = true;
    const assistantMsgId = addMessage('assistant', 'Thinking...', 'text', undefined, undefined, undefined, 'orchestrator');

    try {
      let currentAgentRole: AgentRole | undefined;

      const response = await orchestrator.process(content, undefined, (partial: Partial<IAgentResponse> & { agent?: AgentRole }) => {
        if (partial.agent) {
          currentAgentRole = partial.agent;
        }

        if ('content' in partial && partial.content) {
          addMessage(
            'assistant',
            partial.content,
            partial.type,
            partial.actions,
            assistantMsgId,
            partial.data,
            currentAgentRole
          );
        }
      });

      const finalAgentRole = currentAgentRole || (response as IAgentResponse & { agent?: AgentRole }).agent;
      addMessage(
        'assistant',
        response.content,
        response.type,
        response.actions,
        assistantMsgId,
        response.data,
        finalAgentRole
      );
    } catch (e) {
      addMessage('assistant', '出错啦: ' + e, 'text', undefined, assistantMsgId, { isError: true });
    } finally {
      loading.value = false;
    }
  };

  return {
    // 消息管理
    messages,
    addMessage,
    sendMessage,
    // 输入状态（合并自 use-chat-input-area）
    inputValue,
    loading,
    // 输入区域高度（合并自 use-chat-input-area）
    inputAreaHeight
  };
}

