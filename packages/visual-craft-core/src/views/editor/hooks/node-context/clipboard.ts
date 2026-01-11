import { getUuid } from '../../../../assets/utils/index';
import type { CreateNodeContext } from './index';

export class ClipboardExtension {
    private clipboardData: INode[] = [];

    constructor(private context: CreateNodeContext) { }

    private pasteCount = 0;
    private lastCopyId = '';

    public copy(ids: string[]): void {
        const nodeMap = this.context.getNodeMap();
        const rootTargetIds = ids.filter(id => id !== 'root' && nodeMap.has(id));

        if (rootTargetIds.length === 0) return;

        // Reset paste count when new items are copied
        const currentCopyId = rootTargetIds.sort().join(',');
        if (this.lastCopyId !== currentCopyId) {
            this.pasteCount = 0;
            this.lastCopyId = currentCopyId;
        }

        const allIdsToCopy = new Set<string>();
        for (const id of rootTargetIds) {
            this.collectNodeAndDescendants(id, allIdsToCopy);
        }

        const result: INode[] = [];
        for (const id of allIdsToCopy) {
            const node = nodeMap.get(id);
            if (node) {
                result.push(JSON.parse(JSON.stringify(node)));
            }
        }

        this.clipboardData = result;
    }

    public duplicate(ids: string[]): void {
        const originalClipboard = [...this.clipboardData];
        this.copy(ids);
        this.paste('root', { offset: { x: 10, y: 10 } });
        this.clipboardData = originalClipboard;
    }

    public cut(ids: string[]): void {
        this.copy(ids);
        const nodeMap = this.context.getNodeMap();
        ids.forEach(id => {
            if (id !== 'root' && nodeMap.has(id)) {
                this.context.removeNode(id);
            }
        });
    }

    public paste(targetParentId: string = 'root', options?: { offset?: { x: number, y: number }, position?: { x: number, y: number } }): void {
        if (this.clipboardData.length === 0) return;

        const data = this.context.getData();
        const nodeMap = this.context.getNodeMap();
        if (!data) return;

        const idMap = new Map<string, string>();
        for (const node of this.clipboardData) {
            idMap.set(node.id, getUuid());
        }

        const clipboardIds = new Set(this.clipboardData.map(n => n.id));
        const newNodes: INode[] = [];
        const newRootIds: string[] = [];

        // Calculate Z offset
        const targetSiblings = data.nodes.filter(n => n.parentId === targetParentId);
        let maxZ = 0;
        targetSiblings.forEach(n => { if (n.z > maxZ) maxZ = n.z; });

        // Calculate bounds of clipboard items to support absolute positioning
        let minX = Infinity, minY = Infinity;
        const clipboardRoots = this.clipboardData.filter(n => !clipboardIds.has(n.parentId));
        clipboardRoots.forEach(n => {
            if (n.x < minX) minX = n.x;
            if (n.y < minY) minY = n.y;
        });

        let finalDx = 0;
        let finalDy = 0;

        if (options?.position) {
            finalDx = options.position.x - minX;
            finalDy = options.position.y - minY;
            this.pasteCount = 0; // Reset offset-based paste count
        } else {
            const offset = options?.offset || { x: 20, y: 20 };
            this.pasteCount++;
            finalDx = offset.x * this.pasteCount;
            finalDy = offset.y * this.pasteCount;
        }

        for (const rawNode of this.clipboardData) {
            const node = JSON.parse(JSON.stringify(rawNode)) as INode;
            const oldId = node.id;
            const newId = idMap.get(oldId);
            
            if (!newId) continue;

            node.id = newId;
            node.select = false;
            node.z = maxZ + 1 + node.z;

            if (clipboardIds.has(rawNode.parentId)) {
                const newParentId = idMap.get(rawNode.parentId);
                if (newParentId) {
                    node.parentId = newParentId;
                }
            } else {
                node.parentId = targetParentId;
                node.x += finalDx;
                node.y += finalDy;
                newRootIds.push(newId);
            }

            newNodes.push(node);
        }

        for (const node of newNodes) {
            data.nodes.push(node);
            nodeMap.set(node.id, node);
            this.context.addTreeNodeInternal(node);
        }

        if (newRootIds.length > 0) {
            this.context.onSelectNodes(newRootIds);
        }

        this.context.refreshNodeTreeInternal();
        this.context.syncSpatialIndex();
    }

    public hasClipboardData(): boolean {
        return this.clipboardData.length > 0;
    }

    private collectNodeAndDescendants(id: string, result: Set<string>): void {
        if (result.has(id)) return;
        result.add(id);

        const data = this.context.getData();
        if (!data) return;

        for (const n of data.nodes) {
            if (n.parentId === id) {
                this.collectNodeAndDescendants(n.id, result);
            }
        }
    }
}
