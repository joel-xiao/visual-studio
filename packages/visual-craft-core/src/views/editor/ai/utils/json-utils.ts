/**
 * JSON 处理工具函数
 * 统一所有 JSON 相关的处理逻辑
 */

/**
 * 从文本中安全地提取 JSON 对象
 * @param text 包含 JSON 的文本
 * @returns 解析后的 JSON 对象，如果解析失败则返回 null
 */
export function extractJSON(text: string): any | null {
  if (!text) return null;

  // 方法1: 尝试查找 markdown 代码块中的 JSON
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const cleaned = codeBlockMatch[1].trim();
      if (cleaned) {
        return JSON.parse(cleaned);
      }
    } catch (e) {
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
            return JSON.parse(jsonStr);
          } catch (e) {
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
      return JSON.parse(simpleMatch[0]);
    } catch (e) {
      // 最后的后备方案也失败了
    }
  }

  return null;
}

/**
 * 从文本中提取 JSON，如果失败则抛出错误
 */
export function extractJSONOrThrow(text: string, errorMessage: string = 'Failed to extract JSON'): any {
  const result = extractJSON(text);
  if (!result) {
    throw new Error(errorMessage);
  }
  return result;
}

/**
 * 安全解析 JSON 字符串
 */
export function safeParseJSON(str: string | undefined | null, fallback: any = {}): any {
  if (typeof str !== 'string' || !str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn('[JSON Utils] Failed to parse JSON:', e);
    return fallback;
  }
}

/**
 * 安全序列化 JSON
 */
export function safeStringifyJSON(obj: any, indent: number = 2): string {
  if (typeof obj === 'string') return obj;
  try {
    return JSON.stringify(obj, null, indent);
  } catch (e) {
    console.warn('[JSON Utils] Failed to stringify JSON:', e);
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
