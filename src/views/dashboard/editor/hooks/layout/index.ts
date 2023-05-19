import { readonly, markRaw } from 'vue';

const layoutConfig = readonly(
  markRaw({
    nav_bar_height: 42,
    tool_bar_height: 0,
    tab_bar_height: 42,
    left_menu_width: 241,
    right_menu_width: 252,
    ruler: 16
  })
);
const getLayoutConfig = function () {
  return layoutConfig;
};

export const useLayout = function () {
  return readonly(
    markRaw({
      getLayoutConfig
    })
  );
};
