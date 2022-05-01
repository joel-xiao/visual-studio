import type { App } from 'vue';
export interface Node {
  name: string;
  id: string;
  key: string;
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
  key: string;
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
  key: string;
  nodes: Node[];
}
