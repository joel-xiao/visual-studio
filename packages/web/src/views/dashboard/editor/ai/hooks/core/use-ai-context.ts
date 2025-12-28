import { useNodeContext } from '../../../hooks/node-context';
import { useComponentContext } from '../../../hooks/component-context';
import { useChartThemesContext } from '../../../hooks/chart-themes-context';

export interface IAIContext {
  nodeContext: ReturnType<typeof useNodeContext>;
  componentContext: ReturnType<typeof useComponentContext>;
  chartThemesContext: ReturnType<typeof useChartThemesContext>;
}

let aiContextInstance: IAIContext | null = null;

function initAIContext(): IAIContext {
  if (!aiContextInstance) {
    const nodeContext = useNodeContext();
    const componentContext = useComponentContext();
    const chartThemesContext = useChartThemesContext();

    aiContextInstance = {
      nodeContext,
      componentContext,
      chartThemesContext
    };
  }
  return aiContextInstance;
}

export function useAIContext(): IAIContext {
  if (!aiContextInstance) {
    return initAIContext();
  }
  return aiContextInstance;
}

export function useAIContextOptional(): IAIContext | null {
  return aiContextInstance || null;
}

export function initAIContextExplicit(): IAIContext {
  return initAIContext();
}
