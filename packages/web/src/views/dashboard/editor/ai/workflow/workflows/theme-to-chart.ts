import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';
import { matchAgentByRules } from '../../agent/registry';

/**
 * 主题到图表工作流
 * 切换主题 -> [条件判断] -> 优化图表样式
 */
export function createThemeToChartWorkflow(): IWorkflowGraph {
  return new WorkflowGraphBuilder()
    .setId('theme-to-chart')
    .setName('主题到图表工作流')
    .setDescription('切换主题 -> 优化图表样式')
    .setMatchRule({
      keywords: ['主题', '切换', '暗黑', '明亮', '颜色', '风格'],
      match: (input) => {
        const lowerInput = input.toLowerCase();
        const matchedRole = matchAgentByRules(input);

        return (
          lowerInput.includes('主题') ||
          lowerInput.includes('切换') ||
          lowerInput.includes('暗黑') ||
          lowerInput.includes('明亮') ||
          matchedRole === 'theme-engine'
        );
      },
      priority: 10
    })
    .addStartNode('start', '开始', { x: 100, y: 100 })
    .addAgentNode('theme', 'theme-engine', '切换主题', { x: 100, y: 200 })
    .addConditionNode('hasCharts', (context) => {
      const nodes = context?.nodes || [];
      return nodes.some((n: unknown) => {
        const node = n as { component?: string };
        return node.component && node.component.includes('APACHE_ECHARTS');
      });
    }, '是否有图表', { x: 100, y: 300 })
    .addAgentNode('chart', 'chart-creator', '优化图表', { x: 100, y: 400 })
    .addEndNode('end', '结束', { x: 100, y: 500 })
    .addEdge('start', 'theme')
    .addEdge('theme', 'hasCharts')
    .addEdge('hasCharts', 'chart', 'true')
    .addEdge('hasCharts', 'end', 'false')
    .addEdge('chart', 'end')
    .build();
}

