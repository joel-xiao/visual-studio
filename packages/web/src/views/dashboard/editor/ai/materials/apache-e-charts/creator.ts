import { IAgent, IAgentResponse, AgentRole } from '../../core/types';
import { generateText } from 'ai';
import { defaultModel } from '../../core/config';
import { getChartTemplate } from './template';

export class ChartCreator implements IAgent {
  role: AgentRole = 'chart-creator';
  name = 'Chart Creator';
  description = 'Responsible for generating chart configurations.';

  async process(input: string, context?: any, onStream?: (partial: Partial<IAgentResponse>) => void): Promise<IAgentResponse> {

    if (onStream) {
      onStream({ content: '正在生成图表配置...', type: 'chart' });
    }

    // --- Scenario 1: Batch Beautification (from Layout Architect) ---
    const previousNodes = context?.previousAgentData?.nodes;
    if (previousNodes && Array.isArray(previousNodes)) {

      const updatedNodes = [...previousNodes]; // Clone
      const chartIndices = updatedNodes
        .map((n, i) => (n.component && n.component.includes('APACHE_ECHARTS')) ? i : -1)
        .filter(i => i !== -1);

      const chartOptions: Record<string, any> = {};

      // Sequentially process each chart to avoid token limits/race conditions
      for (const index of chartIndices) {
        const node = updatedNodes[index];
        const chartType = node.component; // e.g. APACHE_ECHARTS_BAR

        if (onStream) {
          onStream({ content: `正在美化图表: ${node.name}...`, type: 'text' });
        }

        try {
          const { text } = await generateText({
            model: defaultModel,
            system: `你是一位专业图表美化师 (Chart Beautifier)。请优化该组件的 ECharts 配置项 (option)。
关注点：视觉美感、清晰的图例、合理的布局。
请只返回包含 'options' 字段的合法 JSON。
参考模板:
${getChartTemplate(chartType)}

重要：不要设置 'color' 或 'backgroundColor'，除非用户明确要求。请依赖 ECharts 主题 (Theme) 来控制颜色。`,
            prompt: `Make this ${node.name} look professional: ${JSON.stringify(node.props?.code?.options || {})}`
          });

          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            const res = JSON.parse(match[0]);
            if (res.data?.options) {
              // Accumulate options mapped by Node ID
              const options = typeof res.data.options === 'string'
                ? JSON.parse(res.data.options)
                : res.data.options;

              chartOptions[node.id] = options;

              // STREAMING UPDATE: Update editor immediately
              if (onStream) {
                onStream({
                  content: `已优化图表: ${node.name}`,
                  type: 'text',
                  data: { chartOptions: { [node.id]: options } } // Send just this update for incremental apply
                });
              }
            }
          }
        } catch (e) {
          console.warn(`[ChartCreator] Failed to beautify ${node.name}:`, e);
        }
      }

      const changedCharts = updatedNodes.filter((_, i) => chartIndices.includes(i));

      return {
        content: '已完成图表美化',
        type: 'text',
        data: { chartOptions }, // Return ONLY options map, decoupled from nodes
        nextAgent: 'data-analyst',
        handoffPrompt: `请为以下图表生成 Mock 数据：${changedCharts.map(n => n.name).join(', ')}`
      };
    }

    // --- Scenario 2: Single Chart Selection (Direct interaction) ---
    const selectedNodes = context?.selectedNodes || [];
    const targetNode = selectedNodes[0];
    const targetContext = targetNode
      ? `\nTarget: ${JSON.stringify({ id: targetNode.id, name: targetNode.name, options: targetNode.props?.code?.options })}`
      : '';

    const { text } = await generateText({
      model: defaultModel,
      system: `你是一位图表设计师 (Chart Creator)。请生成 ECharts 配置项。

请只返回合法的 JSON:
${getChartTemplate('APACHE_ECHARTS_BAR_SIMPLE')}

重要：不要设置 'color' 或 'backgroundColor'，除非用户明确要求。请依赖 ECharts 主题 (Theme) 来控制颜色。
${targetContext}`,
      prompt: input
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);

      // Flexible handling:
      // 1. If result has 'data' wrapper (standard template), use it.
      // 2. If result has 'options' directly (AI simplified output), use result itself as data.
      const payload = result.data || (result.options ? result : undefined);

      if (!payload) {
        console.warn('[ChartCreator] Valid payload not found in response:', result);
      }

      return {
        content: result.content || '已生成图表',
        type: 'chart',
        data: payload
      };
    }

    throw new Error('Failed to parse AI response');
  }
}


