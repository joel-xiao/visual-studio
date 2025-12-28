import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';
import { matchAgentByRules } from '../../agent/registry';

/**
 * 图表优化工作流
 * 优化图表样式和数据
 */
export function createChartOptimizationWorkflow(): IWorkflowGraph {
  return new WorkflowGraphBuilder()
    .setId('chart-optimization')
    .setName('图表优化工作流')
    .setDescription('优化图表样式和数据')
    .setMatchRule({
      keywords: ['图表', '优化', '美化', '修改', '调整'],
      match: (input, context) => {
        const selectedNodes = context?.selectedNodes || [];
        const matchedRole = matchAgentByRules(input);

        // 如果选中了图表组件
        if (selectedNodes.length > 0) {
          const selected = selectedNodes[0] as { component?: string };
          if (selected.component && selected.component.includes('APACHE_ECHARTS')) {
            return true;
          }
        }

        // 如果匹配到 chart-creator
        if (matchedRole === 'chart-creator') {
          return true;
        }

        return false;
      },
      priority: 8
    })
    .addStartNode('start', '开始')
    .addAgentNode('chart', 'chart-creator', '优化图表')
    .addEndNode('end', '结束')
    .addEdge('start', 'chart')
    .addEdge('chart', 'end')
    .build();
}

