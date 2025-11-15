export interface IVisualProjectsResponse extends Record<string, unknown> {
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
