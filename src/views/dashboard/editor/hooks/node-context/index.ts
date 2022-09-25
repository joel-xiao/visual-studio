import { computed, reactive, ComputedRef, onBeforeUnmount } from 'vue';
import type { EditorData, Node, AddNode, NodeDelta, TreeNode, NodeVm } from './interface';

class CreateNodeContext {
  #data: EditorData;
  #nodesVm?: {
    [nodeId: string]: NodeVm;
  };
  constructor(data: EditorData) {
    this.#data = data;
    this.#nodesVm = {};

    this.getNodeTree = this.getNodeTree.bind(this);
    this.getNodes = this.getNodes.bind(this);
    this.getRoot = this.getRoot.bind(this);
    this.getRootStyle = this.getRootStyle.bind(this);
    this.getNode = this.getNode.bind(this);
    this.onUpdateNode = this.onUpdateNode.bind(this);
    this.onAddNode = this.onAddNode.bind(this);
    this.onSelectNode = this.onSelectNode.bind(this);
    this.addNodeVm = this.addNodeVm.bind(this);
    this.removeNodeVm = this.removeNodeVm.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  getNodeTree(): TreeNode[] {
    let nodesTree: TreeNode[] = [];
    const nodes: TreeNode[] = this.#data.nodes.map(
      (n): TreeNode => ({
        parentId: n.container,
        icon: '',
        id: n.id,
        name: n.name,
        data: {
          name: n.name,
          id: n.id,
          container: n.container,
          type: n.type,
          z: n.z
        }
      })
    );

    const rootNode = nodes.find((node) => node.id === 'root');
    if (rootNode) {
      nodesTree = [rootNode];
      this.#formatTreeNode(nodes, nodesTree);
    }
    return reactive<TreeNode[]>(nodesTree);
  }

  #formatTreeNode(nodes: TreeNode[], nodesTree: TreeNode[]): void {
    nodesTree.forEach((node: TreeNode): void => {
      node.children = nodes.filter((n) => n.parentId === node.id);
      this.#formatTreeNode(nodes, node.children);
    });
  }

  getNodes(): ComputedRef<Node[]> {
    return computed<Node[]>(() => {
      return this.#data.nodes.filter((node) => node.id !== 'root');
    });
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

  #onAddNode(addNode: AddNode): void {
    if (addNode instanceof Object) {
      const node: Node = {
        id: Math.random() + '',
        name: addNode.name,
        width: addNode.width || 400,
        height: addNode.height || 400,
        type: addNode.type,
        x: 0,
        y: 0,
        z: 0,
        select: true,
        lock: false
      };
      this.#data.nodes.push(node);
    }
  }

  onAddNode(nodes: AddNode[] | AddNode): void {
    if (Array.isArray(nodes)) {
      nodes.forEach((node: AddNode) => {
        this.#onAddNode(node);
      });
    } else if (nodes instanceof Object) {
      this.#onAddNode(nodes);
    }
  }

  onSelectNode(id: string): void {
    this.#data.nodes.forEach((node) => {
      if (id === node.id) {
        node.select = true;
      } else {
        node.select = false;
      }
      this.#nodesVm?.[node.id]?.setActive?.(node.select);
    });
  }

  addNodeVm(nodeId: string, addNodeVm: NodeVm): void {
    this.#nodesVm && (this.#nodesVm[nodeId] = addNodeVm);
  }

  removeNodeVm(nodeId: string): void {
    this.#nodesVm && delete this.#nodesVm[nodeId];
  }

  uninstall(): void {
    this.#nodesVm = undefined;
  }
}

let myNodeContext: CreateNodeContext;

export const createNodeContext = function (data: EditorData): CreateNodeContext {
  myNodeContext = new CreateNodeContext(data);
  onBeforeUnmount(() => {
    myNodeContext.uninstall();
  });
  return myNodeContext;
};

export const useNodeContext = function (): CreateNodeContext {
  return myNodeContext;
};
