import type { IAgent, IAgentResponse, AgentRole } from '../../types';
import type { IAgentSchema } from '../types';

/**
 * LangChain 驱动模式
 * 基于链式调用的 Agent 执行模式
 */
export class LangChainDriver {
  private agents: Map<AgentRole, IAgent>;
  private schemas: Map<AgentRole, IAgentSchema>;

  constructor(agents: Map<AgentRole, IAgent>, schemas: Map<AgentRole, IAgentSchema>) {
    this.agents = agents;
    this.schemas = schemas;
  }

  /**
   * 执行 Agent 链
   * @param chain Agent 角色链
   * @param input 输入
   * @param context 上下文
   * @param onStream 流式输出回调
   */
  async executeChain(
    chain: AgentRole[],
    input: string,
    context: any = {},
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> {
    let currentInput = input;
    let accumulatedData: any = {};
    let lastResponse: IAgentResponse | null = null;

    for (const role of chain) {
      const agent = this.agents.get(role);
      if (!agent) {
        throw new Error(`Agent ${role} not found`);
      }

      const schema = this.schemas.get(role);
      if (onStream && schema) {
        const msg = schema.messages.processing;
        onStream({
          content: typeof msg === 'function' ? msg() : msg,
          type: 'agent-thought'
        });
      }

      const response = await agent.process(currentInput, {
        ...context,
        previousAgentData: accumulatedData
      }, onStream);

      // 累积数据
      if (response.data) {
        accumulatedData = { ...accumulatedData, ...response.data };
      }

      // 使用响应内容作为下一个 agent 的输入（或使用原始输入）
      currentInput = response.content || currentInput;
      lastResponse = response;
    }

    if (!lastResponse) {
      throw new Error('No response from chain execution');
    }

    return {
      ...lastResponse,
      data: accumulatedData
    };
  }

  /**
   * 根据条件执行 Agent
   */
  async executeConditional(
    condition: (context: any) => AgentRole,
    input: string,
    context: any = {},
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> {
    const role = condition(context);
    const agent = this.agents.get(role);
    
    if (!agent) {
      throw new Error(`Agent ${role} not found`);
    }

    return agent.process(input, context, onStream);
  }
}

