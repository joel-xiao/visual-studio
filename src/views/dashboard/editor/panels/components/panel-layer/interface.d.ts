export interface LayerItemData {
  name?: string;
  icon: string;
  id: string;
  sum?: number;
  children?: LayerItemData[];
  AFold?: boolean;
  select?: boolean;
  handle?: boolean;
  parentId?: string | undefined | null;
  cascades?: LayerItemData[];
  data?: { [key: string]: string | undefined | null | boolean | number };
}

export interface LayerItemMenu {
  name: string;
  icon: string;
  id: string;
  children?: LayerItemMenu[];
  disabled?: boolean;
}
