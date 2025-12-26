import { computed, unref } from 'vue';
import { useNodeContext } from '../../hooks/node-context';
import { getPromptSuggestions, type IPromptSuggestion } from '../modules/prompt/suggestions';

export function useChatSelection() {
  const nodeContext = useNodeContext();
  
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

  return {
    selectedNodes,
    currentSelectionName,
    suggestions,
    chatMode,
    placeholderText,
    clearSelection,
    nodeContext
  };
}

