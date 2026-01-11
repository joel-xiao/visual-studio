import type { ContextMenuItem } from './types';
import type { CreateNodeContext } from '../node-context';
import type { CreateComponentContext } from '../component-context';

/**
 * Builds a list of layers at a specific position or based on a node's hierarchy.
 */
export const buildHierarchyItems = (
    nodeId: string,
    nodeContext: CreateNodeContext,
    componentContext: CreateComponentContext,
    coords?: { x: number; y: number }
): ContextMenuItem[] => {
    const nodeMap = new Map<string, INode>();

    // 1. Always include the clicked node and its ancestors (The "Tree" path)
    let current: INode | undefined = nodeContext.getNode(nodeId) as INode | undefined;
    while (current && current.id) {
        nodeMap.set(current.id, current);
        if (current.id === 'root') break;
        current = current.parentId ? nodeContext.getNode(current.parentId) as INode | undefined : undefined;
    }

    // 2. Include overlapping nodes if we have coordinates (The "Spatial" part)
    if (coords) {
        const overlapping = nodeContext.searchNodesInArea({
            x: coords.x,
            y: coords.y,
            width: 1,
            height: 1
        });

        overlapping.forEach(node => {
            // Add the hit node and its ancestors to allow selecting parent groups spatially
            let p: INode | undefined = node;
            while (p && p.id) {
                nodeMap.set(p.id, p);
                if (p.id === 'root') break;
                p = p.parentId ? nodeContext.getNode(p.parentId) as INode | undefined : undefined;
            }
        });
    }

    // 3. Convert map to array and sort according to visual and logical hierarchy
    const itemsList = Array.from(nodeMap.values());

    itemsList.sort((a, b) => {
        if (a.id === 'root') return 1;
        if (b.id === 'root') return -1;

        // Visual depth check: is one a descendant of the other?
        // Descendants are always "higher" in the selection priority than their ancestors.
        let p: string | undefined = a.parentId;
        while (p && p !== 'root') {
            if (p === b.id) return -1; // a is child of b -> a should be first
            const pNode = nodeContext.getNode(p);
            p = pNode?.parentId;
        }

        p = b.parentId;
        while (p && p !== 'root') {
            if (p === a.id) return 1; // b is child of a -> b should be first
            const pNode = nodeContext.getNode(p);
            p = pNode?.parentId;
        }

        // Tie-breaker: Z-index (Rendering order)
        // Since we reorder nodes array by Z, Z-index is the primary visual order for siblings/unrelated nodes.
        if (a.z !== b.z) {
            return b.z - a.z; // Higher Z-index comes first
        }

        // Final tie-breaker: Smaller area (Usually the more specific targeted item)
        return (a.width * a.height) - (b.width * b.height);
    });

    // 4. Map to ContextMenuItem
    return itemsList.map((node) => ({
        id: `select-${node.id}`,
        label: node.name || node.id,
        icon: componentContext.getComponentIcon ? componentContext.getComponentIcon(node.schema) : undefined,
        checked: !!node.select,
        action: () => nodeContext.onSelectNode(node.id)
    }));
};
