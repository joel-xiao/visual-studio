import http from '../http';
import * as T from './types';

const visualApi: T.IVisualApi = {
  getVisualProjects(folder) {
    return http.get<{
      icon: string;
      label: string;
      id: string;
      folderId: string;
    }[]>('visual/projects/' + folder) as Promise<T.IVisualProjectsResponse>;
  }
};
export default visualApi;
