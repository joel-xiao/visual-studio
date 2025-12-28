import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';

/**
 * 并行布局和主题工作流
 * 并行创建布局和设置主题
 */
export function createParallelLayoutThemeWorkflow(): IWorkflowGraph {
  return new WorkflowGraphBuilder()
    .setId('parallel-layout-theme')
    .setName('并行布局和主题工作流')
    .setDescription('并行创建布局和设置主题')
    .setMatchRule({
      keywords: ['并行', '同时', '一起'],
      match: (input) => {
        const lowerInput = input.toLowerCase();
        // 同时包含布局和主题相关关键词
        const hasLayout = lowerInput.includes('布局') || lowerInput.includes('创建') || lowerInput.includes('生成');
        const hasTheme = lowerInput.includes('主题') || lowerInput.includes('风格') || lowerInput.includes('颜色');
        const hasParallel = lowerInput.includes('并行') || lowerInput.includes('同时') || lowerInput.includes('一起');

        return hasParallel && hasLayout && hasTheme;
      },
      priority: 12 // 比单独的工作流优先级更高
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

