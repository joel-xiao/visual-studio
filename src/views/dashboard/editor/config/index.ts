import { readonly, markRaw } from 'vue';

const config: {
  readonly [key: string]: { [key: string]: number };
} = markRaw(
  readonly({
    layout: {
      nav_bar_height: 42,
      tool_bar_height: 0,
      tab_bar_height: 42,
      left_menu_width: 241,
      right_menu_width: 252,
      ruler_size: 18
    }
  })
);
const getConfig = function (type: string) {
  return config[type];
};

export const useConfig = function () {
  return readonly(
    markRaw({
      getConfig
    })
  );
};
