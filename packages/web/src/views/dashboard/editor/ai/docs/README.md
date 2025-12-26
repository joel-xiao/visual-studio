# AI 助手模块概览

本模块 (`packages/web/src/views/dashboard/editor/ai`) 实现了一个集成在大屏编辑器中的智能助手，旨在通过自然语言交互辅助用户创建和修改大屏内容。

## 1. 核心功能

该模块主要实现了以下功能：
- **自然语言交互**：用户可以通过对话框输入指令。
- **多 Agent 协作**：根据用户意图，自动调度不同的 Agent（如布局专家、图表专家、数据分析师等）进行处理。
- **Agent Pipeline**：支持 Agent 链式协作，如 LayoutArchitect → DataAnalyst 自动填充 Mock 数据。
- **实时预览与应用**：AI 生成的图表或布局配置可以在聊天窗口中预览，并一键应用到编辑器画布中。
- **上下文感知**：Agent 能够感知当前选中的组件、画布上的节点信息，从而进行针对性的修改。

## 2. 目录结构

```
ai/
├── core/                      # 核心逻辑
│   ├── config.ts             # AI SDK 配置
│   ├── orchestrator.ts       # Agent 调度器，负责意图识别、任务分发和 Agent Pipeline
│   ├── provider.ts           # AI Provider 创建逻辑
│   └── types.ts              # 类型定义 (AgentRole, IChatMessage 等)
├── hooks/                     # Vue 3 Composition API Hooks
│   ├── agents/               # Agent Hooks 实现
│   │   ├── use-chart-creator.ts
│   │   ├── use-layout-architect.ts
│   │   ├── use-data-analyst.ts
│   │   └── use-theme-engine.ts
│   ├── use-chat-messages.ts  # 消息管理
│   ├── use-chat-selection.ts # 选择相关逻辑
│   ├── use-chat-input.ts     # 输入状态管理
│   ├── use-input-area-height.ts # 输入区域高度监听
│   └── use-chat-orchestrator.ts # Orchestrator 和消息发送
├── components/               # 聊天界面专用 UI 组件
│   ├── Messages.vue          # 消息列表组件
│   ├── Message.vue           # 单条消息组件
│   ├── InputArea.vue         # 输入区域组件
│   ├── ContextIndicator.vue  # 上下文指示器
│   ├── ChartPreview.vue      # 图表预览组件
│   └── ThemePicker.vue       # 主题选择器组件
├── materials/                # 素材相关
│   └── apache-e-charts/      # ECharts 相关
│       └── template.ts       # 图表模板
├── modules/                  # 功能模块
│   ├── layout/               # 布局模块
│   │   └── template.ts       # 布局模板
│   ├── data/                 # 数据模块
│   │   └── template.ts       # 数据模板
│   ├── theme/                # 主题模块
│   │   └── engine.ts         # 主题引擎（已迁移到 hooks）
│   └── prompt/               # 提示词模块
│       └── suggestions.ts    # 提示建议
├── docs/                     # 文档目录
│   ├── README.md             # 本文件
│   ├── design-review.md      # 设计评估报告
│   └── agents-hooks.md       # Agent Hooks 文档
├── chat.vue                  # [入口] 聊天主界面组件
└── README.md                 # 快速开始（指向 docs/README.md）
```

## 3. 工作流程 (Data Flow)

1.  **用户输入**：用户在 `chat.vue` 中输入指令（例如："帮我画一个销售折线图"）。
2.  **意图识别 (Orchestrator)**：
    -   `AgentOrchestrator` 接收输入，并结合当前上下文（选中的节点、历史对话）。
    -   调用 LLM 路由接口，决定将任务分发给哪个 Agent（如 `chart-creator`）。
3.  **Agent 处理**：
    -   目标 Agent（如 `ChartCreator`）接收任务。
    -   Agent 调用 LLM 生成结构化数据（如 ECharts 的 option 对象）。
    -   Agent 支持流式输出，实时将思考过程和结果反馈给前端。
4.  **Agent Pipeline (链式协作)**：
    -   如果 Agent 返回 `nextAgent` 字段，Orchestrator 会自动触发后续 Agent。
    -   例如：LayoutArchitect → DataAnalyst，生成布局后自动填充 Mock 数据。
    -   `handoffPrompt` 字段用于传递上下文信息给下一个 Agent。
5.  **结果渲染**：
    -   `chat.vue` 接收 Agent 返回的 `IAgentResponse`。
    -   根据 `response.type`（如 `chart`, `text`, `theme-selection`）渲染不同的 UI 组件。
    -   例如，`chart` 类型会渲染图表预览组件，展示图表预览。
6.  **应用变更**：
    -   用户点击组件上的"应用"按钮。
    -   调用 `nodeContext` 的方法（如 `onAddNode`, `updateNodeProps`）。
    -   编辑器画布更新，大屏内容发生改变。

## 4. 关键代码说明

### Orchestrator (`core/orchestrator.ts`)
- 是整个 AI 系统的"大脑"。
- 维护对话历史 (`history`)。
- 通过 AI SDK 的 `generateText` 进行路由决策。
- 支持 Agent 链式协作。

### Agent Hooks (`hooks/agents/`)
- 所有 Agent 都使用 Vue 3 Composition API 的 hooks 模式实现。
- 每个 hook 返回一个实现了 `IAgent` 接口的对象。
- 详细的文档请参考 [agents-hooks.md](./agents-hooks.md)。

### Chat Interface (`chat.vue`)
- 负责 UI 交互和状态管理。
- 使用多个 hooks 组合实现功能：
  - `useChatMessages` - 消息管理
  - `useChatSelection` - 选择相关逻辑
  - `useChatInput` - 输入状态
  - `useInputAreaHeight` - 高度监听
  - `useChatOrchestrator` - 消息发送和响应处理

## 5. 类型定义 (`core/types.ts`)

主要类型包括：
- `AgentRole`: 定义了系统支持的角色 ('layout-architect', 'chart-creator', etc.)。
- `IChatMessage`: 定义了聊天消息的数据结构，支持富文本、代码块、图表预览等多种类型。
- `IAgent`: Agent 接口定义
- `IAgentResponse`: Agent 响应数据结构

## 6. 相关文档

- [设计评估报告](./design-review.md) - Core 目录设计问题和改进建议
- [Agent Hooks 文档](./agents-hooks.md) - Agent Hooks 的详细说明

