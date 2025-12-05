declare interface INodePointerPos {
  x: number;
  y: number;
}

declare interface IBasicNode {
  name: string;
  icon: string;
  component: string;
  schema: string;
}

declare interface IAddNode extends IBasicNode {
  name: string;
  icon: string;
  component: string;
  schema: string;
  props: IComponentProps;
}

declare interface INode extends IAddNode {
  parentId: string;
  id: string;
  type: string;
  width: number;
  height: number;
  radius: number[];
  x: number;
  y: number;
  select?: boolean;
  lock?: boolean;
  z: number;
}

declare interface INodeDelta {
  name?: string;
  id?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

declare interface IEditorData {
  folder?: string;
  name: string;
  id: string;
  type: string;
  nodes: INode[];
}

interface ITreeNodeData {
  parentId?: string | undefined | null;
  id: string;
  name: string;
  z: number;
  select?: boolean;
  type: string;
}

declare type TreeNode = PanelLayerItemData;

declare interface INodeInstance {
  setActive: (val: boolean) => void;
  updatePos: () => void;
}
