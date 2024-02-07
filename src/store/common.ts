import { defineStore } from 'pinia';


export type CommonState = {
  name: string;
};

export const useCommonStore = defineStore({
  id: 'common',
  state: (): CommonState => ({
    name: '张三'
  }),

  getters: {
    nameLength(): number {
      return this.name.length;
    }
  }
  // persist: {
  //   enabled: true,
  //   strategies: [
  //     {
  //       storage: localStorage,
  //       paths: ['name']
  //     }
  //   ]
  // }
});
