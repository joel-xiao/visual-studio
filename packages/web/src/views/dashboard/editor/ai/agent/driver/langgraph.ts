import type { IAgent, IAgentResponse, AgentRole } from '../../types';
import type { IAgentSchema } from '../types';
import type { IWorkflowGraph } from '../../workflow/core/types';
import { WorkflowEngine } from '../../workflow/core/engine';

export class LangGraphDriver {
  private agents: Map<AgentRole, IAgent>;
  private schemas: Map<AgentRole, IAgentSchema>;

  constructor(agents: Map<AgentRole, IAgent>, schemas: Map<AgentRole, IAgentSchema>) {
    this.agents = agents;
    this.schemas = schemas;
  }

  async executeGraph(
    graph: IWorkflowGraph,
    input: string,
    context: Record<string, unknown> = {},
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> {
    const engine = new WorkflowEngine(graph);

    const wrappedOnStream = onStream ? (nodeId: string, partial: Partial<IAgentResponse>) => {
      const node = graph.nodes.find((n: { id: string; agent?: AgentRole }) => n.id === nodeId);
      const agentRole = node?.agent;

      if (agentRole && this.schemas.has(agentRole)) {
        // 可以在这里添加 schema 中的消息处理
      }

      onStream({
        ...partial,
        agent: agentRole
      } as Partial<IAgentResponse> & { agent?: AgentRole });
    } : undefined;

    const result = await engine.execute(input, context, wrappedOnStream);

    if (!result.success) {
      throw result.error || new Error('Workflow execution failed');
    }

    const executionContext = engine.getExecutionContext();
    let lastResponse: IAgentResponse | null = null;

    if (executionContext) {
      for (let i = executionContext.history.length - 1; i >= 0; i--) {
        const historyItem = executionContext.history[i];
        if (historyItem.response) {
          lastResponse = historyItem.response;
          break;
        }
      }
    }

    if (!lastResponse) {
      return {
        content: '工作流执行完成',
        type: 'text',
        data: result.finalData
      };
    }

    return {
      ...lastResponse,
      data: result.finalData
    };
  }
}
