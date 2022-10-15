import type { LayerData } from './../../panels/components/panel-layer/interface';

export interface PointerPos {
  x: number;
  y: number;
}

export interface Node {
  container: string;
  name: string;
  id: string;
  icon: string;
  type: string;
  width: number;
  height: number;
  x: number;
  y: number;
  select?: boolean;
  lock?: boolean;
  z: number;
  component: string;
  schema: string;
}

export interface AddNode {
  name: string;
  icon: string;
  component: string;
  schema: string;
}

export interface NodeDelta {
  name?: string;
  id?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export interface EditorData {
  folder?: string;
  name: string;
  id: string;
  type: string;
  nodes: Node[];
}

interface TreeNodeData {
  container?: string | undefined | null;
  id: string;
  name: string;
  z: number;
  select?: boolean;
  type: string;
}

export type TreeNode = LayerData<TreeNodeData>;

export interface NodeInstance {
  setActive?: (val: boolean) => void;
}
