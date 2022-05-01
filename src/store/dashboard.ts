import { defineStore } from 'pinia';
import type { Node } from '@v/dashboard/editor/interface';
export interface Crumb {
  id?: string;
  name?: string;
}

export interface ComBindKeys {
  isSpace: boolean;
  isShift: boolean;
  isCtrl: boolean;
  isAlt: boolean;
}

type DashboardState = {
  crumbs: Crumb[];
  currentNode: Node | undefined;
  comBindKeys: ComBindKeys;
};

export const useDashboardStore = defineStore({
  id: 'dashboard',
  state: (): DashboardState => ({
    crumbs: [],
    currentNode: undefined,
    comBindKeys: {
      isSpace: false,
      isShift: false,
      isCtrl: false,
      isAlt: false
    }
  }),
  actions: {
    saveCrumbs(value?: Crumb[] | undefined): void {
      this.crumbs = value || [];
    },

    saveCurrentNode(payload: Node | undefined): void {
      this.currentNode = payload;
    },

    saveComBindKeys(
      payload: boolean | undefined | null | { [key: string]: boolean | undefined | null }
    ): void {
      if (payload && payload instanceof Object) {
        Object.keys(payload).forEach((key: string) => {
          // @ts-ignore
          this.comBindKeys[key] = !!payload[key];
        });
      } else {
        Object.keys(this.comBindKeys).forEach((key: string) => {
          // @ts-ignore
          this.comBindKeys[key] = !!payload;
        });
      }
      payload = null;
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
