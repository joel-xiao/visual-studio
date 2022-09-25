import type { App } from 'vue';
export interface Node {
  container?: string;
  name: string;
  id: string;
  type: string;
  width: number;
  height: number;
  x: number;
  y: number;
  select?: boolean;
  lock?: boolean;
  z: number;
  vm?: App<Element>;
}

export interface AddNode {
  name: string;
  type: string;
  width?: number;
  height?: number;
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

export interface NodeVm {
  setActive?: (val: boolean) => void;
}
