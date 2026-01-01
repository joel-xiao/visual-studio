import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';
import type { AgentRole } from '../../types';

export function createSimpleAgentWorkflow(agentRole: AgentRole): IWorkflowGraph {
  return new WorkflowGraphBuilder()
    .setId(`simple-${agentRole}`)
    .setName(`简单 ${agentRole} 工作流`)
    .setDescription(`直接执行 ${agentRole}`)
    .setMatchRule({
      priority: 5
    })
    .addStartNode('start', '开始')
    .addAgentNode('agent', agentRole, agentRole)
    .addEndNode('end', '结束')
    .addEdge('start', 'agent')
    .addEdge('agent', 'end')
    .build();
}
