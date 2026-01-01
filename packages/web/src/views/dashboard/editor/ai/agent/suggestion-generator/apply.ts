import type { IAIContext } from '../../hooks/core/use-ai-context';

export function apply(context: IAIContext, data: any) {
  // Suggestion generator 不需要应用逻辑，只是生成建议
  // 建议的应用由具体的 agent 处理
  console.log('Suggestions generated:', data.suggestions);
}