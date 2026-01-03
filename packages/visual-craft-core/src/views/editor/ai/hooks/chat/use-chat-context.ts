import { computed, unref, ref, watch } from 'vue';
import { useNodeContext } from '../../../hooks/node-context';
import type { IPromptSuggestion } from '../../agent/suggestion-generator/presets';
import { getPresetSuggestions } from '../../agent/suggestion-generator/presets';
import { useSuggestionGenerator } from '../../agent/suggestion-generator/use';
import { useAIContext } from '../core/use-ai-context';
import { useAISuggestionsConfig } from '../../config';
import { asRecord, pickString } from '../../utils/json-utils';
import type { AgentContext } from '../../types';

export { type IPromptSuggestion };
export { useAISuggestionsConfig };

export function useChatContext() {
  const nodeContext = useNodeContext();
  const aiContext = useAIContext();
  const suggestionAgent = useSuggestionGenerator();
  const aiSuggestionsConfig = useAISuggestionsConfig();

  const selectedNodes = computed(() => unref(nodeContext.getSelectedNodes()));
  const suggestions = ref<IPromptSuggestion[]>([]);

  const currentSelectionName = computed(() => {
    const nodes = selectedNodes.value;
    if (nodes.length === 1) {
      return nodes[0].name || '未命名组件';
    } else if (nodes.length > 1) {
      return `${nodes.length} 个组件`;
    }
    return '';
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

  // 加载建议
  const loadSuggestions = async () => {
    const nodes = [...unref(nodeContext.getNodes())];
    const selected = [...unref(nodeContext.getSelectedNodes())];

    const nodeCount = nodes.filter(n => n.id !== 'root').length;
    const hasSelection = selected.length > 0 && selected[0].id !== 'root';
    const selectionType = hasSelection ? selected[0].component || selected[0].schema : '';

    // 获取预设建议
    const presetSuggestions = getPresetSuggestions({
      hasSelection,
      selectionType,
      nodeCount
    });

    // 限制预设建议数量
    const maxPresetSuggestions = aiSuggestionsConfig.getMaxPresetSuggestions();
    const limitedPresetSuggestions = presetSuggestions.slice(0, maxPresetSuggestions);

    // 立即显示预设建议
    suggestions.value = limitedPresetSuggestions;

    // 只有在启用AI建议时才异步加载
    if (aiSuggestionsConfig.enabled) {
      try {
        const context = {
          nodes,
          selectedNodes: selected,
          availableComponents: aiContext.componentContext.getAvailableComponents()
        };

        const aiResponse = await suggestionAgent.process('生成建议', context as unknown as AgentContext);

        const dataObj = asRecord(aiResponse.data) ?? {};
        const suggestionsRaw = dataObj.suggestions;
        if (Array.isArray(suggestionsRaw)) {
          const maxAISuggestions = aiSuggestionsConfig.getMaxAISuggestions();
          const aiSuggestions = suggestionsRaw
            .slice(0, maxAISuggestions)
            .map((s: unknown) => {
              const obj = asRecord(s) ?? {};
              return {
                label: pickString(obj, 'label') || '',
                value: pickString(obj, 'value') || '',
                icon: pickString(obj, 'icon') || 'mdi:lightbulb-outline',
                agent: pickString(obj, 'agent') || 'orchestrator',
                color: pickString(obj, 'color') || 'blue'
              } satisfies IPromptSuggestion;
            });

          // 追加AI建议到前面
          suggestions.value = [...aiSuggestions, ...limitedPresetSuggestions];
        }
      } catch (error) {
        console.warn('AI建议生成失败，仅显示预设建议:', error);
      }
    }
  };

  // 监听节点变化
  watch(
    [() => unref(nodeContext.getNodes()), selectedNodes],
    loadSuggestions,
    { immediate: true, deep: true }
  );

  const clearSelection = () => {
    nodeContext.onSelectNode('root');
  };

  const refreshSuggestions = () => {
    loadSuggestions();
  };

  return {
    selectedNodes,
    currentSelectionName,
    suggestions,
    chatMode,
    placeholderText,
    clearSelection,
    refreshSuggestions,
    nodeContext,
    aiSuggestionsEnabled: aiSuggestionsConfig.enabled
  };
}
