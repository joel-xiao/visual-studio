export interface LayerItemData {
  name?: string;
  icon?: string;
  id: string;
  sum?: number;
  children?: LayerItemData[];
  AFold?: boolean;
  handle?: boolean;
  parentId?: string;
  cascades?: LayerItemData[];
}

export interface LayerItemMenu {
  name: string;
  icon: string;
  id: string;
  children?: LayerItemMenu[];
  disabled?: boolean;
}
