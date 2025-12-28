import type { IAgentSchema } from '../types';

/**
 * 从 schema 获取消息的辅助函数
 */
export function getSchemaMessage(schema: IAgentSchema, key: string, ...args: unknown[]): string {
  const msg = schema.messages[key];
  return typeof msg === 'function' ? msg(...args) : (msg || '');
}

