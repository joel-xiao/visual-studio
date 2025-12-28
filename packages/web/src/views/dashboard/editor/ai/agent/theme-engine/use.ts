import type { IAgent, IAgentResponse } from '../../types';
import themeEngineSchema from './schema';
import { createAgent } from '../../utils/agent/agent-factory';
import { processAgentWithAI } from '../../utils/agent/base-agent';
import { getSchemaMessage } from '../../utils/agent/schema-helpers';
import { useAIConfig } from '../../hooks/core/use-ai-config';

/**
 * 创建回退主题
 */
const createFallbackTheme = (input: string): IAgentResponse => {
  const schema = themeEngineSchema;
  const inputLower = input.toLowerCase();
  let theme = 'dark';

  const fallbackMap = schema.config?.fallbackThemeMap || {};
  for (const [key, value] of Object.entries(fallbackMap)) {
    if (inputLower.includes(key)) {
      theme = value as string;
      break;
    }
  }

  return {
    content: getSchemaMessage(schema, 'fallback', theme),
    type: 'theme-selection' as const,
    data: { theme }
  };
};

/**
 * Theme Engine Agent
 * 使用通用工具函数简化实现
 */
export function useThemeEngine(): IAgent {
  const { defaultModel } = useAIConfig();
  const schema = themeEngineSchema;

  const process = async (
    input: string,
    _context?: unknown,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    try {
      return await processAgentWithAI(
        { defaultModel, schema, onStream },
        schema.prompts.select(),
        input,
        (result) => {
      if (result) {
        return {
          content: result.content || getSchemaMessage(schema, 'completed'),
          type: 'theme-selection',
          data: result.data
        };
      }
          return null;
        }
      );
    } catch (error) {
      console.error('[ThemeEngine] AI failed, using fallback:', error);
      return createFallbackTheme(input);
    }
  };

  return createAgent(schema, process);
}
