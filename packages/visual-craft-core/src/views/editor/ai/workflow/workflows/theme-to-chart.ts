import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';
import { asRecord, isString } from '../../utils/json-utils';

export function createThemeToChartWorkflow(): IWorkflowGraph {
  return new WorkflowGraphBuilder()
    .setId('theme-to-chart')
    .setName('主题到图表工作流')
    .setDescription('切换主题 -> 优化图表样式')
    .setMatchRule({
      keywords: ['主题', '切换', '暗黑', '明亮', '颜色', '风格'],
      priority: 10
    })
    .addStartNode('start', '开始', { x: 100, y: 100 })
    .addAgentNode('theme', 'theme-engine', '切换主题', { x: 100, y: 200 })
    .addConditionNode('hasCharts', (context) => {
      const nodes = Array.isArray(context.nodes) ? context.nodes : [];
      return nodes.some((n: unknown) => {
        const comp = (asRecord(n) ?? {}).component;
        return isString(comp) && comp.includes('APACHE_ECHARTS');
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
