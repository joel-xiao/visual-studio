import { computed, reactive, ComputedRef, onBeforeUnmount, App } from 'vue';
import { getUuid } from '@a/utils/index';
import type {
  EditorData,
  PointerPos,
  Node,
  AddNode,
  NodeDelta,
  TreeNode,
  NodeInstance
} from './interface';
import { createComponent } from '@hooks/vue-hooks';

class CreateNodeContext {
  #data: EditorData;
  #nodes: ComputedRef<Node[]> | [];
  #nodesTreeSource: TreeNode[];
  #nodesTree: ComputedRef<TreeNode[]> | [];
  #nodeInstances?: {
    [nodeId: string]: NodeInstance;
  };
  #nodeComponentInstances?: {
    [nodeId: string]: App | undefined;
  };
  constructor(data: EditorData) {
    this.#data = data;
    this.#nodes = [];
    this.#nodesTreeSource = [];
    this.#nodesTree = [];
    this.#nodeInstances = {};
    this.#nodeComponentInstances = {};

    this.getNodeTree = this.getNodeTree.bind(this);
    this.getNodes = this.getNodes.bind(this);
    this.getRoot = this.getRoot.bind(this);
    this.getRootStyle = this.getRootStyle.bind(this);
    this.getNode = this.getNode.bind(this);
    this.onUpdateNode = this.onUpdateNode.bind(this);
    this.onAddNode = this.onAddNode.bind(this);
    this.onSelectNode = this.onSelectNode.bind(this);
    this.addNodeInstance = this.addNodeInstance.bind(this);
    this.removeNodeInstance = this.removeNodeInstance.bind(this);
    this.createNodeComponent = this.createNodeComponent.bind(this);
    this.deleteNodeComponent = this.deleteNodeComponent.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  getNodeTree(): ComputedRef<TreeNode[]> | [] {
    return this.#nodesTree;
  }

  #createNodeTree(): void {
    this.#nodesTreeSource = reactive<TreeNode[]>([]);
    this.#data.nodes.forEach((node) => {
      this.#addTreeNode(node);
    });

    let nodesTree: TreeNode[] = [];
    const rootNode = this.#nodesTreeSource.find((node) => node.id === 'root');
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
      node.children = nodes.filter((n) => n.parentId === node.id);
      this.#formatTreeNode(nodes, node.children);
    });
  }

  #addTreeNode(node: Node) {
    this.#nodesTreeSource.push({
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

  #createNodes() {
    this.#nodes = computed<Node[]>(() => this.#data.nodes.filter((node) => node.id !== 'root'));
  }

  getNodes(): ComputedRef<Node[]> | [] {
    return this.#nodes;
  }

  getRoot(): Node {
    const node: Node | undefined = this.#data.nodes.find((node) => node.id === 'root');
    return node ? node : ({} as Node);
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

  getNode(id: string): Node {
    const node: Node | undefined = this.#data.nodes.find((node) => node.id === id);
    return node ? node : ({} as Node);
  }

  onUpdateNode(id: string, delta: NodeDelta): void {
    const node = this.#data.nodes.find((node) => node.id === id);
    if (node && delta) {
      Object.keys(delta).forEach((key: string): void => {
        // @ts-ignore
        node[key] = delta[key];
      });
    }
  }

  #onAddNode(addNode: AddNode, container: string, pos: PointerPos): void {
    if (addNode instanceof Object) {
      const node: Node = {
        container: container,
        id: getUuid(),
        name: addNode.name,
        icon: addNode.icon,
        schema: addNode.schema,
        component: addNode.component,
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

      this.#data.nodes.push(node);
      this.#addTreeNode(node);
    }
  }

  onAddNode(nodes: AddNode[] | AddNode, container: string, pos: PointerPos): void {
    if (Array.isArray(nodes)) {
      nodes.forEach((node: AddNode) => {
        this.#onAddNode(node, container, pos);
      });
    } else if (nodes instanceof Object) {
      this.#onAddNode(nodes, container, pos);
    }
  }

  onSelectNode(id: string): void {
    this.#data.nodes.forEach((node) => {
      if (id === node.id) {
        node.select = true;
      } else {
        node.select = false;
      }
      this.#nodeInstances?.[node.id]?.setActive?.(node.select);
    });

    this.#nodesTreeSource.forEach((TreeNode) => {
      if (id === TreeNode.data.id) {
        TreeNode.select = true;
      } else {
        TreeNode.select = false;
      }
    });
  }

  addNodeInstance(nodeId: string, addNodeInstance: NodeInstance): void {
    this.#nodeInstances && (this.#nodeInstances[nodeId] = addNodeInstance);
  }

  removeNodeInstance(nodeId: string): void {
    this.#nodeInstances && delete this.#nodeInstances[nodeId];
  }

  createNodeComponent(node: Node, parentEl: HTMLElement | undefined, component: App): void {
    if (parentEl && this.#nodeComponentInstances) {
      this.#nodeComponentInstances[node.id] = createComponent<{ aa: string }>(
        'middle-node-component',
        parentEl,
        component,
        {
          aa: 'createNodeInstance aaaaaaaaaaaaaaaaaaaa'
        }
      );
    }
  }

  deleteNodeComponent(node: Node): void {
    if (this.#nodeComponentInstances) {
      this.#nodeComponentInstances[node.id]?.unmount();
      delete this.#nodeComponentInstances[node.id];
    }
  }

  install(): void {
    this.#createNodes();
    this.#createNodeTree();
    this.onSelectNode('root');
  }

  uninstall(): void {
    this.#nodes = [];
    this.#nodesTreeSource = [];
    this.#nodesTree = [];
    this.#nodeInstances = undefined;
    this.#nodeComponentInstances = undefined;
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
