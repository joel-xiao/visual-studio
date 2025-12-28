import type { IAgentResponse, AgentRole } from '../../types';

/**
 * Agent 驱动接口
 */
export interface IAgentDriver {
  /**
   * 执行 Agent
   */
  execute(input: string, context?: any, onStream?: (partial: Partial<IAgentResponse>) => void): Promise<IAgentResponse>;
}

