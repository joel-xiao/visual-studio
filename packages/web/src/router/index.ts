import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import layout from '@v/layout/layout-screen.vue';
import type { App } from 'vue';
import { isElectron } from '@/client/electron/main';
import { isTauri } from '@/client/tauri/main';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard/main/projects',
    name: 'Home',
    component: layout,
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '@v/dashboard/index.vue'),
        children: [
          {
            path: '/main',
            name: 'dashboard-main',
            component: () =>
              import(/* webpackChunkName: "dashboard" */ '@v/dashboard/main/index.vue'),
            children: [
              {
                path: '/projects',
                name: 'dashboard-projects',
                component: () =>
                  import(/* webpackChunkName: "dashboard" */ '@v/dashboard/main/my-dashboard.vue')
              },
              {
                path: '/data',
                name: 'dashboard-data',
                component: () =>
                  import(/* webpackChunkName: "dashboard" */ '@v/dashboard/main/my-data.vue')
              }
            ]
          },
          {
            path: '/editor',
            name: 'dashboard-editor',
            component: () =>
              import(/* webpackChunkName: "dashboard" */ '@v/dashboard/main/my-editor.vue')
          }
        ]
      }
    ]
  }
];

const routePathJoinHandler = function (routes: Array<RouteRecordRaw>, parentPath?: string): void {
  routes.forEach(route => {
    if (parentPath) {
      route.path = parentPath + route.path;
    }

    if (Array.isArray(route.children) && route.children.length) {
      routePathJoinHandler(route.children, route.path);
    }
  });
};
routePathJoinHandler(routes);

const useHashMode = isElectron() || isTauri();

const router = createRouter({
  history: useHashMode ? createWebHashHistory() : createWebHistory(),
  routes
});

export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
