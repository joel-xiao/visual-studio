import { reactive } from 'vue';

import type { EditorData } from './../node-context/interface';
import type { TreeNode } from './interface';

const formatNodes = function (nodes: TreeNode[], nodesTree: TreeNode[]): void {
  nodesTree.forEach((node: TreeNode): void => {
    node.children = nodes.filter((n) => n.parentId === node.id);
    formatNodes(nodes, node.children);
  });
};
export const createNodeTree = function (data: EditorData): TreeNode[] {
  let nodesTree: TreeNode[] = [];
  const nodes: TreeNode[] = data.nodes.map(
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
    formatNodes(nodes, nodesTree);
  }
  return reactive<TreeNode[]>(nodesTree);
};
