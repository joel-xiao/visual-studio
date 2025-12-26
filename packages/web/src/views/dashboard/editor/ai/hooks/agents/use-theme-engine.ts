import { IAgent, IAgentResponse, AgentRole } from '../../core/types';
import { generateText } from 'ai';
import { defaultModel } from '../../core/config';
import { extractJSON } from '../../core/json-utils';

// Fallback theme
const createFallbackTheme = (input: string) => {
  const inputLower = input.toLowerCase();
  let theme = 'dark';

  if (inputLower.includes('蓝') || inputLower.includes('科技')) theme = 'westeros';
  else if (inputLower.includes('紫')) theme = 'purplePassion';
  else if (inputLower.includes('绿')) theme = 'walden';
  else if (inputLower.includes('红') || inputLower.includes('暖')) theme = 'essos';
  else if (inputLower.includes('复古')) theme = 'vintage';
  else if (inputLower.includes('柔和')) theme = 'macarons';

  return {
    content: `已切换到 ${theme} 主题（离线模式）`,
    type: 'theme-selection' as const,
    data: { theme }
  };
};

/**
 * Hook for Theme Engine Agent
 * 负责全局视觉样式和主题
 */
export function useThemeEngine(): IAgent {
  const checkContextForCharts = (result: any, context: any) => {
    const previousNodes = context?.previousAgentData?.nodes || [];
    const hasCharts = previousNodes.some((n: any) => n.component && (n.component.includes('ECHARTS') || n.component.includes('CHART')));

    if (hasCharts) {
      return {
        ...result,
        nextAgent: 'chart-creator' as AgentRole,
        handoffPrompt: 'Theme applied. Please optimize charts to match.'
      };
    }
    return result;
  };

  const process = async (
    input: string,
    context?: any,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    if (onStream) {
      onStream({ content: '正在匹配主题...', type: 'theme-selection' });
    }

    try {
      const { text } = await generateText({
        model: defaultModel,
        system: `你是一位主题配色专家 (Theme Engine)。请为大屏选择一个合适的主题。
可用主题列表: dark (暗黑), macarons (马卡龙 - 清新), walden (瓦尔登 - 绿色), purplePassion (紫色), vintage (复古), chalk (粉笔), westeros (权游), wonderland (仙境), essos, shine, roma (罗马)。

请只返回合法的 JSON:
{"content":"简短的主题描述","type":"theme-selection","data":{"theme":"dark"}}
如果需要自定义颜色: {"content":"自定义主题描述","type":"theme-selection","data":{"theme":"custom-name","colors":["#5470c6","#91cc75","#fac858"]}}`,
        prompt: input
      });

      const result = extractJSON(text);
      if (result) {
        return checkContextForCharts({ content: result.content || '已应用主题', type: 'theme-selection', data: result.data }, context);
      }
      throw new Error('No valid JSON');
    } catch (e: any) {
      console.error('[ThemeEngine] AI failed, using fallback:', e);
      const fallback = createFallbackTheme(input);

      // Check for charts to beautify
      const previousNodes = context?.previousAgentData?.nodes || [];
      const hasCharts = previousNodes.some((n: any) => n.component && (n.component.includes('ECHARTS') || n.component.includes('CHART')));

      if (hasCharts) {
        return { ...fallback, nextAgent: 'chart-creator', handoffPrompt: 'Theme applied. Please optimize charts to match.' };
      }
      return fallback;
    }
  };

  return {
    role: 'theme-engine' as AgentRole,
    name: 'Theme Engine',
    description: 'Responsible for global visual style and themes.',
    process
  };
}

