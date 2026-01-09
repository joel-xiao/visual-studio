import { getUuid } from '../../../../assets/utils/index';

export function groupSelectedNodesImpl(
  data: IEditorData | undefined,
  nodeMap: Map<string, INode>,
  addTreeNode: (node: INode) => void,
  refreshNodeTree: () => void,
  onSelectNode: (id: string) => void,
  updateNode?: (id: string, delta: INodeDelta) => void
): INode | undefined {
  if (!data) return;
  const selected = data.nodes.filter(n => n.select && n.id !== 'root');
  if (selected.length < 2) return;

  const parents = new Set(selected.map(n => n.parentId || 'root'));
  const parentId = parents.size === 1 ? Array.from(parents)[0] : 'root';

  const minX = Math.min(...selected.map(n => n.x));
  const minY = Math.min(...selected.map(n => n.y));
  const maxX = Math.max(...selected.map(n => n.x + n.width));
  const maxY = Math.max(...selected.map(n => n.y + n.height));

  const group: INode = {
    parentId: parentId,
    id: getUuid(),
    name: 'Group',
    schema: 'GROUP',
    component: 'GROUP',
    props: { layout: {} },
    width: maxX - minX,
    height: maxY - minY,
    radius: [0, 0, 0, 0],
    type: 'group',
    x: minX,
    y: minY,
    z: 0,
    select: false,
    lock: false
  };

  data.nodes.push(group);
  nodeMap.set(group.id, group);
  addTreeNode(group);

  selected.forEach(child => {
    const oldParentId = child.parentId;
    child.parentId = group.id;

    const rel = {
      xRatio: (child.x - group.x) / Math.max(group.width, 1),
      yRatio: (child.y - group.y) / Math.max(group.height, 1),
      wRatio: child.width / Math.max(group.width, 1),
      hRatio: child.height / Math.max(group.height, 1)
    };

    const layout = (child.props.layout || {}) as Record<string, ComponentPropValue>;
    layout['groupRel'] = rel as unknown as ComponentPropValue;
    child.props.layout = layout as ComponentProp;

    if (oldParentId && oldParentId !== parentId && oldParentId !== 'root' && updateNode) {
      _refreshAncestorBounds(oldParentId, data.nodes, updateNode);
    }
  });

  if (parentId !== 'root' && updateNode) {
    _refreshAncestorBounds(parentId, data.nodes, updateNode);
  }

  onSelectNode(group.id);
  refreshNodeTree();
  return group;
}

export function unGroupImpl(
  data: IEditorData | undefined,
  nodeMap: Map<string, INode>,
  updateNode: (id: string, delta: INodeDelta) => void,
  removeNode: (id: string) => void,
  refreshNodeTree: () => void,
  onSelectNode: (id: string) => void,
  groupId: string
): void {
  if (!data) return;
  const group = nodeMap.get(groupId);
  if (!group || group.schema !== 'GROUP') return;

  const targetParentId = group.parentId || 'root';
  const children = data.nodes.filter(n => n.parentId === group.id && n.id !== 'root');
  const firstChildId = children[0]?.id;

  children.forEach(child => {
    const rel = (child.props?.layout?.groupRel || {}) as Record<string, number>;
    const xRatio = Number(rel['xRatio'] || 0);
    const yRatio = Number(rel['yRatio'] || 0);
    const wRatio = Number(rel['wRatio'] || 0);
    const hRatio = Number(rel['hRatio'] || 0);

    const nextX = group.x + xRatio * group.width;
    const nextY = group.y + yRatio * group.height;
    const nextW = wRatio * group.width;
    const nextH = hRatio * group.height;

    child.parentId = targetParentId;
    updateNode(child.id, { x: nextX, y: nextY, width: nextW, height: nextH });
    if (child.props?.layout) {
      delete (child.props.layout as Record<string, unknown>)['groupRel'];
    }
    child.lock = false;
  });

  removeNode(group.id);
  refreshNodeTree();
  if (firstChildId) {
    onSelectNode(firstChildId);
  }
}

function getAllDescendantIds(allNodes: INode[], parentId: string): string[] {
  const children = allNodes.filter(n => n.parentId === parentId);
  let ids = children.map(c => c.id);
  for (const c of children) {
    ids = ids.concat(getAllDescendantIds(allNodes, c.id));
  }
  return ids;
}

function _refreshAncestorBounds(
  groupId: string,
  allNodes: INode[],
  updateNode: (id: string, delta: INodeDelta) => void
) {
  if (!groupId || groupId === 'root') return;

  const children = allNodes.filter(n => n.parentId === groupId);
  if (children.length === 0) return;

  const minX = Math.min(...children.map(n => n.x));
  const minY = Math.min(...children.map(n => n.y));
  const maxX = Math.max(...children.map(n => n.x + n.width));
  const maxY = Math.max(...children.map(n => n.y + n.height));

  const newW = maxX - minX;
  const newH = maxY - minY;

  const group = allNodes.find(n => n.id === groupId);
  if (!group) return;

  const threshold = 0.01;
  const changed =
    Math.abs(group.x - minX) > threshold ||
    Math.abs(group.y - minY) > threshold ||
    Math.abs(group.width - newW) > threshold ||
    Math.abs(group.height - newH) > threshold;

  if (changed) {
    updateNode(groupId, {
      x: minX,
      y: minY,
      width: newW,
      height: newH
    });

    for (const child of children) {
      const rel = {
        xRatio: (child.x - minX) / Math.max(newW, 1),
        yRatio: (child.y - minY) / Math.max(newH, 1),
        wRatio: child.width / Math.max(newW, 1),
        hRatio: child.height / Math.max(newH, 1)
      };
      if (child.props?.layout) {
        (child.props.layout as Record<string, any>)['groupRel'] = rel;
      }
    }

    if (group.parentId && group.parentId !== 'root') {
      _refreshAncestorBounds(group.parentId, allNodes, updateNode);
    }
  }
}

export function handleNodeDrag(
  node: INode,
  dx: number,
  dy: number,
  allNodes: INode[],
  selectedNodes: INode[],
  updateNode: (id: string, delta: INodeDelta) => void,
  moveNodes: (ids: string[], dx: number, dy: number) => void
) {
  const moveIdsSet = new Set<string>();
  const nodesToProcess = selectedNodes.length > 0 ? selectedNodes : [node];

  for (const n of nodesToProcess) {
    moveIdsSet.add(n.id);
    const descendants = getAllDescendantIds(allNodes, n.id);
    for (const dId of descendants) moveIdsSet.add(dId);
  }

  const moveIdsArr = Array.from(moveIdsSet);
  moveNodes(moveIdsArr, dx, dy);

  const affectedParents = new Set<string>();
  for (const id of moveIdsArr) {
    const n = allNodes.find(item => item.id === id);
    if (n?.parentId && n.parentId !== 'root' && !moveIdsSet.has(n.parentId)) {
      affectedParents.add(n.parentId);
    }
  }

  affectedParents.forEach(pid => _refreshAncestorBounds(pid, allNodes, updateNode));
}

export function handleNodeResize(
  node: INode,
  newBox: IDragDataset,
  allNodes: INode[],
  updateNode: (id: string, delta: INodeDelta) => void
) {
  const newW = newBox.x2 - newBox.x;
  const newH = newBox.y2 - newBox.y;

  updateNode(node.id, {
    x: newBox.x,
    y: newBox.y,
    width: newW,
    height: newH
  });

  if (node.schema === 'GROUP') {
    const children = allNodes.filter(n => n.parentId === node.id);
    for (const child of children) {
      const rel = (child.props?.layout?.groupRel || {}) as Record<string, number>;
      let { xRatio, yRatio, wRatio, hRatio } = rel;

      if ([xRatio, yRatio, wRatio, hRatio].some(v => typeof v !== 'number' || isNaN(v))) {
        xRatio = (child.x - node.x) / Math.max(node.width, 1);
        yRatio = (child.y - node.y) / Math.max(node.height, 1);
        wRatio = child.width / Math.max(node.width, 1);
        hRatio = child.height / Math.max(node.height, 1);
      }

      const nextX = newBox.x + xRatio * newW;
      const nextY = newBox.y + yRatio * newH;
      const nextW = wRatio * newW;
      const nextH = hRatio * newH;

      handleNodeResize(child, { x: nextX, y: nextY, x2: nextX + nextW, y2: nextY + nextH } as IDragDataset, allNodes, updateNode);
    }
  }

  if (node.parentId && node.parentId !== 'root') {
    _refreshAncestorBounds(node.parentId, allNodes, updateNode);
  }
}
