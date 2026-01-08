import { watch, computed, readonly, reactive, ref, shallowReadonly, ComputedRef, type App, type Ref } from 'vue';
import { getUuid } from '../../../../assets/utils/index';

class CreateNodeContext {
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
  #rootNode: ComputedRef<INode> = computed(() => {
    const node = this.#nodeMap.get('root');
    return node ? node : ({} as INode);
  });

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
    this.onAddNode = this.onAddNode.bind(this);
    this.onSelectNode = this.onSelectNode.bind(this);
    this.onSelectNodes = this.onSelectNodes.bind(this);
    this.moveNodes = this.moveNodes.bind(this);
    this.addNodeInstance = this.addNodeInstance.bind(this);
    this.removeNodeInstance = this.removeNodeInstance.bind(this);
    this.setNodesSelection = this.setNodesSelection.bind(this);
    this.deleteNodeComponent = this.deleteNodeComponent.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  getNodeTree() {
    return shallowReadonly(this.#nodesTree);
  }

  #refreshNodeTree(): void {
    const rootNode = this.#treeNodeMap.get('root');
    if (!rootNode) {
      this.#nodesTree.value = [];
      return;
    }

    const childrenMap = new Map<string, TreeNode[]>();
    this.#nodesTreeSource.forEach(node => {
      if (!node.parentId) return;
      const list = childrenMap.get(node.parentId);
      if (list) {
        list.push(node);
      } else {
        childrenMap.set(node.parentId, [node]);
      }
    });

    this.#nodesTreeSource.forEach(node => {
      node.children = childrenMap.get(node.id) || [];
    });

    this.#nodesTree.value = [rootNode];
  }

  #createNodeTree(): void {
    // Clear existing array without breaking reference
    this.#nodesTreeSource.splice(0, this.#nodesTreeSource.length);
    this.#treeNodeMap.clear();

    this.#data?.nodes.forEach(node => {
      this.#addTreeNode(node);
    });

    // Set initial state for root node if needed
    const rootNode = this.#treeNodeMap.get('root');
    if (rootNode) {
      rootNode.AFold = true;
    }

    this.#refreshNodeTree();

    return;
  }

  #syncNodeMap() {
    this.#nodeMap.clear();
    this.#data?.nodes.forEach(node => {
      this.#nodeMap.set(node.id, node);
    });
  }

  #addTreeNode(node: INode) {
    const treeNode: TreeNode = reactive({
      parentId: node.parentId,
      id: node.id,
      get name() {
        return node.name;
      },
      schema: node.schema,
      get select() {
        return node.select;
      },
      data: node
    }) as TreeNode;
    this.#nodesTreeSource.push(treeNode);
    this.#treeNodeMap.set(node.id, treeNode);
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

  /**
   * @parma {
   *  syncLayout: boolean
   * }
   * **/
  updateNode(id: string, delta: INodeDelta, syncLayout = true): void {
    const node = this.#nodeMap.get(id);
    if (node && delta) {
      Object.assign(node, delta);

      this.#nodeInstances?.[node.id]?.updatePos?.();

      // INode binds to  Pros Layout
      if (syncLayout) {
        const layoutUpdates: { key: string; value: ComponentPropValue }[] = [];
        if (delta.x !== undefined) layoutUpdates.push({ key: 'layout.x', value: delta.x });
        if (delta.y !== undefined) layoutUpdates.push({ key: 'layout.y', value: delta.y });
        if (delta.width !== undefined) layoutUpdates.push({ key: 'layout.width', value: delta.width });
        if (delta.height !== undefined) layoutUpdates.push({ key: 'layout.height', value: delta.height });

        if (layoutUpdates.length > 0) {
          this.updateNodeProps(node.id, layoutUpdates, false);
        }
      }
    }
  }

  moveNodes(ids: string[], dx: number, dy: number): void {
    ids.forEach(id => {
      const node = this.#nodeMap.get(id);
      if (node) {
        this.updateNode(id, {
          x: (node.x || 0) + dx,
          y: (node.y || 0) + dy
        });
      }
    });
  }

  /**
   * @parma {
   *  syncNode: boolean
   * }
   * **/
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
    console.log(node);

    if (syncNode && key.startsWith('layout.')) {
      const field = key.split('.')[1];
      const nodeUpdates: INodeDelta = {};
      switch (field) {
        case 'x':
        case 'y':
        case 'width':
        case 'height':
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

  /**
   * @parma {
   *  syncNode: boolean
   * }
   * **/
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

  /**
   * Update the entire editor data (nodes)
   */
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

  #onAddNode(addNode: IAddNode, parentId: string, pos: INodePointerPos, refreshTree = true) {
    if (addNode instanceof Object) {
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
        z: 0,
        select: false,
        lock: false
      };

      this.#data?.nodes.push(node);
      const addedNode =
        this.#data && this.#data.nodes.length > 0
          ? this.#data.nodes[this.#data.nodes.length - 1]
          : node;

      this.#nodeMap.set(addedNode.id, addedNode);

      addedNode.x = pos.x - addedNode.width / 2;
      addedNode.y = pos.y - addedNode.height / 2;
      this.updateNode(addedNode.id, addedNode);
      this.#addTreeNode(addedNode);
      if (refreshTree) this.#refreshNodeTree();
      return addedNode;
    }
  }

  onAddNode(nodes: IAddNode[] | IAddNode, parentId: string, pos: INodePointerPos) {
    if (Array.isArray(nodes)) {
      nodes.forEach((node: IAddNode) => {
        this.#onAddNode(node, parentId, pos, false);
      });
      this.#refreshNodeTree();
    } else if (nodes instanceof Object) {
      return this.#onAddNode(nodes, parentId, pos);
    }
  }

  onSelectNode(id: string, isAppend = false): void {
    this.onSelectNodes([id], isAppend);
  }

  onSelectNodes(ids: string[], isAppend = false): void {
    if (!this.#data) return;

    const idSet = new Set(ids);
    const nodes = this.#data.nodes;

    // 1. Update basic selection state
    nodes.forEach(node => {
      const isTarget = idSet.has(node.id);
      if (isAppend) {
        if (isTarget) node.select = !node.select;
      } else {
        node.select = isTarget;
      }
    });

    // 2. Resolve Page (root) vs. Components conflict
    const selectedComponents = nodes.filter(n => n.select && n.id !== 'root');
    const rootNode = this.#nodeMap.get('root');

    if (selectedComponents.length > 0) {
      if (rootNode) rootNode.select = false;
    } else if (!idSet.has('root')) {
      // Fallback to Page selection if nothing else is selected
      if (rootNode) rootNode.select = true;
    }

    // 3. Propagate to UI instances
    const activeCount = selectedComponents.length;
    nodes.forEach(node => {
      const isSelected = !!node.select;
      const isMultipleMode = activeCount > 1;

      // Handles: Only for single component. Selection: Only for members of group selection.
      this.#nodeInstances?.[node.id]?.setActive?.(isSelected && !isMultipleMode);
      this.#nodeInstances?.[node.id]?.setSelection?.(isSelected && isMultipleMode);
    });
  }

  setNodesSelection(ids: string[], selection: boolean): void {
    ids.forEach(id => {
      this.#nodeInstances?.[id]?.setSelection?.(selection);
    });
  }

  addNodeInstance(nodeId: string, addNodeInstance: INodeInstance): void {
    if (this.#nodeInstances) {
      this.#nodeInstances[nodeId] = addNodeInstance;
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
    this.#nodeInstances = undefined;
    this.#nodeComponentInstances = undefined;
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
