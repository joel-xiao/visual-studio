import { DEFAULT_AGENT_MESSAGES, type IAgentSchema } from '../../agent/types';
import type { JsonValue } from '../../../../../@types/utils';

/**
 * 从 schema 获取消息的辅助函数
 */
export function getSchemaMessage(schema: IAgentSchema, key: string, ...args: JsonValue[]): string {
  const custom = schema.messages?.[key];
  if (typeof custom === 'function') return custom(...args);
  if (typeof custom === 'string') return custom;

  const builtin = (DEFAULT_AGENT_MESSAGES as Record<string, string>)[key];
  return builtin || '';
}
