export interface IVisualProjectsResponse {
  code: number;
  data?: {
    icon: string;
    label: string;
    id: string;
    folderId: string;
  }[];
  msg: string;
  err?: string;
  [key: string]: unknown;
}
export interface IVisualApi {
  getVisualProjects: (folder: string) => Promise<IVisualProjectsResponse>;
}
