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
  data?: T;
}
export type LayerData<T> = LayerItemData;

export interface LayerItemMenu {
  name: string;
  icon: string;
  id: string;
  children?: LayerItemMenu[];
  disabled?: boolean;
}
