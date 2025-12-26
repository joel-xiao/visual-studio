import { IAgent, IAgentResponse, AgentRole } from '../../core/types';
import { generateText } from 'ai';
import { defaultModel } from '../../core/config';
import { getDataTemplate } from '../../modules/data/template';
import { extractJSON } from '../../core/json-utils';

/**
 * Hook for Data Analyst Agent
 * 负责数据分析和 Mock 数据生成
 */
export function useDataAnalyst(): IAgent {
  const process = async (
    input: string,
    context?: any,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    if (onStream) {
      onStream({ content: '正在分析数据...', type: 'code' });
    }

    const previousData = context?.previousAgentData;
    const chartNodes = previousData?.nodes?.filter((n: any) => n.component?.includes('APACHE_ECHARTS')) || [];

    const layoutContext = chartNodes.length > 0
      ? `\nCharts to fill: ${JSON.stringify(chartNodes.map((n: any) => ({ id: n.id, name: n.name })))}`
      : '';

    const { text } = await generateText({
      model: defaultModel,
      system: `你是一位数据分析师 (Data Analyst)。请为图表生成 Mock 数据。
请只返回合法的 JSON:
${getDataTemplate()}
${layoutContext}`,
      prompt: input
    });

    const result = extractJSON(text);
    if (result) {
      if (previousData?.nodes && result.data?.chartDataMap) {
        return {
          content: result.content || '已完成数据分析',
          type: 'code',
          data: { ...result.data }, // specific data
          nextAgent: 'theme-engine',
          handoffPrompt: '为当前大屏推荐一个合适的主题风格'
        };
      }
      return { content: result.content || '已完成数据分析', type: 'code', data: result.data };
    }

    throw new Error('Failed to parse AI response');
  };

  return {
    role: 'data-analyst' as AgentRole,
    name: 'Data Analyst',
    description: 'Responsible for data analysis and mock data generation.',
    process
  };
}

