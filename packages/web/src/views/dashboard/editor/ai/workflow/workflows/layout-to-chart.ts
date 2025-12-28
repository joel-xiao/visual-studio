import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';
import { matchAgentByRules } from '../../agent/registry';

/**
 * 布局到图表工作流
 * 创建布局 -> 美化图表 -> 填充数据
 */
export function createLayoutToChartWorkflow(): IWorkflowGraph {
  return new WorkflowGraphBuilder()
    .setId('layout-to-chart')
    .setName('布局到图表工作流')
    .setDescription('创建布局 -> 美化图表 -> 填充数据')
    .setMatchRule({
      keywords: ['创建', '生成', '大屏', '布局', '新建'],
      match: (input, context) => {
        const lowerInput = input.toLowerCase();
        const nodes = context?.nodes || [];
        const matchedRole = matchAgentByRules(input);

        return (
          lowerInput.includes('创建') ||
          lowerInput.includes('生成') ||
          lowerInput.includes('大屏') ||
          lowerInput.includes('布局') ||
          (lowerInput.includes('新建') && nodes.length === 0) ||
          matchedRole === 'layout-architect'
        );
      },
      priority: 10
    })
    .addStartNode('start', '开始', { x: 100, y: 100 })
    .addAgentNode('layout', 'layout-architect', '创建布局', { x: 100, y: 200 })
    .addAgentNode('chart', 'chart-creator', '美化图表', { x: 100, y: 300 })
    .addAgentNode('data', 'data-analyst', '填充数据', { x: 100, y: 400 })
    .addEndNode('end', '结束', { x: 100, y: 500 })
    .addEdge('start', 'layout')
    .addEdge('layout', 'chart')
    .addEdge('chart', 'data')
    .addEdge('data', 'end')
    .build();
}

