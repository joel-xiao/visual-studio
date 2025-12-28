import { WorkflowGraphBuilder } from '../core/graph';
import type { IWorkflowGraph } from '../core/types';
import type { AgentRole } from '../../types';
import { matchAgentByRules } from '../../agent/registry';

/**
 * 简单单 Agent 工作流
 */
export function createSimpleAgentWorkflow(agentRole: AgentRole): IWorkflowGraph {
  return new WorkflowGraphBuilder()
    .setId(`simple-${agentRole}`)
    .setName(`简单 ${agentRole} 工作流`)
    .setDescription(`直接执行 ${agentRole}`)
    .setMatchRule({
      match: (input) => {
        // 匹配对应的 agent role
        const matchedRole = matchAgentByRules(input);
        return matchedRole === agentRole;
      },
      priority: 5 // 默认优先级较低，优先匹配专用工作流
    })
    .addStartNode('start', '开始')
    .addAgentNode('agent', agentRole, agentRole)
    .addEndNode('end', '结束')
    .addEdge('start', 'agent')
    .addEdge('agent', 'end')
    .build();
}

