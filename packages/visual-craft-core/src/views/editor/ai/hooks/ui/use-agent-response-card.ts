import { computed, type ComputedRef } from 'vue';
import type { IWorkflowControl } from '../../types';
import type { IWorkflowEdge, IWorkflowGraph, IWorkflowNode } from '../../workflow/core/types';
import { WorkflowRegistry } from '../../workflow/registry';
import { asRecord, pickString } from '../../utils/json-utils';

export function useAgentResponseCardWorkflow(
  workflowControl: ComputedRef<IWorkflowControl | undefined>,
  enableWorkflowActions: ComputedRef<boolean | undefined>
) {
  const shouldShowWorkflowUI = computed(() =>
    !!(enableWorkflowActions.value && workflowControl.value?.isMultiStep && workflowControl.value?.hasNext)
  );

  const workflowGraph = computed<IWorkflowGraph | null>(() => {
    const workflowId = workflowControl.value?.workflowId;
    if (!workflowId) return null;
    return WorkflowRegistry.get(workflowId);
  });

  const workflowInlineActions = computed(() => {
    const graph = workflowGraph.value;
    const nodeId = workflowControl.value?.currentNodeId || workflowControl.value?.nextNodeId;
    if (!graph || !nodeId) return [];

    const node = graph.nodes.find(n => n.id === nodeId);
    const config = asRecord(node?.config);
    const uiHints = asRecord(config?.uiHints);
    const raw = uiHints?.inlineActions ?? config?.inlineActions;
    if (!Array.isArray(raw)) return [];

    const normalized: Array<{ kind: 'applyOnly'; label: string; title?: string }> = [];
    for (const a of raw) {
      const aObj = asRecord(a);
      const kind = pickString(aObj, 'kind') === 'applyOnly' ? 'applyOnly' : undefined;
      const label = pickString(aObj, 'label') || '';
      const title = pickString(aObj, 'title');
      if (!kind || !label) continue;
      normalized.push({ kind, label, title });
    }
    return normalized;
  });

  const showWorkflowInlineActions = computed(() => shouldShowWorkflowUI.value && workflowInlineActions.value.length > 0);

  const remainingWorkflowLinear = computed(() => {
    const graph = workflowGraph.value;
    const nextNodeId = workflowControl.value?.nextNodeId;
    if (!graph || !nextNodeId) return [];

    const nodesById = new Map<string, IWorkflowNode>();
    for (const n of graph.nodes) nodesById.set(n.id, n);

    const edgesBySource = new Map<string, IWorkflowEdge[]>();
    for (const e of graph.edges) {
      const list: IWorkflowEdge[] = edgesBySource.get(e.source) || [];
      list.push(e);
      edgesBySource.set(e.source, list);
    }

    const result: Array<{ key: string; label: string }> = [];
    const visited = new Set<string>();
    let curr: string | undefined = nextNodeId;

    while (curr && !visited.has(curr)) {
      visited.add(curr);
      const node = nodesById.get(curr);
      if (!node) break;
      result.push({ key: curr, label: node.label || node.agent || curr });
      const outgoing: IWorkflowEdge[] = edgesBySource.get(curr) || [];
      if (outgoing.length !== 1) return [];
      curr = outgoing[0].target;
    }

    return result;
  });

  const remainingWorkflowEdges = computed(() => {
    const graph = workflowGraph.value;
    const nextNodeId = workflowControl.value?.nextNodeId;
    if (!graph || !nextNodeId) return [];

    const nodesById = new Map<string, IWorkflowNode>();
    for (const n of graph.nodes) nodesById.set(n.id, n);

    const queue: string[] = [nextNodeId];
    const visited = new Set<string>();
    const edges: Array<{ key: string; source: string; target: string; condition?: string }> = [];

    while (queue.length) {
      const id = queue.shift();
      if (!id) break;
      if (visited.has(id)) continue;
      visited.add(id);

      const outgoing = graph.edges.filter(e => e.source === id);
      for (const e of outgoing) {
        const sourceNode = nodesById.get(e.source);
        const targetNode = nodesById.get(e.target);
        edges.push({
          key: e.id || `${e.source}->${e.target}`,
          source: sourceNode?.label || sourceNode?.agent || e.source,
          target: targetNode?.label || targetNode?.agent || e.target,
          condition: e.condition
        });
        if (!visited.has(e.target)) queue.push(e.target);
      }
    }

    return edges;
  });

  const remainingWorkflowTitle = computed(() => workflowGraph.value?.name || '后续步骤');

  const showWorkflowPopover = computed(() =>
    shouldShowWorkflowUI.value &&
    (remainingWorkflowLinear.value.length > 0 || remainingWorkflowEdges.value.length > 0)
  );

  return {
    showWorkflowInlineActions,
    showWorkflowPopover,
    remainingWorkflowTitle,
    remainingWorkflowLinear,
    remainingWorkflowEdges,
    workflowInlineActions
  };
}
