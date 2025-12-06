import { watch, computed, readonly, reactive, ref, ComputedRef, type App, type Ref } from 'vue';
import { getUuid } from '@a/utils/index';

class CreateNodeContext {
  #data?: IEditorData;
  #nodes: ComputedRef<INode[]> | [] = [];
  #selectedNodes: ComputedRef<INode[]> | [] = [];
  #currentNode: Ref<INode> = ref({} as INode);
  #nodesTreeSource: TreeNode[] = reactive([]);
  #nodesTree: ComputedRef<TreeNode[]> | [] = [];
  #nodeInstances?: {
    [nodeId: string]: INodeInstance;
  } = {};
  #nodeComponentInstances?: {
    [nodeId: string]: App | undefined;
  } = {};
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
    this.addNodeInstance = this.addNodeInstance.bind(this);
    this.removeNodeInstance = this.removeNodeInstance.bind(this);
    this.deleteNodeComponent = this.deleteNodeComponent.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  getNodeTree(): ComputedRef<TreeNode[]> | [] {
    return this.#nodesTree;
  }

  #createNodeTree(): void {
    // Clear existing array without breaking reference
    this.#nodesTreeSource.splice(0, this.#nodesTreeSource.length);

    this.#data?.nodes.forEach(node => {
      this.#addTreeNode(node);
    });

    // Set initial state for root node if needed
    const rootNode = this.#nodesTreeSource.find(node => node.id === 'root');
    if (rootNode) {
      rootNode.AFold = true;
    }

    if (Array.isArray(this.#nodesTree)) {
      this.#nodesTree = computed<TreeNode[]>(() => {
        const rootNode = this.#nodesTreeSource.find(node => node.id === 'root');
        if (!rootNode) return [];
        const nodesTree = [rootNode];
        this.#formatTreeNode(this.#nodesTreeSource, nodesTree);
        return nodesTree;
      });
    }
  }

  #formatTreeNode(nodes: TreeNode[], nodesTree: TreeNode[]): void {
    nodesTree.forEach((node: TreeNode): void => {
      node.children = nodes.filter(n => n.parentId === node.id);
      this.#formatTreeNode(nodes, node.children);
    });
  }

  #addTreeNode(node: INode) {
    this.#nodesTreeSource.push({
      parentId: node.parentId,
      icon: node.icon,
      id: node.id,
      name: node.name,
      select: node.select,
      data: {
        name: node.name,
        id: node.id,
        parentId: node.parentId,
        type: node.type,
        z: node.z
      }
    });
  }

  #createNodes() {
    this.#nodes = this.#data
      ? computed<INode[]>(() =>
          this.#data ? this.#data.nodes.filter(node => node.id !== 'root') : []
        )
      : [];
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
    return readonly(computed(() => {
      const node = this.#data?.nodes.find(node => node.id === 'root');
      return node ? node : ({} as INode);
    }));
  }

  getRoot() {
    const node = this.#data?.nodes.find(node => node.id === 'root');
    return readonly( node ? node : ({} as INode));
  }

  getNode(id: string) {
    const node = this.#data?.nodes.find(node => node.id === id);
    return readonly( node ? node : ({} as INode));
  }

  /**
   * @parma {
   *  syncLayout: boolean
   * }
   * **/
  updateNode(id: string, delta: INodeDelta, syncLayout = true): void {
    const node = this.#data?.nodes.find(node => node.id === id);
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
    const node = this.#data?.nodes.find(node => node.id === id);
    if (!node || !key) return;

    const keyArr = key.split('.');
    let current: Record<string, unknown> = node.props as unknown as Record<string, unknown>;

    if (!current) {
      node.props = {} as IComponentProps;
      current = node.props as unknown as Record<string, unknown>;
    }

    for (let i = 0; i < keyArr.length - 1; i++) {
      const k = keyArr[i];
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k] as Record<string, unknown>;
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
          nodeUpdates[field] = Number(value);
          break;
        case 'radius':
          (nodeUpdates as Record<string, unknown>).radius = value;
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

    this.#createNodeTree();
    this.onSelectNode('root');
    this.#initSelectedNode();
  }

  #onAddNode(addNode: IAddNode, parentId: string, pos: INodePointerPos) {
    if (addNode instanceof Object) {
      const node: INode = {
        parentId: parentId,
        id: getUuid(),
        name: addNode.name,
        icon: addNode.icon,
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

      node.x = pos.x - node.width / 2;
      node.y = pos.y - node.height / 2;
      this.updateNode(node.id, node);
      this.#addTreeNode(node);
      return node;
    }
  }

  onAddNode(nodes: IAddNode[] | IAddNode, parentId: string, pos: INodePointerPos) {
    if (Array.isArray(nodes)) {
      nodes.forEach((node: IAddNode) => {
        this.#onAddNode(node, parentId, pos);
      });
    } else if (nodes instanceof Object) {
      return this.#onAddNode(nodes, parentId, pos);
    }
  }

  onSelectNode(id: string): void {
    this.#data?.nodes.forEach(node => {
      if (id === node.id) {
        node.select = true;
      } else {
        node.select = false;
      }
      this.#nodeInstances?.[node.id]?.setActive?.(node.select);
    });

    this.#nodesTreeSource.forEach(treeNode => {
      if (id === treeNode?.data?.id) {
        treeNode.select = true;
      } else {
        treeNode.select = false;
      }
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
    this.#createNodes();
    this.#createSelectedNodes();
    this.#createNodeTree();
    this.onSelectNode('root');
    this.#initSelectedNode();
  }

  uninstall(): void {
    this.#nodes = [];
    this.#selectedNodes = [];
    this.#nodesTreeSource = [];
    this.#nodesTree = [];
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
