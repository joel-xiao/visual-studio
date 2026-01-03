import type { AgentRole } from '../../../types';
import { getAgentSchema } from '../../../agent/registry';
import { asRecord, pickString } from '../../../utils/json-utils';

export const resolveApplyStrategy = (
  agent?: AgentRole,
  nodeConfig?: Record<string, unknown>,
  context?: { nodes?: readonly unknown[] }
): 'manual' | 'auto' => {
  const configObj = asRecord(nodeConfig) ?? {};
  const uiHints = asRecord(configObj.uiHints) ?? {};
  const fromNode = uiHints.applyStrategy ?? configObj.applyStrategy;
  const resolvedFromNode = fromNode === 'auto' || fromNode === 'manual' ? fromNode : undefined;
  if (!agent) return 'manual';
  const schema = getAgentSchema(agent);
  const fromSchema = schema?.uiHints?.applyStrategy;
  const resolvedFromSchema = fromSchema === 'auto' || fromSchema === 'manual' ? fromSchema : undefined;
  const base = resolvedFromNode ?? resolvedFromSchema ?? 'manual';

  const nodes = Array.isArray(context?.nodes) ? context.nodes : [];
  const hasCanvasComponents = nodes.some((n: unknown) => {
    const id = pickString(asRecord(n), 'id');
    return !!id && id !== 'root';
  });

  if (hasCanvasComponents && base === 'auto') return 'manual';
  return base;
};

export const resolveSecondaryAction = (nodeConfig?: Record<string, unknown>) => {
  const configObj = asRecord(nodeConfig) ?? {};
  const uiHints = asRecord(configObj.uiHints) ?? {};
  const action = asRecord(uiHints.secondaryAction ?? configObj.secondaryAction);
  if (!action) return undefined;
  if (pickString(action, 'kind') !== 'skip') return undefined;
  const label = pickString(action, 'label');
  if (!label) return undefined;
  return {
    label,
    kind: 'skip' as const,
    targetNodeId: pickString(action, 'targetNodeId')
  };
};
