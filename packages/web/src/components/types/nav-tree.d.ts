declare interface ITreeItemData {
  name?: string;
  icon?: string;
  id: string;
  sum?: number;
  children?: ITreeItemData[];
  AFold?: boolean;
  handle?: boolean;
  parentId?: string;
  cascades?: ITreeItemData[];
  prefix?: string;
}

declare interface ITreeItemMenu {
  name: string;
  icon: string;
  id: string;
  children?: ITreeItemMenu[];
  disabled?: boolean;
}
