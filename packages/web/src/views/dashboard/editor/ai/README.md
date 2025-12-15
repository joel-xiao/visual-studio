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
├── agents/                 # Agent 核心逻辑定义
│   ├── orchestrator.ts     # [核心] 调度器，负责意图识别、任务分发和 Agent Pipeline
│   ├── chart-creator.ts    # 图表生成器，负责生成 ECharts 配置
│   ├── layout-architect.ts # 布局架构师，负责生成整体大屏布局
│   ├── data-analyst.ts     # 数据分析师，负责数据解读和 Mock 数据生成
│   ├── theme-engine.ts     # 主题引擎，负责切换全局或图表主题
│   ├── prompt-suggestions.ts # 提示词推荐逻辑
│   └── sdk-config.ts       # AI SDK 配置 (Model 定义等)
├── components/             # 聊天界面专用 UI 组件
│   ├── ChartMessage.vue    # 图表消息组件，用于预览和应用图表配置
│   └── ThemeSelector.vue   # 主题选择器组件
├── chat.vue                # [入口] 聊天主界面组件
└── types.ts                # 类型定义 (AgentRole, IChatMessage 等)
```

## 3. 工作流程 (Data Flow)

1.  **用户输入**：用户在 `chat.vue` 中输入指令（例如：“帮我画一个销售折线图”）。
2.  **意图识别 (Orchestrator)**：
    -   `AgentOrchestrator` 接收输入，并结合当前上下文（选中的节点、历史对话）。
    -   调用 LLM 路由接口，决定将任务分发给哪个 Agent（如 `chart-creator`）。
3.  **Agent 处理**：
    -   目标 Agent（如 `ChartCreator`）接收任务。
    -   Agent 调用 LLM 生成结构化数据（如 ECharts 的 option 对象）。
    -   Agent 支持流式输出 (`streamObject`)，实时将思考过程和结果反馈给前端。
4.  **Agent Pipeline (链式协作)**：
    -   如果 Agent 返回 `nextAgent` 字段，Orchestrator 会自动触发后续 Agent。
    -   例如：LayoutArchitect → DataAnalyst，生成布局后自动填充 Mock 数据。
    -   `handoffPrompt` 字段用于传递上下文信息给下一个 Agent。
5.  **结果渲染**：
    -   `chat.vue` 接收 Agent 返回的 `IAgentResponse`。
    -   根据 `response.type`（如 `chart`, `text`, `theme-selection`）渲染不同的 UI 组件。
    -   例如，`chart` 类型会渲染 `ChartMessage.vue`，展示图表预览。
6.  **应用变更**：
    -   用户点击组件上的“应用”按钮。
    -   `ChartMessage.vue` 调用 `nodeContext` 的方法（如 `onAddNode`, `updateNodeProps`）。
    -   编辑器画布更新，大屏内容发生改变。

## 4. 关键代码说明

### Orchestrator (`agents/orchestrator.ts`)
- 是整个 AI 系统的“大脑”。
- 维护对话历史 (`history`)。
- 使用 `zod` 定义 Schema，通过 AI SDK 的 `generateObject` 进行路由决策。

### ChartCreator (`agents/chart-creator.ts`)
- 专注于图表领域。
- 使用 `streamObject` 生成符合 ECharts 规范的 JSON 配置。
- 能够处理“创建新图表”和“修改现有图表”两种模式（通过 System Prompt 区分）。

### Chat Interface (`chat.vue`)
- 负责 UI 交互和状态管理。
- 监听 `orchestrator` 的流式回调，实时更新消息流。
- 处理特殊的副作用，例如自动应用某些简单的变更，或为复杂的变更提供人工确认入口。

## 5. 类型定义 (`types.ts`)

主要类型包括：
- `AgentRole`: 定义了系统支持的角色 ('layout-architect', 'chart-creator', etc.)。
- `IChatMessage`: 定义了聊天消息的数据结构，支持富文本、代码块、图表预览等多种类型。
