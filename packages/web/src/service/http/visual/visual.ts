import http from '../http';
import * as T from './types';

const visualApi: T.IVisualApi = {
  getVisualProjects(folder) {
    return http.get('visual/projects/' + folder);
  }
};
export default visualApi;
