/*
 * @Description: router
 * @Autor: Joel
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import layout from '@v/layout/index.vue';
import type { App } from 'vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard/main',
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
              import(/* webpackChunkName: "dashboard" */ '@v/dashboard/main/index.vue')
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
  routes.forEach((route) => {
    if (parentPath) {
      route.path = parentPath + route.path;
    }

    if (Array.isArray(route.children) && route.children.length) {
      routePathJoinHandler(route.children, route.path);
    }
  });
};
routePathJoinHandler(routes);

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(process.env.BASE_URL),
  routes
});

export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
