import type { AgentRole } from '../../../types';
import { getAgentSchema } from '../../../agent/registry';

export const resolveApplyStrategy = (
  agent?: AgentRole,
  nodeConfig?: Record<string, any>,
  context?: { nodes?: any }
): 'manual' | 'auto' => {
  const fromNode = nodeConfig?.uiHints?.applyStrategy ?? nodeConfig?.applyStrategy;
  const resolvedFromNode = fromNode === 'auto' || fromNode === 'manual' ? fromNode : undefined;
  if (!agent) return 'manual';
  const schema = getAgentSchema(agent);
  const fromSchema = schema?.uiHints?.applyStrategy;
  const resolvedFromSchema = fromSchema === 'auto' || fromSchema === 'manual' ? fromSchema : undefined;
  const base = resolvedFromNode ?? resolvedFromSchema ?? 'manual';

  const nodes = Array.isArray((context as any)?.nodes) ? (context as any).nodes : [];
  const hasCanvasComponents = nodes.some((n: any) => n && typeof n === 'object' && n.id && n.id !== 'root');

  if (hasCanvasComponents && base === 'auto') return 'manual';
  return base;
};

export const resolveSecondaryAction = (nodeConfig?: Record<string, any>) => {
  const action = nodeConfig?.uiHints?.secondaryAction ?? nodeConfig?.secondaryAction;
  if (!action || typeof action !== 'object') return undefined;
  if (action.kind !== 'skip') return undefined;
  if (typeof action.label !== 'string' || !action.label) return undefined;
  return {
    label: action.label,
    kind: 'skip' as const,
    targetNodeId: typeof action.targetNodeId === 'string' ? action.targetNodeId : undefined
  };
};
