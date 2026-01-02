import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';

export function createParallelLayoutThemeWorkflow(): IWorkflowGraph {
  return new WorkflowGraphBuilder()
    .setId('parallel-layout-theme')
    .setName('并行布局和主题工作流')
    .setDescription('并行创建布局和设置主题')
    .setMatchRule({
      keywords: ['并行', '同时', '一起', '布局', '主题'],
      priority: 12
    })
    .addStartNode('start', '开始', { x: 200, y: 100 })
    .addParallelNode('parallel', '并行执行', { x: 200, y: 200 })
    .addAgentNode('layout', 'layout-architect', '创建布局', { x: 100, y: 300 })
    .addAgentNode('theme', 'theme-engine', '设置主题', { x: 300, y: 300 })
    .addMergeNode('merge', '合并结果', { x: 200, y: 400 })
    .addEndNode('end', '结束', { x: 200, y: 500 })
    .addEdge('start', 'parallel')
    .addEdge('parallel', 'layout')
    .addEdge('parallel', 'theme')
    .addEdge('layout', 'merge')
    .addEdge('theme', 'merge')
    .addEdge('merge', 'end')
    .build();
}
