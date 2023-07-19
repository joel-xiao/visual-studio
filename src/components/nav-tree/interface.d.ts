export interface TreeItemData {
  name?: string;
  icon?: string;
  id: string;
  sum?: number;
  children?: TreeItemData[];
  AFold?: boolean;
  handle?: boolean;
  parentId?: string;
  cascades?: TreeItemData[];
  prefix?: string;
}

export interface TreeItemMenu {
  name: string;
  icon: string;
  id: string;
  children?: TreeItemMenu[];
  disabled?: boolean;
}
