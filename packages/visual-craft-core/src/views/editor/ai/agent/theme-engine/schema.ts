import type { AgentRole } from '../../types';
import type { IAgentSchema } from '../types';
import { createRoutingPrompt } from '../../utils/agent/routing';
import type { AgentContext } from '../../types';
import type { JsonValue } from '../../../../../@types/utils';

/**
 * Theme Engine Agent Schema
 * 主题引擎 Agent 定义
 */
const themeEngineSchema: IAgentSchema = {
  id: 'theme-engine',
  role: 'theme-engine' as AgentRole,
  name: 'Theme Engine',
  displayName: '主题引擎',
  description: 'Responsible for global visual style and themes.',
  icon: 'mdi:palette',
  color: '#e74c3c',

  routing: {
    hints: ['主题', '切换', '暗黑', '明亮', '配色', '颜色方案'],
    tags: ['视觉风格', '全局配色', '主题切换', '色彩方案', '品牌调性'],
    intent: '管理大屏的整体视觉风格，包括全局配色方案、UI主题和视觉规范',
    priorityRules: {
      withSelection: '全局主题切换，不用于单个图表颜色修改',
      withoutSelection: '如果用户要求全局主题切换，路由给 theme-engine'
    },
    routingPrompt: (_agentList: string, _context: AgentContext) => ''
  },

  uiHints: {
    fullWidth: true,
    applyStrategy: 'auto'
  },

  // 可用主题列表
  config: {
    availableThemes: [
      'dark (暗黑)',
      'macarons (马卡龙 - 清新)',
      'walden (瓦尔登 - 绿色)',
      'purplePassion (紫色)',
      'vintage (复古)',
      'chalk (粉笔)',
      'westeros (权游)',
      'wonderland (仙境)',
      'essos',
      'shine',
      'roma (罗马)'
    ],
    fallbackThemeMap: {
      '蓝': 'westeros',
      '科技': 'westeros',
      '紫': 'purplePassion',
      '绿': 'walden',
      '红': 'essos',
      '暖': 'essos',
      '复古': 'vintage',
      '柔和': 'macarons'
    }
  },

  prompts: {
    select: () => {
      const raw = themeEngineSchema.config?.availableThemes;
      const themes = Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [];
      return `你是一位主题配色专家 (Theme Engine)。请为大屏选择一个合适的主题。
可用主题列表: ${themes.join(', ')}。

请只返回合法的 JSON:
{"content":"简短的主题描述","type":"theme-selection","data":{"theme":"dark"}}
如果需要自定义颜色: {"content":"自定义主题描述","type":"theme-selection","data":{"theme":"custom-name","colors":["#5470c6","#91cc75","#fac858"]}}`;
    }
  },

  // 流式输出消息
  messages: {
    processing: '正在匹配主题...',
    completed: '已应用主题',
    fallback: (theme: JsonValue) => `已切换到 ${String(theme || '')} 主题（离线模式）`
  }
};

themeEngineSchema.routing.routingPrompt = createRoutingPrompt(themeEngineSchema);

export default themeEngineSchema;
