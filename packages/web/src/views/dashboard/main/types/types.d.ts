declare interface IDbLayoutNewProjectData {
  name: string;
  icon: string;
  id: string;
}

declare interface IDbLayoutProject {
  icon: string;
  label: string;
  id: string;
  folderId: string;
}

declare type DbLayoutCreateProject = {
  folder: ITreeItemData | undefined;
  project: ITreeItemData;
  item: IDbLayoutNewProjectData;
};
