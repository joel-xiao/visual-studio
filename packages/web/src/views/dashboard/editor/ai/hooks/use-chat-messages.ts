import { ref } from 'vue';
import type { IChatMessage, ISceneAction, AgentRole } from '../core/types';

const WELCOME_MESSAGE: IChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '你好！我是你的 AI 大屏设计团队。\n我可以帮你：\n- 🏗️ **生成布局**\n- 📊 **创建图表**\n- 🧠 **分析数据**\n- 🎨 **设计主题**\n\n请直接告诉我你的需求，例如："帮我做一个销售监控大屏"。',
  type: 'text',
  actions: [],
  agent: 'orchestrator'
};

export function useChatMessages() {
  const messages = ref<IChatMessage[]>([WELCOME_MESSAGE]);

  const addMessage = (
    role: 'user' | 'assistant',
    content: string,
    type: IChatMessage['type'] = 'text',
    actions?: ISceneAction[],
    id?: string,
    data?: any,
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
    if (!id && lastMsg && lastMsg.role === role && lastMsg.content === content && lastMsg.type === type) {
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

  return {
    messages,
    addMessage
  };
}

