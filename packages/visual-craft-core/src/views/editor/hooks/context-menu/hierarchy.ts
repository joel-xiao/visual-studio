import type { ContextMenuItem } from './types';
import type { CreateNodeContext } from '../node-context';
import type { CreateComponentContext } from '../component-context';

export const buildHierarchyItems = (
    nodeId: string,
    nodeContext: CreateNodeContext,
    componentContext: CreateComponentContext,
    coords?: { x: number; y: number }
): ContextMenuItem[] => {
    const nodeMap = new Map<string, INode>();

    let current: INode | undefined = nodeContext.getNode(nodeId) as INode | undefined;
    while (current && current.id) {
        nodeMap.set(current.id, current);
        if (current.id === 'root') break;
        current = current.parentId ? nodeContext.getNode(current.parentId) as INode | undefined : undefined;
    }

    if (coords) {
        const overlapping = nodeContext.searchNodesInArea({
            x: coords.x,
            y: coords.y,
            width: 0.1,
            height: 0.1
        });

        overlapping.forEach(node => {
            let p: INode | undefined = node;
            while (p && p.id) {
                nodeMap.set(p.id, p);
                if (p.id === 'root') break;
                p = p.parentId ? nodeContext.getNode(p.parentId) as INode | undefined : undefined;
            }
        });
    }

    const nodesArray = Array.from(nodeMap.values()).filter(n => !n.lock && !n.hide && n.id !== 'root');

    const getDepth = (id: string): number => {
        let depth = 0;
        let p = nodeContext.getNode(id)?.parentId;
        while (p && p !== 'root') {
            depth++;
            const pNode = nodeContext.getNode(p);
            p = pNode?.parentId;
        }
        return depth;
    };

    nodesArray.sort((a, b) => {
        let cur: string | undefined = a.parentId;
        while (cur && cur !== 'root') {
            if (cur === b.id) return 1;
            const pNode = nodeContext.getNode(cur);
            cur = pNode?.parentId;
        }

        cur = b.parentId;
        while (cur && cur !== 'root') {
            if (cur === a.id) return -1;
            const pNode = nodeContext.getNode(cur);
            cur = pNode?.parentId;
        }

        if (a.z !== b.z) return b.z - a.z;
        return (a.width * a.height) - (b.width * b.height);
    });

    return nodesArray.map((node) => ({
        id: `select-${node.id}`,
        label: node.name || node.id,
        icon: componentContext.getComponentIcon ? componentContext.getComponentIcon(node.schema) : undefined,
        checked: !!node.select,
        level: getDepth(node.id),
        action: () => nodeContext.onSelectNode(node.id)
    }));
};
