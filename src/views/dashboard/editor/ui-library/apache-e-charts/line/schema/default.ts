const schema: IComponentSchemaExport = {
  name: '基础折线图',
  type: 'APACHE_ECHARTS_LINE_SIMPLE',
  icon: 'ui-library/apache-e-charts/line-simple.png',
  schemas: [
    {
      type: 'schema',
      schema: 'COMMON_LAYOUT',
      default: {
        x: 0,
        y: 0,
        width: 400,
        height: 300,
        rotate: 0,
        radius: [0, 0, 0, 0]
      }
    }
  ]
};
export default schema;
