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
      keywords: ['屏', '页', '布局', '排版', '整体'],
      match: (input, context) => {
        const lowerInput = input.toLowerCase();
        const nodes = context?.nodes || [];

        const isDashboardRequest =
          lowerInput.includes('屏') ||
          lowerInput.includes('页') ||
          lowerInput.includes('整体') ||
          lowerInput.includes('布局') ||
          (lowerInput.includes('新建') && nodes.length === 0);

        return isDashboardRequest;
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

