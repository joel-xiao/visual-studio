export interface IVisualProjectsResponse extends Object {
  data?: {
    icon: string;
    label: string;
    id: string;
    folderId: string;
  }[];
}
export interface IVisualApi {
  getVisualProjects: (folder: string) => Promise<IVisualProjectsResponse>;
}
