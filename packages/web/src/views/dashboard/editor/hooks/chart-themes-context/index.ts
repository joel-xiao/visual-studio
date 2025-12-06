import { ref, readonly, type Ref } from 'vue';
import { chartColors, defaultTheme } from './data';

export * from './data';

class CreateChartThemesContext {
  #currentTheme: Ref<string> = ref(defaultTheme);

  constructor() {
    this.getCurrentTheme = this.getCurrentTheme.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  getCurrentTheme() {
    return readonly(this.#currentTheme);
  }

  setTheme(themeName: string) {
    if (Object.keys(chartColors).includes(themeName)) {
      this.#currentTheme.value = themeName;
    } else {
      console.warn(`Theme ${themeName} not found.`);
    }
  }

  install(initTheme?: string) {
    if (initTheme && Object.keys(chartColors).includes(initTheme)) {
      this.#currentTheme.value = initTheme;
    } else {
      this.#currentTheme.value = defaultTheme;
    }
  }

  uninstall() {
    this.#currentTheme.value = defaultTheme;
  }
}

let myChartThemesContext: CreateChartThemesContext | undefined;

const createChartThemesContext = function (): CreateChartThemesContext {
  if (!myChartThemesContext) myChartThemesContext = new CreateChartThemesContext();
  return myChartThemesContext;
};

export const removeChartThemesContext = function () {
  myChartThemesContext?.uninstall();
  myChartThemesContext = undefined;
};

export const useChartThemesContext = function () {
  if (!myChartThemesContext) {
    myChartThemesContext = createChartThemesContext();
  }
  return myChartThemesContext;
};
