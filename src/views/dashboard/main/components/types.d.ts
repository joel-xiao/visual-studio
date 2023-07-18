import type {
  TreeItemMenu as _ITreeItemMenu,
  TreeItemData as _TreeItemData
} from '@/components/nav-tree/interface';

export type ITreeItemMenu = _ITreeItemMenu;
export type ITreeItemData = _ITreeItemData;

export interface IItemCard {
  icon: string;
  label: string;
  id: string;
}

export interface ILayoutNewProjectData {
  name: string;
  icon: string;
  id: string;
}

export interface ILayoutOption {
  folderTree?: TreeItemData[];
  folderMenus?: TreeItemMenu[];
  buttons?: newProjectData[];
}

export interface ILayoutProject {
  icon: string;
  label: string;
  id: string;
  folderId: string;
}

export type LayoutCreateProject = {
  folder: ITreeItemData | undefined;
  project: ILayoutProject;
  item: ILayoutNewProjectData;
};
