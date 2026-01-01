import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';

export function createLayoutToChartWorkflow(): IWorkflowGraph {
  return new WorkflowGraphBuilder()
    .setId('layout-to-chart')
    .setName('从零生成大屏')
    .setDescription('用于从空看板或需求出发，规划页面布局、设置主题配色，并填充初始图表和数据。适合“帮我创建一个XX主题的大屏”等全局指令。')
    .setMatchRule({
      keywords: ['屏', '页', '布局', '排版', '整体', '新建'],
      priority: 10
    })
    .addStartNode('start', '开始', { x: 100, y: 100 })
    .addAgentNode('layout', 'layout-architect', '布局规划', { x: 100, y: 200 }, { uiHints: { applyStrategy: 'auto' } })
    .addAgentNode('ui', 'theme-engine', '主题配色', { x: 100, y: 300 }, { uiHints: { applyStrategy: 'manual' } })
    .addAgentNode('chart', 'chart-creator', '图表生成', { x: 100, y: 400 }, { uiHints: { applyStrategy: 'auto' } })
    .addAgentNode('data', 'data-analyst', '数据填充', { x: 100, y: 500 }, { uiHints: { applyStrategy: 'auto' } })
    .addEndNode('end', '结束', { x: 100, y: 600 })
    .addEdge('start', 'layout')
    .addEdge('layout', 'ui')
    .addEdge('ui', 'chart')
    .addEdge('chart', 'data')
    .addEdge('data', 'end')
    .build();
}
