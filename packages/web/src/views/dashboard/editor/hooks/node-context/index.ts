import { watch, computed, readonly, reactive, ref, ComputedRef, type App, type Ref } from 'vue';
import { getUuid } from '@a/utils/index';

class CreateNodeContext {
  #data?: IEditorData;
  #nodes: ComputedRef<INode[]> | [] = [];
  #selectedNodes: ComputedRef<INode[]> | [] = [];
  #currentNode: Ref<INode> = ref({} as INode);
  #nodesTreeSource: TreeNode[] = [];
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
    this.getRoot = this.getRoot.bind(this);
    this.getRootStyle = this.getRootStyle.bind(this);
    this.getNode = this.getNode.bind(this);
    this.updateNode = this.updateNode.bind(this);
    this.updateNodeProps = this.updateNodeProps.bind(this);
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
    this.#nodesTreeSource = reactive<TreeNode[]>([]);
    this.#data?.nodes.forEach(node => {
      this.#addTreeNode(node);
    });

    let nodesTree: TreeNode[] = [];
    const rootNode = this.#nodesTreeSource.find(node => node.id === 'root');
    if (rootNode) {
      rootNode.AFold = true;
      nodesTree = [rootNode];
    }
    this.#nodesTree = computed<TreeNode[]>(() => {
      this.#formatTreeNode(this.#nodesTreeSource, nodesTree);
      return nodesTree;
    });
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

  getRoot() {
    const node: INode | undefined = this.#data?.nodes.find(node => node.id === 'root');
    return readonly(node ? node : ({} as INode));
  }

  getRootStyle() {
    const root = this.getRoot();
    return computed<{ width: string; height: string }>(() => {
      return {
        width: root.width + 'px',
        height: root.height + 'px'
      };
    });
  }

  getNode(id: string) {
    const node: INode | undefined = this.#data?.nodes.find(node => node.id === id);
    return readonly(node ? node : ({} as INode));
  }

  /**
   * @parma {
   *  change_type: update_node_props | ''
   * }
   * **/
  updateNode(id: string, delta: INodeDelta, change_type = ''): void {
    const node = this.#data?.nodes.find(node => node.id === id);
    if (node && delta) {
      Object.keys(delta).forEach((key: string): void => {
        (node as unknown as Record<string, unknown>)[key] = (delta as Record<string, unknown>)[key];
      });

      this.#nodeInstances?.[node.id]?.updatePos?.();

      // INode binds to  Pros Layout
      if (change_type !== 'update_node_props') {
        this.updateNodeProps(node.id, undefined, 'update_node');
      }
    }
  }

  /**
   * @parma {
   *  change_type: update_node | on_add_node |  ''
   * }
   * **/
  updateNodeProps(
    id: string,
    opts:
      | undefined
      | { key: string; value: ComponentPropValue }
      | { key: string; value: ComponentPropValue }[],
    change_type = ''
  ): void {
    const node = this.#data?.nodes.find(node => node.id === id);
    if (!node) return;

    // Pros Layout binds to  INode
    if (!opts) {
      switch (change_type) {
        case 'update_node':
          opts = [
            { key: 'layout.x', value: node.x },
            { key: 'layout.y', value: node.y },
            { key: 'layout.width', value: node.width },
            { key: 'layout.height', value: node.height }
          ];
          break;
        case 'on_add_node_size':
          opts = [
            { key: 'layout.width', value: node.props.layout.width || node.width },
            { key: 'layout.height', value: node.props.layout.height || node.height },
            { key: 'layout.radius', value: node.props.layout.radius || node.radius }
          ];
          break;
        case 'on_add_node_pos':
          opts = [
            { key: 'layout.x', value: node.x },
            { key: 'layout.y', value: node.y }
          ];
          break;
        default:
          break;
      }
    }

    opts = Array.isArray(opts) ? opts : opts ? [opts] : [];
    for (const opt of opts) {
      const key = opt.key;
      const value = opt.value;
      if (key && (value || value === 0)) {
        const keyArr = key.split('.');
        let data: unknown = node?.props;
        keyArr.forEach((k, i) => {
          if (typeof data === 'object' && data !== null && i === keyArr.length - 1) {
            (data as Record<string, unknown>)[k] = value;

            //  Pros Layout binds to  INode
            if (change_type !== 'update_node') {
              const keys = [
                'layout.x',
                'layout.y',
                'layout.width',
                'layout.height',
                'layout.radius'
              ];
              if (keys.some(r => key && key.includes(r))) {
                this.updateNode(id, { [k]: value }, 'update_node_props');
              }
            }
          } else {
            data = typeof data === 'object' && data !== null ? (data as Record<string, unknown>)[k] : undefined;
          }
        });
      }
    }
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

      this.updateNodeProps(node.id, undefined, 'on_add_node_size');
      node.x = pos.x - node.width / 2;
      node.y = pos.y - node.height / 2;
      this.updateNodeProps(node.id, undefined, 'on_add_node_pos');

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
