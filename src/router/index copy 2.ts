// /*
//  * @Description: router
//  * @Autor: Joel
//  */
// import type { App } from 'vue';
// import { useUserStore } from '@/store/useUser';
// import { useKeepAliveStore } from '@/store/useKeepAlive';
// import {
//   createRouter,
//   createWebHashHistory,
//   RouteRecordRaw,
//   RouteLocationNormalized
// } from 'vue-router';

// interface IRoute extends RouteLocationNormalized {
//   name: string;
// }
// // 自动注入modules下的路由
// const modulesFiles = import.meta.globEager('./modules/**/*.(ts|js)');
// let routerList: Array<RouteRecordRaw> = [];
// for (const path in modulesFiles) {
//   routerList = [...routerList, ...(modulesFiles[path].default || modulesFiles[path])];
// }

// const router = createRouter({
//   history: createWebHashHistory(), // hash模式: createWebHashHistory,   history模式: createWebHistory
//   routes: routerList,
//   // @ts-ignore
//   scrollBehavior(to, from, savedPosition) {
//     if (savedPosition) {
//       // 后退才有savedPosition
//       return savedPosition;
//     } else {
//       if (to.meta.isKeepAlive) {
//         to.meta.scrollTop = document.body.scrollTop;
//       }
//       return { left: 0, top: to.meta.scrollTop || 0 };
//     }
//   }
// });
// // @ts-ignore
// router.beforeEach((to: IRoute, from, next) => {
//   const userStore = useUserStore();
//   const keepAliveStore = useKeepAliveStore();
//   to.meta.isKeepAlive && keepAliveStore.setKeepAlive(to.name);
//   if (to.matched.some((res) => res.meta.requireAuth)) {
//     // 判断是否需要登录权限
//     if (userStore.token) {
//       next();
//     } else {
//       next({
//         path: `/login`, // 未登录则跳转至login页面
//         query: { redirect: to.fullPath } // 登陆成功后回到当前页面，这里传值给login页面，to.fullPath为当前点击的页面
//       });
//     }
//   } else {
//     next();
//   }
// });
// router.afterEach((to, from) => {
//   // 添加转场效果
//   const toDepth = to.path.split('/').length;
//   const fromDepth = from.path.split('/').length;
//   to.meta.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left';
// });

// export function setupRouter(app: App<Element>) {
//   app.use(router);
// }

// export default router;
