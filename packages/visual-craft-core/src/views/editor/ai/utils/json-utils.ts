/**
 * JSON 处理工具函数
 * 统一所有 JSON 相关的处理逻辑
 */

import type { JsonValue } from '../../../../@types/utils';

type JsonRecord = Record<string, JsonValue>;

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function asRecord(value: unknown): JsonRecord | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as JsonRecord;
}

export function pickRecord(value: unknown, key: string): JsonRecord | undefined {
  const obj = asRecord(value);
  return asRecord(obj?.[key]);
}

export function pickString(value: unknown, key: string): string | undefined {
  const obj = asRecord(value);
  const v = obj?.[key];
  return typeof v === 'string' ? v : undefined;
}

export function pickNumber(value: unknown, key: string): number | undefined {
  const obj = asRecord(value);
  const v = obj?.[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

export function pickBoolean(value: unknown, key: string): boolean | undefined {
  const obj = asRecord(value);
  const v = obj?.[key];
  return typeof v === 'boolean' ? v : undefined;
}

export function pickArray(value: unknown, key: string): JsonValue[] | undefined {
  const obj = asRecord(value);
  const v = obj?.[key];
  return Array.isArray(v) ? (v as JsonValue[]) : undefined;
}

/**
 * 从文本中安全地提取 JSON 对象
 * @param text 包含 JSON 的文本
 * @returns 解析后的 JSON 对象，如果解析失败则返回 null
 */
export function extractJSON(text: string): JsonValue | null {
  if (!text) return null;

  // 方法1: 尝试查找 markdown 代码块中的 JSON
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const cleaned = codeBlockMatch[1].trim();
      if (cleaned) {
        return JSON.parse(cleaned) as JsonValue;
      }
    } catch (_e) {
      // 继续尝试其他方法
    }
  }

  // 方法2: 尝试找到第一个完整的 JSON 对象（通过计数括号）
  let braceCount = 0;
  let startIndex = -1;
  let inString = false;
  let escapeNext = false;
  let quoteChar: string | null = null;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if ((char === '"' || char === "'") && !inString) {
      inString = true;
      quoteChar = char;
      continue;
    } else if (char === quoteChar && inString) {
      inString = false;
      quoteChar = null;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        if (startIndex === -1) {
          startIndex = i;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          try {
            const jsonStr = text.substring(startIndex, i + 1);
            return JSON.parse(jsonStr) as JsonValue;
          } catch (_e) {
            // 继续尝试其他方法
          }
        }
      }
    }
  }

  // 方法3: 简单的正则匹配（作为最后的后备方案）
  const simpleMatch = text.match(/\{[\s\S]*\}/);
  if (simpleMatch) {
    try {
      return JSON.parse(simpleMatch[0]) as JsonValue;
    } catch (_e) {
      // 最后的后备方案也失败了
    }
  }

  return null;
}

/**
 * 从文本中提取 JSON，如果失败则抛出错误
 */
export function extractJSONOrThrow(text: string, errorMessage: string = 'Failed to extract JSON'): JsonValue {
  const result = extractJSON(text);
  if (!result) {
    throw new Error(errorMessage);
  }
  return result;
}

/**
 * 安全解析 JSON 字符串
 */
export function safeParseJSON<T extends JsonValue = JsonValue>(str: string | undefined | null, fallback: T = {} as T): T {
  if (typeof str !== 'string' || !str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch (_e) {
    return fallback;
  }
}

/**
 * 安全序列化 JSON
 */
export function safeStringifyJSON(obj: JsonValue | string, indent: number = 2): string {
  if (typeof obj === 'string') return obj;
  try {
    return JSON.stringify(obj, null, indent);
  } catch (_e) {
    return '{}';
  }
}

export function isLikelyCodeOutput(text: string): boolean {
  const trimmed = (text || '').trimStart();
  if (!trimmed) return false;
  return trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('```') || trimmed.startsWith('<template');
}

export function inferCodeLanguage(text: string): string {
  const trimmed = (text || '').trimStart();
  if (!trimmed) return 'json';
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  if (trimmed.startsWith('<template')) return 'vue';

  if (trimmed.startsWith('```')) {
    const firstLine = trimmed.split('\n')[0] || '';
    const lang = firstLine.replace('```', '').trim();
    return lang || 'json';
  }
  return 'json';
}

export function stripMarkdownCodeFences(text: string): string {
  const raw = text || '';
  const trimmed = raw.trim();
  if (!trimmed.startsWith('```')) return raw;
  const lines = raw.split('\n');
  if (lines.length === 1) return raw.replace(/^```/, '');

  const firstLine = lines[0] || '';
  const lastLine = lines[lines.length - 1] || '';
  const start = firstLine.trimStart().startsWith('```') ? 1 : 0;
  const end = lastLine.trim().startsWith('```') ? lines.length - 1 : lines.length;
  return lines.slice(start, end).join('\n');
}
