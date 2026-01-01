import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';
import { matchAgentByRules } from '../../agent/registry';

/**
 * 图表生成工作流
 * 图表制作 -> 填充数据
 */
export function createChartGenerationWorkflow(): IWorkflowGraph {
    return new WorkflowGraphBuilder()
        .setId('chart-generation')
        .setName('图表生成工作流')
        .setDescription('图表制作 -> 填充数据')
        .setMatchRule({
            keywords: ['图表', '柱状图', '折线图', '饼图', '添加', '插入'],
            match: (input) => {
                const lowerInput = input.toLowerCase();
                const matchedRole = matchAgentByRules(input);

                // 明确包含图表词汇，或者是图表制作起初匹配到的
                return (
                    lowerInput.includes('图表') ||
                    lowerInput.includes('柱状图') ||
                    lowerInput.includes('添加图') ||
                    lowerInput.includes('折线图') ||
                    lowerInput.includes('饼图') ||
                    matchedRole === 'chart-creator'
                );
            },
            priority: 11 // 略高于 layout-to-chart 以便在模棱两可时优先尝试图表生成
        })
        .addStartNode('start', '开始', { x: 100, y: 100 })
        .addAgentNode('chart', 'chart-creator', '图表制作', { x: 100, y: 200 })
        .addAgentNode('data', 'data-analyst', '填充数据', { x: 100, y: 300 })
        .addEndNode('end', '结束', { x: 100, y: 400 })
        .addEdge('start', 'chart')
        .addEdge('chart', 'data')
        .addEdge('data', 'end')
        .build();
}
