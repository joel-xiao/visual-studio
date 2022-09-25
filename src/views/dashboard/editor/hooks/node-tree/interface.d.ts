import type { LayerData } from './../../panels/components/panel-layer/interface';

interface Node {
  container?: string | undefined | null;
  id: string;
  name: string;
  z: number;
  select?: boolean;
  type: string;
}

export type TreeNode = LayerData<Node>;
