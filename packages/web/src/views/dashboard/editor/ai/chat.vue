<script setup lang="ts">
import { ref, nextTick, unref, computed } from 'vue';
import { AgentOrchestrator } from './core/orchestrator';
import type { IChatMessage, ISceneAction, AgentRole } from './core/types';
import { getPromptSuggestions, type IPromptSuggestion } from './modules/prompt/suggestions';
import { useChartThemesContext } from '../hooks/chart-themes-context';
import { useNodeContext } from '../hooks/node-context';
import { useComponentContext } from '../hooks/component-context';
import { globalThemeJson } from '../hooks/chart-themes-context/data';
import { merge } from 'lodash';
import Messages from './components/Messages.vue';
import InputArea from './components/InputArea.vue';

const { setTheme, registerCustomTheme } = useChartThemesContext();
const nodeContext = useNodeContext();
const { getComponentProps } = useComponentContext();
const orchestrator = new AgentOrchestrator();

const selectedNodes = computed(() => unref(nodeContext.getSelectedNodes()));
const currentSelectionName = computed(() => {
  const nodes = selectedNodes.value;
  if (nodes.length === 1) {
    return nodes[0].name || '未命名组件';
  } else if (nodes.length > 1) {
    return `${nodes.length} 个组件`;
  }
  return '';
});

const suggestions = computed(() => {
  const nodes = unref(nodeContext.getNodes());
  const selected = unref(nodeContext.getSelectedNodes());
  return getPromptSuggestions({
    hasSelection: selected.length > 0,
    selectionType: selected.length > 0 ? selected[0].component : undefined,
    nodeCount: nodes.length
  });
});

const chatMode = computed(() => {
  const nodes = selectedNodes.value;
  return nodes.length > 0 && nodes[0].id !== 'root' ? 'context' : 'global';
});

const placeholderText = computed(() => {
  if (chatMode.value === 'context') {
    return `正在调整 "${currentSelectionName.value}"... (例如："改成红色", "显示前5条")`;
  }
  return "输入您的需求，例如：'帮我生成一个销售大屏'...";
});

const clearSelection = () => {
  nodeContext.onSelectNode('root');
};

const handleSuggestionClick = (suggestion: IPromptSuggestion) => {
  inputValue.value = suggestion.value;
  handleSend();
};

const messages = ref<IChatMessage[]>([
  {
    id: 'welcome',
    role: 'assistant',
    content: '你好！我是你的 AI 大屏设计团队。\n我可以帮你：\n- 🏗️ **生成布局**\n- 📊 **创建图表**\n- 🧠 **分析数据**\n- 🎨 **设计主题**\n\n请直接告诉我你的需求，例如：“帮我做一个销售监控大屏”。',
    type: 'text',
    actions: [],
    agent: 'orchestrator'
  }
]);

const inputValue = ref('');
const loading = ref(false);
const chatContainerRef = ref<HTMLElement | null>(null);

const addMessage = (role: 'user' | 'assistant', content: string, type: IChatMessage['type'] = 'text', actions?: ISceneAction[], id?: string, data?: any, agent?: AgentRole): string => {
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

const handleThemeSelect = async (themeName: string) => {
  setTheme(themeName);
  addMessage('assistant', `🎨 主题 **${themeName}** 已应用。`, 'text', undefined, undefined, undefined, 'theme-engine');

  const nodes = unref(nodeContext.getNodes());
  const hasCharts = nodes.some((n: any) => n.component && (n.component.includes('APACHE_ECHARTS') || n.component.includes('apache-e-charts')));

  if (hasCharts) {
      setTimeout(() => {
          inputValue.value = `Optimize all charts to match the ${themeName} theme.`;
          handleSend();
      }, 500);
  }
};

const applyResponseData = (data: any) => {
  if (!data) return;

  if (data.nodes && Array.isArray(data.nodes)) {
      const validNodes = data.nodes.filter((node: any) =>
        node && typeof node === 'object' && !Array.isArray(node) && node.id
      );

      if (validNodes.length > 0) {
        const hydratedNodes = validNodes.map((node: any) => {
          const nodeCopy = { ...node };
          if (nodeCopy.schema) {
            const defaultProps = getComponentProps(nodeCopy.schema);
            nodeCopy.props = merge({}, defaultProps, nodeCopy.props);
          }

          if (data.chartDataMap && data.chartDataMap[nodeCopy.id]) {
            const chartData = data.chartDataMap[nodeCopy.id];
            nodeCopy.props = nodeCopy.props || {};
            nodeCopy.props.code = nodeCopy.props.code || {};
            try {
              const existingOptions = typeof nodeCopy.props.code.options === 'string'
                ? JSON.parse(nodeCopy.props.code.options || '{}')
                : (nodeCopy.props.code.options || {});
              nodeCopy.props.code.options = JSON.stringify(merge({}, existingOptions, chartData), null, 2);
            } catch (e) {
              console.warn('[Chat] Failed to parse/merge chart options:', e);
            }
          }

          if (data.chartOptions && data.chartOptions[nodeCopy.id]) {
            const beautifiedOptions = data.chartOptions[nodeCopy.id];
            nodeCopy.props = nodeCopy.props || {};
            nodeCopy.props.code = nodeCopy.props.code || {};
            try {
               const existingOptions = typeof nodeCopy.props.code.options === 'string'
                ? JSON.parse(nodeCopy.props.code.options || '{}')
                : (nodeCopy.props.code.options || {});
               nodeCopy.props.code.options = JSON.stringify(merge({}, existingOptions, beautifiedOptions), null, 2);
            } catch (e) {
               console.warn('[Chat] Failed to merge beautified chart options:', e);
            }
          }

          return nodeCopy;
        });

        nodeContext.update({ ...data, nodes: hydratedNodes });
      }
  }
  else if (data.chartOptions) {
     Object.keys(data.chartOptions).forEach(nodeId => {
       const options = data.chartOptions[nodeId];
       const currentNode = unref(nodeContext.getNodes()).find(n => n.id === nodeId);
       if (currentNode) {
           try {
               const currentOpts = typeof currentNode.props?.code?.options === 'string'
                ? JSON.parse(currentNode.props.code.options || '{}')
                : (currentNode.props?.code?.options || {});

               nodeContext.updateNodeProps(nodeId, {
                 key: 'code.options',
                 value: JSON.stringify(merge({}, currentOpts, options), null, 2)
               });
           } catch(e) {
               console.warn(`[Chat] Stream update failed for ${nodeId}`, e);
           }
       }
     });
  }
};

const handleSend = async () => {
  if (!inputValue.value.trim() || loading.value) return;

  const content = inputValue.value;
  inputValue.value = '';
  addMessage('user', content);

  loading.value = true;
  const assistantMsgId = addMessage('assistant', 'Thinking...', 'text', undefined, undefined, undefined, 'orchestrator');

  try {
    const { getAvailableComponents } = useComponentContext();
    const context = {
      nodes: unref(nodeContext.getNodes()),
      selectedNodes: unref(nodeContext.getSelectedNodes()),
      availableComponents: getAvailableComponents ? getAvailableComponents() : []
    };

    const response = await orchestrator.process(content, context, (partial) => {
       addMessage(
         'assistant',
         partial.content || 'Processing...',
         partial.type,
         partial.actions,
         assistantMsgId,
         partial.data,
         partial.nextAgent
       );

       if (partial.data) {
          applyResponseData(partial.data);
       }
    });

    addMessage(
      'assistant',
      response.content,
      response.type,
      response.actions,
      assistantMsgId,
      response.data,
      response.nextAgent
    );

    if (!response.isError && response.data) {
        applyResponseData(response.data);
        if (response.data.nodes) {
             addMessage('assistant', '✅ 已为您应用新的大屏布局。', 'text');
        }
    }

    if (response.type === 'theme-selection' && response.data?.theme) {
       if (response.data.colors && Array.isArray(response.data.colors)) {
         const newTheme = { ...globalThemeJson, color: response.data.colors };
         registerCustomTheme(response.data.theme, newTheme);
         addMessage('assistant', `🎨 已为您生成随机主题：**${response.data.theme}**`, 'text');
       }
       setTheme(response.data.theme);
    }

  } catch (e) {
    addMessage('assistant', '出错啦: ' + e, 'text', undefined, assistantMsgId, { isError: true });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div ref="chatContainerRef" class="chat-container">
    <Messages
      :messages="messages"
      @theme-select="handleThemeSelect"
    />

    <div class="input-area-wrapper">
      <InputArea
        v-model="inputValue"
        :placeholder="placeholderText"
        :suggestions="suggestions"
        :loading="loading"
        :show-mode-indicator="chatMode === 'context'"
        :target-name="currentSelectionName"
        @send="handleSend"
        @suggestion-click="handleSuggestionClick"
        @clear-selection="clearSelection"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg,
    var(--db-editor-color-panel-bg) 0%,
    rgba(var(--db-editor-color-panel-bg-rgb, 38, 38, 38), 0.98) 100%
  );
  position: relative;
  overflow: hidden;

  .input-area-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10px 14px 14px 14px;
    background: linear-gradient(to top,
      var(--db-editor-color-panel-bg) 92%,
      rgba(var(--db-editor-color-panel-bg-rgb, 38, 38, 38), 0.96) 98%,
      transparent 100%
    );
    z-index: 10;
  }
}
</style>
