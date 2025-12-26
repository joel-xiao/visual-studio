# Agent Hooks

本目录包含所有 Agent 的 hooks 实现。这些 hooks 遵循 Vue 3 Composition API 的最佳实践，替代了原来的类实现。

## 结构

```
hooks/agents/
├── index.ts                    # 统一导出
├── use-chart-creator.ts        # 图表创建器 Agent
├── use-layout-architect.ts     # 布局架构师 Agent
├── use-data-analyst.ts         # 数据分析师 Agent
└── use-theme-engine.ts         # 主题引擎 Agent
```

## 设计原则

1. **函数式编程**：每个 hook 返回一个实现了 `IAgent` 接口的对象
2. **无状态**：hooks 本身不维护状态，只返回处理函数
3. **可测试性**：函数式设计使得单元测试更容易
4. **可组合性**：可以轻松地组合和扩展新的 agents

## 使用示例

### 在 Orchestrator 中使用

```typescript
import { useChartCreator } from '../hooks/agents/use-chart-creator';
import { useLayoutArchitect } from '../hooks/agents/use-layout-architect';

export class AgentOrchestrator {
  constructor() {
    this.agents.set('chart-creator', useChartCreator());
    this.agents.set('layout-architect', useLayoutArchitect());
  }
}
```

### 直接使用 Agent

```typescript
import { useChartCreator } from './hooks/agents/use-chart-creator';

const chartCreator = useChartCreator();
const response = await chartCreator.process(input, context, onStream);
```

## 迁移说明

### 原来的实现（类）

```typescript
export class ChartCreator implements IAgent {
  role: AgentRole = 'chart-creator';
  name = 'Chart Creator';
  
  async process(input: string, context?: any): Promise<IAgentResponse> {
    // ...
  }
}
```

### 新的实现（Hook）

```typescript
export function useChartCreator(): IAgent {
  const process = async (
    input: string,
    context?: any,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> {
    // ...
  };
  
  return {
    role: 'chart-creator' as AgentRole,
    name: 'Chart Creator',
    description: '...',
    process
  };
}
```

## 优势

1. **更好的代码组织**：函数式代码更容易理解和维护
2. **符合 Vue 3 最佳实践**：使用 Composition API 模式
3. **易于扩展**：添加新功能只需要添加新的函数
4. **类型安全**：保持了完整的 TypeScript 类型支持
5. **测试友好**：纯函数更容易进行单元测试

