import type { AgentRole } from '../../types';
import type { IAgentSchema } from '../types';
import { getLayoutTemplate } from './template';
import { createRoutingPrompt } from '../../utils/agent/routing';

/**
 * Layout Architect Agent Schema
 * 布局架构师 Agent 定义
 */
const layoutArchitectSchema: IAgentSchema = {
  id: 'layout-architect',
  role: 'layout-architect' as AgentRole,
  name: 'Layout Architect',
  displayName: '布局架构师',
  description: 'Responsible for overall layout structure, visual rhythm, and module partitioning.',
  icon: 'mdi:view-dashboard-outline',
  color: '#f39c12',

  routing: {
    hints: ['布局', '排版', '大屏', '生成', '创建', '新建', '网格', '位置', '调整大小'],
    tags: ['页面布局', '架构设计', '排版规划', '模块划分', '整体设计'],
    intent: '负责大屏页面的整体布局结构、模块划分和视觉节奏规划',
    priorityRules: {
      withSelection: '如果用户要求移动位置/调整大小，请路由给 layout-architect',
      withoutSelection: '如果用户要求生成新大屏/图表，路由给 layout-architect'
    },
    routingPrompt: (() => '') as (agentList: string, context: any) => string
  },

  uiHints: {
    fullWidth: true,
    primaryActionText: '应用此布局'
  },

  prompts: {
    generate: (componentList: string, historyStr: string) => `你是一位顶级大屏布局架构师 (Layout Architect)。你的任务是为用户规划一个专业、美观、且排版合理的数据大屏布局。

### 核心布局原则（必须严格遵守）：
1. **画布与网格**: 
   - **尺寸规范**: 默认画布宽度为 **1920** (16:9 比例，高度 1080)。**重要：如果用户在输入中明确指定了特定的宽度（如 3840, 2560 等），请务必优先使用该宽度并按 16:9 维持高度**。
   - **虚拟网格**: 请根据选定的宽度，将其划分为 **24 (横) x 24 (纵)** 的虚拟网格。
2. **随机性与多样性**: 
   - **组件数量**: 不要总是生成相同数量的组件。根据主题的复杂度，在 **3 到 10 个** 之间**随机**决定生成的组件数量，让布局更有意料之外的惊喜。
3. **严禁重叠**: 任何两个组件的矩形区域 **绝对不能重叠**。所有组件必须都在画布边界内。
4. **专业排版**: 
   - 留出约 **40px** 的外边距 (Margin) 和 **20px** 的内间距 (Gap)。
   - 建议采用“主次分明”的结构（如：中心大图占 12x12，左右各分布几个小图）。
5. **组件选择**: 必须且只能从以下可用组件列表中选择 'component' 和 'schema'：
${componentList}

### 布局建议模式（任选其一或自定义）：
- **T型模式**: 顶部标题 + 中间主视觉 + 左右面板。
- **三栏式**: 左 (6) : 中 (12) : 右 (6) 比例。
- **2+1+2 布局**: 左右各两行，中间一个巨型主图。

### 输出格式：
只返回合法的 JSON 格式，不要包含任何 Markdown 代码块标签或其他解释文本。

### 期望输出格式参考：
${getLayoutTemplate()}
${historyStr}`
  },

  // 流式输出消息
  messages: {
    processing: '正在规划布局...',
    applying: '已生成布局，正在应用...',
    completed: '已生成布局'
  }
};

layoutArchitectSchema.routing.routingPrompt = createRoutingPrompt(layoutArchitectSchema);

export default layoutArchitectSchema;
