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

    public moveLayer(direction: 'up' | 'down' | 'top' | 'bottom', id: string): void {
        const node = this.context.getNodeMap().get(id);
        if (!node || id === 'root') return;

        const siblings = this.getSiblings(node.parentId);
        const currentIdx = siblings.findIndex(s => s.id === id);
        if (currentIdx === -1) return;

        const currentZ = node.z;

        switch (direction) {
            case 'up':
                if (currentIdx < siblings.length - 1) {
                    const upper = siblings[currentIdx + 1];
                    node.z = upper.z;
                    upper.z = currentZ;
                }
                break;
            case 'down':
                if (currentIdx > 0) {
                    const lower = siblings[currentIdx - 1];
                    node.z = lower.z;
                    lower.z = currentZ;
                }
                break;
            case 'top':
                if (currentIdx < siblings.length - 1) {
                    node.z = siblings[siblings.length - 1].z + 1;
                }
                break;
            case 'bottom':
                if (currentIdx > 0) {
                    node.z = siblings[0].z - 1;
                }
                break;
        }

        this.reorderArrayByZ();
        this.context.refreshNodeTreeInternal();
    }

    public sortNode(sourceId: string, targetId: string, position: 'before' | 'after' | 'inside'): void {
        if (sourceId === 'root' || sourceId === targetId) return;
        if (this.isDescendant(sourceId, targetId)) return;

        const nodeMap = this.context.getNodeMap();
        const sourceNode = nodeMap.get(sourceId);
        const targetNode = nodeMap.get(targetId);
        if (!sourceNode || !targetNode) return;

        const oldParentId = sourceNode.parentId;
        let newParentId: string | undefined;

        if (position === 'inside' && targetNode.schema === 'GROUP') {
            newParentId = targetId;
            sourceNode.parentId = targetId;
            sourceNode.z = this.getMaxZ(targetId) + 1;
        } else {
            newParentId = targetNode.parentId;
            sourceNode.parentId = newParentId;

            this.invalidateCache();
            const siblings = this.getSiblings(newParentId, sourceId);
            const targetIdx = siblings.findIndex(s => s.id === targetId);
            const targetZ = targetNode.z;

            if (position === 'before') {
                sourceNode.z = targetIdx < siblings.length - 1
                    ? (targetZ + siblings[targetIdx + 1].z) / 2
                    : targetZ + 1;
            } else {
                sourceNode.z = targetIdx > 0
                    ? (targetZ + siblings[targetIdx - 1].z) / 2
                    : targetZ - 1;
            }
        }

        this.invalidateCache();
        this.reorderArrayByZ();

        if (oldParentId && oldParentId !== 'root' && oldParentId !== newParentId) {
            this.context.group.refreshGroupBounds(oldParentId);
        }
        if (newParentId && newParentId !== 'root') {
            this.context.group.refreshGroupBounds(newParentId);
        }

        if (newParentId && newParentId !== oldParentId) {
            const newParent = nodeMap.get(newParentId);
            if (newParent?.lock) this.setRecursiveProperty(sourceId, 'lock', true);
            if (newParent?.hide) this.setRecursiveProperty(sourceId, 'hide', true);
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
