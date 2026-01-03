import type { IAIContext } from '../../hooks/core/use-ai-context';
import type { JsonValue } from '../../../../../@types/utils';

export function apply(_context: IAIContext, _data: JsonValue) {
  // Suggestion generator 不需要应用逻辑，只是生成建议
  // 建议的应用由具体的 agent 处理
}
