import { defineStore } from 'pinia';

type DashboardState = {
  crumbs: IDashboardCrumb[];
};

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    crumbs: []
  }),
  actions: {
    saveCrumbs(value?: IDashboardCrumb[] | undefined): void {
      this.crumbs = value || [];
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ['crumbs']
      }
    ]
  }
});
