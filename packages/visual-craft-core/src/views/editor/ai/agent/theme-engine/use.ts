import type { IAgent, IAgentResponse } from '../../types';
import themeEngineSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';

export function useThemeEngine(): IAgent {
  const schema = themeEngineSchema;
  const { processWithAI } = useBaseAgent(schema);

  const process = async (input: string, context?: any, onStream?: any): Promise<IAgentResponse> => {
    try {
      return await processWithAI(schema.prompts.select(), input, onStream, (json) => ({
        type: 'theme-selection',
        data: json.data || json
      }), context?.attachments);
    } catch (e) {
      // 简单回退逻辑
      const theme = input.toLowerCase().includes('light') ? 'light' : 'dark';
      return { content: `已为您切换至 ${theme} 主题`, type: 'theme-selection', data: { theme } };
    }
  };

  return { role: schema.role as any, name: schema.name, description: schema.description, process };
}
