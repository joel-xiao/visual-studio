import { getUuid } from '../../../../assets/utils/index';
import type { CreateNodeContext } from './index';

export class GroupExtension {
  constructor(private context: CreateNodeContext) { }

  public groupSelectedNodes(): INode | undefined {
    const data = this.context.getData();
    const nodeMap = this.context.getNodeMap();
    if (!data) return;

    const selected = data.nodes.filter(n => n.select && n.id !== 'root');
    if (selected.length < 2) return;

    const parents = new Set(selected.map(n => n.parentId || 'root'));
    const parentId = parents.size === 1 ? Array.from(parents)[0] : 'root';

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = 0;
    for (const n of selected) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + n.width > maxX) maxX = n.x + n.width;
      if (n.y + n.height > maxY) maxY = n.y + n.height;
      if (n.z > maxZ) maxZ = n.z;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    const group: INode = {
      parentId,
      id: getUuid(),
      name: 'Group',
      schema: 'GROUP',
      component: 'GROUP',
      props: { layout: {} },
      width,
      height,
      radius: [0, 0, 0, 0],
      type: 'group',
      x: minX,
      y: minY,
      z: maxZ + 1,
      select: false,
      lock: false
    };

    data.nodes.push(group);
    nodeMap.set(group.id, group);
    this.context.addTreeNodeInternal(group);

    const invWidth = 1 / Math.max(width, 1);
    const invHeight = 1 / Math.max(height, 1);

    for (const child of selected) {
      const oldParentId = child.parentId;
      child.parentId = group.id;

      const rel = {
        xRatio: (child.x - minX) * invWidth,
        yRatio: (child.y - minY) * invHeight,
        wRatio: child.width * invWidth,
        hRatio: child.height * invHeight
      };

      const layout = (child.props.layout || {}) as Record<string, ComponentPropValue>;
      layout['groupRel'] = rel as unknown as ComponentPropValue;
      child.props.layout = layout as ComponentProp;

      if (oldParentId && oldParentId !== parentId && oldParentId !== 'root') {
        this.refreshGroupBounds(oldParentId);
      }
    }

    if (parentId !== 'root') {
      this.refreshGroupBounds(parentId);
    }

    this.context.onSelectNode(group.id);
    this.context.refreshNodeTreeInternal();
    this.context.syncSpatialIndex();
    return group;
  }

  public unGroup(groupId: string): void {
    const data = this.context.getData();
    const nodeMap = this.context.getNodeMap();
    if (!data) return;

    const group = nodeMap.get(groupId);
    if (!group || group.schema !== 'GROUP') return;

    const targetParentId = group.parentId || 'root';
    const children: INode[] = [];

    for (const n of data.nodes) {
      if (n.parentId === group.id && n.id !== 'root') {
        children.push(n);
      }
    }

    const firstChildId = children[0]?.id;

    for (const child of children) {
      const rel = (child.props?.layout?.groupRel || {}) as Record<string, number>;
      const xRatio = rel['xRatio'] || 0;
      const yRatio = rel['yRatio'] || 0;
      const wRatio = rel['wRatio'] || 0;
      const hRatio = rel['hRatio'] || 0;

      child.parentId = targetParentId;
      this.context.updateNode(child.id, {
        x: group.x + xRatio * group.width,
        y: group.y + yRatio * group.height,
        width: wRatio * group.width,
        height: hRatio * group.height
      }, true, true);

      if (child.props?.layout) {
        delete (child.props.layout as Record<string, unknown>)['groupRel'];
      }
      child.lock = false;
    }

    this.context.removeNode(group.id);
    this.context.refreshNodeTreeInternal();
    this.context.syncSpatialIndex();

    if (firstChildId) {
      this.context.onSelectNode(firstChildId);
    }
  }

  public handleNodeDrag(node: INode, dx: number, dy: number, allNodes: INode[], selectedNodes: INode[]) {
    const moveIdsSet = new Set<string>();
    const nodesToProcess = selectedNodes.length > 0 ? selectedNodes : [node];

    for (const n of nodesToProcess) {
      if (n.lock) continue;
      moveIdsSet.add(n.id);
      this.collectDescendantIds(allNodes, n.id, moveIdsSet);
    }

    this.context.moveNodes(Array.from(moveIdsSet), dx, dy);

    const affectedParents = new Set<string>();
    for (const id of moveIdsSet) {
      const n = this.context.getNodeMap().get(id);
      if (n?.parentId && n.parentId !== 'root' && !moveIdsSet.has(n.parentId)) {
        affectedParents.add(n.parentId);
      }
    }

    for (const pid of affectedParents) {
      this.refreshGroupBounds(pid, true);
    }
    this.context.syncSpatialIndex();
  }

  public handleNodeResize(node: INode, newBox: IDragDataset, allNodes: INode[], isRecursive = false) {
    const newW = newBox.x2 - newBox.x;
    const newH = newBox.y2 - newBox.y;
    const oldX = node.x;
    const oldY = node.y;
    const oldWidth = node.width;
    const oldHeight = node.height;

    if (node.lock && !isRecursive) return;

    this.context.updateNode(node.id, { x: newBox.x, y: newBox.y, width: newW, height: newH }, true, true);

    if (node.schema === 'GROUP') {
      const invOldW = 1 / Math.max(oldWidth, 1);
      const invOldH = 1 / Math.max(oldHeight, 1);

      for (const child of allNodes) {
        if (child.parentId !== node.id) continue;

        const rel = (child.props?.layout?.groupRel || {}) as Record<string, number>;
        let { xRatio, yRatio, wRatio, hRatio } = rel;

        if ([xRatio, yRatio, wRatio, hRatio].some(v => typeof v !== 'number' || isNaN(v))) {
          xRatio = (child.x - oldX) * invOldW;
          yRatio = (child.y - oldY) * invOldH;
          wRatio = child.width * invOldW;
          hRatio = child.height * invOldH;
        }

        const nextX = newBox.x + xRatio * newW;
        const nextY = newBox.y + yRatio * newH;
        const nextW = wRatio * newW;
        const nextH = hRatio * newH;

        this.handleNodeResize(child, { x: nextX, y: nextY, x2: nextX + nextW, y2: nextY + nextH } as IDragDataset, allNodes, true);
      }
    }

    if (!isRecursive) {
      if (node.parentId && node.parentId !== 'root') {
        this.refreshGroupBounds(node.parentId);
      }
      this.context.syncSpatialIndex();
    }
  }

  private collectDescendantIds(allNodes: INode[], parentId: string, result: Set<string>): void {
    for (const n of allNodes) {
      if (n.parentId === parentId && !result.has(n.id)) {
        result.add(n.id);
        this.collectDescendantIds(allNodes, n.id, result);
      }
    }
  }

  public refreshGroupBounds(groupId: string, skipSpatialSync = false) {
    if (!groupId || groupId === 'root') return;

    const nodeMap = this.context.getNodeMap();
    const group = nodeMap.get(groupId);
    if (!group) return;

    const allNodes = this.context.getData()?.nodes || [];
    const children: INode[] = [];

    for (const n of allNodes) {
      if (n.parentId === groupId) children.push(n);
    }

    if (children.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of children) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + n.width > maxX) maxX = n.x + n.width;
      if (n.y + n.height > maxY) maxY = n.y + n.height;
    }

    const newW = maxX - minX;
    const newH = maxY - minY;
    const threshold = 0.01;

    if (Math.abs(group.x - minX) > threshold ||
      Math.abs(group.y - minY) > threshold ||
      Math.abs(group.width - newW) > threshold ||
      Math.abs(group.height - newH) > threshold) {

      this.context.updateNode(groupId, { x: minX, y: minY, width: newW, height: newH }, true, skipSpatialSync);

      const invW = 1 / Math.max(newW, 1);
      const invH = 1 / Math.max(newH, 1);

      for (const child of children) {
        const rel = {
          xRatio: (child.x - minX) * invW,
          yRatio: (child.y - minY) * invH,
          wRatio: child.width * invW,
          hRatio: child.height * invH
        };
        if (child.props?.layout) {
          (child.props.layout as Record<string, unknown>)['groupRel'] = rel;
        }
      }

      if (group.parentId && group.parentId !== 'root') {
        this.refreshGroupBounds(group.parentId, skipSpatialSync);
      }
    }
  }
}
