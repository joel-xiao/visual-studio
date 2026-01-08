import type { ContextMenuItem } from './types';
import type { CreateNodeContext } from '../node-context';
import type { CreateComponentContext } from '../component-context';

/**
 * Helper to calculate absolute position of a node within the canvas.
 * It recursively adds parent coordinates.
 */
const getAbsoluteRect = (nodeId: string, nodeContext: CreateNodeContext) => {
    const node = nodeContext.getNode(nodeId);
    if (!node || node.id === 'root') return { x: 0, y: 0, width: node?.width || 0, height: node?.height || 0 };

    let absX = node.x || 0;
    let absY = node.y || 0;
    let currentParentId = node.parentId;

    // Walk up to root
    while (currentParentId && currentParentId !== 'root') {
        const parent = nodeContext.getNode(currentParentId);
        if (!parent || !parent.id) break;
        absX += parent.x || 0;
        absY += parent.y || 0;
        currentParentId = parent.parentId;

        // Circular dependency safety
        if (currentParentId === nodeId) break;
    }

    return {
        x: absX,
        y: absY,
        width: node.width || 0,
        height: node.height || 0,
        id: node.id
    };
};

/**
 * Builds a list of layers at a specific position or based on a node's hierarchy.
 */
export const buildHierarchyItems = (
    nodeId: string,
    nodeContext: CreateNodeContext,
    componentContext: CreateComponentContext,
    coords?: { x: number; y: number }
): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [];
    // nodeMap stores nodes by ID. We use as INode because CreateNodeContext methods return INode or readonly INode
    const nodeMap = new Map<string, INode>();

    if (coords) {
        // Spatial Hit Test using absolute coordinates
        const allNodes = (nodeContext.getNodes().value || []) as INode[];
        allNodes.forEach((node) => {
            if (node.id === 'root') return;

            const absRect = getAbsoluteRect(node.id, nodeContext);

            const isInside =
                coords.x >= absRect.x &&
                coords.x <= absRect.x + absRect.width &&
                coords.y >= absRect.y &&
                coords.y <= absRect.y + absRect.height;

            if (isInside) {
                nodeMap.set(node.id, node);
            }
        });

        // Strategy: Always include the clicked node and its direct parents regardless of hit test margin errors
        let current: INode | undefined = nodeContext.getNode(nodeId) as INode | undefined;
        while (current && current.id) {
            nodeMap.set(current.id, current);
            if (current.id === 'root') break;
            current = current.parentId ? nodeContext.getNode(current.parentId) as INode | undefined : nodeContext.getNode('root') as INode | undefined;
        }
    } else {
        // Fallback: Tree Climb only
        let current: INode | undefined = nodeContext.getNode(nodeId) as INode | undefined;
        while (current && current.id) {
            nodeMap.set(current.id, current);
            if (current.id === 'root') break;
            current = current.parentId ? nodeContext.getNode(current.parentId) as INode | undefined : nodeContext.getNode('root') as INode | undefined;
        }
    }

    // Convert map to array and sort
    const overlappingNodes = Array.from(nodeMap.values());

    // Sort: Innermost children first, then parent depth, then smaller area
    overlappingNodes.sort((a, b) => {
        if (a.id === 'root') return 1;
        if (b.id === 'root') return -1;

        // Check if one is a descendant of the other
        let parent: string | undefined = a.parentId;
        while (parent && parent !== 'root') {
            if (parent === b.id) return -1; // a is child of b
            const pNode = nodeContext.getNode(parent);
            parent = pNode?.parentId;
        }

        parent = b.parentId;
        while (parent && parent !== 'root') {
            if (parent === a.id) return 1; // b is child of a
            const pNode = nodeContext.getNode(parent);
            parent = pNode?.parentId;
        }

        // Tie-break: Smaller area first
        return (a.width * a.height) - (b.width * b.height);
    });

    // Map to ContextMenuItem
    overlappingNodes.forEach((node) => {
        items.push({
            id: `select-${node.id}`,
            label: node.name || node.id,
            icon: componentContext.getComponentIcon ? componentContext.getComponentIcon(node.schema) : undefined,
            checked: !!node.select,
            action: () => nodeContext.onSelectNode(node.id)
        });
    });

    return items;
};
