import { IAgent, IAgentResponse, AgentRole } from '../../core/types';
import { generateText } from 'ai';
import { defaultModel } from '../../core/config';
import { getLayoutTemplate } from '../../modules/layout/template';
import { extractJSONOrThrow } from '../../core/json-utils';

/**
 * Hook for Layout Architect Agent
 * 负责整体布局结构、视觉节奏和模块分区
 */
export function useLayoutArchitect(): IAgent {
  const process = async (
    input: string,
    context?: any,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    if (onStream) {
      onStream({
        content: '正在规划布局...',
        type: 'text'
      });
    }

    const history = context?.history || [];
    const historyStr = history.length > 0
      ? `\n### Conversation History:\n${history.map((h: any) => `${h.role}: ${h.content}`).join('\n')}`
      : '';

    const availableComponents = context?.availableComponents || [];
    const componentList = availableComponents.map((c: any) => `- ${c.name} (type: ${c.type}, schema: ${c.type})`).join('\n');

    // Simplified prompt: Trust the AI to handle schemas/components
    const systemPrompt = `你是一位大屏布局架构师 (Layout Architect)。请生成一个大屏页面的布局 JSON 数据。
重要要求：
1. 请默认生成一个内容丰富、专业的布局，包含 **5 到 7 个不同的图表组件**。
2. 必须且只能从以下可用组件列表中选择 'component' 和 'schema'：
${componentList}
3. 请使用 grid 布局思想排列组件 (设置合理的 x, y, width, height)，确保布局美观、整齐。
4. 只返回合法的 JSON 格式 (不要使用 markdown 代码块)。

参考模板结构 (请根据需要重复 node 结构以生成多个图表):
${getLayoutTemplate('CANVAS_ROOT', '图表标题', 'APACHE_ECHARTS_BAR_SIMPLE')}
${historyStr}`;

    const { text } = await generateText({
      model: defaultModel,
      system: systemPrompt,
      prompt: input
    });

    // Extract JSON from response
    const result = extractJSONOrThrow(text, 'Invalid JSON response from Layout Architect');

    if (!result.data?.nodes || !Array.isArray(result.data.nodes)) {
      throw new Error('Invalid response structure');
    }

    // Broadly detect charts for the workflow handoff
    const chartNodes = result.data.nodes.filter((n: any) =>
      n.component && (
        n.component.includes('ECHARTS') ||
        n.component.includes('CHART')
      )
    );

    // Stream the result immediately so the canvas updates BEFORE the next agent starts
    if (onStream) {
      onStream({
        content: '已生成布局，正在应用...',
        type: 'text',
        data: result.data
      });
    }

    if (chartNodes.length > 0) {
      return {
        content: result.content || '已生成布局',
        type: 'text',
        data: result.data,
        nextAgent: 'theme-engine',
        handoffPrompt: `布局已生成。请确认是否需要应用特定主题（如：科技黑、极简白），或者请用户选择一个主题。`
      };
    }

    return { content: result.content || '已生成布局', type: 'text', data: result.data };
  };

  return {
    role: 'layout-architect' as AgentRole,
    name: 'Layout Architect',
    description: 'Responsible for overall layout structure, visual rhythm, and module partitioning.',
    process
  };
}

