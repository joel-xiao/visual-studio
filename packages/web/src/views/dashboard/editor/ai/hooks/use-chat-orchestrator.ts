import { unref, type Ref } from 'vue';
import { AgentOrchestrator } from '../core/orchestrator';
import type { IChatMessage } from '../core/types';
import { useNodeContext } from '../../hooks/node-context';
import { useComponentContext } from '../../hooks/component-context';
import { useChartThemesContext } from '../../hooks/chart-themes-context';
import { globalThemeJson } from '../../hooks/chart-themes-context/data';
import { merge } from 'lodash';

export function useChatOrchestrator(
  messages: Ref<IChatMessage[]>,
  addMessage: (role: 'user' | 'assistant', content: string, type?: IChatMessage['type'], actions?: any[], id?: string, data?: any, agent?: any) => string,
  inputValue: Ref<string>,
  loading: Ref<boolean>
) {
  const orchestrator = new AgentOrchestrator();
  const nodeContext = useNodeContext();
  const { getComponentProps } = useComponentContext();
  const { setTheme, registerCustomTheme } = useChartThemesContext();

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
    } else if (data.chartOptions) {
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
          } catch (e) {
            console.warn(`[Chat] Stream update failed for ${nodeId}`, e);
          }
        }
      });
    }
  };

  const sendMessage = async () => {
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

  const handleThemeSelect = async (themeName: string) => {
    setTheme(themeName);
    addMessage('assistant', `🎨 主题 **${themeName}** 已应用。`, 'text', undefined, undefined, undefined, 'theme-engine');

    const nodes = unref(nodeContext.getNodes());
    const hasCharts = nodes.some((n: any) => n.component && (n.component.includes('APACHE_ECHARTS') || n.component.includes('apache-e-charts')));

    if (hasCharts) {
      setTimeout(() => {
        inputValue.value = `Optimize all charts to match the ${themeName} theme.`;
        sendMessage();
      }, 500);
    }
  };

  return {
    handleThemeSelect,
    sendMessage,
    applyResponseData
  };
}

