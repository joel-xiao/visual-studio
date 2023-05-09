import { defineStore } from 'pinia';

export interface Crumb {
  id?: string;
  name?: string;
}

type DashboardState = {
  crumbs: Crumb[];
};

export const useDashboardStore = defineStore({
  id: 'dashboard',
  state: (): DashboardState => ({
    crumbs: []
  }),
  actions: {
    saveCrumbs(value?: Crumb[] | undefined): void {
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
