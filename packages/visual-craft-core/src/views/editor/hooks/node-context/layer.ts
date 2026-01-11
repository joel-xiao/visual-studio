import type { CreateNodeContext } from './index';

export class LayerExtension {
    private cachedChildrenMap: Map<string | undefined, string[]> | null = null;

    constructor(private context: CreateNodeContext) { }

    private invalidateCache(): void {
        this.cachedChildrenMap = null;
    }

    private getChildrenMap(): Map<string | undefined, string[]> {
        if (this.cachedChildrenMap) return this.cachedChildrenMap;

        const nodes = this.context.getData()?.nodes || [];
        const map = new Map<string | undefined, string[]>();

        for (const n of nodes) {
            if (n.id === 'root') continue;
            const list = map.get(n.parentId);
            if (list) {
                list.push(n.id);
            } else {
                map.set(n.parentId, [n.id]);
            }
        }

        this.cachedChildrenMap = map;
        return map;
    }

    private getSiblings(parentId: string | undefined, excludeId?: string): INode[] {
        const nodeMap = this.context.getNodeMap();
        const childIds = this.getChildrenMap().get(parentId) || [];
        const result: INode[] = [];

        for (const id of childIds) {
            if (id !== excludeId) {
                const node = nodeMap.get(id);
                if (node) result.push(node);
            }
        }

        return result.sort((a, b) => a.z - b.z);
    }

    private getMaxZ(parentId: string | undefined): number {
        const siblings = this.getSiblings(parentId);
        return siblings.length > 0 ? siblings[siblings.length - 1].z : 0;
    }

    private getMinZ(parentId: string | undefined): number {
        const siblings = this.getSiblings(parentId);
        return siblings.length > 0 ? siblings[0].z : 0;
    }

    public moveLayer(direction: 'up' | 'down' | 'top' | 'bottom', ids: string[] | string): void {
        const idList = Array.isArray(ids) ? ids : [ids];
        const nodeMap = this.context.getNodeMap();
        const allNodes = idList.map(id => nodeMap.get(id)).filter((n): n is INode => !!n && n.id !== 'root');

        if (allNodes.length === 0) return;

        const groups = new Map<string, INode[]>();
        for (const node of allNodes) {
            const list = groups.get(node.parentId) || [];
            list.push(node);
            groups.set(node.parentId, list);
        }

        for (const [parentId, nodesInGroup] of groups.entries()) {
            const siblings = this.getSiblings(parentId);
            const selectedIds = new Set(nodesInGroup.map(n => n.id));
            let newOrder = [...siblings];

            switch (direction) {
                case 'up':
                    for (let i = newOrder.length - 2; i >= 0; i--) {
                        if (selectedIds.has(newOrder[i].id) && !selectedIds.has(newOrder[i + 1].id)) {
                            [newOrder[i], newOrder[i + 1]] = [newOrder[i + 1], newOrder[i]];
                        }
                    }
                    break;
                case 'down':
                    for (let i = 1; i < newOrder.length; i++) {
                        if (selectedIds.has(newOrder[i].id) && !selectedIds.has(newOrder[i - 1].id)) {
                            [newOrder[i], newOrder[i - 1]] = [newOrder[i - 1], newOrder[i]];
                        }
                    }
                    break;
                case 'top': {
                    const others = newOrder.filter(s => !selectedIds.has(s.id));
                    const selected = newOrder.filter(s => selectedIds.has(s.id));
                    newOrder = [...others, ...selected];
                    break;
                }
                case 'bottom': {
                    const others = newOrder.filter(s => !selectedIds.has(s.id));
                    const selected = newOrder.filter(s => selectedIds.has(s.id));
                    newOrder = [...selected, ...others];
                    break;
                }
            }

            newOrder.forEach((node, index) => {
                node.z = index;
            });
        }

        this.reorderArrayByZ();
        this.context.refreshNodeTreeInternal();
    }

    public sortNode(sourceIds: string[] | string, targetId: string, position: 'before' | 'after' | 'inside'): void {
        const idList = Array.isArray(sourceIds) ? sourceIds : [sourceIds];
        if (idList.length === 0 || idList.includes(targetId) || idList.includes('root')) return;

        const nodeMap = this.context.getNodeMap();
        const targetNode = nodeMap.get(targetId);
        if (!targetNode) return;

        const sourceNodes = idList
            .map(id => nodeMap.get(id))
            .filter((n): n is INode => !!n && !this.isDescendant(n.id, targetId))
            .sort((a, b) => a.z - b.z);

        if (sourceNodes.length === 0) return;

        const oldParents = new Set<string>();
        sourceNodes.forEach(n => {
            if (n.parentId && n.parentId !== 'root') oldParents.add(n.parentId);
        });

        let newParentId: string | undefined;

        if (position === 'inside' && targetNode.schema === 'GROUP') {
            newParentId = targetId;
            let currentMaxZ = this.getMaxZ(targetId);
            sourceNodes.forEach(node => {
                node.parentId = targetId;
                node.z = ++currentMaxZ;
            });
        } else {
            newParentId = targetNode.parentId;
            this.invalidateCache();

            const siblings = this.getSiblings(newParentId);
            const filteredSiblings = siblings.filter(s => !idList.includes(s.id));
            const targetIdx = filteredSiblings.findIndex(s => s.id === targetId);

            if (targetIdx === -1) {
                sourceNodes.forEach((node, i) => {
                    node.parentId = newParentId || 'root';
                    node.z = targetNode.z + i + 1;
                });
            } else {
                const targetZ = targetNode.z;
                if (position === 'before') {
                    const prevZ = targetIdx < filteredSiblings.length - 1 ? filteredSiblings[targetIdx + 1].z : targetZ + 1;
                    const step = (prevZ - targetZ) / (sourceNodes.length + 1);
                    sourceNodes.forEach((node, i) => {
                        node.parentId = newParentId || 'root';
                        node.z = targetZ + step * (i + 1);
                    });
                } else {
                    const prevZ = targetIdx > 0 ? filteredSiblings[targetIdx - 1].z : targetZ - 1;
                    const step = (targetZ - prevZ) / (sourceNodes.length + 1);
                    sourceNodes.forEach((node, i) => {
                        node.parentId = newParentId || 'root';
                        node.z = prevZ + step * (i + 1);
                    });
                }
            }
        }

        this.invalidateCache();
        this.reorderArrayByZ();

        oldParents.forEach(pid => {
            if (pid !== newParentId) this.context.group.refreshGroupBounds(pid);
        });

        if (newParentId && newParentId !== 'root') {
            this.context.group.refreshGroupBounds(newParentId);
        }

        if (newParentId && newParentId !== 'root') {
            const newParent = nodeMap.get(newParentId);
            sourceNodes.forEach(node => {
                if (newParent?.lock) this.setRecursiveProperty(node.id, 'lock', true);
                if (newParent?.hide) this.setRecursiveProperty(node.id, 'hide', true);
            });
        }

        this.context.refreshNodeTreeInternal();
    }

    private reorderArrayByZ(): void {
        const data = this.context.getData();
        if (!data) return;

        data.nodes.sort((a, b) => {
            if (a.id === 'root') return -1;
            if (b.id === 'root') return 1;
            return a.z - b.z;
        });
    }

    public setRecursiveProperty(id: string, property: 'hide' | 'lock', value: boolean): void {
        const node = this.context.getNodeMap().get(id);
        if (!node) return;

        this.context.updateNode(id, { [property]: value });

        if (value) {
            this.updateChildrenRecursive(id, property, true);
        } else {
            this.updateAncestorsRecursive(id, property, false);
            this.updateChildrenRecursive(id, property, false);
        }
    }

    private updateChildrenRecursive(parentId: string, property: 'hide' | 'lock', value: boolean): void {
        const childIds = this.getChildrenMap().get(parentId) || [];
        const nodeMap = this.context.getNodeMap();

        for (const childId of childIds) {
            const child = nodeMap.get(childId);
            if (child) {
                this.context.updateNode(childId, { [property]: value });
                this.updateChildrenRecursive(childId, property, value);
            }
        }
    }

    private updateAncestorsRecursive(childId: string, property: 'hide' | 'lock', value: boolean): void {
        const child = this.context.getNodeMap().get(childId);
        if (!child?.parentId || child.parentId === 'root') return;

        const parent = this.context.getNodeMap().get(child.parentId);
        if (parent) {
            this.context.updateNode(parent.id, { [property]: value });
            this.updateAncestorsRecursive(parent.id, property, value);
        }
    }

    private isDescendant(parentId: string, childId: string): boolean {
        let current = this.context.getNodeMap().get(childId);
        while (current && current.id !== 'root') {
            if (current.parentId === parentId) return true;
            current = current.parentId ? this.context.getNodeMap().get(current.parentId) : undefined;
        }
        return false;
    }
}
