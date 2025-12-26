# Core 目录设计评估报告

## 当前设计分析

### ✅ 优点

1. **职责分离清晰**
   - `types.ts` - 类型定义
   - `provider.ts` - AI Provider 创建逻辑
   - `orchestrator.ts` - Agent 协调和路由
   - `config.ts` - 配置管理

2. **Orchestrator 设计合理**
   - 实现了 Agent 路由机制
   - 支持 Agent 链式协作（Pipeline）
   - 支持流式输出
   - 有降级策略（fallback）

### ❌ 存在的问题

#### 1. **严重安全问题：API Key 硬编码**

**位置：**
- `config.ts` 第 6 行
- `service/api/ai/index.ts` 第 96 行（重复）

**风险：**
- API Key 暴露在前端代码中，任何人都可以获取
- 违反安全最佳实践
- 可能导致费用滥用

**建议：**
- API Key 应该通过环境变量配置
- 或者通过后端代理，前端不直接调用 AI API

---

#### 2. **状态管理问题：Orchestrator 实例生命周期**

**问题：**
在 `use-chat-orchestrator.ts` 中每次调用 hook 都会创建新的 `AgentOrchestrator` 实例：

```typescript
const orchestrator = new AgentOrchestrator();
```

**影响：**
- `orchestrator.history` 状态无法持久化
- 每次组件重新渲染都会丢失对话历史
- 无法实现真正的上下文感知

**建议：**
- 使用单例模式或 Context Provider 管理 Orchestrator
- 或者在 hook 外部创建并共享实例

---

#### 3. **配置与初始化职责混乱**

**当前 `config.ts` 的问题：**
```typescript
// config.ts 既负责配置，又负责初始化
export const openai = createDashScope({...});
export const defaultModel = openai.chat('qwen-max');
```

**问题：**
- `config.ts` 应该只负责配置，不应该执行初始化
- 配置应该可以被外部注入，而不是硬编码

**建议：**
- 分离配置定义和初始化
- 使用工厂函数或依赖注入

---

#### 4. **类型安全性不足**

**问题：**
- `orchestrator.ts` 中多处使用 `any` 类型（history、context）
- `types.ts` 中 `data?: any` 缺乏具体类型定义

**建议：**
- 定义具体的类型接口
- 使用泛型提高类型安全性

---

#### 5. **Orchestrator 与 Agent 强耦合**

**当前：**
```typescript
constructor() {
  this.agents.set('layout-architect', new LayoutArchitect());
  this.agents.set('chart-creator', new ChartCreator());
  // ...
}
```

**问题：**
- 硬编码了所有 Agent 的创建
- 难以扩展或测试（无法 mock agents）
- 违反了依赖倒置原则

**建议：**
- 使用依赖注入
- 通过配置或工厂模式创建 agents

**注：** 此问题已通过使用 hooks 得到改善，但仍有进一步优化的空间。

---

#### 6. **History 管理不够灵活**

**问题：**
- History 存储在内存中，无法持久化
- 没有大小限制，可能无限增长
- 没有提供清理机制

**建议：**
- 支持外部存储（localStorage、IndexedDB）
- 实现 History 大小限制（LRU）
- 提供清理和导出功能

---

## 改进建议

### 方案 1：重构配置文件

```typescript
// config.ts - 只负责配置定义
export interface AIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export function getAIConfig(): AIConfig {
  return {
    apiKey: import.meta.env.VITE_AI_API_KEY || '',
    baseURL: import.meta.env.VITE_AI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: import.meta.env.VITE_AI_MODEL || 'qwen-max'
  };
}
```

### 方案 2：Orchestrator 单例管理

```typescript
// orchestrator-instance.ts
let orchestratorInstance: AgentOrchestrator | null = null;

export function getOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
  }
  return orchestratorInstance;
}

export function resetOrchestrator() {
  orchestratorInstance = null;
}
```

### 方案 3：依赖注入 Orchestrator

```typescript
// orchestrator.ts
export class AgentOrchestrator {
  constructor(private agents: Map<AgentRole, IAgent>) {
    // ...
  }
}

// orchestrator-factory.ts
export function createOrchestrator(): AgentOrchestrator {
  const agents = new Map<AgentRole, IAgent>();
  agents.set('layout-architect', useLayoutArchitect());
  // ...
  return new AgentOrchestrator(agents);
}
```

### 方案 4：类型改进

```typescript
// types.ts
export interface IAgentContext {
  nodes: INode[];
  selectedNodes: INode[];
  availableComponents: IComponent[];
  history?: IMessage[];
  previousAgentData?: Record<string, any>;
  previousAgentRole?: AgentRole;
}

export interface IAgentResponse<T = any> {
  content: string;
  type: IChatMessage['type'];
  data?: T;
  // ...
}
```

---

## 优先级建议

### 🔴 高优先级（必须修复）

1. **API Key 安全问题** - 立即修复
2. **Orchestrator 实例管理** - 影响核心功能

### 🟡 中优先级（建议改进）

3. **配置管理重构** - 提高可维护性
4. **类型安全性** - 减少运行时错误
5. **依赖注入** - 提高可测试性

### 🟢 低优先级（长期优化）

6. **History 持久化** - 增强用户体验
7. **配置外部化** - 提高灵活性

