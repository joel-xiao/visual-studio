import {
  watch,
  computed,
  readonly,
  reactive,
  Ref,
  ref,
  ComputedRef,
  onBeforeUnmount,
  App
} from 'vue';
// import { getUuid } from '@a/utils/index';
import type {
  EditorData,
  PointerPos,
  Node,
  AddNode,
  NodeDelta,
  TreeNode,
  NodeInstance
} from './interface';

class CreateNodeContext {
  _data: EditorData;
  _nodes: ComputedRef<Node[]> | [];
  _selectedNodes: ComputedRef<Node[]> | [];
  _currentNode: Ref<Node>;
  _nodesTreeSource: TreeNode[];
  _nodesTree: ComputedRef<TreeNode[]> | [];
  _nodeInstances?: {
    [nodeId: string]: NodeInstance;
  };
  _nodeComponentInstances?: {
    [nodeId: string]: App | undefined;
  };
  constructor(data: EditorData) {
    this._data = data;
    this._nodes = [];
    this._selectedNodes = [];
    this._currentNode = ref({} as Node);
    this._nodesTreeSource = [];
    this._nodesTree = [];
    this._nodeInstances = {};
    this._nodeComponentInstances = {};

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
    return this._nodesTree;
  }

  _createNodeTree(): void {
    this._nodesTreeSource = reactive<TreeNode[]>([]);
    this._data.nodes.forEach((node) => {
      this._addTreeNode(node);
    });

    let nodesTree: TreeNode[] = [];
    const rootNode = this._nodesTreeSource.find((node) => node.id === 'root');
    if (rootNode) {
      rootNode.AFold = true;
      nodesTree = [rootNode];
    }
    this._nodesTree = computed<TreeNode[]>(() => {
      this._formatTreeNode(this._nodesTreeSource, nodesTree);
      return nodesTree;
    });
  }

  _formatTreeNode(nodes: TreeNode[], nodesTree: TreeNode[]): void {
    nodesTree.forEach((node: TreeNode): void => {
      node.children = nodes.filter((n) => n.parentId === node.id);
      this._formatTreeNode(nodes, node.children);
    });
  }

  _addTreeNode(node: Node) {
    this._nodesTreeSource.push({
      parentId: node.container,
      icon: node.icon,
      id: node.id,
      name: node.name,
      select: node.select,
      data: {
        name: node.name,
        id: node.id,
        container: node.container,
        type: node.type,
        z: node.z
      }
    });
  }

  _createNodes() {
    this._nodes = computed<Node[]>(() => this._data.nodes.filter((node) => node.id !== 'root'));
  }

  getNodes() {
    return readonly(this._nodes);
  }

  _createSelectedNodes() {
    this._selectedNodes = computed<Node[]>(() => this._data.nodes.filter((node) => node.select));

    watch(this._selectedNodes, (newVal) => {
      if (newVal.length <= 1) {
        this._currentNode.value = newVal[0] || ({} as Node);
      }
    });
  }

  getSelectedNodes() {
    return readonly(this._selectedNodes);
  }

  getCurrentNode() {
    return this._currentNode;
  }

  getRoot() {
    const node: Node | undefined = this._data.nodes.find((node) => node.id === 'root');
    return readonly(node ? node : ({} as Node));
  }

  getRootStyle(): ComputedRef<{ width: string; height: string }> {
    const root = this.getRoot();
    return computed<{ width: string; height: string }>(() => {
      return {
        width: root.width + 'px',
        height: root.height + 'px'
      };
    });
  }

  getNode(id: string) {
    const node: Node | undefined = this._data.nodes.find((node) => node.id === id);
    return readonly(node ? node : ({} as Node));
  }

  /**
   * @parma {
   *  change_type: update_node_props | ''
   * }
   * **/
  updateNode(id: string, delta: NodeDelta, change_type = ''): void {
    const node = this._data.nodes.find((node) => node.id === id);
    if (node && delta) {
      Object.keys(delta).forEach((key: string): void => {
        // @ts-ignore
        node[key] = delta[key];
      });

      this._nodeInstances?.[node.id]?.updatePos?.();

      // Node binds to  Pros Layout
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
      | { key: string; value: number | string | boolean | undefined | number[] }
      | { key: string; value: number | string | boolean | undefined | number[] }[],
    change_type = ''
  ): void {
    const node = this._data.nodes.find((node) => node.id === id);
    if (!node) return;

    // Pros Layout binds to  Node
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
        case 'on_add_node':
          opts = [
            { key: 'layout.x', value: node.props.layout.x },
            { key: 'layout.y', value: node.props.layout.y },
            { key: 'layout.width', value: node.props.layout.width },
            { key: 'layout.height', value: node.props.layout.height }
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
        //@ts-ignore
        let data = node?.props;
        keyArr.forEach((k, i) => {
          //@ts-ignore
          if (typeof data === 'object' && i === keyArr.length - 1) {
            //@ts-ignore
            data[k] = value;

            //  Pros Layout binds to  Node
            if (change_type !== 'update_node') {
              const keys = ['layout.x', 'layout.y', 'layout.width', 'layout.height'];
              if (keys.some((r) => key && key.includes(r))) {
                this.updateNode(id, { [k]: value }, 'update_node_props');
              }
            }
          } else {
            //@ts-ignore
            data = data[k];
          }
        });
      }
    }
  }

  _onAddNode(addNode: AddNode, container: string, pos: PointerPos): void {
    if (addNode instanceof Object) {
      const node: Node = {
        container: container,
        // id: getUuid(),
        id: '111',
        name: addNode.name,
        icon: addNode.icon,
        schema: addNode.schema,
        component: addNode.component,
        props: addNode.props,
        width: 400,
        height: 400,
        type: '',
        x: 0,
        y: 0,
        z: 0,
        select: false,
        lock: false
      };

      node.x = pos.x - node.width / 2;
      node.y = pos.y - node.height / 2;

      this._data.nodes.push(node);
      this._addTreeNode(node);
      this.updateNodeProps(node.id, undefined, 'on_add_node');
    }
  }

  onAddNode(nodes: AddNode[] | AddNode, container: string, pos: PointerPos): void {
    if (Array.isArray(nodes)) {
      nodes.forEach((node: AddNode) => {
        this._onAddNode(node, container, pos);
      });
    } else if (nodes instanceof Object) {
      this._onAddNode(nodes, container, pos);
    }
  }

  onSelectNode(id: string): void {
    this._data.nodes.forEach((node) => {
      if (id === node.id) {
        node.select = true;
      } else {
        node.select = false;
      }
      this._nodeInstances?.[node.id]?.setActive?.(node.select);
    });

    this._nodesTreeSource.forEach((TreeNode) => {
      if (id === TreeNode?.data?.id) {
        TreeNode.select = true;
      } else {
        TreeNode.select = false;
      }
    });
  }

  addNodeInstance(nodeId: string, addNodeInstance: NodeInstance): void {
    this._nodeInstances && (this._nodeInstances[nodeId] = addNodeInstance);
  }

  removeNodeInstance(nodeId: string): void {
    this._nodeInstances && delete this._nodeInstances[nodeId];
  }

  addNodeNodeComponent(node: Node, component: App): void {
    this._nodeComponentInstances && (this._nodeComponentInstances[node.id] = component);
  }

  deleteNodeComponent(node: Node): void {
    if (this._nodeComponentInstances) {
      this._nodeComponentInstances[node.id]?.unmount();
      delete this._nodeComponentInstances[node.id];
    }
  }

  install(): void {
    this._createNodes();
    this._createSelectedNodes();
    this._createNodeTree();
    this.onSelectNode('root');
  }

  uninstall(): void {
    this._nodes = [];
    this._selectedNodes = [];
    this._nodesTreeSource = [];
    this._nodesTree = [];
    this._nodeInstances = undefined;
    this._nodeComponentInstances = undefined;
  }
}

let myNodeContext: CreateNodeContext;

export const createNodeContext = function (data: EditorData): CreateNodeContext {
  myNodeContext = new CreateNodeContext(data);
  myNodeContext.install();
  onBeforeUnmount(() => {
    myNodeContext.uninstall();
  });
  return myNodeContext;
};

export const useNodeContext = function (): CreateNodeContext {
  return myNodeContext;
};
