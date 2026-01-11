import { watch, computed, readonly, reactive, ref, shallowReadonly, ComputedRef, type App, type Ref } from 'vue';
import RBush from 'rbush';
import { getUuid } from '../../../../assets/utils/index';
import { GroupExtension } from './group';
import { LayerExtension } from './layer';
import { ClipboardExtension } from './clipboard';

interface SpatialItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  id: string;
}

export class CreateNodeContext {
  #data?: IEditorData;
  #nodes: ComputedRef<INode[]> = computed(() => []);
  #selectedNodes: ComputedRef<INode[]> = computed(() => []);
  #currentNode: Ref<INode> = ref({} as INode);
  #nodesTreeSource: TreeNode[] = reactive([]);
  #nodesTree: Ref<TreeNode[]> = ref<TreeNode[]>([]);
  #nodeInstances?: Record<string, INodeInstance> = {};
  #nodeComponentInstances?: Record<string, App | undefined> = {};
  #nodeMap = reactive(new Map<string, INode>());
  #treeNodeMap = reactive(new Map<string, TreeNode>());
  #spatialIndex = new RBush<SpatialItem>();
  #rootNode: ComputedRef<INode> = computed(() => {
    const node = this.#nodeMap.get('root');
    return node ? node : ({} as INode);
  });

  public group: GroupExtension;
  public layer: LayerExtension;
  public clipboard: ClipboardExtension;

  constructor() {
    this.getNodeTree = this.getNodeTree.bind(this);
    this.getNodes = this.getNodes.bind(this);
    this.getSelectedNodes = this.getSelectedNodes.bind(this);
    this.getCurrentNode = this.getCurrentNode.bind(this);
    this.getRootRef = this.getRootRef.bind(this);
    this.getRoot = this.getRoot.bind(this);
    this.getNode = this.getNode.bind(this);
    this.updateNode = this.updateNode.bind(this);
    this.updateNodeProps = this.updateNodeProps.bind(this);
    this.updateNodeProp = this.updateNodeProp.bind(this);
    this.update = this.update.bind(this);
    this.removeNode = this.removeNode.bind(this);
    this.onAddNode = this.onAddNode.bind(this);
    this.onSelectNode = this.onSelectNode.bind(this);
    this.onSelectNodes = this.onSelectNodes.bind(this);
    this.moveNodes = this.moveNodes.bind(this);
    this.groupSelectedNodes = this.groupSelectedNodes.bind(this);
    this.unGroup = this.unGroup.bind(this);
    this.addNodeInstance = this.addNodeInstance.bind(this);
    this.removeNodeInstance = this.removeNodeInstance.bind(this);
    this.setNodesSelection = this.setNodesSelection.bind(this);
    this.deleteNodeComponent = this.deleteNodeComponent.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
    this.searchNodesInArea = this.searchNodesInArea.bind(this);
    this.syncSpatialIndex = this.syncSpatialIndex.bind(this);

    this.group = new GroupExtension(this);
    this.layer = new LayerExtension(this);
    this.clipboard = new ClipboardExtension(this);
  }

  getNodeTree() {
    return shallowReadonly(this.#nodesTree);
  }

  getData() {
    return this.#data;
  }

  getNodeMap() {
    return this.#nodeMap;
  }

  refreshNodeTreeInternal() {
    this.#refreshNodeTree();
  }

  addTreeNodeInternal(node: INode) {
    this.#addTreeNode(node);
  }

  #refreshNodeTree(): void {
    const rootNode = this.#treeNodeMap.get('root');
    if (!rootNode) {
      this.#nodesTree.value = [];
      return;
    }

    const childrenMap = new Map<string, TreeNode[]>();
    for (const node of this.#nodesTreeSource) {
      if (!node.parentId) continue;
      const list = childrenMap.get(node.parentId);
      if (list) {
        list.push(node);
      } else {
        childrenMap.set(node.parentId, [node]);
      }
    }

    for (const node of this.#nodesTreeSource) {
      node.children = childrenMap.get(node.id) || [];
    }

    this.#nodesTree.value = [rootNode];
  }

  #createNodeTree(): void {
    this.#nodesTreeSource.splice(0, this.#nodesTreeSource.length);
    this.#treeNodeMap.clear();

    this.#data?.nodes.forEach(node => {
      this.#addTreeNode(node);
    });

    const rootNode = this.#treeNodeMap.get('root');
    if (rootNode) {
      rootNode.AFold = true;
    }

    this.#refreshNodeTree();
  }

  #syncNodeMap() {
    this.#nodeMap.clear();
    this.#data?.nodes.forEach(node => {
      this.#nodeMap.set(node.id, node);
    });
    this.#syncSpatialIndex();
  }

  #syncSpatialIndex() {
    this.#spatialIndex.clear();
    const items: SpatialItem[] = [];
    this.#data?.nodes.forEach(node => {
      if (node.id === 'root') return;
      items.push({
        minX: node.x,
        minY: node.y,
        maxX: node.x + node.width,
        maxY: node.y + node.height,
        id: node.id
      });
    });
    this.#spatialIndex.load(items);
  }

  #addTreeNode(node: INode) {
    const id = node.id;
    const nodeMap = this.#nodeMap;
    const treeNode: TreeNode = reactive({
      get parentId() {
        return nodeMap.get(id)?.parentId;
      },
      id: id,
      get name() {
        return nodeMap.get(id)?.name;
      },
      get schema() {
        return nodeMap.get(id)?.schema;
      },
      get select() {
        return nodeMap.get(id)?.select;
      },
      get data() {
        return nodeMap.get(id);
      }
    }) as TreeNode;
    this.#nodesTreeSource.push(treeNode);
    this.#treeNodeMap.set(id, treeNode);
  }

  #createNodes() {
    this.#nodes = computed<INode[]>(() =>
      this.#data ? this.#data.nodes.filter(node => node.id !== 'root') : []
    );
  }

  getNodes() {
    return readonly(this.#nodes);
  }

  #initSelectedNode() {
    const node = this.#data?.nodes.find(node => node.select);
    if (!node) return;
    this.#currentNode.value = node;
  }

  #createSelectedNodes() {
    this.#selectedNodes = computed<INode[]>(() =>
      this.#data ? this.#data.nodes.filter(node => node.select) : []
    );

    watch(this.#selectedNodes, newVal => {
      if (newVal.length <= 1) {
        this.#currentNode.value = newVal[0] || ({} as INode);
      }
    });
  }

  getSelectedNodes() {
    return readonly(this.#selectedNodes);
  }

  getCurrentNode() {
    return this.#currentNode;
  }

  getRootRef() {
    return this.#rootNode;
  }

  getRoot() {
    const node = this.#nodeMap.get('root');
    return readonly(node ? node : ({} as INode));
  }

  getNode(id: string) {
    const node = this.#nodeMap.get(id);
    return readonly(node ? node : ({} as INode));
  }

  updateNode(id: string, delta: INodeDelta, syncLayout = true, skipSpatialSync = false): void {
    const node = this.#nodeMap.get(id);
    if (node && delta) {
      const geometryChanged = delta.x !== undefined || delta.y !== undefined || delta.width !== undefined || delta.height !== undefined;

      Object.assign(node, delta);

      this.#nodeInstances?.[node.id]?.updatePos?.();

      if (syncLayout) {
        const layoutUpdates: { key: string; value: ComponentPropValue }[] = [];
        if (delta.x !== undefined) layoutUpdates.push({ key: 'layout.x', value: delta.x });
        if (delta.y !== undefined) layoutUpdates.push({ key: 'layout.y', value: delta.y });
        if (delta.width !== undefined) layoutUpdates.push({ key: 'layout.width', value: delta.width });
        if (delta.height !== undefined) layoutUpdates.push({ key: 'layout.height', value: delta.height });
        if (delta.rotate !== undefined) layoutUpdates.push({ key: 'layout.rotate', value: delta.rotate });

        if (layoutUpdates.length > 0) {
          this.updateNodeProps(node.id, layoutUpdates, false);
        }
      }

      if (geometryChanged && !skipSpatialSync) {
        this.#syncSpatialIndex();
      }
    }
  }

  removeNode(id: string): void {
    if (!this.#data || id === 'root') return;

    // Recursive removal of children
    const children = this.#data.nodes.filter(n => n.parentId === id);
    for (const child of children) {
      this.removeNode(child.id);
    }

    const idx = this.#data.nodes.findIndex(n => n.id === id);
    if (idx >= 0) {
      const node = this.#data.nodes[idx];
      this.deleteNodeComponent(node);
      this.#data.nodes.splice(idx, 1);
      this.#nodeMap.delete(id);
      const tree = this.#treeNodeMap.get(id);
      if (tree) {
        const tIdx = this.#nodesTreeSource.findIndex(t => t.id === id);
        if (tIdx >= 0) this.#nodesTreeSource.splice(tIdx, 1);
        this.#treeNodeMap.delete(id);
      }
      this.#refreshNodeTree();
      this.#syncSpatialIndex();
    }
  }

  moveNodes(ids: string[], dx: number, dy: number): void {
    for (const id of ids) {
      const node = this.#nodeMap.get(id);
      if (node) {
        this.updateNode(id, {
          x: (node.x || 0) + dx,
          y: (node.y || 0) + dy
        }, true, true);
      }
    }
    this.#syncSpatialIndex();
  }

  groupSelectedNodes(): INode | undefined {
    return this.group.groupSelectedNodes();
  }

  unGroup(groupId: string): void {
    this.group.unGroup(groupId);
  }

  updateNodeProp(
    id: string,
    key: string,
    value: ComponentPropValue,
    syncNode = true
  ): void {
    const node = this.#nodeMap.get(id);
    if (!node || !key) return;

    const keyArr = key.split('.');
    let current: Record<string, ComponentPropValue | ComponentProp> = node.props;

    if (!current) {
      node.props = {} as IComponentProps;
      current = node.props;
    }

    for (let i = 0; i < keyArr.length - 1; i++) {
      const k = keyArr[i];
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k] as Record<string, ComponentPropValue | ComponentProp>;
    }
    const lastKey = keyArr[keyArr.length - 1];
    current[lastKey] = value;

    if (syncNode && key.startsWith('layout.')) {
      const field = key.split('.')[1];
      const nodeUpdates: INodeDelta = {};
      switch (field) {
        case 'x':
        case 'y':
        case 'width':
        case 'height':
        case 'rotate':
          nodeUpdates[field] = Number(value);
          break;
        case 'radius':
          (nodeUpdates as Record<string, ComponentPropValue>).radius = value;
          break;
      }
      if (Object.keys(nodeUpdates).length > 0) {
        this.updateNode(id, nodeUpdates, false);
      }
    }
  }

  updateNodeProps(
    id: string,
    opts:
      | undefined
      | { key: string; value: ComponentPropValue }
      | { key: string; value: ComponentPropValue }[],
    syncNode = true
  ): void {
    if (!opts) return;
    const options = Array.isArray(opts) ? opts : [opts];
    for (const opt of options) {
      this.updateNodeProp(id, opt.key, opt.value, syncNode);
    }
  }

  update(data: IEditorData): void {
    if (!this.#data || !data || !data.nodes) return;

    if (this.#data.nodes) {
      this.#data.nodes.splice(0, this.#data.nodes.length);
      data.nodes.forEach((node: INode) => {
        this.#data?.nodes.push(node);
      });
    }

    this.#syncNodeMap();
    this.#createNodeTree();
    this.onSelectNode('root');
    this.#initSelectedNode();
  }

  #onAddNode(addNode: IAddNode, parentId: string, pos: INodePointerPos, refreshTree = true, skipSpatialSync = false) {
    if (addNode instanceof Object) {
      // 计算该父级下的最大 z 值
      let maxZ = 0;
      this.#data?.nodes.forEach(n => {
        if (n.parentId === parentId && n.z > maxZ) {
          maxZ = n.z;
        }
      });

      const node: INode = {
        parentId: parentId,
        id: getUuid(),
        name: addNode.name,
        schema: addNode.schema,
        component: addNode.component,
        props: addNode.props,
        width: 400,
        height: 400,
        radius: [0, 0, 0, 0],
        type: '',
        x: 0,
        y: 0,
        z: maxZ + 1, // 新节点始终在最顶层
        select: false,
        lock: false,
        hide: false
      };

      this.#data?.nodes.push(node);
      const addedNode =
        this.#data && this.#data.nodes.length > 0
          ? this.#data.nodes[this.#data.nodes.length - 1]
          : node;

      this.#nodeMap.set(addedNode.id, addedNode);

      addedNode.x = pos.x - addedNode.width / 2;
      addedNode.y = pos.y - addedNode.height / 2;
      this.updateNode(addedNode.id, addedNode, true, skipSpatialSync);
      this.#addTreeNode(addedNode);
      if (refreshTree) this.#refreshNodeTree();
      return addedNode;

    }
  }

  onAddNode(nodes: IAddNode[] | IAddNode, parentId: string, pos: INodePointerPos) {
    if (Array.isArray(nodes)) {
      for (const node of nodes) {
        this.#onAddNode(node, parentId, pos, false, true);
      }
      this.#refreshNodeTree();
      this.#syncSpatialIndex();
    } else if (nodes instanceof Object) {
      return this.#onAddNode(nodes, parentId, pos);
    }
  }

  onSelectNode(id: string, isAppend = false): void {
    this.onSelectNodes([id], isAppend);
  }

  onSelectNodes(ids: string[], isAppend = false): void {
    if (!this.#data) return;

    let targetIds = [...ids];
    if (targetIds.length > 1) {
      targetIds = targetIds.filter(id => {
        let parentId = this.#nodeMap.get(id)?.parentId;
        while (parentId && parentId !== 'root') {
          if (targetIds.includes(parentId)) return false;
          parentId = this.#nodeMap.get(parentId)?.parentId;
        }
        return true;
      });
    }

    const idSet = new Set(targetIds);
    const nodes = this.#data.nodes;

    for (const node of nodes) {
      const isTarget = idSet.has(node.id);
      if (isAppend) {
        if (isTarget) node.select = !node.select;
      } else {
        node.select = isTarget;
      }
    }

    const selectedComponents = nodes.filter(n => n.select && n.id !== 'root');
    const rootNode = this.#nodeMap.get('root');

    if (selectedComponents.length > 0) {
      if (rootNode) rootNode.select = false;
    } else if (!idSet.has('root')) {
      if (rootNode) rootNode.select = true;
    }

    const activeCount = selectedComponents.length;
    for (const node of nodes) {
      const isSelected = !!node.select;
      const isMultipleMode = activeCount > 1;

      this.#nodeInstances?.[node.id]?.setActive?.(isSelected && !isMultipleMode);
      this.#nodeInstances?.[node.id]?.setSelection?.(isSelected && isMultipleMode);
    }
  }

  setNodesSelection(ids: string[], selection: boolean): void {
    for (const id of ids) {
      this.#nodeInstances?.[id]?.setSelection?.(selection);
    }
  }

  addNodeInstance(nodeId: string, addNodeInstance: INodeInstance): void {
    if (this.#nodeInstances) {
      this.#nodeInstances[nodeId] = addNodeInstance;

      const node = this.#nodeMap.get(nodeId);
      if (node) {
        const activeCount = this.#selectedNodes.value.filter(n => n.id !== 'root').length;
        const isSelected = !!node.select;
        const isMultipleMode = activeCount > 1;

        addNodeInstance.setActive?.(isSelected && !isMultipleMode);
        addNodeInstance.setSelection?.(isSelected && isMultipleMode);
      }
    }
  }

  removeNodeInstance(nodeId: string): void {
    if (this.#nodeInstances) {
      delete this.#nodeInstances[nodeId];
    }
  }

  addNodeNodeComponent(node: INode, component: App): void {
    if (this.#nodeComponentInstances) {
      this.#nodeComponentInstances[node.id] = component;
    }
  }

  deleteNodeComponent(node: INode): void {
    if (this.#nodeComponentInstances) {
      this.#nodeComponentInstances[node.id]?.unmount();
      delete this.#nodeComponentInstances[node.id];
    }
  }

  install(data: IEditorData): void {
    this.#data = data;
    this.#syncNodeMap();
    this.#createNodes();
    this.#createSelectedNodes();
    this.#createNodeTree();
    this.onSelectNode('root');
    this.#initSelectedNode();
  }

  uninstall(): void {
    this.#data = undefined;
    this.#nodes = computed(() => []);
    this.#selectedNodes = computed(() => []);
    this.#nodesTreeSource.splice(0, this.#nodesTreeSource.length);
    this.#nodesTree.value = [];
    this.#nodeMap.clear();
    this.#treeNodeMap.clear();
    this.#spatialIndex.clear();
    this.#nodeInstances = undefined;
    this.#nodeComponentInstances = undefined;
  }

  searchNodesInArea(rect: { x: number; y: number; width: number; height: number }): INode[] {
    const items = this.#spatialIndex.search({
      minX: rect.x,
      minY: rect.y,
      maxX: rect.x + rect.width,
      maxY: rect.y + rect.height
    });
    return items
      .map(item => this.#nodeMap.get(item.id))
      .filter((n): n is INode => !!n && !n.lock && !n.hide);
  }

  syncSpatialIndex() {
    this.#syncSpatialIndex();
  }
}

let myNodeContext: CreateNodeContext | undefined;

const createNodeContext = function (): CreateNodeContext {
  if (!myNodeContext) myNodeContext = new CreateNodeContext();
  return myNodeContext;
};

export const removeNodeContext = function () {
  myNodeContext?.uninstall();
  myNodeContext = undefined;
};

export const useNodeContext = function () {
  myNodeContext = createNodeContext();
  return myNodeContext;
};
