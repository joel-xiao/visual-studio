import { defineStore } from 'pinia';
import type { Node } from '@v/dashboard/editor/hooks/node-context/interface';
export interface Crumb {
  id?: string;
  name?: string;
}

type DashboardState = {
  crumbs: Crumb[];
  currentNode: Node | undefined;
};

export const useDashboardStore = defineStore({
  id: 'dashboard',
  state: (): DashboardState => ({
    crumbs: [],
    currentNode: undefined
  }),
  actions: {
    saveCrumbs(value?: Crumb[] | undefined): void {
      this.crumbs = value || [];
    },

    saveCurrentNode(payload: Node | undefined): void {
      this.currentNode = payload;
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
