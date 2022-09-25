import { computed, reactive, ComputedRef, onBeforeUnmount, App, defineAsyncComponent } from 'vue';
import type { EditorData, Node, AddNode, NodeDelta, TreeNode, NodeInstance } from './interface';
import { createComponent } from '@hooks/vue-hooks';

class CreateNodeContext {
  #data: EditorData;
  #nodeInstances?: {
    [nodeId: string]: NodeInstance;
  };
  #nodeComponentInstances?: {
    [nodeId: string]: App | undefined;
  };
  constructor(data: EditorData) {
    this.#data = data;
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
      this.#nodeInstances?.[node.id]?.setActive?.(node.select);
    });
  }

  addNodeInstance(nodeId: string, addNodeInstance: NodeInstance): void {
    this.#nodeInstances && (this.#nodeInstances[nodeId] = addNodeInstance);
  }

  removeNodeInstance(nodeId: string): void {
    this.#nodeInstances && delete this.#nodeInstances[nodeId];
  }

  createNodeComponent(node: Node, parentEl: HTMLElement | undefined): void {
    if (parentEl && this.#nodeComponentInstances) {
      this.#nodeComponentInstances[node.id] = createComponent<{ aa: string }>(
        'middle-node-component',
        parentEl,
        defineAsyncComponent(() => import('./../../ui-library/controls/picture/index.vue')),
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

  uninstall(): void {
    this.#nodeInstances = undefined;
    this.#nodeComponentInstances = undefined;
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
