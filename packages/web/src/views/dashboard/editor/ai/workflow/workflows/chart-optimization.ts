import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';

export function createChartOptimizationWorkflow(): IWorkflowGraph {
  return new WorkflowGraphBuilder()
    .setId('chart-optimization')
    .setName('图表优化工作流')
    .setDescription('优化图表样式和数据')
    .setMatchRule({
      keywords: ['图表', '优化', '美化', '修改', '调整'],
      priority: 8
    })
    .addStartNode('start', '开始')
    .addAgentNode('chart', 'chart-creator', '优化图表')
    .addEndNode('end', '结束')
    .addEdge('start', 'chart')
    .addEdge('chart', 'end')
    .build();
}
