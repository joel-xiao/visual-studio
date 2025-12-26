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
  // 这个方法可以正确处理嵌套的 JSON 对象和字符串中的括号
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
    
    // 处理单引号和双引号（JSON 标准只支持双引号，但有些 AI 可能使用单引号）
    if ((char === '"' || char === "'") && !inString) {
      inString = true;
      quoteChar = char;
      continue;
    } else if (char === quoteChar && inString) {
      inString = false;
      quoteChar = null;
      continue;
    }
    
    if (inString) {
      continue;
    }
    
    if (char === '{') {
      if (startIndex === -1) {
        startIndex = i;
      }
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0 && startIndex !== -1) {
        const jsonString = text.substring(startIndex, i + 1);
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          // 如果解析失败，尝试替换单引号为双引号（处理 AI 可能使用单引号的情况）
          try {
            // 只替换不在字符串转义中的单引号
            const normalized = jsonString.replace(/([^\\])'/g, '$1"').replace(/^'/, '"').replace(/'$/, '"');
            return JSON.parse(normalized);
          } catch (e2) {
            // 如果还是失败，重置状态继续查找下一个可能的 JSON
            startIndex = -1;
            braceCount = 0;
            // 不需要重置 inString 等，因为它们已经是 false/null
          }
        }
      }
    }
  }

  // 方法3: 尝试使用正则表达式匹配（更宽松的方式）
  // 找到所有可能的 JSON 对象，尝试解析每一个
  const jsonCandidates: string[] = [];
  
  // 尝试找到所有 {...} 模式
  let currentStart = -1;
  let currentBraceCount = 0;
  let currentInString = false;
  let currentEscapeNext = false;
  let currentQuoteChar: string | null = null;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (currentEscapeNext) {
      currentEscapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      currentEscapeNext = true;
      continue;
    }
    
    if ((char === '"' || char === "'") && !currentInString) {
      currentInString = true;
      currentQuoteChar = char;
      continue;
    } else if (char === currentQuoteChar && currentInString) {
      currentInString = false;
      currentQuoteChar = null;
      continue;
    }
    
    if (currentInString) {
      continue;
    }
    
    if (char === '{') {
      if (currentStart === -1) {
        currentStart = i;
      }
      currentBraceCount++;
    } else if (char === '}') {
      currentBraceCount--;
      if (currentBraceCount === 0 && currentStart !== -1) {
        jsonCandidates.push(text.substring(currentStart, i + 1));
        currentStart = -1;
        currentBraceCount = 0;
      }
    }
  }

  // 尝试解析每个候选 JSON
  for (const candidate of jsonCandidates) {
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // 尝试替换单引号为双引号
      try {
        const normalized = candidate.replace(/([^\\])'/g, '$1"').replace(/^'/, '"').replace(/'$/, '"');
        return JSON.parse(normalized);
      } catch (e2) {
        // 继续尝试下一个候选
      }
    }
  }

  // 方法4: 尝试解析整个文本（如果文本本身就是 JSON）
  try {
    const trimmed = text.trim();
    // 只尝试解析以 { 或 [ 开头的文本
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return JSON.parse(trimmed);
    }
  } catch (e) {
    // 不是纯 JSON 文本
  }

  return null;
}

/**
 * 从文本中提取 JSON，如果失败则抛出错误
 * @param text 包含 JSON 的文本
 * @param errorMessage 自定义错误消息
 * @returns 解析后的 JSON 对象
 * @throws Error 如果无法提取有效的 JSON
 */
export function extractJSONOrThrow(text: string, errorMessage = 'Failed to extract JSON from response'): any {
  const result = extractJSON(text);
  if (result === null) {
    // 提供更详细的错误信息，包含原始文本的前200个字符
    const preview = text ? text.substring(0, 200).replace(/\n/g, '\\n') : 'empty text';
    console.error('[JSON Extract Error]', errorMessage, '\nText preview:', preview);
    throw new Error(`${errorMessage}. Text preview: ${preview}`);
  }
  return result;
}

