export const getChartTemplate = (exampleComponent: string): string => {
  return JSON.stringify({
    component: exampleComponent,
    options: {}
  });
};
