import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';

export function createChartGenerationWorkflow(): IWorkflowGraph {
    return new WorkflowGraphBuilder()
        .setId('chart-generation')
        .setName('新增图表与数据')
        .setDescription('在当前看板中直接插入一个新的图表，并自动生成符合场景的 Mock 数据。适合“加个柱状图”、“生成一张销售图表”等指令。')
        .setMatchRule({
            keywords: ['图表', '柱状图', '折线图', '饼图', '添加', '插入'],
            priority: 11
        })
        .addStartNode('start', '开始', { x: 100, y: 100 })
        .addAgentNode('chart', 'chart-creator', '图表制作', { x: 100, y: 200 }, {
          uiHints: {
            inlineActions: [
              { kind: 'applyOnly', label: '应用' }
            ],
            secondaryAction: {
              label: '跳过数据',
              kind: 'skip',
              targetNodeId: 'end'
            }
          }
        })
        .addAgentNode('data', 'data-analyst', '填充数据', { x: 100, y: 300 })
        .addEndNode('end', '结束', { x: 100, y: 400 })
        .addEdge('start', 'chart')
        .addEdge('chart', 'data')
        .addEdge('data', 'end')
        .build();
}
