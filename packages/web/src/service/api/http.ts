import axios from 'axios';
// import NProgress from 'nprogress';
import { createDiscreteApi } from 'naive-ui';

const { loadingBar } = createDiscreteApi(['loadingBar']);

const NProgress = {
  start: () => loadingBar.start(),
  done: () => loadingBar.finish(),
  error: () => loadingBar.error()
};

axios.defaults.baseURL = '/api';
axios.defaults.timeout = 10000;
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
axios.interceptors.request.use(
  config => {
    const token = window.sessionStorage.getItem('token');
    if (token && config.headers) {
      (config.headers as Record<string, string>).token = token;
    }
    return config;
  },
  error => {
    return error;
  }
);
axios.interceptors.response.use(res => {
  if (res.data.code === 111) {
    sessionStorage.setItem('token', '');
  }
  return res;
});

interface ResType<T> {
  code: number;
  statusCode?: number; // Backend format
  data?: T;
  msg: string;
  message?: string; // Backend format
  err?: string;
  timestamp?: string;
}
interface Http {
  get<T>(url: string, params?: unknown): Promise<ResType<T>>;
  post<T>(url: string, params?: unknown): Promise<ResType<T>>;
  put<T>(url: string, params?: unknown): Promise<ResType<T>>;
  delete<T>(url: string, params?: unknown): Promise<ResType<T>>;
  upload<T>(url: string, params: unknown): Promise<ResType<T>>;
  download(url: string): void;
}

const http: Http = {
  get(url, params) {
    return new Promise((resolve, reject) => {
      NProgress.start();
      axios
        .get(url, { params })
        .then(res => {
          NProgress.done();
          // Map backend fields to frontend for compatibility
          if (res.data.statusCode !== undefined && res.data.code === undefined) {
             res.data.code = res.data.statusCode === 200 || res.data.statusCode === 201 ? 0 : res.data.statusCode;
          }
          if (res.data.message && !res.data.msg) {
             res.data.msg = res.data.message;
          }
          if (res.data.statusCode === 401 || res.data.code === 111) {
             window.sessionStorage.setItem('token', '');
          }
          resolve(res.data);
        })
        .catch(err => {
          NProgress.done();
          const errorData = err.response?.data || { msg: err.message };
          // Map backend error format if needed
          if (errorData.message && !errorData.msg) {
             errorData.msg = errorData.message;
          }
          reject(errorData);
        });
    });
  },
  post(url, params) {
    return new Promise((resolve, reject) => {
      NProgress.start();
      axios
        .post(url, JSON.stringify(params))
        .then(res => {
          NProgress.done();
          if (res.data.statusCode !== undefined && res.data.code === undefined) {
             res.data.code = res.data.statusCode === 200 || res.data.statusCode === 201 ? 0 : res.data.statusCode;
          }
          if (res.data.message && !res.data.msg) {
             res.data.msg = res.data.message;
          }
          if (res.data.statusCode === 401 || res.data.code === 111) {
             window.sessionStorage.setItem('token', '');
          }
          resolve(res.data);
        })
        .catch(err => {
          NProgress.done();
          const errorData = err.response?.data || { msg: err.message };
          if (errorData.message && !errorData.msg) {
             errorData.msg = errorData.message;
          }
          reject(errorData);
        });
    });
  },
  put(url, params) {
    return new Promise((resolve, reject) => {
      NProgress.start();
      axios
        .put(url, JSON.stringify(params))
        .then(res => {
          NProgress.done();
          if (res.data.statusCode !== undefined && res.data.code === undefined) {
             res.data.code = res.data.statusCode === 200 || res.data.statusCode === 201 ? 0 : res.data.statusCode;
          }
          if (res.data.message && !res.data.msg) {
             res.data.msg = res.data.message;
          }
          if (res.data.statusCode === 401 || res.data.code === 111) {
             window.sessionStorage.setItem('token', '');
          }
          resolve(res.data);
        })
        .catch(err => {
          NProgress.done();
          const errorData = err.response?.data || { msg: err.message };
          if (errorData.message && !errorData.msg) {
             errorData.msg = errorData.message;
          }
          reject(errorData);
        });
    });
  },
  delete(url, params) {
    return new Promise((resolve, reject) => {
      NProgress.start();
      axios
        .delete(url, { data: params })
        .then(res => {
          NProgress.done();
          if (res.data.statusCode !== undefined && res.data.code === undefined) {
             res.data.code = res.data.statusCode === 200 || res.data.statusCode === 201 ? 0 : res.data.statusCode;
          }
          if (res.data.message && !res.data.msg) {
             res.data.msg = res.data.message;
          }
          if (res.data.statusCode === 401 || res.data.code === 111) {
             window.sessionStorage.setItem('token', '');
          }
          resolve(res.data);
        })
        .catch(err => {
          NProgress.done();
          const errorData = err.response?.data || { msg: err.message };
          if (errorData.message && !errorData.msg) {
             errorData.msg = errorData.message;
          }
          reject(errorData);
        });
    });
  },
  upload(url, file) {
    return new Promise((resolve, reject) => {
      NProgress.start();
      axios
        .post(url, file, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          NProgress.done();
          resolve(res.data);
        })
        .catch(err => {
          NProgress.done();
          reject(err.data);
        });
    });
  },
  download(url) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    iframe.onload = function () {
      document.body.removeChild(iframe);
    };
    document.body.appendChild(iframe);
  }
};
export default http;
